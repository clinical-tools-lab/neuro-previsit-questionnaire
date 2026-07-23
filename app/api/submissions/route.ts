import { getSupabaseAdmin } from "../../../lib/supabase-admin";

type Submission = {
  name: string;
  gender: string;
  age: string;
  visitType: string;
  course: string;
  symptoms: string[];
  symptomOther: string;
  impact: string;
  frequency: string;
  duration: string;
  conditions: string[];
  preferences: string[];
};

const weightedConditions = new Set([
  "心脑血管疾病", "止痛药频繁", "止晕药频繁", "备孕/怀孕/哺乳", "14岁及以下", "常规吃药效果不好",
]);

function assess(input: Submission) {
  let symptoms = input.symptoms.length === 0 ? 0 : input.symptoms.length >= 4 ? 3 : input.symptoms.length >= 2 ? 2 : 1;
  if (input.symptoms.includes("眩晕") && input.symptoms.includes("头痛")) symptoms += 1;
  const impact = Number(input.impact) || 0;
  const frequency = Number(input.frequency) || 0;
  const duration = Number(input.duration) || 1;
  const conditions = input.conditions.reduce((score, item) => item === "以上均没有" ? score : score + (weightedConditions.has(item) ? 2 : 1), 0);
  let preference = input.preferences.includes("线上专病管理配合门诊预约复诊") ? 2 : input.preferences.length ? 1 : 0;
  if (input.preferences.includes("非药物治疗")) preference += 1;
  if (input.preferences.length === 1 && input.preferences[0] === "传统门诊复诊") preference = 0;
  const total = symptoms + impact + frequency + duration + conditions + preference;

  const grade = total <= 6
    ? { level: "I级", label: "极小或无明显功能障碍" }
    : total <= 13
      ? { level: "II级", label: "轻度功能障碍" }
      : total <= 20
        ? { level: "III级", label: "中度功能障碍" }
        : { level: "IV级", label: "重度功能障碍" };

  const tags: string[] = [];
  if (input.symptoms.includes("头痛") && input.symptoms.some((item) => ["怕光或怕吵", "眼前闪光/视物模糊", "恶心或呕吐"].includes(item))) tags.push("偏头痛倾向");
  if (input.symptoms.some((item) => ["眩晕", "头晕"].includes(item)) && input.symptoms.some((item) => ["耳鸣/耳闷/听力下降", "恶心或呕吐"].includes(item))) tags.push("前庭性头晕倾向");
  if (input.conditions.includes("失眠")) tags.push("睡眠障碍");
  if (input.conditions.includes("情绪问题")) tags.push("情绪因素");
  if (input.conditions.some((item) => ["止痛药频繁", "止晕药频繁"].includes(item))) tags.push("频繁用药风险");
  if (frequency >= 3) tags.push("高频或慢性");
  else if (frequency === 2) tags.push("频发");
  else if (frequency === 1) tags.push("偶发");
  if (tags.length === 0) tags.push("暂无明显风险标签");

  const guidance = total <= 6
    ? "目前量表提示症状影响较小。建议记录发作时间、诱因与伴随症状，并在就诊时向医生说明。"
    : total <= 13
      ? "症状已对生活造成一定影响。建议携带用药记录和既往检查结果，由专病门诊进一步评估。"
      : "症状影响较明显或合并风险因素。建议尽早安排专病门诊评估，不要自行频繁调整药物。";

  return {
    total,
    ...grade,
    scores: [
      { label: "症状复杂度", value: symptoms },
      { label: "生活影响", value: impact },
      { label: "发作频率", value: frequency },
      { label: "持续时间", value: duration },
      { label: "合并情况", value: conditions },
      { label: "治疗意愿", value: preference },
    ],
    tags,
    guidance,
  };
}

function isValid(input: Submission) {
  const age = Number(input.age);
  return Boolean(
    input.name?.trim() &&
    input.gender &&
    Number.isInteger(age) &&
    age >= 1 &&
    age <= 120 &&
    input.visitType &&
    input.course &&
    (input.symptoms?.length || input.symptomOther?.trim()) &&
    input.impact !== "" &&
    input.frequency !== "" &&
    input.duration !== "" &&
    input.conditions?.length &&
    input.preferences?.length
  );
}

export async function POST(request: Request) {
  try {
    const input = await request.json() as Submission;
    if (!isValid(input)) return Response.json({ error: "问卷信息不完整，请返回检查" }, { status: 400 });

    const result = assess(input);
    const id = crypto.randomUUID();
    const shortId = id.split("-")[0].toUpperCase();
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("questionnaire_submissions").insert({
      id,
      created_at: new Date().toISOString(),
      name: input.name.trim().slice(0, 40),
      gender: input.gender,
      age: Number(input.age),
      visit_type: input.visitType,
      course: input.course,
      answers: {
        symptoms: input.symptoms,
        symptomOther: input.symptomOther.trim().slice(0, 200),
        impact: input.impact,
        frequency: input.frequency,
        duration: input.duration,
        conditions: input.conditions,
        preferences: input.preferences,
      },
      total_score: result.total,
      level: result.level,
      tags: result.tags,
    });
    if (error) throw new Error(`Supabase insert failed: ${error.message}`);

    return Response.json({ submissionId: shortId, ...result });
  } catch (error) {
    console.error("questionnaire submission failed", error);
    return Response.json({ error: "提交失败，请稍后重试" }, { status: 500 });
  }
}
