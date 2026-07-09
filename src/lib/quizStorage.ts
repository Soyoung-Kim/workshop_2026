export type QuizSessionStatus = "READY" | "IN_PROGRESS" | "FINISHED";

export type QuizCategory = {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
  useYn: boolean;
};

export type QuizMediaItem = {
  mediaType: "image" | "audio";
  mediaUrl: string;
  mediaCaption?: string;
};

export type QuizQuestion = {
  id: string;
  categoryId: string;
  question: string;
  answer: string;
  mediaType?: "" | "image" | "audio";
  mediaUrl?: string;
  mediaCaption?: string;
  mediaItems?: QuizMediaItem[];
  sortOrder: number;
  useYn: boolean;
};

export type QuizState = {
  categories: QuizCategory[];
  questions: QuizQuestion[];
  usedQuestionIds: string[];
  sessionStatus: QuizSessionStatus;
  selectedCategoryId: string;
  currentQuestionId: string;
  isAnswerVisible: boolean;
};

export const QUIZ_KEYS = {
  categories: "quiz.categories",
  questions: "quiz.questions",
  usedQuestionIds: "quiz.usedQuestionIds",
  sessionStatus: "quiz.sessionStatus",
  selectedCategoryId: "quiz.selectedCategoryId",
  currentQuestionId: "quiz.currentQuestionId",
  isAnswerVisible: "quiz.isAnswerVisible",
  dataVersion: "quiz.dataVersion",
};

export const DEFAULT_QUIZ_DATA_VERSION = "2026-07-10-workshop-quiz-v6";

export const DEFAULT_QUIZ_CATEGORIES: QuizCategory[] = [
  {
    id: "cat_person",
    name: "인물",
    description: "발표자와 참석자 관련 문제",
    sortOrder: 1,
    useYn: true,
  },
  {
    id: "cat_it",
    name: "IT 상식",
    description: "IT 회사 구성원이 알면 좋은 쉬운 상식",
    sortOrder: 2,
    useYn: true,
  },
  {
    id: "cat_nonsense",
    name: "넌센스/초성퀴즈",
    description: "말장난, 그림, 초성 순발력 퀴즈",
    sortOrder: 3,
    useYn: true,
  },
  {
    id: "cat_memory",
    name: "추억 소환",
    description: "80~90년대 문화와 물건",
    sortOrder: 5,
    useYn: true,
  },
];

