import createClient from 'openapi-fetch'
import type { paths } from '../../types/api'

// Create the OpenBao API client - this gives you full type safety for all endpoints
export const createOpenBaoClient = (baseUrl: string, token?: string, customHeaders?: Record<string, string>) => {
  return createClient<paths>({
    baseUrl,
    headers: {
      ...customHeaders,
      ...(token && { 'X-Vault-Token': token }),
    },
  })
}

// Export the client type for use in components/hooks
export type OpenBaoClient = ReturnType<typeof createOpenBaoClient>

// Export types for convenience
export type * from '../../types/api'