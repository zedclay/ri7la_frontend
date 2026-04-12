/** True in production builds (client and server). */
export function isProductionBuild(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Demo/mock fallbacks (search, checkout, booking detail) are allowed only outside production,
 * unless explicitly forced for local QA via NEXT_PUBLIC_ALLOW_DEMO_MOCKS=true.
 */
export function allowDemoMocks(): boolean {
  if (process.env.NEXT_PUBLIC_ALLOW_DEMO_MOCKS === "true") return true;
  return !isProductionBuild();
}