export const DEFAULT_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q_person_001",
    categoryId: "cat_person",
    question: "오늘 첫 번째 발표를 진행한 사람은 누구일까요?",
    answer: "행사 당일 입력",
    sortOrder: 1,
    useYn: true,
  },
  {
    id: "q_person_002",
    categoryId: "cat_person",
    question: "오늘 사회자는 누구일까요?",
    answer: "행사 당일 입력",
    sortOrder: 2,
    useYn: true,
  },
  {
    id: "q_person_003",
    categoryId: "cat_person",
    question: "오늘 발표한 OO님의 생일은 언제일까요?",
    answer: "행사 당일 입력",
    sortOrder: 3,
    useYn: true,
  },
  {
    id: "q_person_004",
    categoryId: "cat_person",
    question: "오늘 발표한 OO님의 MBTI는 무엇일까요?",
    answer: "행사 당일 입력",
    sortOrder: 4,
    useYn: true,
  },
  {
    id: "q_it_001",
    categoryId: "cat_it",
    question: "AI는 무엇의 약자일까요?",
    answer: "Artificial Intelligence",
    sortOrder: 1,
    useYn: true,
  },
  {
    id: "q_it_002",
    categoryId: "cat_it",
    question: "AWS의 S3에서 S는 무엇의 약자일까요?",
    answer: "Simple Storage Service",
    sortOrder: 2,
    useYn: true,
  },
  {
    id: "q_it_003",
    categoryId: "cat_it",
    question: "URL에서 U는 무엇의 약자일까요?",
    answer: "Uniform\n\n(Uniform Resource Locator)",
    sortOrder: 3,
    useYn: true,
  },
  {
    id: "q_it_004",
    categoryId: "cat_it",
    question: "HTTP에서 H는 무엇의 약자일까요?",
    answer: "HyperText\n\n(HyperText Transfer Protocol)",
    sortOrder: 4,
    useYn: true,
  },
  {
    id: "q_nonsense_001",
    categoryId: "cat_nonsense",
    question: "세상에서 가장 쉬운 숫자는?",
    answer: "190000 (십구만)",
    sortOrder: 1,
    useYn: true,
  },
  {
    id: "q_nonsense_002",
    categoryId: "cat_nonsense",
    question: "아빠들이 같이 세면?",
    answer: "부가가치세",
    sortOrder: 2,
    useYn: true,
  },
  {
    id: "q_nonsense_003",
    categoryId: "cat_nonsense",
    question: "세상에서 가장 뜨거운 과일은",
    answer: "천도복숭아",
    mediaType: "image",
    mediaUrl: "quiz-assets/images/cheondo.png",
    mediaCaption: "",
    sortOrder: 3,
    useYn: true,
  },
  {
    id: "q_nonsense_004",
    categoryId: "cat_nonsense",
    question: "그림 넌센스 퀴즈",
    answer: "돈다발",
    mediaType: "image",
    mediaUrl: "quiz-assets/images/binggeul.png",
    mediaCaption: "",
    sortOrder: 4,
    useYn: true,
  },
  {
    id: "q_memory_001",
    categoryId: "cat_memory",
    question: "다음 숫자의 의미를 모두 맞혀보세요.\n\n486\n7942\n0024",
    answer: "486 -> 사랑해\n7942 -> 친구사이\n0024 -> 이 세상에 하나뿐인 사랑",
    mediaType: "",
    mediaUrl: "",
    mediaCaption: "",
    sortOrder: 1,
    useYn: true,
  },
  {
    id: "q_memory_003",
    categoryId: "cat_memory",
    question: "다음 추억의 애니메이션 이름을 각각 맞혀보세요.",
    answer: "세일러문\n카드캡터 체리\n시간탐험대",
    mediaItems: [
      {
        mediaType: "image",
        mediaUrl: "quiz-assets/images/sailor-moon.png",
        mediaCaption: "세일러문",
      },
      {
        mediaType: "image",
        mediaUrl: "quiz-assets/images/cardcaptor-cherry.png",
        mediaCaption: "카드캡터 체리",
      },
      {
        mediaType: "image",
        mediaUrl: "quiz-assets/images/time-quest.png",
        mediaCaption: "시간탐험대",
      },
    ],
    sortOrder: 3,
    useYn: true,
  },
  {
    id: "q_chosung_001",
    categoryId: "cat_nonsense",
    question: "이미지를 보고 정답을 맞혀보세요.",
    answer: "꾸중",
    mediaItems: [
      {
        mediaType: "image",
        mediaUrl: "quiz-assets/images/chosung-scolding.png",
        mediaCaption: "정답 초성: ㄲㅈ",
      },
    ],
    sortOrder: 5,
    useYn: true,
  },
  {
    id: "q_chosung_002",
    categoryId: "cat_nonsense",
    question: "이미지를 보고 정답을 맞혀보세요.",
    answer: "백수",
    mediaItems: [
      {
        mediaType: "image",
        mediaUrl: "quiz-assets/images/chosung-unemployed.png",
        mediaCaption: "정답 초성: ㅂㅅ",
      },
    ],
    sortOrder: 6,
    useYn: true,
  },
  {
    id: "q_chosung_003",
    categoryId: "cat_nonsense",
    question: "이미지를 보고 정답을 맞혀보세요.",
    answer: "조롱",
    mediaItems: [
      {
        mediaType: "image",
        mediaUrl: "quiz-assets/images/chosung-mocking.png",
        mediaCaption: "정답 초성: ㅈㄹ",
      },
    ],
    sortOrder: 7,
    useYn: true,
  },
  {
    id: "q_chosung_004",
    categoryId: "cat_nonsense",
    question: "이미지를 보고 정답을 맞혀보세요.",
    answer: "마침내",
    mediaItems: [
      {
        mediaType: "image",
        mediaUrl: "quiz-assets/images/chosung-finally.png",
        mediaCaption: "정답 초성: ㅁㅊㄴ",
      },
    ],
    sortOrder: 8,
    useYn: true,
  },
];

export function loadQuizState(): QuizState {
  const hasStoredCategories = Boolean(window.localStorage.getItem(QUIZ_KEYS.categories));
  const hasStoredQuestions = Boolean(window.localStorage.getItem(QUIZ_KEYS.questions));
  const storedVersion = window.localStorage.getItem(QUIZ_KEYS.dataVersion);
  const storedQuestions = readArray<QuizQuestion>(QUIZ_KEYS.questions, []);
  const shouldReplaceOldBundledData =
    hasStoredQuestions &&
    ((!storedVersion && looksLikeInitialBundledQuestions(storedQuestions)) ||
      (storedVersion !== DEFAULT_QUIZ_DATA_VERSION && looksLikePreviousBundledQuestions(storedQuestions)));
  let categories = readArray<QuizCategory>(QUIZ_KEYS.categories, DEFAULT_QUIZ_CATEGORIES);
  let questions = readArray<QuizQuestion>(QUIZ_KEYS.questions, DEFAULT_QUIZ_QUESTIONS);

  if (!hasStoredCategories || shouldReplaceOldBundledData) {
    categories = DEFAULT_QUIZ_CATEGORIES;
    saveQuizCategories(categories);
  }

  if (!hasStoredQuestions || shouldReplaceOldBundledData) {
    questions = DEFAULT_QUIZ_QUESTIONS;
    saveQuizQuestions(questions);
  }

  if (!storedVersion || shouldReplaceOldBundledData) {
    window.localStorage.setItem(QUIZ_KEYS.dataVersion, DEFAULT_QUIZ_DATA_VERSION);
  }

  return {
    categories: sortCategories(categories),
    questions: sortQuestions(questions),
    usedQuestionIds: readArray<string>(QUIZ_KEYS.usedQuestionIds, []),
    sessionStatus: readSessionStatus(),
    selectedCategoryId: window.localStorage.getItem(QUIZ_KEYS.selectedCategoryId) || "",
    currentQuestionId: window.localStorage.getItem(QUIZ_KEYS.currentQuestionId) || "",
    isAnswerVisible: window.localStorage.getItem(QUIZ_KEYS.isAnswerVisible) === "true",
  };
}

