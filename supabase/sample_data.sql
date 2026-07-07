with active_event as (
  select id
  from public.ws_event
  where active = true
  order by created_at desc
  limit 1
),
team_counts as (
  select *
  from (
    values
      ('클라우드사업부', 23),
      ('클라우드기술팀', 27),
      ('솔루션팀', 21),
      ('플랫폼개발실', 25)
  ) as t(department_name, sample_count)
),
phrases as (
  select
    array[
      '스위스 아미 나이프',
      '건강검진센터',
      '번역가',
      '여행 플래너',
      '레이더',
      '내비게이션',
      '운영체제',
      '공구함',
      '허브',
      '등대',
      '안전벨트',
      '엔진',
      '충전기',
      '지도',
      '기초공사',
      '필터',
      '조율자',
      '소방서',
      '관제탑',
      '실험실',
      '정비소',
      '다리',
      '스위치',
      '도서관',
      '오케스트라',
      '기상청',
      '백업 시스템'
    ] as answer_one_values,
    array[
      '다양한 기술을 활용해 여러 문제를 해결하기',
      '문제가 커지기 전에 미리 발견하고 관리하기',
      '고객의 생각을 개발자가 이해할 수 있는 언어로 바꿔주기',
      '고객에게 가장 적합한 길을 함께 설계하기',
      '보이지 않는 변화와 위험을 먼저 감지하기',
      '복잡한 상황에서도 가야 할 방향을 알려주기',
      '여러 업무가 안정적으로 돌아가도록 받쳐주기',
      '상황마다 필요한 해결책을 꺼내 쓸 수 있게 해주기',
      '사람과 일, 정보가 자연스럽게 모이게 하기',
      '흐린 상황에서도 기준점과 방향을 보여주기',
      '빠르게 움직이는 업무 속에서 안전하게 잡아주기',
      '조용히 전체 추진력을 만들어내기',
      '일이 멈추지 않도록 필요한 에너지를 채워주기',
      '현재 위치와 다음 단계를 함께 보여주기',
      '눈에 잘 보이지 않아도 전체 성과의 기반을 만들기',
      '복잡한 정보를 필요한 형태로 정리해주기',
      '서로 다른 의견과 업무 흐름을 자연스럽게 맞춰주기',
      '문제가 생겼을 때 가장 먼저 달려가 해결하기',
      '여러 움직임을 한눈에 보며 우선순위를 잡아주기',
      '새로운 방법을 시도하고 더 나은 방식을 찾아내기',
      '흔들리는 부분을 점검하고 다시 안정화하기',
      '부서와 고객, 계획과 실행 사이를 이어주기',
      '좋은 아이디어가 실제 실행으로 켜지게 하기',
      '필요한 지식과 경험을 찾아 쓸 수 있게 모아두기',
      '각자의 역할이 하나의 흐름으로 들리게 만들기',
      '앞으로 다가올 변화를 미리 살피고 준비하게 하기',
      '예상치 못한 상황에서도 다시 이어갈 수 있게 해주기'
    ] as answer_two_values
),
sample_source as (
  select
    tc.department_name,
    n,
    format('%s 테스트%02s', tc.department_name, n) as participant_name,
    phrases.answer_one_values[((n - 1) % array_length(phrases.answer_one_values, 1)) + 1] as answer_one,
    phrases.answer_two_values[((n - 1) % array_length(phrases.answer_two_values, 1)) + 1] as answer_two
  from team_counts tc
  cross join phrases
  cross join lateral generate_series(1, tc.sample_count) as n
)
insert into public.ws_submission (
  event_id,
  department_id,
  participant_name,
  participant_key,
  answer_one,
  answer_two
)
select
  e.id,
  d.id,
  s.participant_name,
  lower(regexp_replace(trim(s.participant_name), '\s+', '', 'g')),
  s.answer_one,
  s.answer_two
from sample_source s
cross join active_event e
join public.ws_department d
  on d.event_id = e.id
 and d.name = s.department_name
on conflict (event_id, department_id, participant_key)
do update set
  participant_name = excluded.participant_name,
  answer_one = excluded.answer_one,
  answer_two = excluded.answer_two;

select d.name, count(*) as count
from public.ws_submission s
join public.ws_department d on d.id = s.department_id
join active_event e on e.id = s.event_id
group by d.name
order by d.name;
