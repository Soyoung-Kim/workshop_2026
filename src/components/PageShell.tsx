import { PropsWithChildren } from "react";
import { UsersRound } from "lucide-react";
import { formatKoreanDateTime } from "../lib/date";
import { PublicSettings } from "../types";

type PageShellProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  settings?: PublicSettings | null;
}>;

export function PageShell({ eyebrow, title, settings, children }: PageShellProps) {
  return (
    <div className="min-h-screen bg-stone-50 text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-teal-700">{eyebrow}</p>
              <h1 className="mt-1 text-2xl font-bold tracking-normal text-zinc-950 sm:text-3xl">
                {title}
              </h1>
            </div>
            <nav className="flex flex-wrap gap-2 text-sm">
              <a className="rounded-md border border-zinc-200 px-3 py-2 font-medium text-zinc-700 hover:border-teal-400 hover:text-teal-800" href="./timetable">
                일정표
              </a>
              <a className="rounded-md border border-zinc-200 px-3 py-2 font-medium text-zinc-700 hover:border-teal-400 hover:text-teal-800" href="./">
                참여자
              </a>
              <a className="rounded-md border border-zinc-200 px-3 py-2 font-medium text-zinc-700 hover:border-teal-400 hover:text-teal-800" href="./judge">
                심사
              </a>
              <a className="rounded-md border border-zinc-200 px-3 py-2 font-medium text-zinc-700 hover:border-teal-400 hover:text-teal-800" href="./admin">
                관리자
              </a>
            </nav>
          </div>

          {settings ? (
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <DeadlineItem
                label="답변 마감"
                closed={settings.submissionClosed}
                value={settings.submissionDeadline}
              />
              <DeadlineItem
                label="평가 마감"
                closed={settings.voteClosed}
                value={settings.voteDeadline}
              />
            </div>
          ) : null}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}

function DeadlineItem({ label, value, closed }: { label: string; value: string; closed: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-zinc-200 bg-white px-3 py-2">
      <div className="flex min-w-0 items-center gap-2">
        <UsersRound className="h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
        <span className="shrink-0 font-semibold text-zinc-700">{label}</span>
        <span className="truncate text-zinc-500">{formatKoreanDateTime(value)}</span>
      </div>
      <span
        className={`shrink-0 rounded px-2 py-1 text-xs font-bold ${
          closed ? "bg-rose-100 text-rose-700" : "bg-teal-100 text-teal-800"
        }`}
      >
        {closed ? "마감" : "진행"}
      </span>
    </div>
  );
}
