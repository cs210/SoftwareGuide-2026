/** @type {import('next').NextConfig} */
const repo = "SoftwareGuide-2026";
const isGithubActions = process.env.GITHUB_ACTIONS === "true";

const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  ...(isGithubActions && {
    basePath: `/${repo}`,
    assetPrefix: `/${repo}/`,
  }),
};

export default nextConfig;
