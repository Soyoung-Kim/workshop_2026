import { FormEvent, useEffect, useState } from "react";
import { RotateCcw, Save, Search } from "lucide-react";
import { PageShell } from "../components/PageShell";
import { Button, Notice, NoticeTone, TextArea, TextInput, Toast } from "../components/ui";
import { AnswerKind, getAnswerPhrase } from "../lib/answers";
import { rpcErrorMessage, supabase } from "../lib/supabase";
import { BootstrapData, SubmissionPayload } from "../types";

type ParticipantStep = "identity" | "editor";

export function ParticipantPage() {
  const [bootstrap, setBootstrap] = useState<BootstrapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<ParticipantStep>("identity");
  const [participantName, setParticipantName] = useState("");
  const [answerOne, setAnswerOne] = useState("");
  const [answerTwo, setAnswerTwo] = useState("");
  const [foundSubmission, setFoundSubmission] = useState<SubmissionPayload | null>(null);
  const [status, setStatus] = useState<{ tone: "success" | "warning" | "error"; text: string } | null>(null);
  const [toast, setToast] = useState<{ tone: NoticeTone; text: string; key: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadBootstrap();
  }, []);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  async function loadBootstrap() {
    setLoading(true);
    const { data, error } = await supabase.rpc("ws_public_bootstrap");

    if (error) {
      setStatus({ tone: "error", text: rpcErrorMessage(error) });
    } else {
      setBootstrap(data as BootstrapData);
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

    setSubmitting(true);
    const { data, error } = await supabase.rpc("ws_find_submission", {
      p_participant_name: participantName.trim(),
    });
    setSubmitting(false);

    if (error) {
      setStatus({ tone: "error", text: rpcErrorMessage(error) });
      return;
    }

    const submission = data as SubmissionPayload | null;
    setFoundSubmission(submission);
    setAnswerOne(getAnswerPhrase(submission?.answerOne ?? "", "teamLike"));
    setAnswerTwo(getAnswerPhrase(submission?.answerTwo ?? "", "teamReason"));
    setStep("editor");

    if (submission) {
      const message = "이전 작성 내용이 있습니다. 이전 작성 내용을 불러옵니다.";
      setStatus({ tone: "success", text: message });
      setToast({ tone: "success", text: message, key: Date.now() });
    } else {
      setStatus({ tone: "success", text: "새 답변을 작성합니다." });
    }
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!bootstrap || bootstrap.settings.submissionClosed) {
      setStatus({ tone: "warning", text: "답변 마감 이후에는 저장할 수 없습니다." });
      return;
    }

    const answerOnePhrase = getAnswerPhrase(answerOne, "teamLike");
    const answerTwoPhrase = getAnswerPhrase(answerTwo, "teamReason");

    if (!answerOnePhrase || !answerTwoPhrase) {
      setStatus({ tone: "warning", text: "두 문항을 모두 입력해주세요." });
      return;
    }

    setSubmitting(true);
    const { data, error } = await supabase.rpc("ws_upsert_submission", {
      p_participant_name: participantName.trim(),
      p_answer_one: answerOnePhrase,
      p_answer_two: answerTwoPhrase,
    });
    setSubmitting(false);

    if (error) {
      setStatus({ tone: "error", text: rpcErrorMessage(error) });
      return;
    }

    setFoundSubmission(data as SubmissionPayload);
    setAnswerOne(answerOnePhrase);
    setAnswerTwo(answerTwoPhrase);

    const message = foundSubmission ? "수정 내용이 저장되었습니다." : "저장되었습니다.";
    setStatus({ tone: "success", text: message });
    setToast({ tone: "success", text: message, key: Date.now() });
    await loadBootstrap();
  }

  return (
    <PageShell
      eyebrow="전략사업본부 워크샵"
      title={bootstrap?.event.title ?? "우리 팀은 어떤 팀인가?"}
      settings={bootstrap?.settings}
    >
      {toast ? (
        <Toast key={toast.key} tone={toast.tone}>
          {toast.text}
        </Toast>
      ) : null}
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
              <span className="text-sm font-semibold text-zinc-500">
                중복 참여를 원하실 경우, 이름 뒤에 숫자를 붙여 주세요. ex) 홍길동 , 홍길동1 ....
              </span>
              <TextInput
                value={participantName}
                disabled={step === "editor"}
                onChange={(event) => setParticipantName(event.target.value)}
                autoComplete="name"
                placeholder="이름"
              />
            </label>
            {step === "identity" ? (
              <Button className="w-full" type="submit" disabled={loading || submitting}>
                <Search className="h-4 w-4" aria-hidden="true" />
                작성 시작
              </Button>
            ) : null}
          </form>

          <div className="mt-5 space-y-3">
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
              {step === "editor" ? participantName.trim() : "이름을 먼저 확인"}
            </span>
          </div>
          <span className="text-sm font-semibold text-zinc-500">
            작성된 답변은, 심사자에 공개됩니다. 심사시 작성자 이름은 표시되지 않습니다.
          </span>
          {step === "identity" ? (
            <div className="flex min-h-72 items-center justify-center rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-4 text-center text-sm font-semibold text-zinc-500">
              이름을 입력하면 답변 입력창이 열립니다.
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSave}>
              <details className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
                <summary className="cursor-pointer text-sm font-bold text-amber-900">
                  작성 예시 보기
                </summary>
                <div className="mt-3 space-y-3 text-sm leading-6 text-amber-950">
                  <p>우리 팀은 스위스 아미 나이프 같다. 다양한 기술을 활용해 여러 문제를 해결하기 때문이다.</p>
                  <p>우리 팀은 건강검진센터 같다. 문제가 커지기 전에 미리 발견하고 관리하기 때문이다.</p>
                  <p>우리 팀은 번역가 같다. 고객의 생각을 개발자가 이해할 수 있는 언어로 바꿔주기 때문이다.</p>
                  <p>우리 팀은 여행 플래너 같다. 고객에게 가장 적합한 길을 함께 설계하기 때문이다.</p>
                </div>
              </details>
              <AnswerPhraseField
                kind="teamLike"
                label="내가 생각하는 우리 팀(파트)은 _________ 같다."
                value={answerOne}
                disabled={bootstrap?.settings.submissionClosed}
                onChange={setAnswerOne}
                placeholder="예: 스위스 아미 나이프"
              />
              <AnswerPhraseField
                kind="teamReason"
                label="_________(이기/하기) 때문이다."
                value={answerTwo}
                disabled={bootstrap?.settings.submissionClosed}
                onChange={setAnswerTwo}
                placeholder="예: 다양한 기술을 활용해 여러 문제를 해결하기"
              />
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

function AnswerPhraseField({
  kind,
  label,
  value,
  disabled,
  onChange,
  placeholder,
}: {
  kind: AnswerKind;
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const phrase = getAnswerPhrase(value, kind);
  const template =
    kind === "teamLike"
      ? { before: "내가 생각하는 우리 팀(파트)은 ", after: " 같다." }
      : { before: "", after: " 때문이다." };

  return (
    <label className="block space-y-2">
      <span className="text-sm font-bold text-zinc-700">{label}</span>
      <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
        <p className="mb-3 min-h-8 break-words text-base font-semibold leading-7 text-zinc-800">
          {phrase ? (
            <>
              {template.before}
              <span className="rounded bg-amber-100 px-1.5 py-0.5 font-black text-amber-950 ring-1 ring-amber-200">
                {phrase}
              </span>
              {template.after}
            </>
          ) : (
            <span className="text-zinc-400">{label}</span>
          )}
        </p>
        <TextArea
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          maxLength={400}
        />
      </div>
    </label>
  );
}
