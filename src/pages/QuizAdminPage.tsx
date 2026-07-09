import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { Download, LockKeyhole, Pencil, Play, Plus, RefreshCw, Save, Square, Trash2, Upload } from "lucide-react";
import { PageShell } from "../components/PageShell";
import { Button, Notice, SelectInput, TextArea, TextInput } from "../components/ui";
import { rpcErrorMessage, supabase } from "../lib/supabase";
import {
  createQuizId,
  DEFAULT_QUIZ_CATEGORIES,
  DEFAULT_QUIZ_QUESTIONS,
  loadQuizState,
  QuizCategory,
  QuizQuestion,
  resetQuizProgress,
  saveQuizCategories,
  saveQuizQuestions,
  saveQuizRuntimeState,
  saveQuizSessionStatus,
  saveUsedQuestionIds,
  sortCategories,
  sortQuestions,
} from "../lib/quizStorage";

const PASSWORD_STORAGE_KEY = "ws:admin-password";

type CategoryForm = {
  name: string;
  description: string;
  sortOrder: number;
  useYn: boolean;
};

type QuestionForm = {
  categoryId: string;
  question: string;
  answer: string;
  mediaType: "" | "image" | "audio";
  mediaUrl: string;
  mediaCaption: string;
  sortOrder: number;
  useYn: boolean;
};

const emptyCategoryForm: CategoryForm = {
  name: "",
  description: "",
  sortOrder: 1,
  useYn: true,
};

const emptyQuestionForm: QuestionForm = {
  categoryId: "",
  question: "",
  answer: "",
  mediaType: "",
  mediaUrl: "",
  mediaCaption: "",
  sortOrder: 1,
  useYn: true,
};

