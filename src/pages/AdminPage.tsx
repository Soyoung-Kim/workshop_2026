import { FormEvent, ReactNode, useMemo, useState } from "react";
import { Download, LockKeyhole, RefreshCw, Save } from "lucide-react";
import { PageShell } from "../components/PageShell";
import { Button, Notice, TextInput } from "../components/ui";
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
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ tone: "success" | "warning" | "error"; text: string } | null>(null);

  const maxVotes = useMemo(
    () => Math.max(0, ...(overview?.results.map((submission) => submission.voteCount) ?? [0])),
    [overview?.results],
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
    setStatus({ tone: "success", text: "운영설정이 저장되었습니다." });
  }

  function exportSubmissions() {
    if (!overview) {
      return;
    }

    downloadCsv(
      "workshop-submissions.csv",
      ["이름", "팀", "답변1", "답변2", "득표수", "작성일", "수정일"],
      overview.submissions.map((submission) => [
        submission.participantName,
        submission.departmentName,
        submission.answerOne,
        submission.answerTwo,
        submission.voteCount,
        formatKoreanDateTime(submission.createdAt),
        formatKoreanDateTime(submission.updatedAt),
      ]),
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
                <div className="grid gap-4 sm:grid-cols-2">
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
                </div>
                <Button className="mt-4" type="button" onClick={saveSettings} disabled={saving}>
                  <Save className="h-4 w-4" aria-hidden="true" />
                  설정 저장
                </Button>
              </div>

              <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-soft">
                <h2 className="text-lg font-bold text-zinc-950">참여현황</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Metric label="전체 참여자" value={`${overview.counts.total}명`} tone="teal" />
                  <Metric label="심사 완료" value={`${overview.judges.filter((judge) => judge.selectedSubmissionId).length}/5명`} tone="amber" />
                </div>
                <div className="mt-4 grid gap-2">
                  {overview.counts.byDepartment.map((item) => (
                    <div key={item.departmentId} className="flex items-center justify-between rounded-md bg-zinc-100 px-3 py-2 text-sm">
                      <span className="font-semibold text-zinc-700">{item.departmentName}</span>
                      <span className="font-bold text-zinc-950">{item.count}명</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-soft">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-bold text-zinc-950">결과집계</h2>
                <Button type="button" variant="secondary" onClick={exportSubmissions}>
                  <Download className="h-4 w-4" aria-hidden="true" />
                  CSV 다운로드
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
                  <thead>
                    <tr className="text-zinc-500">
                      <Th>순위</Th>
                      <Th>이름</Th>
                      <Th>팀</Th>
                      <Th>득표</Th>
                      <Th>답변</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.results.map((submission, index) => (
                      <tr key={submission.id} className="align-top">
                        <Td>
                          <span
                            className={`rounded px-2 py-1 text-xs font-bold ${
                              submission.voteCount > 0 && submission.voteCount === maxVotes
                                ? "bg-teal-100 text-teal-800"
                                : "bg-zinc-100 text-zinc-700"
                            }`}
                          >
                            {index + 1}
                          </span>
                        </Td>
                        <Td>{submission.participantName}</Td>
                        <Td>{submission.departmentName}</Td>
                        <Td>{submission.voteCount}</Td>
                        <Td>
                          <div className="max-w-xl space-y-2">
                            <p className="break-words">{submission.answerOne}</p>
                            <p className="break-words text-zinc-500">{submission.answerTwo}</p>
                          </div>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
              <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-soft">
                <h2 className="text-lg font-bold text-zinc-950">평가현황</h2>
                <div className="mt-4 space-y-2">
                  {overview.judges.map((judge) => (
                    <div key={judge.id} className="rounded-md border border-zinc-200 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-bold text-zinc-950">
                            {judge.name} {judge.role}
                          </p>
                          <p className="text-xs font-semibold text-zinc-500">{judge.token}</p>
                        </div>
                        <span
                          className={`rounded px-2 py-1 text-xs font-bold ${
                            judge.selectedSubmissionId ? "bg-teal-100 text-teal-800" : "bg-zinc-100 text-zinc-500"
                          }`}
                        >
                          {judge.selectedSubmissionId ? "선택" : "미선택"}
                        </span>
                      </div>
                      {judge.selectedDepartment ? (
                        <p className="mt-2 text-sm font-medium text-zinc-600">
                          {judge.selectedDepartment} · {formatKoreanDateTime(judge.votedAt)}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-soft">
                <h2 className="text-lg font-bold text-zinc-950">답변 조회</h2>
                <div className="mt-4 max-h-[520px] overflow-auto rounded-md border border-zinc-200">
                  <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
                    <thead className="sticky top-0 bg-zinc-100">
                      <tr className="text-zinc-500">
                        <Th>이름</Th>
                        <Th>팀</Th>
                        <Th>답변1</Th>
                        <Th>답변2</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {overview.submissions.map((submission) => (
                        <tr key={submission.id} className="align-top">
                          <Td>{submission.participantName}</Td>
                          <Td>{submission.departmentName}</Td>
                          <Td>
                            <p className="max-w-sm break-words">{submission.answerOne}</p>
                          </Td>
                          <Td>
                            <p className="max-w-sm break-words">{submission.answerTwo}</p>
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </PageShell>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: "teal" | "amber" }) {
  const colors = {
    teal: "bg-teal-50 text-teal-900 border-teal-100",
    amber: "bg-amber-50 text-amber-900 border-amber-100",
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
