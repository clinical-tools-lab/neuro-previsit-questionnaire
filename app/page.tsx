"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { type FormState, type Result, computeRecommendation } from "@/lib/recommendation";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

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
  conditions: [],
  specialPopulations: [],
  treatmentPreference: "",
  followUpPreference: "",
};

const symptoms = [
  ["头晕", "头重脚轻、站不稳、晕乎乎的感觉"],
  ["眩晕", "天旋地转、感觉自身或周围在转动"],
  ["头痛", ""],
  ["头昏胀", "头部胀满感、头脑不清醒"],
  ["恶心或呕吐", ""],
  ["耳鸣/耳闷/听力下降", "耳鸣、耳闷或听力下降"],
  ["怕光或怕吵", ""],
  ["眼前闪光/视物模糊", "眼前闪光、视物模糊"],
];

const impact = [
  ["0", "完全不影响，该干嘛干嘛", ""],
  ["1", "有些力不从心，做事效率明显下降", ""],
  ["2", "明显影响日常活动，需要休息或减少活动", ""],
  ["3", "无法进行日常活动，需要卧床休息", ""],
];

const frequency = [
  ["0", "近期没有发作", "是因为以前的老毛病来看病"],
  ["1", "1 到 3 天", ""],
  ["2", "4 到 15 天", ""],
  ["3", "超过 15 天", ""],
  ["4", "几乎每天都有", ""],
];

const conditions = [
  ["心脑血管疾病", "高血压、糖尿病、高血脂、冠心病或中风"],
  ["吸烟/饮酒/咖啡", "有吸烟、饮酒或每天喝超过 2 杯咖啡"],
  ["失眠", "每周超过 3 天睡不好，病程超过 2 周"],
  ["精神紧张或情绪低落", "精神紧张、担忧，或情绪低落、对什么都没兴趣（病程超过 2 周）"],
  ["止晕药频繁", "止晕药每周服用超过 2 天（如异丙嗪、山莨菪碱、地芬尼多等）"],
  ["止痛药频繁", "止痛药每周服用超过 2 天（如布洛芬、对乙酰氨基酚、曲普坦等）"],
  ["以上均没有", ""],
];

const specialPopulations = [
  ["14岁及以下", ""],
  ["学生或正在备考", ""],
  ["工作需要高度用脑", "程序员、金融、科研等"],
  ["需要长时间驾驶", "职业司机或每天通勤超过 2 小时"],
  ["经常上夜班或作息不规律", ""],
  ["正在备孕、怀孕或哺乳中", ""],
  ["常规吃药效果不太好", ""],
  ["以上都不符合", ""],
];

const treatmentOptions = [
  ["药物治疗", "药物治疗头晕头痛"],
  ["非药物治疗", "非药物治疗头晕头痛（如生活调理/康复理疗/心理治疗）"],
];

const followUpOptions = [
  ["专病门诊定期复诊", "专病门诊定期复诊，可以接受预约排队候诊"],
  ["互联网平台复诊", "通过互联网平台复诊，居家就能获得医疗指导"],
  ["均可接受", "两种复诊方式均可以接受"],
];

const packageQRUrls = [
  "",
  "https://interhos.eheren.com/static/h5/docDetail.html?hosId=449&hosDocId=252&docType=99",
  "https://interhos.eheren.com/static/h5/docDetail.html?hosId=449&nhPath=pages/v3/postDiagnosisService/detail%3FhosId%3D449%26serviceId%3D2511260631765791192",
  "https://interhos.eheren.com/static/h5/docDetail.html?hosId=449&nhPath=/pages/v3/postDiagnosisService/detail%3FhosId%3D449%26packageId%3D20260622100000000001",
];

const stepMeta = [
  ["基本信息", "用于建立本次预诊档案"],
  ["症状评估", "您目前有哪些不舒服？可多选"],
  ["生活影响", "这些不舒服对您的生活影响有多大？"],
  ["发作频率", "近一个月里，这些不舒服大概持续了多少天？"],
  ["合并情况", "您是否同时有以下情况？可多选"],
  ["特殊人群", "以下哪些情况符合您？可多选"],
  ["治疗方式", "您更倾向于哪种治疗方式？"],
  ["复诊方式", "您更倾向于哪种复诊方式？"],
];

