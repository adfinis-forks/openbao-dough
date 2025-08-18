import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createOpenBaoClient, type OpenBaoClient } from './client'

// Global client management
let globalClient: OpenBaoClient | null = null

export function initializeClient(baseUrl: string, token?: string) {
  globalClient = createOpenBaoClient(baseUrl, token)
  return globalClient
}

export function updateClientToken(token: string, baseUrl: string) {
  if (globalClient) {
    globalClient = createOpenBaoClient(baseUrl, token)
  }
}

export function useOpenBaoClient() {
  if (!globalClient) {
    throw new Error('OpenBao client not initialized. Call initializeClient first.')
  }
  return globalClient
}

// Query Keys Factory
export const queryKeys = {
  // Auth
  tokenAccessors: ['auth', 'token', 'accessors'] as const,
  tokenLookup: ['auth', 'token', 'lookup'] as const,
  tokenRoles: ['auth', 'token', 'roles'] as const,
  tokenRole: (name: string) => ['auth', 'token', 'roles', name] as const,
  
  // Secrets
  secret: (path: string) => ['secrets', 'cubbyhole', path] as const,
  secretsList: (path: string) => ['secrets', 'cubbyhole', 'list', path] as const,
  
  // Identity
  entities: ['identity', 'entities'] as const,
  entity: (id: string) => ['identity', 'entities', id] as const,
  groups: ['identity', 'groups'] as const,
  group: (id: string) => ['identity', 'groups', id] as const,
  
  // MFA
  mfaMethods: ['identity', 'mfa', 'methods'] as const,
  mfaMethod: (id: string) => ['identity', 'mfa', 'methods', id] as const,
}

// Auth Token Hooks
export function useTokenAccessors() {
  const client = useOpenBaoClient()
  
  return useQuery({
    queryKey: queryKeys.tokenAccessors,
    queryFn: async () => {
      const { data, error } = await client.GET('/auth/token/accessors', {
        params: { query: { list: 'true' } }
      })
      if (error) throw new Error('Failed to fetch token accessors')
      return data
    },
  })
}

export function useTokenLookup() {
  const client = useOpenBaoClient()
  
  return useQuery({
    queryKey: queryKeys.tokenLookup,
    queryFn: async () => {
      const { data, error } = await client.GET('/auth/token/lookup')
      if (error) throw new Error('Failed to lookup token')
      return data
    },
  })
}

export function useCreateToken() {
  const client = useOpenBaoClient()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (tokenData: any) => {
      const { data, error } = await client.POST('/auth/token/create', { body: tokenData })
      if (error) throw new Error('Failed to create token')
      return data
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.tokenAccessors })
    },
  })
}

export function useRevokeToken() {
  const client = useOpenBaoClient()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await client.POST('/auth/token/revoke', { body: data })
      if (error) throw new Error('Failed to revoke token')
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tokenAccessors })
    },
  })
}

// Token Roles
export function useTokenRoles() {
  const client = useOpenBaoClient()
  
  return useQuery({
    queryKey: queryKeys.tokenRoles,
    queryFn: async () => {
      const { data, error } = await client.GET('/auth/token/roles', {
        params: { query: { list: 'true' } }
      })
      if (error) throw new Error('Failed to fetch token roles')
      return data
    },
  })
}

export function useTokenRole(roleName: string) {
  const client = useOpenBaoClient()
  
  return useQuery({
    queryKey: queryKeys.tokenRole(roleName),
    queryFn: async () => {
      const { data, error } = await client.GET('/auth/token/roles/{role_name}', {
        params: { path: { role_name: roleName } }
      })
      if (error) throw new Error(`Failed to fetch token role: ${roleName}`)
      return data
    },
    enabled: !!roleName,
  })
}

// Secrets (Cubbyhole)
export function useSecret(path: string) {
  const client = useOpenBaoClient()
  
  return useQuery({
    queryKey: queryKeys.secret(path),
    queryFn: async () => {
      const { data, error } = await client.GET('/cubbyhole/{path}', {
        params: { path: { path } }
      })
      if (error) throw new Error(`Failed to read secret: ${path}`)
      return data
    },
    enabled: !!path,
  })
}

export function useSecretsList(path: string = '') {
  const client = useOpenBaoClient()
  
  return useQuery({
    queryKey: queryKeys.secretsList(path),
    queryFn: async () => {
      const { data, error } = await client.GET('/cubbyhole/{path}', {
        params: {
          path: { path },
          query: { list: 'true' }
        }
      })
      if (error) throw new Error(`Failed to list secrets: ${path}`)
      return data
    },
  })
}

export function useWriteSecret() {
  const client = useOpenBaoClient()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ path, data }: { path: string; data: any }) => {
      const { data: result, error } = await client.POST('/cubbyhole/{path}', {
        params: { path: { path } },
        body: data
      })
      if (error) throw new Error(`Failed to write secret: ${path}`)
      return result
    },
    onSuccess: (_, { path }) => {
      // Invalidate the specific secret and any list queries that might contain it
      queryClient.invalidateQueries({ queryKey: queryKeys.secret(path) })
      queryClient.invalidateQueries({ queryKey: ['secrets', 'cubbyhole', 'list'] })
    },
  })
}

export function useDeleteSecret() {
  const client = useOpenBaoClient()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (path: string) => {
      const { error } = await client.DELETE('/cubbyhole/{path}', {
        params: { path: { path } }
      })
      if (error) throw new Error(`Failed to delete secret: ${path}`)
    },
    onSuccess: (_, path) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.secret(path) })
      queryClient.invalidateQueries({ queryKey: ['secrets', 'cubbyhole', 'list'] })
    },
  })
}

// Identity - Entities
export function useEntities() {
  const client = useOpenBaoClient()
  
  return useQuery({
    queryKey: queryKeys.entities,
    queryFn: async () => {
      const { data, error } = await client.GET('/identity/entity/id', {
        params: { query: { list: 'true' } }
      })
      if (error) throw new Error('Failed to fetch entities')
      return data
    },
  })
}

export function useEntity(id: string) {
  const client = useOpenBaoClient()
  
  return useQuery({
    queryKey: queryKeys.entity(id),
    queryFn: async () => {
      const { data, error } = await client.GET('/identity/entity/id/{id}', {
        params: { path: { id } }
      })
      if (error) throw new Error(`Failed to fetch entity: ${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateEntity() {
  const client = useOpenBaoClient()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (entityData: any) => {
      const { data, error } = await client.POST('/identity/entity', { body: entityData })
      if (error) throw new Error('Failed to create entity')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.entities })
    },
  })
}

// Identity - Groups
export function useGroups() {
  const client = useOpenBaoClient()
  
  return useQuery({
    queryKey: queryKeys.groups,
    queryFn: async () => {
      const { data, error } = await client.GET('/identity/group/id', {
        params: { query: { list: 'true' } }
      })
      if (error) throw new Error('Failed to fetch groups')
      return data
    },
  })
}