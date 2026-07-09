import { CalendarDays, ExternalLink, MapPin } from "lucide-react";

type ScheduleItem = {
  day: "7/10 (금)" | "7/11 (토)";
  time: string;
  program: string;
  place: string;
  details: string;
  link?: {
    label: string;
    href: string;
  };
};

const scheduleItems: ScheduleItem[] = [
  {
    day: "7/10 (금)",
    time: "11:30",
    program: "집결",
    place: "홍천 소노벨 B동 지하 1층 미채원",
    details: "워크샵 집결",
    link: {
      label: "지도 보기",
      href: "https://naver.me/FlZksovq",
    },
  },
  {
    day: "7/10 (금)",
    time: "11:30 ~ 12:30",
    program: "중식",
    place: "비발디파크 내 미채원",
    details: "중식",
  },
  {
    day: "7/10 (금)",
    time: "12:30 ~ 12:50",
    program: "강당 집결",
    place: "소노벨 비발디파크 크리스탈볼룸",
    details: "참석자 집결",
  },
  {
    day: "7/10 (금)",
    time: "12:50 ~ 13:00",
    program: "워크샵 오리엔테이션",
    place: "크리스탈볼룸",
    details: "행사 일정 및 프로그램 소개, 우리팀은~ 소개, 상품 소개 등 방식 설명",
  },
  {
    day: "7/10 (금)",
    time: "13:00 ~ 13:15",
    program: "신규 입사자 소개 등",
    place: "크리스탈볼룸",
    details: "신규 입사자 소개 및 인사 / 탄생 축하",
  },
  {
    day: "7/10 (금)",
    time: "13:10 ~ 13:20",
    program: "본부 사업 성과 공유",
    place: "크리스탈볼룸",
    details: "2분기 본부 성과 및 주요 실적 공유",
  },
  {
    day: "7/10 (금)",
    time: "13:20 ~ 13:30",
    program: "특별 세션 I",
    place: "크리스탈볼룸",
    details: "Databricks 출장 소회 (장채훈 님)",
  },
  {
    day: "7/10 (금)",
    time: "13:30 ~ 13:40",
    program: "특별 세션 II",
    place: "크리스탈볼룸",
    details: "N-AI 소개 (허미경 님)",
  },
  {
    day: "7/10 (금)",
    time: "13:40 ~ 14:30",
    program: "방 배정 및 초청강연 준비",
    place: "크리스탈볼룸",
    details: "방 배정 및 강연 준비",
  },
  {
    day: "7/10 (금)",
    time: "14:30 ~ 16:00",
    program: "외부 초청 특강",
    place: "크리스탈볼룸",
    details: "소양 특강 (90분 예정)",
  },
  {
    day: "7/10 (금)",
    time: "16:00 ~ 16:05",
    program: "단체사진 촬영",
    place: "크리스탈볼룸",
    details: "단체사진 촬영",
  },
  {
    day: "7/10 (금)",
    time: "16:10 ~ 16:40",
    program: "조직문화 참여 프로그램",
    place: "크리스탈볼룸",
    details: "참여 이벤트, 경품 추첨 및 우수 참여자 시상. 귀가 셔틀 이용 시 버스 17시 출발",
  },
  {
    day: "7/10 (금)",
    time: "16:40 ~ 17:30",
    program: "객실 체크인 및 휴식",
    place: "소노벨 비발디파크",
    details: "개인 정비 및 자유시간",
  },
  {
    day: "7/10 (금)",
    time: "18:00 ~ 20:30",
    program: "석식 및 구성원 교류",
    place: "홍천조박사화로구이",
    details: "석식 및 구성원 간 자유로운 교류",
    link: {
      label: "지도 보기",
      href: "https://naver.me/xf5AFCgY",
    },
  },
  {
    day: "7/10 (금)",
    time: "20:30 ~ 22:30",
    program: "팀빌딩 및 조직 교류 프로그램",
    place: "비발디파크 부대시설",
    details: "부대시설 이용 및 자유 교류",
  },
  {
    day: "7/11 (토)",
    time: "~ 10:00",
    program: "퇴실 및 집결",
    place: "소노벨 비발디파크",
    details: "객실 반납 및 출발 준비",
  },
  {
    day: "7/11 (토)",
    time: "10:30 ~",
    program: "식사",
    place: "인근 식당",
    details: "인근 식당 식사 후 해산",
  },
];

const days = ["7/10 (금)", "7/11 (토)"] as const;

export function TimetablePage() {
  return (
    <div className="min-h-screen bg-stone-50 text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-teal-700">전략사업본부 워크샵</p>
              <h1 className="mt-1 text-2xl font-bold tracking-normal text-zinc-950 sm:text-3xl">
                일정표
              </h1>
            </div>
            <nav className="flex flex-wrap gap-2 text-sm">
              <a className="rounded-md border border-zinc-200 px-3 py-2 font-medium text-zinc-700 hover:border-teal-400 hover:text-teal-800" href="./">
                참여자
              </a>
              <a className="rounded-md border border-zinc-200 px-3 py-2 font-medium text-zinc-700 hover:border-teal-400 hover:text-teal-800" href="./quize">
                퀴즈
              </a>
            </nav>
          </div>

          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <SummaryItem label="일정" value="2026.07.10 (금) ~ 07.11 (토)" />
            <SummaryItem label="장소" value="소노벨 비발디파크" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {days.map((day) => (
            <section key={day} className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-soft">
              <div className="flex items-center gap-2 border-b border-zinc-200 bg-zinc-100 px-4 py-3">
                <CalendarDays className="h-5 w-5 text-teal-700" aria-hidden="true" />
                <h2 className="text-lg font-black text-zinc-950">{day}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
                  <thead className="bg-white text-zinc-500">
                    <tr>
                      <Th>시간</Th>
                      <Th>프로그램</Th>
                      <Th>장소</Th>
                      <Th>주요 내용</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {scheduleItems
                      .filter((item) => item.day === day)
                      .map((item, index) => (
                        <tr key={`${item.day}-${item.time}-${item.program}`} className={index % 2 ? "bg-white" : "bg-zinc-50/60"}>
                          <Td strong>{item.time}</Td>
                          <Td>
                            <span className="font-bold text-zinc-950">{item.program}</span>
                          </Td>
                          <Td>
                            <div className="flex min-w-48 flex-col gap-1">
                              <span className="inline-flex items-start gap-1.5 font-semibold text-zinc-700">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
                                {item.place}
                              </span>
                              {item.link ? (
                                <a
                                  className="inline-flex items-center gap-1 text-sm font-bold text-teal-700 hover:text-teal-900"
                                  href={item.link.href}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {item.link.label}
                                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                                </a>
                              ) : null}
                            </div>
                          </Td>
                          <Td>
                            <p className="max-w-xl whitespace-pre-wrap leading-6 text-zinc-700">{item.details}</p>
                          </Td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-zinc-200 bg-white px-3 py-2">
      <span className="font-semibold text-zinc-700">{label}</span>
      <span className="text-right font-bold text-zinc-950">{value}</span>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="border-b border-zinc-200 px-4 py-3 text-xs font-black uppercase">{children}</th>;
}

function Td({ children, strong = false }: { children: React.ReactNode; strong?: boolean }) {
  return (
    <td className={`border-b border-zinc-100 px-4 py-4 align-top ${strong ? "font-black text-teal-800" : "text-zinc-800"}`}>
      {children}
    </td>
  );
}