export function saveQuizCategories(categories: QuizCategory[]) {
  window.localStorage.setItem(QUIZ_KEYS.categories, JSON.stringify(sortCategories(categories)));
  window.localStorage.setItem(QUIZ_KEYS.dataVersion, DEFAULT_QUIZ_DATA_VERSION);
}

export function saveQuizQuestions(questions: QuizQuestion[]) {
  window.localStorage.setItem(QUIZ_KEYS.questions, JSON.stringify(sortQuestions(questions)));
  window.localStorage.setItem(QUIZ_KEYS.dataVersion, DEFAULT_QUIZ_DATA_VERSION);
}

export function saveUsedQuestionIds(questionIds: string[]) {
  window.localStorage.setItem(QUIZ_KEYS.usedQuestionIds, JSON.stringify([...new Set(questionIds)]));
}

export function saveQuizSessionStatus(status: QuizSessionStatus) {
  window.localStorage.setItem(QUIZ_KEYS.sessionStatus, status);
}

export function saveQuizRuntimeState({
  selectedCategoryId,
  currentQuestionId,
  isAnswerVisible,
}: {
  selectedCategoryId?: string;
  currentQuestionId?: string;
  isAnswerVisible?: boolean;
}) {
  if (selectedCategoryId !== undefined) {
    window.localStorage.setItem(QUIZ_KEYS.selectedCategoryId, selectedCategoryId);
  }

  if (currentQuestionId !== undefined) {
    window.localStorage.setItem(QUIZ_KEYS.currentQuestionId, currentQuestionId);
  }

  if (isAnswerVisible !== undefined) {
    window.localStorage.setItem(QUIZ_KEYS.isAnswerVisible, String(isAnswerVisible));
  }
}

export function resetQuizProgress(status: QuizSessionStatus = "FINISHED") {
  saveUsedQuestionIds([]);
  saveQuizSessionStatus(status);
  saveQuizRuntimeState({
    selectedCategoryId: "",
    currentQuestionId: "",
    isAnswerVisible: false,
  });
}

export function restoreDefaultQuizData() {
  saveQuizCategories(DEFAULT_QUIZ_CATEGORIES);
  saveQuizQuestions(DEFAULT_QUIZ_QUESTIONS);
  resetQuizProgress("READY");
}

export function clearQuizData() {
  Object.values(QUIZ_KEYS).forEach((key) => window.localStorage.removeItem(key));
}

export function createQuizId(prefix: string) {
  if ("crypto" in window && "randomUUID" in window.crypto) {
    return `${prefix}_${window.crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function sortCategories(categories: QuizCategory[]) {
  return [...categories].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "ko-KR"));
}

export function sortQuestions(questions: QuizQuestion[]) {
  return [...questions].sort((a, b) => a.sortOrder - b.sortOrder || a.question.localeCompare(b.question, "ko-KR"));
}

function readArray<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = window.localStorage.getItem(key);

    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function readSessionStatus(): QuizSessionStatus {
  const value = window.localStorage.getItem(QUIZ_KEYS.sessionStatus);

  if (value === "READY" || value === "IN_PROGRESS" || value === "FINISHED") {
    return value;
  }

  return "READY";
}

function looksLikeInitialBundledQuestions(questions: QuizQuestion[]) {
  return (
    questions.length === 7 &&
    questions.some((question) => question.id === "q_it_002" && question.answer === "Simple Storage Service") &&
    questions.some((question) => question.id === "q_new_001") &&
    !questions.some((question) => question.id === "q_person_004")
  );
}

function looksLikePreviousBundledQuestions(questions: QuizQuestion[]) {
  const memoryImageQuestion = questions.find((question) => question.id === "q_memory_003");

  return (
    (questions.length === 20 &&
      Boolean(memoryImageQuestion) &&
      !memoryImageQuestion?.mediaItems?.length &&
      memoryImageQuestion?.question.includes("천사소녀 네티")) ||
    (questions.length === 20 &&
      Boolean(memoryImageQuestion?.mediaItems?.length) &&
      !questions.some((question) => question.id === "q_chosung_001")) ||
    (questions.length === 24 &&
      questions.some((question) => question.id === "q_new_001") &&
      questions.some((question) => question.id === "q_chosung_001")) ||
    (questions.length === 18 &&
      questions.some((question) => question.id === "q_chosung_001" && question.categoryId === "cat_chosung"))
  );
}
