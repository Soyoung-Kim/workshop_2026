create extension if not exists pgcrypto;

create table if not exists public.ws_event (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.ws_department (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.ws_event(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (event_id, name)
);

create table if not exists public.ws_submission (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.ws_event(id) on delete cascade,
  department_id uuid not null references public.ws_department(id) on delete restrict,
  participant_name text not null,
  participant_key text not null,
  answer_one text not null,
  answer_two text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, department_id, participant_key)
);

create table if not exists public.ws_judge (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.ws_event(id) on delete cascade,
  name text not null,
  role text not null,
  token text not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.ws_vote (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.ws_event(id) on delete cascade,
  judge_id uuid not null references public.ws_judge(id) on delete cascade,
  submission_id uuid not null references public.ws_submission(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, judge_id)
);

create table if not exists public.ws_setting (
  event_id uuid primary key references public.ws_event(id) on delete cascade,
  submission_deadline timestamptz not null,
  vote_deadline timestamptz not null,
  admin_password text not null,
  updated_at timestamptz not null default now()
);

create or replace function public.ws_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists ws_submission_touch_updated_at on public.ws_submission;
create trigger ws_submission_touch_updated_at
before update on public.ws_submission
for each row execute function public.ws_touch_updated_at();

drop trigger if exists ws_vote_touch_updated_at on public.ws_vote;
create trigger ws_vote_touch_updated_at
before update on public.ws_vote
for each row execute function public.ws_touch_updated_at();

drop trigger if exists ws_setting_touch_updated_at on public.ws_setting;
create trigger ws_setting_touch_updated_at
before update on public.ws_setting
for each row execute function public.ws_touch_updated_at();

insert into public.ws_event (id, title, active)
values ('20260000-0000-0000-0000-000000000001', '우리 팀은 어떤 팀인가?', true)
on conflict (id) do update
set title = excluded.title,
    active = excluded.active;

insert into public.ws_department (id, event_id, name, sort_order)
values
  ('20260000-0000-0000-0000-000000000101', '20260000-0000-0000-0000-000000000001', '클라우드사업부', 10),
  ('20260000-0000-0000-0000-000000000102', '20260000-0000-0000-0000-000000000001', '클라우드기술팀', 20),
  ('20260000-0000-0000-0000-000000000103', '20260000-0000-0000-0000-000000000001', '솔루션팀', 30),
  ('20260000-0000-0000-0000-000000000104', '20260000-0000-0000-0000-000000000001', '플랫폼개발실', 40)
on conflict (event_id, name) do update
set sort_order = excluded.sort_order;

insert into public.ws_judge (id, event_id, name, role, token, sort_order)
values
  ('20260000-0000-0000-0000-000000000201', '20260000-0000-0000-0000-000000000001', '송기흥', '팀장', 'judge-song', 10),
  ('20260000-0000-0000-0000-000000000202', '20260000-0000-0000-0000-000000000001', '양주호', '팀장', 'judge-yang', 20),
  ('20260000-0000-0000-0000-000000000203', '20260000-0000-0000-0000-000000000001', '이덕필', '팀장', 'judge-lee', 30),
  ('20260000-0000-0000-0000-000000000204', '20260000-0000-0000-0000-000000000001', '문광영', '팀장', 'judge-moon', 40),
  ('20260000-0000-0000-0000-000000000205', '20260000-0000-0000-0000-000000000001', '신승열', '본부장', 'judge-shin', 50)
on conflict (token) do update
set name = excluded.name,
    role = excluded.role,
    sort_order = excluded.sort_order;

insert into public.ws_setting (event_id, submission_deadline, vote_deadline, admin_password)
values (
  '20260000-0000-0000-0000-000000000001',
  '2026-12-31 18:00:00+09',
  '2026-12-31 20:00:00+09',
  'CHANGE_ME_ADMIN_PASSWORD'
)
on conflict (event_id) do nothing;

create or replace function public.ws_current_event_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.ws_event
  where active = true
  order by created_at desc
  limit 1;
$$;

create or replace function public.ws_participant_key(p_name text)
returns text
language sql
immutable
security definer
set search_path = public
as $$
  select lower(regexp_replace(trim(coalesce(p_name, '')), '\s+', '', 'g'));
$$;

create or replace function public.ws_public_bootstrap()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_event uuid;
  v_result jsonb;
begin
  v_event := public.ws_current_event_id();

  if v_event is null then
    raise exception 'No active event.';
  end if;

  select jsonb_build_object(
    'event', jsonb_build_object(
      'id', e.id,
      'title', e.title
    ),
    'departments', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', d.id,
          'name', d.name
        )
        order by d.sort_order, d.name
      )
      from public.ws_department d
      where d.event_id = e.id
    ), '[]'::jsonb),
    'settings', jsonb_build_object(
      'submissionDeadline', s.submission_deadline,
      'voteDeadline', s.vote_deadline,
      'submissionClosed', now() > s.submission_deadline,
      'voteClosed', now() > s.vote_deadline
    )
  )
  into v_result
  from public.ws_event e
  join public.ws_setting s on s.event_id = e.id
  where e.id = v_event;

  return v_result;
