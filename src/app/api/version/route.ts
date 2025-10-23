import { NextResponse } from "next/server";

// 배포마다 고유한 ID 사용 (더 확실한 버전 구분)
const BUILD_ID =
  process.env.VERCEL_DEPLOYMENT_ID ||
  process.env.VERCEL_GIT_COMMIT_SHA ||
  Date.now().toString();
const BUILD_VERSION = process.env.npm_package_version || "1.0.0";

export async function GET() {
  return NextResponse.json({
    version: BUILD_VERSION,
    buildId: BUILD_ID,
    deploymentId: process.env.VERCEL_DEPLOYMENT_ID || "local",
    commitSha: process.env.VERCEL_GIT_COMMIT_SHA || "unknown",
    timestamp: new Date().toISOString(),
  });
}
