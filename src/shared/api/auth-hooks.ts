import { useMutation } from '@tanstack/react-query'
import { createOpenBaoClient } from './client'

// Authentication doesn't use the global client since we need to authenticate first
export function useAuthenticate() {
  return useMutation({
    mutationFn: async ({ 
      baseUrl, 
      authMethod, 
      credentials, 
      namespace,
      mountPath 
    }: {
      baseUrl: string
      authMethod: string
      credentials: Record<string, string>
      namespace?: string
      mountPath?: string
    }) => {
      // Add namespace header if provided
      const headers: Record<string, string> = {}
      if (namespace && namespace !== '/') {
        headers['X-Vault-Namespace'] = namespace
      }
      
      // Create client with namespace headers but no token for authentication
      const authClient = createOpenBaoClient(baseUrl, undefined, headers)

      // Handle different authentication methods
      switch (authMethod) {
        case 'token': {
          // For token auth, just validate the token
          const tokenClient = createOpenBaoClient(baseUrl, credentials.token, headers)
          
          try {
            const { data, error, response } = await tokenClient.GET('/auth/token/lookup-self')
            
            if (error) {
              // Log more details about the error
              console.error('Token validation error:', {
                status: response?.status,
                statusText: response?.statusText,
                error,
                url: response?.url
              })
              
              if (response?.status === 404) {
                throw new Error('OpenBao server not found. Check if the server is running.')
              } else if (response?.status === 403) {
                throw new Error('Token is invalid or has insufficient permissions.')
              } else if (response?.status === 401) {
                throw new Error('Token is invalid or expired.')
              } else {
                throw new Error(`Authentication failed: ${response?.status || 'Unknown error'}`)
              }
            }
            
            return {
              token: credentials.token,
              tokenData: data,
              method: 'token'
            }
          } catch (fetchError) {
            console.error('Network error during token validation:', fetchError)
            if (fetchError instanceof TypeError && fetchError.message.includes('fetch')) {
              throw new Error(`Cannot connect to OpenBao server at ${baseUrl}. Is the server running?`)
            }
            throw fetchError
          }
        }
        
        case 'userpass': {
          // Userpass authentication
          const path = mountPath || 'userpass'
          const loginPath = `/auth/${path}/login/${credentials.username}` as any
          
          const { data, error } = await authClient.POST(loginPath, {
            body: {
              password: credentials.password
            }
          })
          
          if (error) {
            throw new Error('Invalid username or password')
          }
          
          return {
            token: data?.auth?.client_token,
            tokenData: data,
            method: 'userpass'
          }
        }
        
        case 'ldap': {
          // LDAP authentication - use ldapUsername field
          const path = mountPath || 'ldap'
          const username = credentials.ldapUsername || credentials.username
          const password = credentials.ldapPassword || credentials.password
          const loginPath = `/auth/${path}/login/${username}` as any
          
          const { data, error } = await authClient.POST(loginPath, {
            body: {
              password: password
            }
          })
          
          if (error) {
            throw new Error('LDAP authentication failed')
          }
          
          return {
            token: data?.auth?.client_token,
            tokenData: data,
            method: 'ldap'
          }
        }
        
        case 'approle': {
          // AppRole authentication - use roleId/secretId fields
          const path = mountPath || 'approle'
          const loginPath = `/auth/${path}/login` as any
          
          const { data, error } = await authClient.POST(loginPath, {
            body: {
              role_id: credentials.roleId,
              secret_id: credentials.secretId
            }
          })
          
          if (error) {
            throw new Error('AppRole authentication failed')
          }
          
          return {
            token: data?.auth?.client_token,
            tokenData: data,
            method: 'approle'
          }
        }
        
        default:
          throw new Error(`Unsupported authentication method: ${authMethod}`)
      }
    },
  })
}

export function useTokenValidation() {
  return useMutation({
    mutationFn: async ({ baseUrl, token, namespace }: {
      baseUrl: string
      token: string
      namespace?: string
    }) => {
      const headers: Record<string, string> = {}
      if (namespace && namespace !== '/') {
        headers['X-Vault-Namespace'] = namespace
      }
      
      const client = createOpenBaoClient(baseUrl, token, headers)
      const { data, error } = await client.GET('/auth/token/lookup-self')
      
      if (error) {
        throw new Error('Token validation failed')
      }
      
      return data
    },
  })
}