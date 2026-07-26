export type FormState = {
  name: string;
  gender: string;
  age: string;
  visitType: string;
  course: string;
  symptoms: string[];
  symptomOther: string;
  impact: string;
  frequency: string;
  conditions: string[];
  specialPopulations: string[];
  treatmentPreference: string;
  followUpPreference: string;
};

export type Recommendation = {
  ruleLabel: string;
  uRules: string[];
  package: string;
  packageName: string;
  price: string;
  copy: string;
  variantCopy: string[];
  tags: string[];
};

export type Result = {
  submissionId: string;
  recommendation: Recommendation;
};

export function computeRecommendation(form: FormState): Recommendation {
  const tags: string[] = [];

  if (
    form.symptoms.includes("头痛") &&
    (form.symptoms.includes("怕光或怕吵") ||
      form.symptoms.includes("眼前闪光/视物模糊") ||
      form.symptoms.includes("恶心或呕吐"))
  ) {
    tags.push("偏头痛");
  }

  if (form.symptoms.includes("眩晕") && form.symptoms.includes("头痛")) {
    tags.push("前庭性偏头痛");
  }

  if (form.symptoms.includes("眩晕") && form.symptoms.includes("耳鸣/耳闷/听力下降")) {
    tags.push("梅尼埃病");
  }

  if (form.conditions.includes("失眠")) {
    tags.push("睡眠障碍");
  }

  if (form.conditions.includes("精神紧张或情绪低落")) {
    tags.push("情绪问题");
  }

  if (form.conditions.includes("心脑血管疾病") || form.conditions.includes("吸烟/饮酒/咖啡")) {
    tags.push("高危共病或嗜好人群");
  }

  if (form.conditions.includes("止痛药频繁") || form.conditions.includes("止晕药频繁")) {
    tags.push("药物过度使用");
  }

  if (
    form.specialPopulations.includes("14岁及以下") ||
    form.specialPopulations.includes("正在备孕、怀孕或哺乳中")
  ) {
    tags.push("药物禁忌人群");
  }

  if (
    form.specialPopulations.includes("学生或正在备考") ||
    form.specialPopulations.includes("工作需要高度用脑") ||
    form.specialPopulations.includes("需要长时间驾驶") ||
    form.specialPopulations.includes("经常上夜班或作息不规律")
  ) {
    tags.push("高危职业人群");
  }

  if (
    form.treatmentPreference === "非药物治疗" ||
    form.specialPopulations.includes("常规吃药效果不太好")
  ) {
    tags.push("非药物治疗倾向");
  }

  if (form.visitType === "预约复诊") {
    return {
      ruleLabel: "D1",
      uRules: [],
      package: "不推荐",
      packageName: "",
      price: "",
      copy: "您已预约复诊，已有专病管理计划。请按预约时间就诊，由施天明主任团队进一步评估。",
      variantCopy: [],
      tags,
    };
  }

  let basePackage: 1 | 2 | 3 = 1;
  let ruleLabel = "";

  if (form.impact === "0" && form.frequency === "0") {
    basePackage = 1;
    ruleLabel = "D2";
  }

  const i = form.impact;
  const f = form.frequency;

  if (ruleLabel === "") {
    if (["0", "1"].includes(i) && ["0", "1"].includes(f)) {
      basePackage = 1;
      ruleLabel = "R1";
    } else if (i === "0" && ["2", "3", "4"].includes(f)) {
      basePackage = 2;
      ruleLabel = "R2";
    } else if (i === "1" && f === "2") {
      basePackage = 2;
      ruleLabel = "R3";
    } else if (i === "1" && ["3", "4"].includes(f)) {
      basePackage = 3;
      ruleLabel = "R4";
    } else if (["2", "3"].includes(i) && f === "0") {
      basePackage = 1;
      ruleLabel = "R5";
    } else if (["2", "3"].includes(i) && f === "1") {
      basePackage = 2;
      ruleLabel = "R6";
    } else if (["2", "3"].includes(i) && ["2", "3", "4"].includes(f)) {
      basePackage = 3;
      ruleLabel = "R7";
    }
  }

  const uRules: string[] = [];

  if (form.course === "是") uRules.push("U1");
  if (form.conditions.includes("心脑血管疾病") || form.conditions.includes("吸烟/饮酒/咖啡"))
    uRules.push("U2");
  if (form.conditions.includes("止痛药频繁") || form.conditions.includes("止晕药频繁"))
    uRules.push("U3");
  if (form.specialPopulations.includes("正在备孕、怀孕或哺乳中")) uRules.push("U4");
  if (form.specialPopulations.includes("14岁及以下")) uRules.push("U5");
  if (
    form.specialPopulations.includes("学生或正在备考") ||
    form.specialPopulations.includes("工作需要高度用脑") ||
    form.specialPopulations.includes("需要长时间驾驶")
  )
    uRules.push("U6");
  if (form.specialPopulations.includes("经常上夜班或作息不规律")) uRules.push("U7");
  if (form.specialPopulations.includes("常规吃药效果不太好")) uRules.push("U8");

  let finalPackage = basePackage;
  if (uRules.length > 0) {
    if (finalPackage === 1) finalPackage = 2;
    else if (finalPackage === 2) finalPackage = 3;
  }

  if (
    uRules.length === 0 &&
    form.followUpPreference === "专病门诊定期复诊"
  ) {
    finalPackage = 1;
  }

  const packageNames = ["", "互联网专病团队咨询", "生活调理包", "专病管理包"];
  const prices = ["", "25元/次（限10条回复）", "150元/30天 或 390元/90天", "500元/30天"];

  const variantCopy: string[] = [];

  if (tags.includes("偏头痛")) {
    variantCopy.push(
      "您的症状表现与偏头痛特征较为吻合，偏头痛是一种常见而复杂、且会造成严重失能的神经系统疾患，但可以规范诊断、治疗与预防。",
    );
  }
  if (tags.includes("前庭性偏头痛")) {
    variantCopy.push(
      "您的症状表现与前庭性偏头痛特征较为吻合，前庭性偏头痛是一种与偏头痛相关的发作性前庭疾病，但可以规范诊断、治疗与预防。",
    );
  }
  if (tags.includes("梅尼埃病")) {
    variantCopy.push(
      "您的症状表现与梅尼埃病特征较为吻合，梅尼埃病是一种慢性内耳疾病，会严重影响听力与平衡功能，但可以规范诊断、治疗与预防。",
    );
  }
  if (tags.includes("睡眠障碍")) {
    variantCopy.push(
      "您的症状可能与睡眠问题有关，长期睡眠障碍与头晕头痛往往互成因果，可以通过药物或非药物方案（认知行为治疗）改善，解决睡眠问题才能更有效控制头晕头痛。",
    );
  }
  if (tags.includes("情绪问题")) {
    variantCopy.push(
      "您的症状可能与情绪问题有关，长期情绪障碍与头晕头痛往往互成因果，可以通过药物或非药物方案（认知行为治疗）改善，解决情绪问题才能更有效控制头晕头痛。",
    );
  }
  if (tags.includes("高危共病或嗜好人群")) {
    variantCopy.push(
      "您存在心脑血管疾病或不良嗜好，可能与头晕头痛复发相关，需要更加严格生活方式管理及共病治疗。",
    );
  }
  if (tags.includes("药物过度使用")) {
    variantCopy.push(
      "您止痛药或止晕药使用频率偏高，长期频繁使用上述药物可能导致药效下降、成瘾依赖，且对多器官存在潜在伤害，建议尽早重新评估用药方案。",
    );
  }
  if (tags.includes("药物禁忌人群")) {
    variantCopy.push(
      "考虑到您的年龄或当前身体状况并不适合使用常规药物治疗，建议启动非药物治疗。",
    );
  }
  if (tags.includes("高危职业人群")) {
    variantCopy.push(
      "考虑到您的职业对注意力或脑力要求较高，头晕头痛发作或常规药物治疗均可能增加职业风险，建议关注药物不良反应或启动非药物治疗。",
    );
  }
  if (tags.includes("非药物治疗倾向")) {
    variantCopy.push(
      "考虑到您倾向于非药物治疗或常规药物治疗无效，建议启动非药物治疗。",
    );
  }

  let copy = "";

  if (finalPackage === 1) {
    copy =
      "根据问卷评估结果，目前症状程度较轻。建议先由施天明主任团队进行病情评估，诊后随访推荐【浙江省人民医院互联网医院头晕头痛专病团队】，如有相关问题可咨询专病团队在线解答。如后续症状有变化，可随时升级【头晕头痛生活调理包】或【头晕头痛专病管理包】服务。";
  } else if (finalPackage === 2) {
    copy =
      "根据问卷评估结果，症状存在频发趋势，对日常生活造成一定影响。建议先由施天明主任团队进行病情评估，诊后随访推荐【头晕头痛生活调理服务包】，专病团队与小助手将从诱因排查、饮食管理、睡眠改善、康复指导四个方面为您制定系统生活调理方案。通过综合干预，减少症状发作频率，提高生活质量。";
  } else {
    copy =
      "根据问卷评估结果，症状发作较为频繁，且对日常生活造成显著影响。建议先由施天明主任团队进行病情评估，诊后随访推荐【头晕头痛专病管理服务包】，由专病团队为您提供全程管理，包括：生活方式调理、精准诱因排查、专业用药指导、发作预警快速响应及神经调控、康复训练、认知行为等非药物治疗，以及开通门诊优先复诊通道。专病专治，通过更规范的管理，摆脱晕痛困扰。";
  }

  return {
    ruleLabel,
    uRules,
    package: finalPackage === 1 ? "套餐一" : finalPackage === 2 ? "套餐二" : "套餐三",
    packageName: packageNames[finalPackage],
    price: prices[finalPackage],
    copy,
    variantCopy,
    tags,
  };
}