end;
$$;

create or replace function public.ws_find_submission(
  p_department_id uuid,
  p_participant_name text
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_event uuid;
  v_key text;
  v_submission public.ws_submission%rowtype;
  v_department_name text;
begin
  v_event := public.ws_current_event_id();
  v_key := public.ws_participant_key(p_participant_name);

  if v_event is null or p_department_id is null or v_key = '' then
    return null;
  end if;

  select s.*
  into v_submission
  from public.ws_submission s
  where s.event_id = v_event
    and s.department_id = p_department_id
    and s.participant_key = v_key;

  if v_submission.id is null then
    return null;
  end if;

  select name
  into v_department_name
  from public.ws_department
  where id = v_submission.department_id;

  return jsonb_build_object(
    'id', v_submission.id,
    'departmentId', v_submission.department_id,
    'departmentName', v_department_name,
    'participantName', v_submission.participant_name,
    'answerOne', v_submission.answer_one,
    'answerTwo', v_submission.answer_two,
    'createdAt', v_submission.created_at,
    'updatedAt', v_submission.updated_at
  );
end;
$$;

create or replace function public.ws_upsert_submission(
  p_department_id uuid,
  p_participant_name text,
  p_answer_one text,
  p_answer_two text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event uuid;
  v_key text;
  v_submission public.ws_submission%rowtype;
  v_department_name text;
  v_settings public.ws_setting%rowtype;
begin
  v_event := public.ws_current_event_id();
  v_key := public.ws_participant_key(p_participant_name);

  if v_event is null then
    raise exception 'No active event.';
  end if;

  select *
  into v_settings
  from public.ws_setting
  where event_id = v_event;

  if now() > v_settings.submission_deadline then
    raise exception 'Submission deadline has passed.';
  end if;

  if v_key = '' then
    raise exception 'Participant name is required.';
  end if;

  if length(trim(coalesce(p_answer_one, ''))) = 0 or length(trim(coalesce(p_answer_two, ''))) = 0 then
    raise exception 'Both answers are required.';
  end if;

  select name
  into v_department_name
  from public.ws_department
  where id = p_department_id
    and event_id = v_event;

  if v_department_name is null then
    raise exception 'Invalid department.';
  end if;

  insert into public.ws_submission (
    event_id,
    department_id,
    participant_name,
    participant_key,
    answer_one,
    answer_two
  )
  values (
    v_event,
    p_department_id,
    trim(p_participant_name),
    v_key,
    trim(p_answer_one),
    trim(p_answer_two)
  )
  on conflict (event_id, department_id, participant_key)
  do update set
    participant_name = excluded.participant_name,
    answer_one = excluded.answer_one,
    answer_two = excluded.answer_two
  returning *
  into v_submission;

  return jsonb_build_object(
    'id', v_submission.id,
    'departmentId', v_submission.department_id,
    'departmentName', v_department_name,
    'participantName', v_submission.participant_name,
    'answerOne', v_submission.answer_one,
    'answerTwo', v_submission.answer_two,
    'createdAt', v_submission.created_at,
    'updatedAt', v_submission.updated_at
  );
end;
$$;

create or replace function public.ws_judge_view(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event uuid;
  v_judge public.ws_judge%rowtype;
  v_selected uuid;
  v_result jsonb;
begin
  v_event := public.ws_current_event_id();

  select *
  into v_judge
  from public.ws_judge
  where event_id = v_event
    and token = trim(coalesce(p_token, ''));

  if v_judge.id is null then
    raise exception 'Invalid judge token.';
  end if;

  select submission_id
  into v_selected
  from public.ws_vote
  where event_id = v_event
    and judge_id = v_judge.id;

  select jsonb_build_object(
    'judge', jsonb_build_object(
      'name', v_judge.name,
      'role', v_judge.role
    ),
    'settings', jsonb_build_object(
      'submissionDeadline', s.submission_deadline,
      'voteDeadline', s.vote_deadline,
      'submissionClosed', now() > s.submission_deadline,
      'voteClosed', now() > s.vote_deadline
    ),
    'selectedSubmissionId', v_selected,
    'submissions', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', sub.id,
          'departmentName', d.name,
          'answerOne', sub.answer_one,
          'answerTwo', sub.answer_two,
          'createdAt', sub.created_at
        )
        order by d.sort_order, sub.created_at
      )
      from public.ws_submission sub
      join public.ws_department d on d.id = sub.department_id
      where sub.event_id = v_event
    ), '[]'::jsonb)
  )
  into v_result
  from public.ws_setting s
  where s.event_id = v_event;

  return v_result;