/* ------------------------------------------------------------------ */
/*  Components                                                         */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  QRCodeCard                                                         */
/* ------------------------------------------------------------------ */

function QRCodeCard({
  url,
  name,
  price,
  recommended,
}: {
  url: string;
  name: string;
  price: string;
  recommended: boolean;
}) {
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(url, {
      width: 200,
      margin: 1,
      color: { dark: "#13212f", light: "#ffffff" },
    }).then((svg) => {
      if (!cancelled) setDataUrl(svg);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [url]);

  return (
    <div className={`qrCard ${recommended ? "qrCardRecommended" : ""}`}>
      {recommended ? <span className="qrBadge">推荐方案</span> : null}
      <div className="qrImageWrap">
        {dataUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={dataUrl} alt={`${name}购买二维码`} className="qrImage" />
        ) : (
          <div className="qrPlaceholder" />
        )}
      </div>
      <div className="qrInfo">
        <strong>{name}</strong>
        <span>{price}</span>
        <small>微信扫码购买</small>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Home                                                               */
/* ------------------------------------------------------------------ */

export default function Home() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const progress = useMemo(() => Math.round((step / 8) * 100), [step]);

  const setField = (field: keyof FormState, value: string | string[]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggle = (field: "symptoms" | "conditions" | "specialPopulations", value: string) => {
    setForm((current) => {
      const noneOption = field === "conditions" ? "以上均没有" : "以上都不符合";
      let next = current[field].includes(value)
        ? current[field].filter((item) => item !== value)
        : [...current[field], value];

      if (value === noneOption && !current[field].includes(value)) next = [noneOption];
      if (value !== noneOption) next = next.filter((item) => item !== noneOption);
      return { ...current, [field]: next };
    });
  };

  const validate = () => {
    if (step === 0 && (!form.name.trim() || !form.gender || !form.age || !form.visitType || !form.course)) {
      return "请完整填写基本信息";
    }
    if (step === 1 && form.symptoms.length === 0 && !form.symptomOther.trim())
      return "请至少选择或填写一项症状";
    if (step === 2 && form.impact === "") return "请选择生活影响程度";
    if (step === 3 && form.frequency === "") return "请选择发作频率";
    if (step === 4 && form.conditions.length === 0) return "请选择一项合并情况";
    if (step === 5 && form.specialPopulations.length === 0) return "请选择一项";
    if (step === 6 && form.treatmentPreference === "") return "请选择治疗方式";
    if (step === 7 && form.followUpPreference === "") return "请选择复诊方式";
    return "";
  };

  const next = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");

    if (step < 7) {
      setStep((value) => value + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !supabaseAnonKey) throw new Error("问卷服务尚未配置，请稍后重试");

      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/submit_questionnaire`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          apikey: supabaseAnonKey,
          authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ input: form }),
      });

      const data = await response.json();

      if (!response.ok) {
        const err: { error?: string; message?: string } = data;
        throw new Error(err.error || err.message || "提交失败，请稍后重试");
      }

      const recommendation = computeRecommendation(form);

      setResult({
        submissionId: data.submissionId ?? "",
        recommendation,
      });
      setStep(8);
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

  /* ---- Render ---- */

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
        {step < 8 ? (
          <>
            <div className="progressBlock">
              <div className="progressCopy">
                <span>预诊评估</span>
                <strong>{step + 1} / 8</strong>
              </div>
              <div className="progressTrack"><span style={{ width: `${progress}%` }} /></div>
            </div>

            <div className="questionHeading">
              <span className="eyebrow">
                {step === 0 ? "开始评估" : `第 ${step} 题`}
              </span>
              <h2>{stepMeta[step][0]}</h2>
              <p>{stepMeta[step][1]}</p>
            </div>

            <section className="questionCard">
              {/* Step 0: Basic Info */}
              {step === 0 ? (
                <div className="formGrid">
                  <label className="field fieldWide">
                    <span>姓名</span>
                    <input
                      value={form.name}
                      onChange={(event) => setField("name", event.target.value)}
                      placeholder="请输入姓名"
                      autoComplete="name"
                    />
                  </label>
                  <label className="field">
                    <span>性别</span>
                    <select
                      value={form.gender}
                      onChange={(event) => setField("gender", event.target.value)}
                    >
                      <option value="">请选择</option>
                      <option>男</option>
                      <option>女</option>
                    </select>
                  </label>
                  <label className="field">
                    <span>年龄</span>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={form.age}
                      onChange={(event) => setField("age", event.target.value)}
                      placeholder="岁"
                    />
                  </label>
                  <label className="field">
                    <span>就诊类型</span>
                    <select
                      value={form.visitType}
                      onChange={(event) => setField("visitType", event.target.value)}
                    >
                      <option value="">请选择</option>
                      <option>初诊</option>
                      <option>普通复诊</option>
                      <option>预约复诊</option>
                    </select>
                  </label>
                  <label className="field">
                    <span>首次发病是否超过3个月</span>
                    <select
                      value={form.course}
                      onChange={(event) => setField("course", event.target.value)}
                    >
                      <option value="">请选择</option>
                      <option>是</option>
                      <option>否</option>
                    </select>
                  </label>
                  <div className="privacyCard fieldWide">
                    <span aria-hidden="true">✦</span>
                    <p>
                      <strong>预计用时约 3 分钟</strong>
                      <br />
                      所有信息均严格保密，仅用于医疗评估与诊后管理方案匹配。
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Step 1: Q1 Symptoms */}
              {step === 1 ? (
                <div className="choiceList">
                  {symptoms.map(([title, subtitle]) => (
                    <Choice
                      key={title}
                      checked={form.symptoms.includes(title)}
                      title={title}
                      subtitle={subtitle}
                      multiple
                      onChange={() => toggle("symptoms", title)}
                    />
                  ))}
                  <label className="otherField">
                    <span>其他（请描述）</span>
                    <input
                      value={form.symptomOther}
                      onChange={(event) => setField("symptomOther", event.target.value)}
                      placeholder="选填"
                    />
                  </label>
                </div>
              ) : null}

              {/* Step 2: Q2 Impact */}
              {step === 2 ? (
                <div className="choiceList">
                  {impact.map(([value, title, subtitle]) => (
                    <Choice
                      key={value}
                      checked={form.impact === value}
                      title={title}
                      subtitle={subtitle}
                      onChange={() => setField("impact", value)}
                    />
                  ))}
                </div>
              ) : null}

              {/* Step 3: Q3 Frequency */}
              {step === 3 ? (
                <div className="choiceList">
                  {frequency.map(([value, title, subtitle]) => (
                    <Choice
                      key={value}
                      checked={form.frequency === value}
                      title={title}
                      subtitle={subtitle}
                      onChange={() => setField("frequency", value)}
                    />
                  ))}
                </div>
              ) : null}

              {/* Step 4: Q4 Comorbidities */}
              {step === 4 ? (
                <div className="choiceList">
                  {conditions.map(([title, subtitle]) => (
                    <Choice
                      key={title}
                      checked={form.conditions.includes(title)}
                      title={title}
                      subtitle={subtitle}
                      multiple
                      onChange={() => toggle("conditions", title)}
                    />
                  ))}
                </div>
              ) : null}

              {/* Step 5: Q5 Special Populations */}
              {step === 5 ? (
                <div className="choiceList">
                  {specialPopulations.map(([title, subtitle]) => (
                    <Choice
                      key={title}
                      checked={form.specialPopulations.includes(title)}
                      title={title}
                      subtitle={subtitle}
                      multiple
                      onChange={() => toggle("specialPopulations", title)}
                    />
                  ))}
                </div>
              ) : null}

              {/* Step 6: Q6 Treatment Preference */}
              {step === 6 ? (
                <div className="choiceList">
                  {treatmentOptions.map(([key, label]) => (
                    <Choice
                      key={key}
                      checked={form.treatmentPreference === key}
                      title={label}
                      onChange={() => setField("treatmentPreference", key)}
                    />
                  ))}
                </div>
              ) : null}

              {/* Step 7: Q7 Follow-up Preference */}
              {step === 7 ? (
                <div className="choiceList">
                  {followUpOptions.map(([key, label]) => (
                    <Choice
                      key={key}
                      checked={form.followUpPreference === key}
                      title={label}
                      onChange={() => setField("followUpPreference", key)}
                    />
                  ))}
                </div>
              ) : null}

              {error ? (
                <div className="errorMessage" role="alert">
                  {error}
                </div>
              ) : null}
            </section>

            <div className="navigation">
              <button
                type="button"
                className="secondaryButton"
                disabled={step === 0 || submitting}
                onClick={() => {
                  setError("");
                  setStep((value) => Math.max(0, value - 1));
                }}
              >
                上一步
              </button>
              <button
                type="button"
                className="primaryButton"
                disabled={submitting}
                onClick={next}
              >
                {submitting
                  ? "正在生成评估…"
                  : step === 7
                    ? "提交并生成评估"
                    : "下一步"}
              </button>
            </div>
          </>
        ) : result ? (
          /* ---- Result ---- */
          <section className="resultPage">
            {result.recommendation.package === "不推荐" ? (
              <section className="resultCard noPackageCard">
                <span className="resultKicker">预诊评估已完成</span>
                <h2>已预约复诊</h2>
                <p className="noPackageCopy">{result.recommendation.copy}</p>
              </section>
            ) : (
              <>
                <section className="resultHero resultHeroRec">
                  <span className="resultKicker">预诊评估已完成</span>
                  <div className="recBadge">
                    {result.recommendation.package}
                  </div>
                  <h2>{result.recommendation.packageName}</h2>
                  <p className="recPrice">{result.recommendation.price}</p>
                </section>

                <section className="resultCard recCopy">
                  <p>{result.recommendation.copy}</p>
                </section>

                {result.recommendation.variantCopy.length > 0 ? (
                  <section className="resultCard recVariants">
                    <h3>个性化分析</h3>
                    {result.recommendation.variantCopy.map((text, idx) => (
                      <p key={idx}>{text}</p>
                    ))}
                  </section>
                ) : null}

                {result.recommendation.tags.length > 0 ? (
                  <section className="resultCard recTags">
                    <h3>评估标签</h3>
                    <div className="tags">
                      {result.recommendation.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </section>
                ) : null}

                {result.submissionId ? (
                  <p className="recArchive">档案编号：{result.submissionId}</p>
                ) : null}

                <section className="resultCard qrSection">
                  <h3>扫码购买服务包</h3>
                  <div className="qrGrid">
                    <QRCodeCard
                      url={packageQRUrls[
                        result.recommendation.package === "套餐一" ? 1
                        : result.recommendation.package === "套餐二" ? 2
                        : 3
                      ]}
                      name={result.recommendation.packageName}
                      price={result.recommendation.price}
                      recommended
                    />
                  </div>
                </section>
              </>
            )}

            <section className="resultCard doctorSchedule">
              <h3>出诊时间</h3>
              <div className="scheduleTable">
                <div>
                  <span>周一上午</span>
                  <span>越城院区</span>
                </div>
                <div>
                  <span>周二上午</span>
                  <span>朝晖院区（精英门诊）</span>
                </div>
                <div>
                  <span>周三下午</span>
                  <span>朝晖院区（精英门诊）</span>
                </div>
                <div>
                  <span>周五上午</span>
                  <span>越城院区（专家门诊）</span>
                </div>
              </div>
              <p className="scheduleNote">
                施天明主任门诊时间 · 线上服务包不受院区限制，由团队医师开通后可随时使用。
              </p>
            </section>

            <button
              type="button"
              className="secondaryButton restartButton"
              onClick={restart}
            >
              重新填写
            </button>
          </section>
        ) : null}
      </section>
      <footer>浙江省人民医院神经内科 · 头晕头痛专病门诊</footer>
    </main>
  );
}
