// OpenBao API configuration
export const BAO_ADDR: string = (() => {
  // Use BAO_ADDR env var if set (for custom deployments)
  const envAddr = (import.meta as any).env?.BAO_ADDR as string | undefined;
  if (envAddr) {
    return envAddr.endsWith('/v1') ? envAddr : `${envAddr}/v1`;
  }

  // During development, use current origin (proxy will handle /v1 requests)
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/v1`;
  }

  // Fallback for server-side rendering
  return 'http://localhost:8200/v1';
})();

export const APP_CONFIG = { BAO_ADDR } as const;