end;
$$;

create or replace function public.ws_cast_vote(
  p_token text,
  p_submission_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event uuid;
  v_judge public.ws_judge%rowtype;
  v_settings public.ws_setting%rowtype;
begin
  v_event := public.ws_current_event_id();

  select *
  into v_judge
  from public.ws_judge
  where event_id = v_event
    and token = trim(coalesce(p_token, ''));

  if v_judge.id is null then
    raise exception 'Invalid judge token.';
  end if;

  select *
  into v_settings
  from public.ws_setting
  where event_id = v_event;

  if now() > v_settings.vote_deadline then
    raise exception 'Vote deadline has passed.';
  end if;

  if not exists (
    select 1
    from public.ws_submission
    where id = p_submission_id
      and event_id = v_event
  ) then
    raise exception 'Invalid submission.';
  end if;

  insert into public.ws_vote (event_id, judge_id, submission_id)
  values (v_event, v_judge.id, p_submission_id)
  on conflict (event_id, judge_id)
  do update set submission_id = excluded.submission_id;

  return public.ws_judge_view(p_token);
end;
$$;

create or replace function public.ws_admin_password_is_valid(
  p_event_id uuid,
  p_password text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.ws_setting
    where event_id = p_event_id
      and admin_password = p_password
  );
$$;

create or replace function public.ws_admin_overview(p_password text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event uuid;
  v_result jsonb;
begin
  v_event := public.ws_current_event_id();

  if not public.ws_admin_password_is_valid(v_event, p_password) then
    raise exception 'Invalid admin password.';
  end if;

  select jsonb_build_object(
    'event', jsonb_build_object(
      'id', e.id,
      'title', e.title
    ),
    'settings', jsonb_build_object(
      'submissionDeadline', s.submission_deadline,
      'voteDeadline', s.vote_deadline,
      'submissionClosed', now() > s.submission_deadline,
      'voteClosed', now() > s.vote_deadline
    ),
    'departments', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', d.id,
          'name', d.name
        )
        order by d.sort_order, d.name
      )
      from public.ws_department d
      where d.event_id = e.id
    ), '[]'::jsonb),
    'counts', jsonb_build_object(
      'total', (
        select count(*)::int
        from public.ws_submission sub
        where sub.event_id = e.id
      ),
      'byDepartment', coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'departmentId', counted.department_id,
            'departmentName', counted.department_name,
            'count', counted.submission_count
          )
          order by counted.sort_order
        )
        from (
          select d.id as department_id,
                 d.name as department_name,
                 d.sort_order,
                 count(sub.id)::int as submission_count
          from public.ws_department d
          left join public.ws_submission sub
            on sub.department_id = d.id
           and sub.event_id = e.id
          where d.event_id = e.id
          group by d.id, d.name, d.sort_order
        ) counted
      ), '[]'::jsonb)
    ),
    'submissions', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', listed.id,
          'departmentId', listed.department_id,
          'departmentName', listed.department_name,
          'participantName', listed.participant_name,
          'answerOne', listed.answer_one,
          'answerTwo', listed.answer_two,
          'createdAt', listed.created_at,
          'updatedAt', listed.updated_at,
          'voteCount', listed.vote_count
        )
        order by listed.department_sort, listed.participant_name
      )
      from public.ws_admin_submission_rows(e.id) listed
    ), '[]'::jsonb),
    'judges', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', judge_rows.id,
          'name', judge_rows.name,
          'role', judge_rows.role,
          'token', judge_rows.token,
          'selectedSubmissionId', judge_rows.selected_submission_id,
          'selectedDepartment', judge_rows.selected_department,
          'votedAt', judge_rows.voted_at
        )
        order by judge_rows.sort_order
      )
      from public.ws_admin_judge_rows(e.id) judge_rows
    ), '[]'::jsonb),
    'results', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', listed.id,
          'departmentId', listed.department_id,
          'departmentName', listed.department_name,
          'participantName', listed.participant_name,
          'answerOne', listed.answer_one,
          'answerTwo', listed.answer_two,
          'createdAt', listed.created_at,
          'updatedAt', listed.updated_at,
          'voteCount', listed.vote_count
        )
        order by listed.vote_count desc, listed.department_sort, listed.created_at
      )
      from public.ws_admin_submission_rows(e.id) listed
    ), '[]'::jsonb)
  )
  into v_result
  from public.ws_event e
  join public.ws_setting s on s.event_id = e.id
  where e.id = v_event;

  return v_result;
