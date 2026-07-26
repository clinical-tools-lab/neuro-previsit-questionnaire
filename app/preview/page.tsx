"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { type Recommendation, computeRecommendation } from "@/lib/recommendation";

const packageQRUrls = [
  "",
  "https://interhos.eheren.com/static/h5/docDetail.html?hosId=449&hosDocId=252&docType=99",
  "https://interhos.eheren.com/static/h5/docDetail.html?hosId=449&nhPath=pages/v3/postDiagnosisService/detail%3FhosId%3D449%26serviceId%3D2511260631765791192",
  "https://interhos.eheren.com/static/h5/docDetail.html?hosId=449&nhPath=/pages/v3/postDiagnosisService/detail%3FhosId%3D449%26packageId%3D20260622100000000001",
];

function QRImage({ url }: { url: string }) {
  const [dataUrl, setDataUrl] = useState("");
  useEffect(() => {
    let c = false;
    QRCode.toDataURL(url, { width: 140, margin: 1, color: { dark: "#13212f", light: "#ffffff" } })
      .then((s) => { if (!c) setDataUrl(s); })
      .catch(() => {});
    return () => { c = true; };
  }, [url]);
  return dataUrl ? <img src={dataUrl} alt="" className="qrImage" /> : <div className="qrPlaceholder" />;
}

const mockRecommendations: { label: string; rec: Recommendation }[] = [
  {
    label: "套餐一 · 互联网专病团队咨询 · R1",
    rec: computeRecommendation({
      name: "张三",
      gender: "男",
      age: "35",
      visitType: "初诊",
      course: "否",
      symptoms: ["头痛"],
      symptomOther: "",
      impact: "0",
      frequency: "0",
      conditions: ["以上均没有"],
      specialPopulations: ["以上都不符合"],
      treatmentPreference: "药物治疗",
      followUpPreference: "均可接受",
    }),
  },
  {
    label: "套餐二 · 生活调理包 · R3",
    rec: computeRecommendation({
      name: "李四",
      gender: "女",
      age: "42",
      visitType: "初诊",
      course: "否",
      symptoms: ["眩晕", "耳鸣/耳闷/听力下降"],
      symptomOther: "",
      impact: "1",
      frequency: "2",
      conditions: ["失眠"],
      specialPopulations: ["以上都不符合"],
      treatmentPreference: "非药物治疗",
      followUpPreference: "互联网平台复诊",
    }),
  },
  {
    label: "套餐三 · 专病管理包 · R7",
    rec: computeRecommendation({
      name: "王五",
      gender: "男",
      age: "55",
      visitType: "初诊",
      course: "是",
      symptoms: ["眩晕", "头痛", "恶心或呕吐", "怕光或怕吵"],
      symptomOther: "",
      impact: "2",
      frequency: "3",
      conditions: ["心脑血管疾病", "失眠"],
      specialPopulations: ["需要长时间驾驶"],
      treatmentPreference: "药物治疗",
      followUpPreference: "互联网平台复诊",
    }),
  },
];

export default function Preview() {
  return (
    <main className="appShell" style={{ "--ink": "#13212f" } as React.CSSProperties}>
      <header className="topbar">
        <div className="brandMark" aria-hidden="true">预</div>
        <div className="brandText">
          <h1>套餐推荐预览 · 三类结果对比</h1>
          <p>基于 2026-07-26 新版问卷推荐引擎</p>
        </div>
      </header>

      <section className="content">
        {mockRecommendations.map(({ label, rec }, idx) => {
          const pkgIdx = rec.package === "套餐一" ? 1 : rec.package === "套餐二" ? 2 : 3;
          return (
            <article key={idx} className="previewBlock">
              <div className="previewTitle">
                <span className="recBadge">{rec.package}</span>
                <span className="previewLabel">{label}</span>
              </div>

              <section className="resultHero resultHeroRec">
                <h2>{rec.packageName}</h2>
                <p className="recPrice">{rec.price}</p>
              </section>

              <section className="resultCard recCopy">
                <p>{rec.copy}</p>
              </section>

              {rec.variantCopy.length > 0 ? (
                <section className="resultCard recVariants">
                  <h3>个性化分析</h3>
                  {rec.variantCopy.map((text, vi) => (
                    <p key={vi}>{text}</p>
                  ))}
                </section>
              ) : null}

              {rec.tags.length > 0 ? (
                <section className="resultCard recTags">
                  <h3>评估标签</h3>
                  <div className="tags">
                    {rec.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="resultCard qrSection">
                <h3>扫码购买服务包</h3>
                <div className="qrGrid">
                  {[
                    { idx: 1, name: "互联网医院咨询", price: "25元/次" },
                    { idx: 2, name: "生活调理包", price: "150元/30天\n390元/90天" },
                    { idx: 3, name: "专病管理包", price: "500元/30天" },
                  ].map((pkg) => (
                    <div
                      key={pkg.idx}
                      className={`qrCard ${pkg.idx === pkgIdx ? "qrCardRecommended" : ""}`}
                    >
                      {pkg.idx === pkgIdx ? <span className="qrBadge">推荐方案</span> : null}
                      <div className="qrImageWrap"><QRImage url={packageQRUrls[pkg.idx]} /></div>
                      <div className="qrInfo">
                        <strong>{pkg.name}</strong>
                        <span>{pkg.price}</span>
                        <small>微信扫码购买</small>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </article>
          );
        })}
      </section>
      <footer>预览模式 · 浙江省人民医院神经内科 · 头晕头痛专病门诊</footer>
    </main>
  );
}
