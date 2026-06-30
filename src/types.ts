export type Department = {
  id: string;
  name: string;
};

export type PublicSettings = {
  submissionDeadline: string;
  voteDeadline: string;
  submissionClosed: boolean;
  voteClosed: boolean;
};

export type BootstrapData = {
  event: {
    id: string;
    title: string;
  };
  departments: Department[];
  settings: PublicSettings;
};

export type SubmissionPayload = {
  id: string;
  departmentId: string;
  departmentName: string;
  participantName: string;
  answerOne: string;
  answerTwo: string;
  createdAt: string;
  updatedAt: string;
};

export type JudgeSubmission = {
  id: string;
  departmentName: string;
  answerOne: string;
  answerTwo: string;
  createdAt: string;
};

export type JudgeViewData = {
  judge: {
    name: string;
    role: string;
  };
  settings: PublicSettings;
  submissions: JudgeSubmission[];
  selectedSubmissionId: string | null;
};

export type CountByDepartment = {
  departmentId: string;
  departmentName: string;
  count: number;
};

export type AdminSubmission = SubmissionPayload & {
  voteCount: number;
};

export type AdminJudge = {
  id: string;
  name: string;
  role: string;
  token: string;
  selectedSubmissionId: string | null;
  selectedDepartment: string | null;
  votedAt: string | null;
};

export type AdminOverview = {
  event: {
    id: string;
    title: string;
  };
  settings: PublicSettings;
  departments: Department[];
  counts: {
    total: number;
    byDepartment: CountByDepartment[];
  };
  submissions: AdminSubmission[];
  judges: AdminJudge[];
  results: AdminSubmission[];
};
