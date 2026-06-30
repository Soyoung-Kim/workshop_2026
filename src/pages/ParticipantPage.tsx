import { FormEvent, useEffect, useMemo, useState } from "react";
import { Save, Search, RotateCcw } from "lucide-react";
import { PageShell } from "../components/PageShell";
import { Button, Notice, SelectInput, TextArea, TextInput } from "../components/ui";
import { rpcErrorMessage, supabase } from "../lib/supabase";
import { BootstrapData, SubmissionPayload } from "../types";

type ParticipantStep = "identity" | "editor";

export function ParticipantPage() {
  const [bootstrap, setBootstrap] = useState<BootstrapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<ParticipantStep>("identity");
  const [participantName, setParticipantName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [answerOne, setAnswerOne] = useState("");
  const [answerTwo, setAnswerTwo] = useState("");
  const [foundSubmission, setFoundSubmission] = useState<SubmissionPayload | null>(null);
  const [status, setStatus] = useState<{ tone: "success" | "warning" | "error"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadBootstrap();
  }, []);

  const selectedDepartment = useMemo(
    () => bootstrap?.departments.find((department) => department.id === departmentId) ?? null,
    [bootstrap?.departments, departmentId],
  );

  async function loadBootstrap() {
    setLoading(true);
    const { data, error } = await supabase.rpc("ws_public_bootstrap");

    if (error) {
      setStatus({ tone: "error", text: rpcErrorMessage(error) });
    } else {
      const nextBootstrap = data as BootstrapData;
      setBootstrap(nextBootstrap);
      setDepartmentId((current) => current || nextBootstrap.departments[0]?.id || "");
    }

    setLoading(false);
  }

  async function handleStart(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    if (!participantName.trim()) {
      setStatus({ tone: "warning", text: "이름을 입력해주세요." });
      return;
    }

    if (!departmentId) {
      setStatus({ tone: "warning", text: "팀을 선택해주세요." });
      return;
    }

    setSubmitting(true);
    const { data, error } = await supabase.rpc("ws_find_submission", {
      p_department_id: departmentId,
      p_participant_name: participantName.trim(),
    });
    setSubmitting(false);

    if (error) {
      setStatus({ tone: "error", text: rpcErrorMessage(error) });
      return;
    }

    const submission = data as SubmissionPayload | null;
    setFoundSubmission(submission);
    setAnswerOne(submission?.answerOne ?? "");
    setAnswerTwo(submission?.answerTwo ?? "");
    setStep("editor");
    setStatus(
      submission
        ? { tone: "success", text: "기존 답변을 불러왔습니다." }
        : { tone: "success", text: "새 답변을 작성합니다." },
    );
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!bootstrap || bootstrap.settings.submissionClosed) {
      setStatus({ tone: "warning", text: "답변 마감 이후에는 저장할 수 없습니다." });
      return;
    }

    if (!answerOne.trim() || !answerTwo.trim()) {
      setStatus({ tone: "warning", text: "두 문항을 모두 입력해주세요." });
      return;
    }

    setSubmitting(true);
    const { data, error } = await supabase.rpc("ws_upsert_submission", {
      p_department_id: departmentId,
      p_participant_name: participantName.trim(),
      p_answer_one: answerOne.trim(),
      p_answer_two: answerTwo.trim(),
    });
    setSubmitting(false);

    if (error) {
      setStatus({ tone: "error", text: rpcErrorMessage(error) });
      return;
    }

    setFoundSubmission(data as SubmissionPayload);
    setStatus({
      tone: "success",
      text: foundSubmission ? "수정 내용이 저장되었습니다." : "답변이 제출되었습니다.",
    });
    await loadBootstrap();
  }

  return (
    <PageShell
      eyebrow="전략사업본부 워크샵"
      title={bootstrap?.event.title ?? "우리 팀은 어떤 팀인가?"}
      settings={bootstrap?.settings}
    >
      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-zinc-950">참여자</h2>
            {step === "editor" ? (
              <Button type="button" variant="secondary" onClick={() => setStep("identity")}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                다시 조회
              </Button>
            ) : null}
          </div>

          <form className="space-y-4" onSubmit={handleStart}>
            <label className="block space-y-2">
              <span className="text-sm font-bold text-zinc-700">이름</span>
              <TextInput
                value={participantName}
                disabled={step === "editor"}
                onChange={(event) => setParticipantName(event.target.value)}
                autoComplete="name"
                placeholder="이름"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-bold text-zinc-700">팀</span>
              <SelectInput
                value={departmentId}
                disabled={step === "editor" || loading}
                onChange={(event) => setDepartmentId(event.target.value)}
              >
                {bootstrap?.departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </SelectInput>
            </label>
            {step === "identity" ? (
              <Button className="w-full" type="submit" disabled={loading || submitting}>
                <Search className="h-4 w-4" aria-hidden="true" />
                작성 시작
              </Button>
            ) : null}
          </form>

          <div className="mt-5 space-y-3">
            {selectedDepartment ? (
              <div className="rounded-md bg-zinc-100 px-3 py-2 text-sm font-semibold text-zinc-700">
                {selectedDepartment.name}
              </div>
            ) : null}
            {bootstrap?.settings.submissionClosed ? (
              <Notice tone="warning">답변 마감 이후에는 조회만 가능합니다.</Notice>
            ) : null}
            {status ? <Notice tone={status.tone}>{status.text}</Notice> : null}
          </div>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-soft">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-bold text-zinc-950">
              {foundSubmission ? "답변 수정" : "답변 작성"}
            </h2>
            <span className="text-sm font-semibold text-zinc-500">
              {step === "editor" ? participantName.trim() : "이름과 팀을 먼저 확인"}
            </span>
          </div>

          {step === "identity" ? (
            <div className="flex min-h-72 items-center justify-center rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-4 text-center text-sm font-semibold text-zinc-500">
              이름과 팀을 입력하면 답변 입력란이 열립니다.
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSave}>
              <label className="block space-y-2">
                <span className="text-sm font-bold text-zinc-700">우리 팀은 _________ 같다.</span>
                <TextArea
                  value={answerOne}
                  disabled={bootstrap?.settings.submissionClosed}
                  onChange={(event) => setAnswerOne(event.target.value)}
                  placeholder="예: 우리 팀은 와이파이 같다. 보이지 않아도 모두의 연결을 지켜준다."
                  maxLength={800}
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-bold text-zinc-700">
                  우리 팀이 없다면 _________ 될 것이다.
                </span>
                <TextArea
                  value={answerTwo}
                  disabled={bootstrap?.settings.submissionClosed}
                  onChange={(event) => setAnswerTwo(event.target.value)}
                  placeholder="예: 우리 팀이 없다면 방향을 잃고 같은 문제를 반복하게 될 것이다."
                  maxLength={800}
                />
              </label>
              <Button className="w-full sm:w-auto" type="submit" disabled={submitting || bootstrap?.settings.submissionClosed}>
                <Save className="h-4 w-4" aria-hidden="true" />
                {foundSubmission ? "수정 저장하기" : "제출하기"}
              </Button>
            </form>
          )}
        </section>
      </div>
    </PageShell>
  );
}