export function QuizAdminPage() {
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const [password, setPassword] = useState(() => window.sessionStorage.getItem(PASSWORD_STORAGE_KEY) || "");
  const [authenticated, setAuthenticated] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [categories, setCategories] = useState<QuizCategory[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [sessionStatus, setSessionStatus] = useState(loadQuizState().sessionStatus);
  const [usedCount, setUsedCount] = useState(loadQuizState().usedQuestionIds.length);
  const [categoryForm, setCategoryForm] = useState<CategoryForm>(emptyCategoryForm);
  const [editingCategoryId, setEditingCategoryId] = useState("");
  const [questionForm, setQuestionForm] = useState<QuestionForm>(emptyQuestionForm);
  const [editingQuestionId, setEditingQuestionId] = useState("");
  const [status, setStatus] = useState<{ tone: "success" | "warning" | "error"; text: string } | null>(null);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!password.trim()) {
      setStatus({ tone: "warning", text: "관리자 비밀번호를 입력해주세요." });
      return;
    }

    setAuthenticating(true);
    const { error } = await supabase.rpc("ws_admin_overview", { p_password: password.trim() });
    setAuthenticating(false);

    if (error) {
      setStatus({ tone: "error", text: rpcErrorMessage(error) });
      return;
    }

    window.sessionStorage.setItem(PASSWORD_STORAGE_KEY, password.trim());
    setAuthenticated(true);
    loadLocalData();
    setStatus({ tone: "success", text: "퀴즈 관리자 화면이 열렸습니다." });
  }

  function loadLocalData() {
    const next = loadQuizState();
    setCategories(next.categories);
    setQuestions(next.questions);
    setSessionStatus(next.sessionStatus);
    setUsedCount(next.usedQuestionIds.length);
  }

  function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!categoryForm.name.trim()) {
      setStatus({ tone: "warning", text: "카테고리명을 입력해주세요." });
      return;
    }

    const nextCategories = editingCategoryId
      ? categories.map((category) =>
          category.id === editingCategoryId
            ? {
                ...category,
                name: categoryForm.name.trim(),
                description: categoryForm.description.trim(),
                sortOrder: categoryForm.sortOrder || 0,
                useYn: categoryForm.useYn,
              }
            : category,
        )
      : [
          ...categories,
          {
            id: createQuizId("cat"),
            name: categoryForm.name.trim(),
            description: categoryForm.description.trim(),
            sortOrder: categoryForm.sortOrder || categories.length + 1,
            useYn: categoryForm.useYn,
          },
        ];

    saveQuizCategories(nextCategories);
    setCategories(sortCategories(nextCategories));
    setCategoryForm(emptyCategoryForm);
    setEditingCategoryId("");
    setStatus({ tone: "success", text: editingCategoryId ? "카테고리가 수정되었습니다." : "카테고리가 추가되었습니다." });
  }

  function editCategory(category: QuizCategory) {
    setEditingCategoryId(category.id);
    setCategoryForm({
      name: category.name,
      description: category.description,
      sortOrder: category.sortOrder,
      useYn: category.useYn,
    });
  }

  function deleteCategory(category: QuizCategory) {
    const relatedQuestionCount = questions.filter((question) => question.categoryId === category.id).length;
    const message =
      relatedQuestionCount > 0
        ? `${category.name} 카테고리와 연결된 문제 ${relatedQuestionCount}개를 함께 삭제할까요?`
        : `${category.name} 카테고리를 삭제할까요?`;

    if (!window.confirm(message)) {
      return;
    }

    const nextCategories = categories.filter((item) => item.id !== category.id);
    const nextQuestions = questions.filter((question) => question.categoryId !== category.id);

    saveQuizCategories(nextCategories);
    saveQuizQuestions(nextQuestions);
    setCategories(sortCategories(nextCategories));
    setQuestions(sortQuestions(nextQuestions));
    cancelCategoryEdit();
    setStatus({ tone: "success", text: "카테고리가 삭제되었습니다." });
  }

  function cancelCategoryEdit() {
    setEditingCategoryId("");
    setCategoryForm(emptyCategoryForm);
  }

  function saveQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!questionForm.categoryId) {
      setStatus({ tone: "warning", text: "카테고리를 선택해주세요." });
      return;
    }

    if (!questionForm.question.trim() || !questionForm.answer.trim()) {
      setStatus({ tone: "warning", text: "문제와 정답을 모두 입력해주세요." });
      return;
    }

    const nextQuestions = editingQuestionId
      ? questions.map((question) =>
          question.id === editingQuestionId
            ? {
                ...question,
                categoryId: questionForm.categoryId,
                question: questionForm.question.trim(),
                answer: questionForm.answer.trim(),
                mediaType: questionForm.mediaType,
                mediaUrl: questionForm.mediaUrl.trim(),
                mediaCaption: questionForm.mediaCaption.trim(),
                sortOrder: questionForm.sortOrder || 0,
                useYn: questionForm.useYn,
              }
            : question,
        )
      : [
          ...questions,
          {
            id: createQuizId("q"),
            categoryId: questionForm.categoryId,
            question: questionForm.question.trim(),
            answer: questionForm.answer.trim(),
            mediaType: questionForm.mediaType,
            mediaUrl: questionForm.mediaUrl.trim(),
            mediaCaption: questionForm.mediaCaption.trim(),
            sortOrder: questionForm.sortOrder || questions.length + 1,
            useYn: questionForm.useYn,
          },
        ];

    saveQuizQuestions(nextQuestions);
    setQuestions(sortQuestions(nextQuestions));
    setQuestionForm({ ...emptyQuestionForm, categoryId: categories[0]?.id || "" });
    setEditingQuestionId("");
    setStatus({ tone: "success", text: editingQuestionId ? "문제가 수정되었습니다." : "문제가 추가되었습니다." });
  }

  function editQuestion(question: QuizQuestion) {
    setEditingQuestionId(question.id);
    setQuestionForm({
      categoryId: question.categoryId,
      question: question.question,
      answer: question.answer,
      mediaType: question.mediaType || "",
      mediaUrl: question.mediaUrl || "",
      mediaCaption: question.mediaCaption || "",
      sortOrder: question.sortOrder,
      useYn: question.useYn,
    });
  }

  function deleteQuestion(question: QuizQuestion) {
    if (!window.confirm("이 문제를 삭제할까요?")) {
      return;
    }

    const nextQuestions = questions.filter((item) => item.id !== question.id);
    saveQuizQuestions(nextQuestions);
    setQuestions(sortQuestions(nextQuestions));
    cancelQuestionEdit();
    setStatus({ tone: "success", text: "문제가 삭제되었습니다." });
  }

  function cancelQuestionEdit() {
    setEditingQuestionId("");
    setQuestionForm({ ...emptyQuestionForm, categoryId: categories[0]?.id || "" });
  }

  function startQuiz() {
    saveQuizSessionStatus("IN_PROGRESS");
    saveQuizRuntimeState({ currentQuestionId: "", isAnswerVisible: false });
    loadLocalData();
    setStatus({ tone: "success", text: "퀴즈 진행 상태가 시작으로 변경되었습니다." });
  }

  function finishQuiz() {
    if (!window.confirm("전체 퀴즈를 종료하고 출제 이력을 초기화할까요?")) {
      return;
    }

    resetQuizProgress("FINISHED");
    loadLocalData();
    setStatus({ tone: "success", text: "퀴즈가 종료되고 출제 이력이 초기화되었습니다." });
  }

  function resetProgress() {
    if (!window.confirm("출제 이력만 초기화할까요?")) {
      return;
    }

    resetQuizProgress("READY");
    loadLocalData();
    setStatus({ tone: "success", text: "출제 이력이 초기화되었습니다." });
  }

  function restoreDefaults() {
    if (!window.confirm("기본 샘플 데이터로 복원할까요? 기존 퀴즈 데이터는 바뀝니다.")) {
      return;
    }

    saveQuizCategories(DEFAULT_QUIZ_CATEGORIES);
    saveQuizQuestions(DEFAULT_QUIZ_QUESTIONS);
    resetQuizProgress("READY");
    loadLocalData();
    setStatus({ tone: "success", text: "기본 데이터가 복원되었습니다." });
  }

  function clearAllData() {
    if (!window.confirm("카테고리와 문제를 모두 비울까요?")) {
      return;
    }

    saveQuizCategories([]);
    saveQuizQuestions([]);
    saveUsedQuestionIds([]);
    saveQuizSessionStatus("READY");
    saveQuizRuntimeState({ selectedCategoryId: "", currentQuestionId: "", isAnswerVisible: false });
    loadLocalData();
    setStatus({ tone: "success", text: "퀴즈 데이터가 초기화되었습니다." });
  }

  function exportJson() {
    const payload = {
      categories,
      questions,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "workshop-quiz-data.json";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  function importJson(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const nextCategories = Array.isArray(parsed.categories) ? parsed.categories : [];
        const nextQuestions = Array.isArray(parsed.questions) ? parsed.questions : [];

        if (!nextCategories.length && !nextQuestions.length) {
          setStatus({ tone: "warning", text: "가져올 카테고리 또는 문제가 없습니다." });
          return;
        }

        saveQuizCategories(nextCategories);
        saveQuizQuestions(nextQuestions);
        resetQuizProgress("READY");
        loadLocalData();
        setStatus({ tone: "success", text: "JSON 데이터를 가져왔습니다." });
      } catch {
        setStatus({ tone: "error", text: "JSON 파일 형식을 확인해주세요." });
      }
    };
    reader.readAsText(file);
  }

  const questionsByCategory = sortQuestions(questions).map((question) => ({
    ...question,
    categoryName: categories.find((category) => category.id === question.categoryId)?.name ?? "카테고리 없음",
  }));

  return (
    <PageShell eyebrow="퀴즈 관리자" title="워크샵 랜덤 퀴즈 관리">
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
            <Button className="self-end" type="submit" disabled={authenticating}>
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

        {authenticated ? (
          <>
            <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
              <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-soft">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-bold text-zinc-950">진행 제어</h2>
                  <Button type="button" variant="secondary" onClick={loadLocalData}>
                    <RefreshCw className="h-4 w-4" aria-hidden="true" />
                    새로고침
                  </Button>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <Metric label="진행 상태" value={sessionStatusLabel(sessionStatus)} tone="teal" />
                  <Metric label="카테고리" value={`${categories.length}개`} tone="amber" />
                  <Metric label="출제 완료" value={`${usedCount}개`} tone="zinc" />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button type="button" onClick={startQuiz}>
                    <Play className="h-4 w-4" aria-hidden="true" />
                    퀴즈 시작
                  </Button>
                  <Button type="button" variant="secondary" onClick={resetProgress}>
                    <RefreshCw className="h-4 w-4" aria-hidden="true" />
                    출제 이력 초기화
                  </Button>
                  <Button type="button" variant="danger" onClick={finishQuiz}>
                    <Square className="h-4 w-4" aria-hidden="true" />
                    전체 퀴즈 종료
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-soft">
                <h2 className="text-lg font-bold text-zinc-950">데이터 관리</h2>
                <input
                  ref={importInputRef}
                  className="hidden"
                  type="file"
                  accept="application/json,.json"
                  onChange={importJson}
                />
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <Button type="button" variant="secondary" onClick={exportJson}>
                    <Download className="h-4 w-4" aria-hidden="true" />
                    JSON 내보내기
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => importInputRef.current?.click()}>
                    <Upload className="h-4 w-4" aria-hidden="true" />
                    JSON 가져오기
                  </Button>
                  <Button type="button" variant="secondary" onClick={restoreDefaults}>
                    기본 데이터 복원
                  </Button>
                  <Button type="button" variant="danger" onClick={clearAllData}>
                    전체 초기화
                  </Button>
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-soft">
              <h2 className="text-lg font-bold text-zinc-950">카테고리 관리</h2>
              <form className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_120px_120px_auto]" onSubmit={saveCategory}>
                <label className="block space-y-2">
                  <span className="text-sm font-bold text-zinc-700">카테고리명</span>
                  <TextInput
                    value={categoryForm.name}
                    onChange={(event) => setCategoryForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder="예: 신조어"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-bold text-zinc-700">설명</span>
                  <TextInput
                    value={categoryForm.description}
                    onChange={(event) =>
                      setCategoryForm((current) => ({ ...current, description: event.target.value }))
                    }
                    placeholder="예: 요즘 밈과 신조어"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-bold text-zinc-700">순서</span>
                  <TextInput
                    type="number"
                    value={categoryForm.sortOrder}
                    onChange={(event) =>
                      setCategoryForm((current) => ({ ...current, sortOrder: Number(event.target.value) }))
                    }
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-bold text-zinc-700">사용 여부</span>
                  <SelectInput
                    value={categoryForm.useYn ? "true" : "false"}
                    onChange={(event) =>
                      setCategoryForm((current) => ({ ...current, useYn: event.target.value === "true" }))
                    }
                  >
                    <option value="true">사용</option>
                    <option value="false">미사용</option>
                  </SelectInput>
                </label>
                <div className="flex items-end gap-2">
                  <Button type="submit">
                    {editingCategoryId ? <Save className="h-4 w-4" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
                    {editingCategoryId ? "저장" : "추가"}
                  </Button>
                  {editingCategoryId ? (
                    <Button type="button" variant="secondary" onClick={cancelCategoryEdit}>
                      취소
                    </Button>
                  ) : null}
                </div>
              </form>

              <div className="mt-5 overflow-x-auto rounded-md border border-zinc-200">
                <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
                  <thead className="bg-zinc-100 text-zinc-500">
                    <tr>
                      <Th>카테고리명</Th>
                      <Th>설명</Th>
                      <Th>사용</Th>
                      <Th>순서</Th>
                      <Th>관리</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr key={category.id}>
                        <Td>{category.name}</Td>
                        <Td>{category.description}</Td>
                        <Td>{category.useYn ? "사용" : "미사용"}</Td>
                        <Td>{category.sortOrder}</Td>
                        <Td>
                          <RowActions onEdit={() => editCategory(category)} onDelete={() => deleteCategory(category)} />
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-soft">
              <h2 className="text-lg font-bold text-zinc-950">문제 관리</h2>
              <form className="mt-4 space-y-3" onSubmit={saveQuestion}>
                <div className="grid gap-3 lg:grid-cols-[220px_140px_120px_120px]">
                  <label className="block space-y-2">
                    <span className="text-sm font-bold text-zinc-700">카테고리</span>
                    <SelectInput
                      value={questionForm.categoryId}
                      onChange={(event) =>
                        setQuestionForm((current) => ({ ...current, categoryId: event.target.value }))
                      }
                    >
                      <option value="">선택</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </SelectInput>
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-bold text-zinc-700">미디어 유형</span>
                    <SelectInput
                      value={questionForm.mediaType}
                      onChange={(event) =>
                        setQuestionForm((current) => ({
                          ...current,
                          mediaType: event.target.value as QuestionForm["mediaType"],
                        }))
                      }
                    >
                      <option value="">없음</option>
                      <option value="image">이미지</option>
                      <option value="audio">오디오</option>
                    </SelectInput>
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-bold text-zinc-700">순서</span>
                    <TextInput
                      type="number"
                      value={questionForm.sortOrder}
                      onChange={(event) =>
                        setQuestionForm((current) => ({ ...current, sortOrder: Number(event.target.value) }))
                      }
                    />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-bold text-zinc-700">사용 여부</span>
                    <SelectInput
                      value={questionForm.useYn ? "true" : "false"}
                      onChange={(event) =>
                        setQuestionForm((current) => ({ ...current, useYn: event.target.value === "true" }))
                      }
                    >
                      <option value="true">사용</option>
                      <option value="false">미사용</option>
                    </SelectInput>
                  </label>
                </div>
                <div className="grid gap-3 lg:grid-cols-2">
                  <label className="block space-y-2">
                    <span className="text-sm font-bold text-zinc-700">미디어 URL</span>
                    <TextInput
                      value={questionForm.mediaUrl}
                      onChange={(event) =>
                        setQuestionForm((current) => ({ ...current, mediaUrl: event.target.value }))
                      }
                      placeholder="예: quiz-assets/sound/modem.mp3"
                    />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-bold text-zinc-700">미디어 설명</span>
                    <TextInput
                      value={questionForm.mediaCaption}
                      onChange={(event) =>
                        setQuestionForm((current) => ({ ...current, mediaCaption: event.target.value }))
                      }
                      placeholder="예: 모뎀 연결음"
                    />
                  </label>
                </div>
                <div className="grid gap-3 lg:grid-cols-2">
                  <label className="block space-y-2">
                    <span className="text-sm font-bold text-zinc-700">문제</span>
                    <TextArea
                      value={questionForm.question}
                      onChange={(event) =>
                        setQuestionForm((current) => ({ ...current, question: event.target.value }))
                      }
                      placeholder="실제 출제 문구"
                    />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-bold text-zinc-700">정답</span>
                    <TextArea
                      value={questionForm.answer}
                      onChange={(event) => setQuestionForm((current) => ({ ...current, answer: event.target.value }))}
                      placeholder="진행자 확인용 정답"
                    />
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="submit">
                    {editingQuestionId ? <Save className="h-4 w-4" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
                    {editingQuestionId ? "문제 저장" : "문제 추가"}
                  </Button>
                  {editingQuestionId ? (
                    <Button type="button" variant="secondary" onClick={cancelQuestionEdit}>
                      취소
                    </Button>
                  ) : null}
                </div>
              </form>

              <div className="mt-5 max-h-[560px] overflow-auto rounded-md border border-zinc-200">
                <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
                  <thead className="sticky top-0 bg-zinc-100 text-zinc-500">
                    <tr>
                      <Th>카테고리</Th>
                      <Th>문제</Th>
                      <Th>정답</Th>
                      <Th>미디어</Th>
                      <Th>사용</Th>
                      <Th>순서</Th>
                      <Th>관리</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {questionsByCategory.map((question) => (
                      <tr key={question.id} className="align-top">
                        <Td>{question.categoryName}</Td>
                        <Td>
                          <p className="max-w-xs whitespace-pre-wrap">{question.question}</p>
                        </Td>
                        <Td>
                          <p className="max-w-xs whitespace-pre-wrap text-zinc-600">{question.answer}</p>
                        </Td>
                        <Td>
                          {question.mediaItems?.length ? (
                            <p className="max-w-[180px] break-words text-xs font-semibold text-zinc-600">
                              {question.mediaItems.every((item) => item.mediaType === "audio") ? "오디오" : "이미지"}{" "}
                              {question.mediaItems.length}개
                            </p>
                          ) : question.mediaUrl ? (
                            <p className="max-w-[180px] break-words text-xs font-semibold text-zinc-600">
                              {question.mediaType === "audio" ? "오디오" : "이미지"} · {question.mediaUrl}
                            </p>
                          ) : (
                            <span className="text-zinc-400">없음</span>
                          )}
                        </Td>
                        <Td>{question.useYn ? "사용" : "미사용"}</Td>
                        <Td>{question.sortOrder}</Td>
                        <Td>
                          <RowActions onEdit={() => editQuestion(question)} onDelete={() => deleteQuestion(question)} />
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </PageShell>
  );
}

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-300 text-zinc-700 transition hover:border-teal-400 hover:text-teal-800"
        onClick={onEdit}
        aria-label="수정"
      >
        <Pencil className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-rose-200 text-rose-700 transition hover:border-rose-400"
        onClick={onDelete}
        aria-label="삭제"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
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

function Th({ children }: { children: React.ReactNode }) {
  return <th className="border-b border-zinc-200 px-3 py-2 text-xs font-bold uppercase">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="border-b border-zinc-100 px-3 py-3 text-zinc-800">{children}</td>;
}

function sessionStatusLabel(status: string) {
  if (status === "IN_PROGRESS") {
    return "진행 중";
  }

  if (status === "FINISHED") {
    return "종료";
  }

  return "대기 중";
}
