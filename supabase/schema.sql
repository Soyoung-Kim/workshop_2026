create extension if not exists pgcrypto;

drop function if exists public.ws_public_bootstrap();
drop function if exists public.ws_find_submission(uuid, text);
drop function if exists public.ws_find_submission(text);
drop function if exists public.ws_upsert_submission(uuid, text, text, text);
drop function if exists public.ws_upsert_submission(text, text, text);
drop function if exists public.ws_judge_view(text);
drop function if exists public.ws_cast_vote(text, uuid);
drop function if exists public.ws_cast_vote(text, uuid[]);
drop function if exists public.ws_admin_overview(text);
drop function if exists public.ws_admin_update_settings(text, timestamptz, timestamptz);
drop function if exists public.ws_admin_update_settings(text, timestamptz, timestamptz, integer);
drop function if exists public.ws_admin_submission_rows(uuid);
drop function if exists public.ws_admin_judge_rows(uuid);
drop function if exists public.ws_admin_password_is_valid(uuid, text);
drop function if exists public.ws_current_event_id();
drop function if exists public.ws_participant_key(text);

create table if not exists public.ws_event (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.ws_submission (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.ws_event(id) on delete cascade,
  participant_name text not null,
  participant_key text not null,
  answer_one text not null,
  answer_two text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, participant_key)
);

alter table public.ws_submission
  drop constraint if exists ws_submission_event_id_department_id_participant_key_key;

alter table public.ws_submission
  drop constraint if exists ws_submission_department_id_fkey;

alter table public.ws_submission
  drop column if exists department_id;

drop table if exists public.ws_department cascade;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.ws_submission'::regclass
      and conname = 'ws_submission_event_id_participant_key_key'
  ) then
    alter table public.ws_submission
      add constraint ws_submission_event_id_participant_key_key unique (event_id, participant_key);
  end if;
end;
$$;

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
  unique (event_id, judge_id, submission_id)
);

alter table public.ws_vote
  drop constraint if exists ws_vote_event_id_judge_id_key;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.ws_vote'::regclass
      and conname = 'ws_vote_event_id_judge_id_submission_id_key'
  ) then
    alter table public.ws_vote
      add constraint ws_vote_event_id_judge_id_submission_id_key unique (event_id, judge_id, submission_id);
  end if;
end;
$$;

create table if not exists public.ws_setting (
  event_id uuid primary key references public.ws_event(id) on delete cascade,
  submission_deadline timestamptz not null,
  vote_deadline timestamptz not null,
  votes_per_judge integer not null default 3 check (votes_per_judge between 1 and 3),
  admin_password text not null,
  updated_at timestamptz not null default now()
);

alter table public.ws_setting
  add column if not exists votes_per_judge integer not null default 3;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.ws_setting'::regclass
      and conname = 'ws_setting_votes_per_judge_check'
  ) then
    alter table public.ws_setting
      add constraint ws_setting_votes_per_judge_check check (votes_per_judge between 1 and 3);
  end if;
end;
$$;

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

insert into public.ws_setting (event_id, submission_deadline, vote_deadline, votes_per_judge, admin_password)
values (
  '20260000-0000-0000-0000-000000000001',
  '2026-12-31 18:00:00+09',
  '2026-12-31 20:00:00+09',
  3,
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
    'settings', jsonb_build_object(
      'submissionDeadline', s.submission_deadline,
      'voteDeadline', s.vote_deadline,
      'submissionClosed', now() > s.submission_deadline,
      'voteClosed', now() > s.vote_deadline,
      'votesPerJudge', s.votes_per_judge
    )
  )
  into v_result
  from public.ws_event e
  join public.ws_setting s on s.event_id = e.id
  where e.id = v_event;

  return v_result;
end;
$$;

create or replace function public.ws_find_submission(p_participant_name text)
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
begin
  v_event := public.ws_current_event_id();
  v_key := public.ws_participant_key(p_participant_name);

  if v_event is null or v_key = '' then
    return null;
  end if;

  select s.*
  into v_submission
  from public.ws_submission s
  where s.event_id = v_event
    and s.participant_key = v_key;

  if v_submission.id is null then
    return null;
  end if;

  return jsonb_build_object(
    'id', v_submission.id,
    'participantName', v_submission.participant_name,
    'answerOne', v_submission.answer_one,
    'answerTwo', v_submission.answer_two,
    'createdAt', v_submission.created_at,
    'updatedAt', v_submission.updated_at
  );
end;
$$;

