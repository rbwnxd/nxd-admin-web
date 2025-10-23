import { NextResponse } from "next/server";

// 빌드 시점의 타임스탬프를 버전으로 사용
const BUILD_TIME = process.env.VERCEL_GIT_COMMIT_SHA || Date.now().toString();
const BUILD_VERSION = process.env.npm_package_version || "1.0.0";

export async function GET() {
  return NextResponse.json({
    version: BUILD_VERSION,
    buildId: BUILD_TIME,
    deploymentId: process.env.VERCEL_DEPLOYMENT_ID || "local",
    timestamp: new Date().toISOString(),
  });
}
