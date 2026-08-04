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
  preferences_json jsonb := coalesce(input->'preferences', '[]'::jsonb);
  symptom_count integer;
  symptoms_score integer;
  impact_score integer;
  frequency_score integer;
  duration_score integer;
  conditions_score integer;
  preference_score integer;
  total_score integer;
  grade_level text;
  grade_label text;
  result_tags text[] := array[]::text[];
  guidance_text text;
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
    or jsonb_typeof(preferences_json) <> 'array'
  then
    raise exception '问卷信息不完整，请返回检查';
  end if;

  submission_age := (input->>'age')::integer;
  if submission_age < 1 or submission_age > 120
    or (jsonb_array_length(symptoms_json) = 0 and trim(coalesce(input->>'symptomOther', '')) = '')
    or coalesce(input->>'impact', '') = ''
    or coalesce(input->>'frequency', '') = ''
    or coalesce(input->>'duration', '') = ''
    or jsonb_array_length(conditions_json) = 0
    or jsonb_array_length(preferences_json) = 0
  then
    raise exception '问卷信息不完整，请返回检查';
  end if;

  symptom_count := jsonb_array_length(symptoms_json);
  symptoms_score := case
    when symptom_count = 0 then 0
    when symptom_count >= 4 then 3
    when symptom_count >= 2 then 2
    else 1
  end;
  if symptoms_json ? '眩晕' and symptoms_json ? '头痛' then
    symptoms_score := symptoms_score + 1;
  end if;

  impact_score := (input->>'impact')::integer;
  frequency_score := (input->>'frequency')::integer;
  duration_score := greatest((input->>'duration')::integer, 1);

  select coalesce(sum(
    case
      when item = '以上均没有' then 0
      when item in ('心脑血管疾病', '止痛药频繁', '止晕药频繁', '备孕/怀孕/哺乳', '14岁及以下', '常规吃药效果不好') then 2
      else 1
    end
  ), 0)::integer
  into conditions_score
  from jsonb_array_elements_text(conditions_json) as selected(item);

  preference_score := case
    when preferences_json ? '线上专病管理配合门诊预约复诊' then 2
    when jsonb_array_length(preferences_json) > 0 then 1
    else 0
  end;
  if preferences_json ? '非药物治疗' then
    preference_score := preference_score + 1;
  end if;
  if jsonb_array_length(preferences_json) = 1 and preferences_json ? '传统门诊复诊' then
    preference_score := 0;
  end if;

  total_score := symptoms_score + impact_score + frequency_score + duration_score + conditions_score + preference_score;

  if total_score <= 6 then
    grade_level := 'I级';
    grade_label := '极小或无明显功能障碍';
    guidance_text := '目前量表提示症状影响较小。建议记录发作时间、诱因与伴随症状，并在就诊时向医生说明。';
  elsif total_score <= 13 then
    grade_level := 'II级';
    grade_label := '轻度功能障碍';
    guidance_text := '症状已对生活造成一定影响。建议携带用药记录和既往检查结果，由专病门诊进一步评估。';
  elsif total_score <= 20 then
    grade_level := 'III级';
    grade_label := '中度功能障碍';
    guidance_text := '症状影响较明显或合并风险因素。建议尽早安排专病门诊评估，不要自行频繁调整药物。';
  else
    grade_level := 'IV级';
    grade_label := '重度功能障碍';
    guidance_text := '症状影响较明显或合并风险因素。建议尽早安排专病门诊评估，不要自行频繁调整药物。';
  end if;

  if symptoms_json ? '头痛'
    and (symptoms_json ? '怕光或怕吵' or symptoms_json ? '眼前闪光/视物模糊' or symptoms_json ? '恶心或呕吐')
  then
    result_tags := array_append(result_tags, '偏头痛倾向');
  end if;
  if (symptoms_json ? '眩晕' or symptoms_json ? '头晕')
    and (symptoms_json ? '耳鸣/耳闷/听力下降' or symptoms_json ? '恶心或呕吐')
  then
    result_tags := array_append(result_tags, '前庭性头晕倾向');
  end if;
  if conditions_json ? '失眠' then result_tags := array_append(result_tags, '睡眠障碍'); end if;
  if conditions_json ? '情绪问题' then result_tags := array_append(result_tags, '情绪因素'); end if;
  if conditions_json ? '止痛药频繁' or conditions_json ? '止晕药频繁' then
    result_tags := array_append(result_tags, '频繁用药风险');
  end if;
  if frequency_score >= 3 then
    result_tags := array_append(result_tags, '高频或慢性');
  elsif frequency_score = 2 then
    result_tags := array_append(result_tags, '频发');
  elsif frequency_score = 1 then
    result_tags := array_append(result_tags, '偶发');
  end if;
  if cardinality(result_tags) = 0 then
    result_tags := array_append(result_tags, '暂无明显风险标签');
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
    input->>'course',
    jsonb_build_object(
      'symptoms', symptoms_json,
      'symptomOther', left(trim(coalesce(input->>'symptomOther', '')), 200),
      'impact', input->>'impact',
      'frequency', input->>'frequency',
      'duration', input->>'duration',
      'conditions', conditions_json,
      'preferences', preferences_json
    ),
    total_score,
    grade_level,
    to_jsonb(result_tags)
  );

  return jsonb_build_object(
    'submissionId', upper(left(submission_uuid::text, 8)),
    'total', total_score,
    'level', grade_level,
    'label', grade_label,
    'scores', jsonb_build_array(
      jsonb_build_object('label', '症状复杂度', 'value', symptoms_score),
      jsonb_build_object('label', '生活影响', 'value', impact_score),
      jsonb_build_object('label', '发作频率', 'value', frequency_score),
      jsonb_build_object('label', '持续时间', 'value', duration_score),
      jsonb_build_object('label', '合并情况', 'value', conditions_score),
      jsonb_build_object('label', '治疗意愿', 'value', preference_score)
    ),
    'tags', to_jsonb(result_tags),
    'guidance', guidance_text
  );
end;
$$;

revoke all on function public.submit_questionnaire(jsonb) from public, authenticated;
grant execute on function public.submit_questionnaire(jsonb) to anon;

comment on function public.submit_questionnaire(jsonb) is
  'Validates, assesses, and stores an anonymous pre-visit questionnaire submission.';
