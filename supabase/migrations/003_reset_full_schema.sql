-- DROP OLD
drop function if exists public.submit_questionnaire(jsonb);
drop table if exists public.questionnaire_submissions;

-- CREATE TABLE (clean, no V-DAS-6 columns)
create table public.questionnaire_submissions (
  id uuid primary key,
  created_at timestamptz not null default now(),
  surname text not null check (char_length(surname) between 1 and 20),
  outpatient_number text not null check (char_length(outpatient_number) between 1 and 30),
  gender text not null,
  age integer not null check (age between 1 and 120),
  visit_type text not null,
  course text not null,
  answers jsonb not null
);

create index questionnaire_created_at_idx
  on public.questionnaire_submissions (created_at desc);

alter table public.questionnaire_submissions enable row level security;

revoke all on table public.questionnaire_submissions from anon, authenticated;
grant all on table public.questionnaire_submissions to service_role;

comment on table public.questionnaire_submissions is
  'Pre-visit questionnaire submissions. Access only from service role.';

-- CREATE RPC
create or replace function public.submit_questionnaire(input jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  submission_uuid uuid := gen_random_uuid();
  submission_surname text := trim(coalesce(input->>'surname', ''));
  submission_opn text := trim(coalesce(input->>'outpatientNumber', ''));
  submission_age integer;
  symptoms_json jsonb := coalesce(input->'symptoms', '[]'::jsonb);
  conditions_json jsonb := coalesce(input->'conditions', '[]'::jsonb);
  special_json jsonb := coalesce(input->'specialPopulations', '[]'::jsonb);
begin
  if jsonb_typeof(input) <> 'object'
    or submission_surname = ''
    or submission_opn = ''
    or coalesce(input->>'gender', '') = ''
    or coalesce(input->>'age', '') !~ '^[0-9]+$'
    or coalesce(input->>'visitType', '') = ''
    or coalesce(input->>'course', '') = ''
    or jsonb_typeof(symptoms_json) <> 'array'
    or jsonb_typeof(conditions_json) <> 'array'
    or jsonb_typeof(special_json) <> 'array'
  then
    raise exception '问卷信息不完整，请返回检查';
  end if;

  submission_age := (input->>'age')::integer;
  if submission_age < 1 or submission_age > 120
    or (jsonb_array_length(symptoms_json) = 0 and trim(coalesce(input->>'symptomOther', '')) = '')
    or coalesce(input->>'impact', '') = ''
    or coalesce(input->>'frequency', '') = ''
    or jsonb_array_length(conditions_json) = 0
    or jsonb_array_length(special_json) = 0
    or coalesce(input->>'treatmentPreference', '') = ''
    or coalesce(input->>'followUpPreference', '') = ''
  then
    raise exception '问卷信息不完整，请返回检查';
  end if;

  insert into public.questionnaire_submissions (
    id, created_at, surname, outpatient_number, gender, age, visit_type, course, answers
  ) values (
    submission_uuid,
    now(),
    left(submission_surname, 20),
    left(submission_opn, 30),
    input->>'gender',
    submission_age,
    input->>'visitType',
    case when input->>'course' = '是' then '首次发病已超过3个月' else '首次发病不足3个月' end,
    jsonb_build_object(
      'symptoms', symptoms_json,
      'symptomOther', left(trim(coalesce(input->>'symptomOther', '')), 200),
      'impact', input->>'impact',
      'frequency', input->>'frequency',
      'conditions', conditions_json,
      'specialPopulations', special_json,
      'treatmentPreference', input->>'treatmentPreference',
      'followUpPreference', input->>'followUpPreference'
    )
  );

  return jsonb_build_object('submissionId', upper(left(submission_uuid::text, 8)));
end;
$$;

revoke all on function public.submit_questionnaire(jsonb) from public, authenticated;
grant execute on function public.submit_questionnaire(jsonb) to anon;

comment on function public.submit_questionnaire(jsonb) is
  'Validates and stores a pre-visit questionnaire submission. Returns the submission ID.';
