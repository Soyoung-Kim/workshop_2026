import { FormEvent, useEffect, useMemo, useState } from "react";
import { KeyRound, Save, ShieldCheck } from "lucide-react";
import { PageShell } from "../components/PageShell";
import { HighlightedAnswer } from "../components/HighlightedAnswer";
import { Button, Notice, TextInput } from "../components/ui";
import { rpcErrorMessage, supabase } from "../lib/supabase";
import { JudgeViewData } from "../types";

export function JudgePage() {
  const initialToken = useMemo(() => new URLSearchParams(window.location.search).get("token") || "", []);
  const [token, setToken] = useState(initialToken);
  const [tokenInput, setTokenInput] = useState(initialToken);
  const [view, setView] = useState<JudgeViewData | null>(null);
  const [selectedSubmissionIds, setSelectedSubmissionIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(Boolean(initialToken));
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ tone: "success" | "warning" | "error"; text: string } | null>(null);

  const selectionLimit = view?.settings.votesPerJudge ?? 1;

  useEffect(() => {
    if (!initialToken) {
      return;
    }

    loadView(initialToken);
  }, [initialToken]);

  async function loadView(nextToken: string) {
    setLoading(true);
    const { data, error } = await supabase.rpc("ws_judge_view", { p_token: nextToken });
    setLoading(false);

    if (error) {
      setView(null);
      setSelectedSubmissionIds([]);
      setStatus({ tone: "error", text: rpcErrorMessage(error) });
      return;
    }

    const nextView = data as JudgeViewData;
    setView(nextView);
    setSelectedSubmissionIds(nextView.selectedSubmissionIds ?? []);
    setStatus(null);
  }

  async function handleTokenSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextToken = tokenInput.trim();

    if (!nextToken) {
      setStatus({ tone: "warning", text: "심사 토큰을 입력해주세요." });
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set("token", nextToken);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    setToken(nextToken);
    await loadView(nextToken);
  }

  function toggleSubmission(submissionId: string) {
    if (!view || view.settings.voteClosed) {
      return;
    }

    if (selectedSubmissionIds.includes(submissionId)) {
      setSelectedSubmissionIds((current) => current.filter((id) => id !== submissionId));
      setStatus(null);
      return;
    }

    if (selectedSubmissionIds.length >= selectionLimit) {
      setStatus({ tone: "warning", text: `최대 ${selectionLimit}개까지 선택할 수 있습니다.` });
      return;
    }

    setSelectedSubmissionIds((current) => [...current, submissionId]);
    setStatus(null);
  }

  async function saveVote() {
    if (selectedSubmissionIds.length === 0) {
      setStatus({ tone: "warning", text: "답변을 하나 이상 선택해주세요." });
      return;
    }

    if (selectedSubmissionIds.length > selectionLimit) {
      setStatus({ tone: "warning", text: `최대 ${selectionLimit}개까지 선택할 수 있습니다.` });
      return;
    }

    setSaving(true);
    const { data, error } = await supabase.rpc("ws_cast_vote", {
      p_token: token,
      p_submission_ids: selectedSubmissionIds,
    });
    setSaving(false);

    if (error) {
      setStatus({ tone: "error", text: rpcErrorMessage(error) });
      return;
    }

    const nextView = data as JudgeViewData;
    setView(nextView);
    setSelectedSubmissionIds(nextView.selectedSubmissionIds ?? selectedSubmissionIds);
    setStatus({ tone: "success", text: "선택이 저장되었습니다." });
  }

  return (
    <PageShell eyebrow="심사자" title="우리 팀은 어떤 팀인가?" settings={view?.settings}>
      <div className="space-y-5">
        <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-soft">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-zinc-950">
                {view ? `${view.judge.name} ${view.judge.role}` : "심사"}
              </h2>
              <p className="mt-1 text-sm font-medium text-zinc-500">
                {view ? `${selectedSubmissionIds.length}/${selectionLimit}개 선택` : "토큰 입력 후 심사 시작"}
              </p>
            </div>
            {view ? (
              <Button
                type="button"
                onClick={saveVote}
                disabled={loading || saving || view.settings.voteClosed}
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                저장
              </Button>
            ) : null}
          </div>
          <div className="mt-4 space-y-3">
            {view ? (
              <Notice>
                마음에 드는 답변을 최대 {selectionLimit}개까지 선택할 수 있습니다. 작성자 이름은 표시되지 않습니다.
              </Notice>
            ) : null}
            {view?.settings.voteClosed ? (
              <Notice tone="warning">평가 마감 이후에는 수정할 수 없습니다.</Notice>
            ) : null}
            {status ? <Notice tone={status.tone}>{status.text}</Notice> : null}
          </div>
        </section>

        {!view ? (
          <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-soft">
            <form className="mx-auto flex max-w-md flex-col gap-4" onSubmit={handleTokenSubmit}>
              <div>
                <h2 className="text-lg font-bold text-zinc-950">심사 토큰 입력</h2>
                <p className="mt-1 text-sm font-medium text-zinc-500">
                  전달받은 토큰을 입력하면 심사 화면이 열립니다.
                </p>
              </div>
              <label className="block space-y-2">
                <span className="text-sm font-bold text-zinc-700">토큰</span>
                <TextInput
                  value={tokenInput}
                  onChange={(event) => setTokenInput(event.target.value)}
                  placeholder="토큰을 입력하세요"
                  autoComplete="off"
                />
              </label>
              <Button type="submit" disabled={loading}>
                <KeyRound className="h-4 w-4" aria-hidden="true" />
                심사 시작
              </Button>
            </form>
          </section>
        ) : null}

        <section className="space-y-3">
          {loading ? (
            <Notice>답변을 불러오는 중입니다.</Notice>
          ) : view && view.submissions.length === 0 ? (
            <Notice tone="warning">등록된 답변이 없습니다.</Notice>
          ) : null}

          {view?.submissions.map((submission, index) => {
            const checked = selectedSubmissionIds.includes(submission.id);
            return (
              <label
                key={submission.id}
                className={`block cursor-pointer rounded-lg border bg-white p-5 shadow-soft transition ${
                  checked ? "border-teal-600 ring-2 ring-teal-100" : "border-zinc-200 hover:border-teal-300"
                }`}
              >
                <div className="flex items-start gap-4">
                  <input
                    className="mt-1 h-5 w-5 accent-teal-700"
                    type="checkbox"
                    name="submission"
                    value={submission.id}
                    checked={checked}
                    disabled={view?.settings.voteClosed ?? false}
                    onChange={() => toggleSubmission(submission.id)}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded bg-zinc-100 px-2 py-1 text-xs font-bold text-zinc-700">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {checked ? (
                        <span className="inline-flex items-center gap-1 rounded bg-teal-100 px-2 py-1 text-xs font-bold text-teal-800">
                          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                          선택
                        </span>
                      ) : null}
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <AnswerBlock kind="teamLike" title="내가 생각하는 우리 팀(파트)은 _________ 같다." text={submission.answerOne} />
                      <AnswerBlock kind="teamReason" title="_________(이기/하기) 때문이다." text={submission.answerTwo} />
                    </div>
                  </div>
                </div>
              </label>
            );
          })}
        </section>
      </div>
    </PageShell>
  );
}

function AnswerBlock({ title, text, kind }: { title: string; text: string; kind: "teamLike" | "teamReason" }) {
  return (
    <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
      <h3 className="text-sm font-bold text-zinc-600">{title}</h3>
      <p className="mt-2 text-base leading-7 text-zinc-950">
        <HighlightedAnswer kind={kind} text={text} />
      </p>
    </div>
  );
}
