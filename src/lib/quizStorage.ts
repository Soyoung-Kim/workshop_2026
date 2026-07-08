export type QuizSessionStatus = "READY" | "IN_PROGRESS" | "FINISHED";

export type QuizCategory = {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
  useYn: boolean;
};

export type QuizQuestion = {
  id: string;
  categoryId: string;
  question: string;
  answer: string;
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
};

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
    name: "넌센스",
    description: "말장난과 순발력 퀴즈",
    sortOrder: 3,
    useYn: true,
  },
  {
    id: "cat_new_words",
    name: "신조어",
    description: "요즘 밈과 신조어",
    sortOrder: 4,
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
    question: "오늘 첫 번째 발표자는 누구였을까요?",
    answer: "사전 입력",
    sortOrder: 1,
    useYn: true,
  },
  {
    id: "q_it_001",
    categoryId: "cat_it",
    question: "AI는 어떤 말의 약자일까요?",
    answer: "Artificial Intelligence",
    sortOrder: 1,
    useYn: true,
  },
  {
    id: "q_it_002",
    categoryId: "cat_it",
    question: "AWS에서 S3는 어떤 말의 약자일까요?",
    answer: "Simple Storage Service",
    sortOrder: 2,
    useYn: true,
  },
  {
    id: "q_nonsense_001",
    categoryId: "cat_nonsense",
    question: "아빠가 제일 세면?",
    answer: "부가세",
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
    id: "q_new_001",
    categoryId: "cat_new_words",
    question: "다음 신조어의 뜻을 모두 맞혀보세요. 럭키비키, 원영적 사고, 긁?, 영크크, 늙크크",
    answer:
      "럭키비키: 긍정적으로 받아들이는 태도 / 원영적 사고: 부정적 상황도 긍정적으로 해석 / 긁?: 발끈했네 / 영크크: 젊은 감성이라 웃긴 것 / 늙크크: 아재 감성인데 웃긴 것",
    sortOrder: 1,
    useYn: true,
  },
  {
    id: "q_memory_001",
    categoryId: "cat_memory",
    question: "다음 숫자 암호의 의미를 모두 맞혀보세요. 486, 1004, 8282, 7942, 0024",
    answer: "486: 사랑해 / 1004: 천사 / 8282: 빨리빨리 / 7942: 친구사이 / 0024: 이 세상에 하나뿐인 사랑",
    sortOrder: 1,
    useYn: true,
  },
];

export function loadQuizState(): QuizState {
  const categories = readArray<QuizCategory>(QUIZ_KEYS.categories, DEFAULT_QUIZ_CATEGORIES);
  const questions = readArray<QuizQuestion>(QUIZ_KEYS.questions, DEFAULT_QUIZ_QUESTIONS);

  if (!window.localStorage.getItem(QUIZ_KEYS.categories)) {
    saveQuizCategories(categories);
  }

  if (!window.localStorage.getItem(QUIZ_KEYS.questions)) {
    saveQuizQuestions(questions);
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
}

export function saveQuizQuestions(questions: QuizQuestion[]) {
  window.localStorage.setItem(QUIZ_KEYS.questions, JSON.stringify(sortQuestions(questions)));
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
