alter table public.ws_event enable row level security;
alter table public.ws_submission enable row level security;
alter table public.ws_judge enable row level security;
alter table public.ws_vote enable row level security;
alter table public.ws_setting enable row level security;

revoke all on table public.ws_event from anon, authenticated;
revoke all on table public.ws_submission from anon, authenticated;
revoke all on table public.ws_judge from anon, authenticated;
revoke all on table public.ws_vote from anon, authenticated;
revoke all on table public.ws_setting from anon, authenticated;

revoke execute on function public.ws_admin_password_is_valid(uuid, text) from public;
revoke execute on function public.ws_admin_submission_rows(uuid) from public;
revoke execute on function public.ws_admin_judge_rows(uuid) from public;
revoke execute on function public.ws_current_event_id() from public;
revoke execute on function public.ws_participant_key(text) from public;
revoke execute on function public.ws_touch_updated_at() from public;

grant usage on schema public to anon, authenticated;

grant execute on function public.ws_public_bootstrap() to anon, authenticated;
grant execute on function public.ws_find_submission(text) to anon, authenticated;
grant execute on function public.ws_upsert_submission(text, text, text) to anon, authenticated;
grant execute on function public.ws_judge_view(text) to anon, authenticated;
grant execute on function public.ws_cast_vote(text, uuid[]) to anon, authenticated;
grant execute on function public.ws_admin_overview(text) to anon, authenticated;
grant execute on function public.ws_admin_update_settings(text, timestamptz, timestamptz, integer) to anon, authenticated;
