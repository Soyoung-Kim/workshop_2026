import { FormEvent, ReactNode, useMemo, useState } from "react";
import { Download, LockKeyhole, RefreshCw, Save } from "lucide-react";
import { PageShell } from "../components/PageShell";
import { HighlightedAnswer } from "../components/HighlightedAnswer";
import { Button, Notice, SelectInput, TextInput } from "../components/ui";
import { downloadCsv } from "../lib/csv";
import { formatKoreanDateTime, fromDateTimeLocal, toDateTimeLocal } from "../lib/date";
import { rpcErrorMessage, supabase } from "../lib/supabase";
import { AdminOverview } from "../types";

const PASSWORD_STORAGE_KEY = "ws:admin-password";

export function AdminPage() {
  const [password, setPassword] = useState(() => window.sessionStorage.getItem(PASSWORD_STORAGE_KEY) || "");
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [submissionDeadline, setSubmissionDeadline] = useState("");
  const [voteDeadline, setVoteDeadline] = useState("");
  const [votesPerJudge, setVotesPerJudge] = useState(3);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedJudgeIds, setExpandedJudgeIds] = useState<string[]>([]);
  const [revealedResultIds, setRevealedResultIds] = useState<string[]>([]);
  const [status, setStatus] = useState<{ tone: "success" | "warning" | "error"; text: string } | null>(null);

  const selectedSubmissions = useMemo(
    () => overview?.results.filter((submission) => submission.voteCount > 0) ?? [],
    [overview],
  );

  const completedJudgeCount = useMemo(
    () => overview?.judges.filter((judge) => judge.selectedCount > 0).length ?? 0,
    [overview],
  );

  const totalVoteCount = useMemo(
    () => selectedSubmissions.reduce((total, submission) => total + submission.voteCount, 0),
    [selectedSubmissions],
  );

  async function loadOverview(nextPassword = password) {
    setLoading(true);
    const { data, error } = await supabase.rpc("ws_admin_overview", { p_password: nextPassword });
    setLoading(false);

    if (error) {
      setStatus({ tone: "error", text: rpcErrorMessage(error) });
      return;
    }

    const nextOverview = data as AdminOverview;
    setOverview(nextOverview);
    setSubmissionDeadline(toDateTimeLocal(nextOverview.settings.submissionDeadline));
    setVoteDeadline(toDateTimeLocal(nextOverview.settings.voteDeadline));
    setVotesPerJudge(nextOverview.settings.votesPerJudge);
    window.sessionStorage.setItem(PASSWORD_STORAGE_KEY, nextPassword);
    setStatus({ tone: "success", text: "관리자 데이터가 갱신되었습니다." });
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!password.trim()) {
      setStatus({ tone: "warning", text: "관리자 비밀번호를 입력해주세요." });
      return;
    }

    await loadOverview(password.trim());
  }

  async function saveSettings() {
    if (!submissionDeadline || !voteDeadline) {
      setStatus({ tone: "warning", text: "마감 시간을 모두 입력해주세요." });
      return;
    }

    setSaving(true);
    const { data, error } = await supabase.rpc("ws_admin_update_settings", {
      p_password: password,
      p_submission_deadline: fromDateTimeLocal(submissionDeadline),
      p_vote_deadline: fromDateTimeLocal(voteDeadline),
      p_votes_per_judge: votesPerJudge,
    });
    setSaving(false);

    if (error) {
      setStatus({ tone: "error", text: rpcErrorMessage(error) });
      return;
    }

    const nextOverview = data as AdminOverview;
    setOverview(nextOverview);
    setSubmissionDeadline(toDateTimeLocal(nextOverview.settings.submissionDeadline));
    setVoteDeadline(toDateTimeLocal(nextOverview.settings.voteDeadline));
    setVotesPerJudge(nextOverview.settings.votesPerJudge);
    setStatus({ tone: "success", text: "운영설정이 저장되었습니다." });
  }

  function exportSubmissions() {
    if (!overview) {
      return;
    }

    downloadCsv(
      "workshop-submissions.csv",
      ["이름", "답변1", "답변2", "득표수", "작성일", "수정일"],
      overview.submissions.map((submission) => [
        submission.participantName,
        submission.answerOne,
        submission.answerTwo,
        submission.voteCount,
        formatKoreanDateTime(submission.createdAt),
        formatKoreanDateTime(submission.updatedAt),
      ]),
    );
  }

  function toggleJudgeSelections(judgeId: string) {
    setExpandedJudgeIds((current) =>
      current.includes(judgeId) ? current.filter((id) => id !== judgeId) : [...current, judgeId],
    );
  }

  function toggleResultName(submissionId: string) {
    setRevealedResultIds((current) =>
      current.includes(submissionId) ? current.filter((id) => id !== submissionId) : [...current, submissionId],
    );
  }

  return (
    <PageShell
      eyebrow="관리자"
      title={overview?.event.title ?? "우리 팀은 어떤 팀인가?"}
      settings={overview?.settings}
    >
      <div className="space-y-5">
        <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-soft">
          <form className="grid gap-3 sm:grid-cols-[1fr_auto]" onSubmit={handleLogin}>
            <label className="block space-y-2">
              <span className="text-sm font-bold text-zinc-700">관리자 비밀번호</span>
              <TextInput
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="비밀번호"
                autoComplete="current-password"
              />
            </label>
            <Button className="self-end" type="submit" disabled={loading}>
              <LockKeyhole className="h-4 w-4" aria-hidden="true" />
              로그인
            </Button>
          </form>
          {status ? (
            <div className="mt-4">
              <Notice tone={status.tone}>{status.text}</Notice>
            </div>
          ) : null}
        </section>

        {overview ? (
          <>
            <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
              <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-soft">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-bold text-zinc-950">운영설정</h2>
                  <Button type="button" variant="secondary" onClick={() => loadOverview()} disabled={loading}>
                    <RefreshCw className="h-4 w-4" aria-hidden="true" />
                    새로고침
                  </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="block space-y-2">
                    <span className="text-sm font-bold text-zinc-700">답변 마감시간</span>
                    <TextInput
                      type="datetime-local"
                      value={submissionDeadline}
                      onChange={(event) => setSubmissionDeadline(event.target.value)}
                    />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-bold text-zinc-700">평가 마감시간</span>
                    <TextInput
                      type="datetime-local"
                      value={voteDeadline}
                      onChange={(event) => setVoteDeadline(event.target.value)}
                    />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-bold text-zinc-700">심사자별 선택 수</span>
                    <SelectInput
                      value={votesPerJudge}
                      onChange={(event) => setVotesPerJudge(Number(event.target.value))}
                    >
                      <option value={1}>1개</option>
                      <option value={2}>2개</option>
                      <option value={3}>3개</option>
                    </SelectInput>
                  </label>
                </div>
                <Button className="mt-4" type="button" onClick={saveSettings} disabled={saving}>
                  <Save className="h-4 w-4" aria-hidden="true" />
                  설정 저장
                </Button>
              </div>

              <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-soft">
                <h2 className="text-lg font-bold text-zinc-950">참여현황</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <Metric label="전체 참여자" value={`${overview.counts.total}명`} tone="teal" />
                  <Metric label="심사 참여" value={`${completedJudgeCount}/5명`} tone="amber" />
                  <Metric label="총 득표" value={`${totalVoteCount}표`} tone="zinc" />
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-soft">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-bold text-zinc-950">결과집계</h2>
              </div>
              {selectedSubmissions.length === 0 ? (
                <Notice tone="warning">아직 선택한 심사자가 없습니다.</Notice>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
                    <thead>
                      <tr className="text-zinc-500">
                        <Th>순위</Th>
                        <Th>득표수</Th>
                        <Th>이름</Th>
                        <Th>내용</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSubmissions.map((submission, index) => {
                        const nameRevealed = revealedResultIds.includes(submission.id);

                        return (
                          <tr key={submission.id} className="align-top">
                            <Td>{index + 1}</Td>
                            <Td>
                              <span className="rounded bg-teal-100 px-2 py-1 text-sm font-black text-teal-900">
                                {submission.voteCount}표
                              </span>
                            </Td>
                            <Td>
                              <button
                                type="button"
                                className={`rounded-md border px-3 py-1.5 text-sm font-bold transition ${
                                  nameRevealed
                                    ? "border-amber-300 bg-amber-50 text-amber-900"
                                    : "border-zinc-300 bg-zinc-50 text-zinc-500 hover:border-teal-400 hover:text-teal-800"
                                }`}
                                onClick={() => toggleResultName(submission.id)}
                                aria-label={nameRevealed ? `${submission.participantName} 이름 숨기기` : "이름 보기"}
                              >
                                {nameRevealed ? submission.participantName : "이름 보기"}
                              </button>
                            </Td>
                            <Td>
                              <div className="max-w-xl space-y-2">
                                <p>
                                  <HighlightedAnswer kind="teamLike" text={submission.answerOne} />
                                </p>
                                <p className="text-zinc-500">
                                  <HighlightedAnswer kind="teamReason" text={submission.answerTwo} />
                                </p>
                              </div>
                            </Td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="space-y-5">
              <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-soft">
                <h2 className="text-lg font-bold text-zinc-950">평가현황</h2>
                <div className="mt-4 space-y-2">
                  {overview.judges.map((judge) => {
                    const expanded = expandedJudgeIds.includes(judge.id);
                    const judgeSelections = overview.submissions.filter((submission) =>
                      judge.selectedSubmissionIds.includes(submission.id),
                    );

                    return (
                      <div key={judge.id} className="rounded-md border border-zinc-200 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-bold text-zinc-950">
                              {judge.name} {judge.role}
                            </p>
                            <p className="mt-1 text-sm font-medium text-zinc-500">
                              {judge.selectedCount}/{overview.settings.votesPerJudge}개 선택
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            {judge.selectedCount > 0 ? (
                              <button
                                type="button"
                                className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-bold text-zinc-700 transition hover:border-teal-400 hover:text-teal-800"
                                onClick={() => toggleJudgeSelections(judge.id)}
                              >
                                {expanded ? "닫기" : "조회"}
                              </button>
                            ) : null}
                            <span
                              className={`rounded px-2 py-1 text-xs font-bold ${
                                judge.selectedCount > 0 ? "bg-teal-100 text-teal-800" : "bg-zinc-100 text-zinc-500"
                              }`}
                            >
                              {judge.selectedCount > 0 ? "선택" : "미선택"}
                            </span>
                          </div>
                        </div>
                        {judge.votedAt ? (
                          <p className="mt-2 text-sm font-medium text-zinc-600">
                            마지막 저장 {formatKoreanDateTime(judge.votedAt)}
                          </p>
                        ) : null}
                        {expanded ? (
                          <div className="mt-3 space-y-3 rounded-md border border-zinc-200 bg-zinc-50 p-3">
                            {judgeSelections.length === 0 ? (
                              <p className="text-sm font-medium text-zinc-500">선택한 답변을 찾을 수 없습니다.</p>
                            ) : (
                              judgeSelections.map((submission, index) => (
                                <div key={submission.id} className="rounded-md border border-zinc-200 bg-white p-3">
                                  <div className="mb-2 flex flex-wrap items-center gap-2">
                                    <span className="rounded bg-zinc-100 px-2 py-1 text-xs font-bold text-zinc-700">
                                      {index + 1}
                                    </span>
                                    <span className="text-sm font-bold text-zinc-950">
                                      {submission.participantName}
                                    </span>
                                    <span className="text-xs font-bold text-teal-700">
                                      {submission.voteCount}표
                                    </span>
                                  </div>
                                  <div className="space-y-1 text-sm leading-6">
                                    <p>
                                      <HighlightedAnswer kind="teamLike" text={submission.answerOne} />
                                    </p>
                                    <p className="text-zinc-600">
                                      <HighlightedAnswer kind="teamReason" text={submission.answerTwo} />
                                    </p>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>

              <details className="rounded-lg border border-zinc-200 bg-white p-5 shadow-soft">
                <summary className="cursor-pointer text-lg font-bold text-zinc-950">
                  전체 답변 조회
                </summary>
                <p className="mt-2 text-sm font-medium text-zinc-500">
                  전체 참여자 답변은 관리자 확인용입니다.
                </p>
                <div className="mt-3 flex justify-end">
                  <Button type="button" variant="secondary" onClick={exportSubmissions}>
                    <Download className="h-4 w-4" aria-hidden="true" />
                    CSV 다운로드
                  </Button>
                </div>
                <div className="mt-4 max-h-[520px] overflow-auto rounded-md border border-zinc-200">
                  <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
                    <thead className="sticky top-0 bg-zinc-100">
                      <tr className="text-zinc-500">
                        <Th>이름</Th>
                        <Th>득표수</Th>
                        <Th>답변1</Th>
                        <Th>답변2</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {overview.submissions.map((submission) => (
                        <tr key={submission.id} className="align-top">
                          <Td>{submission.participantName}</Td>
                          <Td>{submission.voteCount}표</Td>
                          <Td>
                            <p className="max-w-sm">
                              <HighlightedAnswer kind="teamLike" text={submission.answerOne} />
                            </p>
                          </Td>
                          <Td>
                            <p className="max-w-sm">
                              <HighlightedAnswer kind="teamReason" text={submission.answerTwo} />
                            </p>
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </section>
          </>
        ) : null}
      </div>
    </PageShell>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: "teal" | "amber" | "zinc" }) {
  const colors = {
    teal: "bg-teal-50 text-teal-900 border-teal-100",
    amber: "bg-amber-50 text-amber-900 border-amber-100",
    zinc: "bg-zinc-50 text-zinc-900 border-zinc-200",
  };

  return (
    <div className={`rounded-md border p-4 ${colors[tone]}`}>
      <p className="text-sm font-bold">{label}</p>
      <p className="mt-2 text-2xl font-black tracking-normal">{value}</p>
    </div>
  );
}

function Th({ children }: { children: ReactNode }) {
  return <th className="border-b border-zinc-200 px-3 py-2 text-xs font-bold uppercase">{children}</th>;
}

function Td({ children }: { children: ReactNode }) {
  return <td className="border-b border-zinc-100 px-3 py-3 text-zinc-800">{children}</td>;
}
