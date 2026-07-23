"use client";

import { useMemo, useState } from "react";

type FormState = {
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

type Result = {
  submissionId: string;
  total: number;
  level: string;
  label: string;
  scores: { label: string; value: number }[];
  tags: string[];
  guidance: string;
};

const initialForm: FormState = {
  name: "",
  gender: "",
  age: "",
  visitType: "",
  course: "",
  symptoms: [],
  symptomOther: "",
  impact: "",
  frequency: "",
  duration: "",
  conditions: [],
  preferences: [],
};

const symptoms = [
  ["眩晕", "天旋地转、感觉自身或周围在转动"],
  ["头晕", "头重脚轻、站不稳、晕乎乎的感觉"],
  ["头痛", ""],
  ["头昏胀", "头部胀满感、头脑不清醒"],
  ["恶心或呕吐", ""],
  ["耳鸣/耳闷/听力下降", "耳鸣、耳闷或听力下降"],
  ["怕光或怕吵", ""],
  ["眼前闪光/视物模糊", "眼前闪光、视物模糊"],
];

const impact = [
  ["0", "完全不影响", "该干嘛干嘛"],
  ["1", "有些力不从心", "做事效率明显下降"],
  ["2", "明显影响日常活动", "需要休息或减少活动"],
  ["3", "无法进行日常活动", "需要卧床休息"],
];

const frequency = [
  ["0", "近期没有发作", "是因为以前的老毛病来看病"],
  ["1", "1 到 3 天", ""],
  ["2", "4 到 15 天", ""],
  ["3", "超过 15 天", ""],
  ["4", "几乎每天都有", ""],
];

const durations = [
  ["1", "不到 1 分钟", "翻身、低头或抬头时出现，很快缓解"],
  ["2", "1 分钟到几小时", ""],
  ["3", "几小时到 1 天", ""],
  ["4", "超过 1 天", ""],
];

const conditions = [
  ["心脑血管疾病", "高血压、糖尿病、高血脂、冠心病或中风"],
  ["失眠", "每周超过 3 天睡不好"],
  ["情绪问题", "精神紧张、情绪低落或兴趣下降"],
  ["止晕药频繁", "止晕药每周使用超过 2 天"],
  ["止痛药频繁", "止痛药每周使用超过 2 天"],
  ["14岁及以下", ""],
  ["备孕/怀孕/哺乳", ""],
  ["长时间驾驶", "职业司机或每天通勤超过 2 小时"],
  ["常规吃药效果不好", ""],
  ["以上均没有", ""],
];

const preferences = [
  "非药物治疗",
  "药物治疗",
  "传统门诊复诊",
  "线上专病管理配合门诊预约复诊",
];

const stepMeta = [
  ["基本信息", "用于建立本次预诊档案"],
  ["症状识别", "您目前有哪些不舒服？可多选"],
  ["生活影响", "这些不舒服对生活有多大影响？"],
  ["发作频率", "近一个月里，大概持续了多少天？"],
  ["持续时间", "每次发作大概持续多长时间？"],
  ["合并情况", "您是否同时有以下情况？可多选"],
  ["治疗意愿", "您更倾向于哪些治疗和随访方式？"],
];

function Choice({
  checked,
  title,
  subtitle,
  multiple,
  onChange,
}: {
  checked: boolean;
  title: string;
  subtitle?: string;
  multiple?: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      className={`choice ${checked ? "choiceSelected" : ""}`}
      aria-pressed={checked}
      onClick={onChange}
    >
      <span className={multiple ? "choiceBox" : "choiceDot"} />
      <span>
        <strong>{title}</strong>
        {subtitle ? <small>{subtitle}</small> : null}
      </span>
    </button>
  );
}

export default function Home() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const progress = useMemo(() => Math.round((step / 7) * 100), [step]);

  const setField = (field: keyof FormState, value: string | string[]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggle = (field: "symptoms" | "conditions" | "preferences", value: string) => {
    setForm((current) => {
      let next = current[field].includes(value)
        ? current[field].filter((item) => item !== value)
        : [...current[field], value];

      if (field === "conditions") {
        if (value === "以上均没有" && !current[field].includes(value)) next = ["以上均没有"];
        if (value !== "以上均没有") next = next.filter((item) => item !== "以上均没有");
      }
      return { ...current, [field]: next };
    });
  };

  const validate = () => {
    if (step === 0 && (!form.name.trim() || !form.gender || !form.age || !form.visitType || !form.course)) {
      return "请完整填写基本信息";
    }
    if (step === 1 && form.symptoms.length === 0 && !form.symptomOther.trim()) return "请至少选择或填写一项症状";
    if (step === 2 && form.impact === "") return "请选择生活影响程度";
    if (step === 3 && form.frequency === "") return "请选择发作频率";
    if (step === 4 && form.duration === "") return "请选择持续时间";
    if (step === 5 && form.conditions.length === 0) return "请选择一项合并情况";
    if (step === 6 && form.preferences.length === 0) return "请至少选择一项治疗意愿";
    return "";
  };

  const next = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    if (step < 6) {
      setStep((value) => value + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json()) as Result & { error?: string };
      if (!response.ok) throw new Error(data.error || "提交失败，请稍后重试");
      setResult(data);
      setStep(7);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "提交失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  };

  const restart = () => {
    setForm(initialForm);
    setResult(null);
    setStep(0);
    setError("");
  };

  return (
    <main className="appShell">
      <header className="topbar">
        <div className="brandMark" aria-hidden="true">浙</div>
        <div className="brandText">
          <h1>头晕头痛专病门诊</h1>
          <p>浙江省人民医院 · 神经内科预诊问卷</p>
        </div>
        <span className="securePill">隐私保护</span>
      </header>

      <section className="content">
        {step < 7 ? (
          <>
            <div className="progressBlock">
              <div className="progressCopy">
                <span>预诊评估</span>
                <strong>{step + 1} / 7</strong>
              </div>
              <div className="progressTrack"><span style={{ width: `${progress}%` }} /></div>
            </div>

            <div className="questionHeading">
              <span className="eyebrow">{step === 0 ? "开始评估" : `第 ${step} 题`}</span>
              <h2>{stepMeta[step][0]}</h2>
              <p>{stepMeta[step][1]}</p>
            </div>

            <section className="questionCard">
              {step === 0 ? (
                <div className="formGrid">
                  <label className="field fieldWide">
                    <span>姓名</span>
                    <input value={form.name} onChange={(event) => setField("name", event.target.value)} placeholder="请输入姓名" autoComplete="name" />
                  </label>
                  <label className="field">
                    <span>性别</span>
                    <select value={form.gender} onChange={(event) => setField("gender", event.target.value)}>
                      <option value="">请选择</option><option>男</option><option>女</option>
                    </select>
                  </label>
                  <label className="field">
                    <span>年龄</span>
                    <input type="number" min="1" max="120" value={form.age} onChange={(event) => setField("age", event.target.value)} placeholder="岁" />
                  </label>
                  <label className="field">
                    <span>就诊类型</span>
                    <select value={form.visitType} onChange={(event) => setField("visitType", event.target.value)}>
                      <option value="">请选择</option><option>初诊</option><option>普通复诊</option><option>预约复诊</option>
                    </select>
                  </label>
                  <label className="field">
                    <span>病程</span>
                    <select value={form.course} onChange={(event) => setField("course", event.target.value)}>
                      <option value="">请选择</option><option>首次发病不足3个月</option><option>首次发病已超过3个月</option>
                    </select>
                  </label>
                  <div className="privacyCard fieldWide">
                    <span aria-hidden="true">✦</span>
                    <p><strong>预计用时约 3 分钟</strong><br />信息将加密提交，仅用于本次预诊评估。</p>
                  </div>
                </div>
              ) : null}

              {step === 1 ? (
                <div className="choiceList">
                  {symptoms.map(([title, subtitle]) => (
                    <Choice key={title} checked={form.symptoms.includes(title)} title={title} subtitle={subtitle} multiple onChange={() => toggle("symptoms", title)} />
                  ))}
                  <label className="otherField"><span>其他不适（选填）</span><input value={form.symptomOther} onChange={(event) => setField("symptomOther", event.target.value)} /></label>
                </div>
              ) : null}

              {step === 2 ? (
                <div className="choiceList">{impact.map(([value, title, subtitle]) => (
                  <Choice key={value} checked={form.impact === value} title={title} subtitle={subtitle} onChange={() => setField("impact", value)} />
                ))}</div>
              ) : null}

              {step === 3 ? (
                <div className="choiceList">{frequency.map(([value, title, subtitle]) => (
                  <Choice key={value} checked={form.frequency === value} title={title} subtitle={subtitle} onChange={() => setField("frequency", value)} />
                ))}</div>
              ) : null}

              {step === 4 ? (
                <div className="choiceList">{durations.map(([value, title, subtitle]) => (
                  <Choice key={value} checked={form.duration === value} title={title} subtitle={subtitle} onChange={() => setField("duration", value)} />
                ))}</div>
              ) : null}

              {step === 5 ? (
                <div className="choiceList">{conditions.map(([title, subtitle]) => (
                  <Choice key={title} checked={form.conditions.includes(title)} title={title} subtitle={subtitle} multiple onChange={() => toggle("conditions", title)} />
                ))}</div>
              ) : null}

              {step === 6 ? (
                <div className="preferenceGrid">{preferences.map((item) => (
                  <Choice key={item} checked={form.preferences.includes(item)} title={item} multiple onChange={() => toggle("preferences", item)} />
                ))}</div>
              ) : null}

              {error ? <div className="errorMessage" role="alert">{error}</div> : null}
            </section>

            <div className="navigation">
              <button type="button" className="secondaryButton" disabled={step === 0 || submitting} onClick={() => { setError(""); setStep((value) => Math.max(0, value - 1)); }}>上一步</button>
              <button type="button" className="primaryButton" disabled={submitting} onClick={next}>{submitting ? "正在生成评估…" : step === 6 ? "提交并生成评估" : "下一步"}</button>
            </div>
          </>
        ) : result ? (
          <section className="resultPage">
            <div className="resultHero">
              <span className="resultKicker">预诊评估已完成</span>
              <div className="scoreRing"><strong>{result.total}</strong><span>V-DAS-6</span></div>
              <h2>{result.level} · {result.label}</h2>
              <p>档案编号：{result.submissionId}</p>
            </div>

            <div className="resultGrid">
              <section className="resultCard">
                <h3>各维度评分</h3>
                <div className="scoreList">{result.scores.map((score) => (
                  <div key={score.label}><span>{score.label}</span><strong>{score.value} 分</strong></div>
                ))}</div>
              </section>
              <section className="resultCard">
                <h3>评估标签</h3>
                <div className="tags">{result.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                <p className="guidance">{result.guidance}</p>
              </section>
            </div>

            <div className="medicalNotice">
              <strong>重要提示</strong>
              <p>本结果仅用于门诊前信息整理，不构成诊断或治疗建议。若出现突发剧烈头痛、意识障碍、肢体无力或言语不清，请立即就医。</p>
            </div>
            <button type="button" className="secondaryButton restartButton" onClick={restart}>重新填写</button>
          </section>
        ) : null}
      </section>
      <footer>浙江省人民医院神经内科 · 头晕头痛专病门诊</footer>
    </main>
  );
}
