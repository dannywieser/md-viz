import { client } from '../generated/cache/client.gen'

export * from '../generated/cache'
export * from '../generated/cache/zod.gen'
export { client as cacheClient }

/** Point the cache client at a running cache service, e.g. `http://localhost:8787`. */
export function configureCacheClient(options: { baseUrl: string; fetch?: typeof fetch }): void {
  client.setConfig(options)
}
