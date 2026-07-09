import { useEffect, useMemo, useState } from "react";
import { Eye, Image as ImageIcon, Play, Shuffle, Square, TimerReset, Volume2 } from "lucide-react";
import {
  loadQuizState,
  QuizCategory,
  QuizQuestion,
  QuizState,
  resetQuizProgress,
  saveQuizRuntimeState,
  saveQuizSessionStatus,
  saveUsedQuestionIds,
} from "../lib/quizStorage";

export function QuizPage() {
  const [state, setState] = useState<QuizState>(() => loadQuizState());
  const adminHref = getProjectRouteHref("admin2");

  useEffect(() => {
    function handleStorageChange() {
      setState(loadQuizState());
    }

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const currentQuestion = useMemo(
    () => state.questions.find((question) => question.id === state.currentQuestionId) ?? null,
    [state.currentQuestionId, state.questions],
  );

  const selectedCategory = useMemo(
    () => state.categories.find((category) => category.id === state.selectedCategoryId) ?? null,
    [state.categories, state.selectedCategoryId],
  );

  const activeCategories = useMemo(
    () =>
      state.categories.filter(
        (category) => category.useYn && getRemainingQuestionCount(category, state.questions, state.usedQuestionIds) > 0,
      ),
    [state.categories, state.questions, state.usedQuestionIds],
  );

  const totalRemaining = useMemo(
    () =>
      state.categories.reduce(
        (total, category) => total + getRemainingQuestionCount(category, state.questions, state.usedQuestionIds),
        0,
      ),
    [state.categories, state.questions, state.usedQuestionIds],
  );

  function refreshState() {
    setState(loadQuizState());
  }

  function startQuiz() {
    saveQuizSessionStatus("IN_PROGRESS");
    saveQuizRuntimeState({ currentQuestionId: "", isAnswerVisible: false });
    refreshState();
  }

  function selectCategory(categoryId: string) {
    saveQuizRuntimeState({ selectedCategoryId: categoryId });
    refreshState();
  }

  function drawQuestion() {
    if (!state.selectedCategoryId) {
      return;
    }

    const availableQuestions = state.questions.filter(
      (question) =>
        question.categoryId === state.selectedCategoryId &&
        question.useYn &&
        !state.usedQuestionIds.includes(question.id),
    );

    if (availableQuestions.length === 0) {
      saveQuizRuntimeState({ selectedCategoryId: "", currentQuestionId: "", isAnswerVisible: false });
      refreshState();
      return;
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const question = availableQuestions[randomIndex];

    saveQuizSessionStatus("IN_PROGRESS");
    saveUsedQuestionIds([...state.usedQuestionIds, question.id]);
    saveQuizRuntimeState({
      currentQuestionId: question.id,
      isAnswerVisible: false,
    });
    refreshState();
  }

  function revealAnswer() {
    saveQuizRuntimeState({ isAnswerVisible: true });
    refreshState();
  }

  function endQuestion() {
    const nextSelectedCategoryId =
      selectedCategory && getRemainingQuestionCount(selectedCategory, state.questions, state.usedQuestionIds) > 0
        ? selectedCategory.id
        : "";

    saveQuizRuntimeState({
      selectedCategoryId: nextSelectedCategoryId,
      currentQuestionId: "",
      isAnswerVisible: false,
    });
    refreshState();
  }

  function finishQuiz() {
    if (!window.confirm("전체 퀴즈를 종료하고 이번 회차의 출제 이력을 초기화할까요?")) {
      return;
    }

    resetQuizProgress("FINISHED");
    refreshState();
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-black text-rose-600">전략사업본부 워크샵</p>
              <h1 className="mt-1 text-3xl font-black tracking-normal text-zinc-950 sm:text-5xl">
                워크샵 랜덤 퀴즈
              </h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-bold text-zinc-700 transition hover:border-teal-500 hover:text-teal-800"
                href={adminHref}
              >
                퀴즈 관리
              </a>
              <button
                type="button"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-bold text-rose-800 transition hover:border-rose-400"
                onClick={finishQuiz}
              >
                <TimerReset className="h-4 w-4" aria-hidden="true" />
                전체 퀴즈 종료
              </button>
            </div>
          </div>

          <div className="grid gap-3 text-sm sm:grid-cols-3">
            <StatusPill label="진행 상태" value={statusLabel(state.sessionStatus)} tone="teal" />
            <StatusPill label="남은 문제" value={`${totalRemaining}개`} tone="amber" />
            <StatusPill label="출제 완료" value={`${state.usedQuestionIds.length}개`} tone="rose" />
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_340px] lg:px-8">
        <section className="space-y-5">
          {state.sessionStatus !== "IN_PROGRESS" ? (
            <section className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-zinc-200 bg-white px-5 py-12 text-center shadow-soft">
              <p className="rounded bg-zinc-100 px-3 py-1 text-sm font-black text-zinc-600">
                {state.sessionStatus === "FINISHED" ? "퀴즈가 종료되었습니다." : "아직 퀴즈가 시작되지 않았습니다."}
              </p>
              <h2 className="mt-5 text-3xl font-black tracking-normal text-zinc-950 sm:text-5xl">
                준비되면 퀴즈를 시작하세요
              </h2>
              <button
                type="button"
                className="mt-8 inline-flex min-h-14 items-center justify-center gap-3 rounded-md bg-teal-700 px-7 py-3 text-lg font-black text-white transition hover:bg-teal-800"
                onClick={startQuiz}
              >
                <Play className="h-5 w-5" aria-hidden="true" />
                퀴즈 시작
              </button>
            </section>
          ) : null}

          {state.sessionStatus === "IN_PROGRESS" ? (
            <>
              {currentQuestion ? (
                <QuestionStage
                  category={state.categories.find((category) => category.id === currentQuestion.categoryId) ?? null}
                  question={currentQuestion}
                  isAnswerVisible={state.isAnswerVisible}
                  onRevealAnswer={revealAnswer}
                  onEndQuestion={endQuestion}
                />
              ) : (
                <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-soft">
                  <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h2 className="text-2xl font-black tracking-normal text-zinc-950">카테고리를 선택하세요</h2>
                      <p className="mt-1 text-sm font-semibold text-zinc-500">
                        남은 문제가 있는 카테고리만 표시됩니다.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-zinc-700 disabled:bg-zinc-300"
                      disabled={!state.selectedCategoryId}
                      onClick={drawQuestion}
                    >
                      <Shuffle className="h-4 w-4" aria-hidden="true" />
                      문제 뽑기
                    </button>
                  </div>

                  {activeCategories.length === 0 ? (
                    <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-5 text-center">
                      <p className="text-lg font-black text-amber-950">모든 문제가 출제되었습니다.</p>
                      <p className="mt-1 text-sm font-semibold text-amber-900">
                        전체 퀴즈를 종료하면 다시 처음부터 진행할 수 있습니다.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {activeCategories.map((category) => {
                        const remainingCount = getRemainingQuestionCount(
                          category,
                          state.questions,
                          state.usedQuestionIds,
                        );
                        const selected = state.selectedCategoryId === category.id;

                        return (
                          <button
                            key={category.id}
                            type="button"
                            className={`min-h-36 rounded-lg border p-5 text-left transition ${
                              selected
                                ? "border-teal-600 bg-teal-50 ring-2 ring-teal-100"
                                : "border-zinc-200 bg-white hover:border-teal-300"
                            }`}
                            onClick={() => selectCategory(category.id)}
                          >
                            <span className="rounded bg-white px-2 py-1 text-xs font-black text-zinc-500 ring-1 ring-zinc-200">
                              {remainingCount}개 남음
                            </span>
                            <span className="mt-4 block text-3xl font-black tracking-normal text-zinc-950">
                              {category.name}
                            </span>
                            <span className="mt-2 block text-sm font-semibold leading-6 text-zinc-500">
                              {category.description || "설명 없음"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}
            </>
          ) : null}
        </section>

        <aside className="space-y-4">
          <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-soft">
            <h2 className="text-lg font-black text-zinc-950">남은 문제 수</h2>
            <div className="mt-4 space-y-2">
              {state.categories.length === 0 ? (
                <p className="text-sm font-semibold text-zinc-500">등록된 카테고리가 없습니다.</p>
              ) : (
                state.categories.map((category) => {
                  const remainingCount = getRemainingQuestionCount(category, state.questions, state.usedQuestionIds);

                  return (
                    <div key={category.id} className="flex items-center justify-between rounded-md bg-zinc-100 px-3 py-2 text-sm">
                      <span className="font-bold text-zinc-700">{category.name}</span>
                      <span className={`font-black ${remainingCount > 0 ? "text-zinc-950" : "text-zinc-400"}`}>
                        {remainingCount}개
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-soft">
            <h2 className="text-lg font-black text-zinc-950">현재 선택</h2>
            <div className="mt-4 space-y-3 text-sm font-semibold text-zinc-600">
              <p>카테고리: {selectedCategory?.name ?? "없음"}</p>
              <p>현재 문제: {currentQuestion ? "출제 중" : "대기"}</p>
            </div>
          </section>
        </aside>
      </main>
    </div>
  );
}

function QuestionStage({
  category,
  question,
  isAnswerVisible,
  onRevealAnswer,
  onEndQuestion,
}: {
  category: QuizCategory | null;
  question: QuizQuestion;
  isAnswerVisible: boolean;
  onRevealAnswer: () => void;
  onEndQuestion: () => void;
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-soft sm:p-8">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded bg-rose-100 px-3 py-1 text-sm font-black text-rose-800">
          {category?.name ?? "카테고리"}
        </span>
        <span className="rounded bg-zinc-100 px-3 py-1 text-sm font-bold text-zinc-600">출제 중</span>
      </div>

      <div className="mt-8 rounded-lg border border-zinc-200 bg-[#fbfcff] px-5 py-10 text-center sm:px-8 sm:py-14">
        <p className="text-lg font-black text-teal-700">Q.</p>
        <h2 className="mt-4 whitespace-pre-wrap break-words text-3xl font-black leading-tight tracking-normal text-zinc-950 sm:text-5xl">
          {question.question}
        </h2>
        <QuestionMedia question={question} />
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-amber-500 px-5 py-2 text-base font-black text-zinc-950 transition hover:bg-amber-400 disabled:bg-zinc-300"
          disabled={isAnswerVisible}
          onClick={onRevealAnswer}
        >
          <Eye className="h-5 w-5" aria-hidden="true" />
          정답 보기
        </button>
        <button
          type="button"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-zinc-900 px-5 py-2 text-base font-black text-white transition hover:bg-zinc-700"
          onClick={onEndQuestion}
        >
          <Square className="h-5 w-5" aria-hidden="true" />
          이 문제 종료
        </button>
      </div>

      {isAnswerVisible ? (
        <div className="mt-6 rounded-lg border border-teal-200 bg-teal-50 px-5 py-7 text-center sm:px-8">
          <p className="text-lg font-black text-teal-800">A.</p>
          <p className="mt-3 whitespace-pre-wrap break-words text-2xl font-black leading-snug tracking-normal text-teal-950 sm:text-4xl">
            {question.answer}
          </p>
        </div>
      ) : null}
    </section>
  );
}

function QuestionMedia({ question }: { question: QuizQuestion }) {
  const mediaItems = question.mediaItems?.length
    ? question.mediaItems
    : question.mediaUrl && question.mediaType
      ? [
          {
            mediaType: question.mediaType,
            mediaUrl: question.mediaUrl,
            mediaCaption: question.mediaCaption,
          },
        ]
      : [];

  if (mediaItems.length === 0) {
    return null;
  }

  return (
    <div className={`mx-auto mt-8 grid max-w-5xl gap-4 ${mediaItems.length > 1 ? "md:grid-cols-3" : ""}`}>
      {mediaItems.map((item, index) => {
        const mediaUrl = resolveQuizMediaUrl(item.mediaUrl);

        if (item.mediaType === "audio") {
          return (
            <div key={`${item.mediaUrl}-${index}`} className="rounded-lg border border-zinc-200 bg-white p-4 text-left">
              <div className="mb-3 flex items-center gap-2 text-sm font-black text-zinc-700">
                <Volume2 className="h-4 w-4 text-rose-600" aria-hidden="true" />
                사운드
              </div>
              <audio className="w-full" controls src={mediaUrl}>
                오디오를 재생할 수 없습니다.
              </audio>
              {item.mediaCaption ? (
                <p className="mt-2 text-sm font-semibold text-zinc-500">{item.mediaCaption}</p>
              ) : null}
            </div>
          );
        }

        return (
          <figure key={`${item.mediaUrl}-${index}`} className="rounded-lg border border-zinc-200 bg-white p-3">
            <div className="mb-3 flex items-center justify-center gap-2 text-sm font-black text-zinc-700">
              <ImageIcon className="h-4 w-4 text-rose-600" aria-hidden="true" />
              이미지
            </div>
            <img
              className="mx-auto aspect-[4/3] w-full rounded-md border border-zinc-100 bg-white object-cover"
              src={mediaUrl}
              alt={item.mediaCaption || "퀴즈 이미지"}
            />
            {item.mediaCaption ? (
              <figcaption className="mt-2 text-sm font-black text-zinc-700">{item.mediaCaption}</figcaption>
            ) : null}
          </figure>
        );
      })}
    </div>
  );
}

function StatusPill({ label, value, tone }: { label: string; value: string; tone: "teal" | "amber" | "rose" }) {
  const tones = {
    teal: "border-teal-200 bg-teal-50 text-teal-950",
    amber: "border-amber-200 bg-amber-50 text-amber-950",
    rose: "border-rose-200 bg-rose-50 text-rose-950",
  };

  return (
    <div className={`flex items-center justify-between rounded-md border px-4 py-3 ${tones[tone]}`}>
      <span className="font-bold">{label}</span>
      <span className="font-black">{value}</span>
    </div>
  );
}

function getRemainingQuestionCount(category: QuizCategory, questions: QuizQuestion[], usedQuestionIds: string[]) {
  return questions.filter(
    (question) => question.categoryId === category.id && question.useYn && !usedQuestionIds.includes(question.id),
  ).length;
}

function statusLabel(status: string) {
  if (status === "IN_PROGRESS") {
    return "진행 중";
  }

  if (status === "FINISHED") {
    return "종료";
  }

  return "대기 중";
}

function getProjectRouteHref(route: string) {
  const parts = window.location.pathname.split("/").filter(Boolean);
  const projectBase = parts[0] === "workshop_2026" ? "/workshop_2026" : "";
  return `${projectBase}/${route}`;
}

function resolveQuizMediaUrl(url: string) {
  if (/^(https?:|data:|blob:)/.test(url)) {
    return url;
  }

  const parts = window.location.pathname.split("/").filter(Boolean);
  const projectBase = parts[0] === "workshop_2026" ? "/workshop_2026" : "";

  if (url.startsWith("/workshop_2026/")) {
    return url;
  }

  if (url.startsWith("/")) {
    return `${projectBase}${url}`;
  }

  return `${projectBase}/${url}`;
}
