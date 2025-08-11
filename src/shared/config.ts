export const BAO_ADDR: string =
  ((import.meta as any).env?.BAO_ADDR as string | undefined) ??
  'http://localhost:8200';

export const APP_CONFIG = { BAO_ADDR } as const;
