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
    id, created_at, surname, outpatient_number, gender, age, visit_type, course, answers, total_score, level, tags
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
    ),
    0,
    '',
    '[]'::jsonb
  );

  return jsonb_build_object('submissionId', upper(left(submission_uuid::text, 8)));
end;
$$;

revoke all on function public.submit_questionnaire(jsonb) from public, authenticated;
grant execute on function public.submit_questionnaire(jsonb) to anon;

comment on function public.submit_questionnaire(jsonb) is
  'Validates and stores a pre-visit questionnaire submission. Returns the submission ID.';