end;
$$;

create or replace function public.ws_admin_submission_rows(p_event_id uuid)
returns table (
  id uuid,
  department_id uuid,
  department_name text,
  department_sort integer,
  participant_name text,
  answer_one text,
  answer_two text,
  created_at timestamptz,
  updated_at timestamptz,
  vote_count integer
)
language sql
stable
security definer
set search_path = public
as $$
  select sub.id,
         sub.department_id,
         d.name as department_name,
         d.sort_order as department_sort,
         sub.participant_name,
         sub.answer_one,
         sub.answer_two,
         sub.created_at,
         sub.updated_at,
         count(v.id)::int as vote_count
  from public.ws_submission sub
  join public.ws_department d on d.id = sub.department_id
  left join public.ws_vote v on v.submission_id = sub.id
  where sub.event_id = p_event_id
  group by sub.id, sub.department_id, d.name, d.sort_order, sub.participant_name, sub.answer_one, sub.answer_two, sub.created_at, sub.updated_at;
$$;

create or replace function public.ws_admin_judge_rows(p_event_id uuid)
returns table (
  id uuid,
  name text,
  role text,
  token text,
  sort_order integer,
  selected_submission_id uuid,
  selected_department text,
  voted_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select j.id,
         j.name,
         j.role,
         j.token,
         j.sort_order,
         v.submission_id as selected_submission_id,
         d.name as selected_department,
         v.updated_at as voted_at
  from public.ws_judge j
  left join public.ws_vote v
    on v.judge_id = j.id
   and v.event_id = p_event_id
  left join public.ws_submission sub on sub.id = v.submission_id
  left join public.ws_department d on d.id = sub.department_id
  where j.event_id = p_event_id;
$$;

create or replace function public.ws_admin_update_settings(
  p_password text,
  p_submission_deadline timestamptz,
  p_vote_deadline timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event uuid;
begin
  v_event := public.ws_current_event_id();

  if not public.ws_admin_password_is_valid(v_event, p_password) then
    raise exception 'Invalid admin password.';
  end if;

  if p_submission_deadline is null or p_vote_deadline is null then
    raise exception 'Deadlines are required.';
  end if;

  update public.ws_setting
  set submission_deadline = p_submission_deadline,
      vote_deadline = p_vote_deadline
  where event_id = v_event;

  return public.ws_admin_overview(p_password);
end;
$$;
