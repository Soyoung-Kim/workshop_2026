export type PublicSettings = {
  submissionDeadline: string;
  voteDeadline: string;
  submissionClosed: boolean;
  voteClosed: boolean;
  votesPerJudge: number;
};

export type BootstrapData = {
  event: {
    id: string;
    title: string;
  };
  settings: PublicSettings;
};

export type SubmissionPayload = {
  id: string;
  participantName: string;
  answerOne: string;
  answerTwo: string;
  createdAt: string;
  updatedAt: string;
};

export type JudgeSubmission = {
  id: string;
  answerOne: string;
  answerTwo: string;
};

export type JudgeViewData = {
  judge: {
    name: string;
    role: string;
  };
  settings: PublicSettings;
  submissions: JudgeSubmission[];
  selectedSubmissionIds: string[];
};

export type AdminSubmission = SubmissionPayload & {
  voteCount: number;
};

export type AdminJudge = {
  id: string;
  name: string;
  role: string;
  token: string;
  selectedSubmissionIds: string[];
  selectedCount: number;
  votedAt: string | null;
};

export type AdminOverview = {
  event: {
    id: string;
    title: string;
  };
  settings: PublicSettings;
  counts: {
    total: number;
  };
  submissions: AdminSubmission[];
  judges: AdminJudge[];
  results: AdminSubmission[];
};