create or replace function public.ws_upsert_submission(
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

  insert into public.ws_submission (
    event_id,
    participant_name,
    participant_key,
    answer_one,
    answer_two
  )
  values (
    v_event,
    trim(p_participant_name),
    v_key,
    trim(p_answer_one),
    trim(p_answer_two)
  )
  on conflict (event_id, participant_key)
  do update set
    participant_name = excluded.participant_name,
    answer_one = excluded.answer_one,
    answer_two = excluded.answer_two
  returning *
  into v_submission;

  return jsonb_build_object(
    'id', v_submission.id,
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
  v_selected uuid[];
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

  select coalesce(array_agg(v.submission_id order by v.updated_at, v.id), array[]::uuid[])
  into v_selected
  from public.ws_vote v
  where v.event_id = v_event
    and v.judge_id = v_judge.id;

  select jsonb_build_object(
    'judge', jsonb_build_object(
      'name', v_judge.name,
      'role', v_judge.role
    ),
    'settings', jsonb_build_object(
      'submissionDeadline', s.submission_deadline,
      'voteDeadline', s.vote_deadline,
      'submissionClosed', now() > s.submission_deadline,
      'voteClosed', now() > s.vote_deadline,
      'votesPerJudge', s.votes_per_judge
    ),
    'selectedSubmissionIds', v_selected,
    'submissions', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', sub.id,
          'answerOne', sub.answer_one,
          'answerTwo', sub.answer_two
        )
        order by sub.created_at, sub.id
      )
      from public.ws_submission sub
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
  p_submission_ids uuid[]
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
  v_submission_ids uuid[];
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

  select coalesce(array_agg(distinct selected.submission_id), array[]::uuid[])
  into v_submission_ids
  from unnest(coalesce(p_submission_ids, array[]::uuid[])) as selected(submission_id)
  where selected.submission_id is not null;

  if cardinality(v_submission_ids) = 0 then
    raise exception 'At least one submission must be selected.';
  end if;

  if cardinality(v_submission_ids) > v_settings.votes_per_judge then
    raise exception 'Too many submissions selected.';
  end if;

  if exists (
    select 1
    from unnest(v_submission_ids) as selected(submission_id)
    left join public.ws_submission sub
      on sub.id = selected.submission_id
     and sub.event_id = v_event
    where sub.id is null
  ) then
    raise exception 'Invalid submission.';
  end if;

  delete from public.ws_vote
  where event_id = v_event
    and judge_id = v_judge.id;

  insert into public.ws_vote (event_id, judge_id, submission_id)
  select v_event, v_judge.id, selected.submission_id
  from unnest(v_submission_ids) as selected(submission_id);

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
      'voteClosed', now() > s.vote_deadline,
      'votesPerJudge', s.votes_per_judge
    ),
    'counts', jsonb_build_object(
      'total', (
        select count(*)::int
        from public.ws_submission sub
        where sub.event_id = e.id
      )
    ),
    'submissions', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', listed.id,
          'participantName', listed.participant_name,
          'answerOne', listed.answer_one,
          'answerTwo', listed.answer_two,
          'createdAt', listed.created_at,
          'updatedAt', listed.updated_at,
          'voteCount', listed.vote_count
        )
        order by listed.participant_name
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
          'selectedSubmissionIds', judge_rows.selected_submission_ids,
          'selectedCount', judge_rows.selected_count,
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
          'participantName', listed.participant_name,
          'answerOne', listed.answer_one,
          'answerTwo', listed.answer_two,
          'createdAt', listed.created_at,
          'updatedAt', listed.updated_at,
          'voteCount', listed.vote_count
        )
        order by listed.vote_count desc, listed.created_at, listed.participant_name
      )
      from public.ws_admin_submission_rows(e.id) listed
      where listed.vote_count > 0
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
         sub.participant_name,
         sub.answer_one,
         sub.answer_two,
         sub.created_at,
         sub.updated_at,
         count(v.id)::int as vote_count
  from public.ws_submission sub
  left join public.ws_vote v on v.submission_id = sub.id
  where sub.event_id = p_event_id
  group by sub.id, sub.participant_name, sub.answer_one, sub.answer_two, sub.created_at, sub.updated_at;
$$;

create or replace function public.ws_admin_judge_rows(p_event_id uuid)
returns table (
  id uuid,
  name text,
  role text,
  token text,
  sort_order integer,
  selected_submission_ids uuid[],
  selected_count integer,
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
         coalesce(
           array_agg(v.submission_id order by v.updated_at, v.id) filter (where v.id is not null),
           array[]::uuid[]
         ) as selected_submission_ids,
         count(v.id)::int as selected_count,
         max(v.updated_at) as voted_at
  from public.ws_judge j
  left join public.ws_vote v
    on v.judge_id = j.id
   and v.event_id = p_event_id
  where j.event_id = p_event_id
  group by j.id, j.name, j.role, j.token, j.sort_order;
$$;

create or replace function public.ws_admin_update_settings(
  p_password text,
  p_submission_deadline timestamptz,
  p_vote_deadline timestamptz,
  p_votes_per_judge integer
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

  if p_votes_per_judge is null or p_votes_per_judge < 1 or p_votes_per_judge > 3 then
    raise exception 'Votes per judge must be between 1 and 3.';
  end if;

  update public.ws_setting
  set submission_deadline = p_submission_deadline,
      vote_deadline = p_vote_deadline,
      votes_per_judge = p_votes_per_judge
  where event_id = v_event;

  return public.ws_admin_overview(p_password);
end;
$$;
