import type { NextConfig } from "next";

const basePath = process.env.GITHUB_PAGES === "true"
  ? "/neuro-previsit-questionnaire"
  : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
};

export default nextConfig;
