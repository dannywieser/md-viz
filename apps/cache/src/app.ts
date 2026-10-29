import { OpenAPIHono, createRoute } from '@hono/zod-openapi'
import { bodyLimit } from 'hono/body-limit'
import { cors } from 'hono/cors'
import { HTTPException } from 'hono/http-exception'
import {
  AddTagColorsResultSchema,
  ErrorSchema,
  HealthSchema,
  IdParamSchema,
  ListQuerySchema,
  NoteRowsSchema,
  NoteSchema,
  ReplaceSetBodySchema,
  ReplaceSetResultSchema,
  SetIdParamSchema,
  SetSchema,
  SetSummariesSchema,
  TagColorsSchema,
  UpsertBodySchema,
  UpsertResultSchema,
} from './schemas.ts'
import type { Store } from './store.ts'

const MAX_BODY_BYTES = 64 * 1024 * 1024

const jsonContent = <
  T extends typeof ErrorSchema | typeof NoteRowsSchema | typeof SetSummariesSchema,
>(
  schema: T,
) => ({
  'application/json': { schema },
})

const badRequest = {
  description: 'invalid input',
  content: jsonContent(ErrorSchema),
}

const healthRoute = createRoute({
  method: 'get',
  path: '/health',
  operationId: 'getHealth',
  summary: 'liveness check',
  responses: {
    200: {
      description: 'service is up',
      content: { 'application/json': { schema: HealthSchema } },
    },
  },
})

const upsertRoute = createRoute({
  method: 'put',
  path: '/notes',
  operationId: 'upsertNotes',
  summary: 'upsert a batch of notes; only the named fields are written',
  middleware: [bodyLimit({ maxSize: MAX_BODY_BYTES })],
  request: {
    body: { required: true, content: { 'application/json': { schema: UpsertBodySchema } } },
  },
  responses: {
    200: {
      description: 'number of notes upserted',
      content: { 'application/json': { schema: UpsertResultSchema } },
    },
    400: badRequest,
  },
})

const listRoute = createRoute({
  method: 'get',
  path: '/notes',
  operationId: 'listNotes',
  summary: 'list notes with the requested fields, ordered by id',
  request: { query: ListQuerySchema },
  responses: {
    200: { description: 'one row per note', content: jsonContent(NoteRowsSchema) },
    400: badRequest,
  },
})

const getRoute = createRoute({
  method: 'get',
  path: '/notes/{id}',
  operationId: 'getNote',
  summary: 'all fields of one note',
  request: { params: IdParamSchema },
  responses: {
    200: { description: 'the note', content: { 'application/json': { schema: NoteSchema } } },
    404: { description: 'unknown note', content: jsonContent(ErrorSchema) },
  },
})

const deleteRoute = createRoute({
  method: 'delete',
  path: '/notes/{id}',
  operationId: 'deleteNote',
  summary: 'remove a note; succeeds even if it did not exist',
  request: { params: IdParamSchema },
  responses: {
    204: { description: 'note removed' },
  },
})

const replaceSetRoute = createRoute({
  method: 'put',
  path: '/sets/{id}',
  operationId: 'replaceSet',
  summary: 'replace the note ids of a set, creating it if needed',
  middleware: [bodyLimit({ maxSize: MAX_BODY_BYTES })],
  request: {
    params: SetIdParamSchema,
    body: { required: true, content: { 'application/json': { schema: ReplaceSetBodySchema } } },
  },
  responses: {
    200: {
      description: 'number of notes in the set',
      content: { 'application/json': { schema: ReplaceSetResultSchema } },
    },
    400: badRequest,
  },
})

const listSetsRoute = createRoute({
  method: 'get',
  path: '/sets',
  operationId: 'listSets',
  summary: 'list sets with their note counts, ordered by id',
  responses: {
    200: { description: 'one row per set', content: jsonContent(SetSummariesSchema) },
  },
})

const getSetRoute = createRoute({
  method: 'get',
  path: '/sets/{id}',
  operationId: 'getSet',
  summary: 'the note ids of one set',
  request: { params: SetIdParamSchema },
  responses: {
    200: { description: 'the set', content: { 'application/json': { schema: SetSchema } } },
    404: { description: 'unknown set', content: jsonContent(ErrorSchema) },
  },
})

const deleteSetRoute = createRoute({
  method: 'delete',
  path: '/sets/{id}',
  operationId: 'deleteSet',
  summary: 'remove a set; succeeds even if it did not exist',
  request: { params: SetIdParamSchema },
  responses: {
    204: { description: 'set removed' },
  },
})

const listTagColorsRoute = createRoute({
  method: 'get',
  path: '/tag-colors',
  operationId: 'listTagColors',
  summary: 'the color index of every tag, ordered by tag',
  responses: {
    200: {
      description: 'one row per tag',
      content: { 'application/json': { schema: TagColorsSchema } },
    },
  },
})

const addTagColorsRoute = createRoute({
  method: 'post',
  path: '/tag-colors',
  operationId: 'addTagColors',
  summary: 'give tags a color index; a tag that has one keeps it',
  middleware: [bodyLimit({ maxSize: MAX_BODY_BYTES })],
  request: {
    body: { required: true, content: { 'application/json': { schema: TagColorsSchema } } },
  },
  responses: {
    200: {
      description: 'number of tags that had no color yet',
      content: { 'application/json': { schema: AddTagColorsResultSchema } },
    },
    400: badRequest,
  },
})

export function createApp(store: Store): OpenAPIHono {
  const app = new OpenAPIHono({
    defaultHook: (result, c) => {
      if (result.success) return undefined
      const message = result.error.issues
        .map((issue) => `${issue.path.join('.') || 'input'}: ${issue.message}`)
        .join('; ')
      return c.json({ error: message }, 400)
    },
  })

  app.use(cors())

  app.onError((error, c) => {
    if (error instanceof HTTPException) return c.json({ error: error.message }, error.status)
    console.error(error)
    return c.json({ error: 'internal error' }, 500)
  })

  app.openapi(healthRoute, (c) => c.json({ ok: true as const }, 200))

  app.openapi(upsertRoute, (c) => {
    const { notes } = c.req.valid('json')
    store.upsertNotes(notes)
    return c.json({ upserted: notes.length }, 200)
  })

  app.openapi(listRoute, (c) => {
    const fields = c.req
      .valid('query')
      .fields.split(',')
      .filter((name) => name.length > 0)
    if (fields.length === 0) {
      return c.json({ error: 'fields is required, e.g. ?fields=title,synced' }, 400)
    }
    return c.json(store.listNotes(fields), 200)
  })

  app.openapi(getRoute, (c) => {
    const fields = store.getNote(c.req.valid('param').id)
    return fields ? c.json({ fields }, 200) : c.json({ error: 'not found' }, 404)
  })

  app.openapi(deleteRoute, (c) => {
    store.deleteNote(c.req.valid('param').id)
    return c.body(null, 204)
  })

  app.openapi(replaceSetRoute, (c) => {
    const { noteIds } = c.req.valid('json')
    store.replaceSet(c.req.valid('param').id, noteIds)
    return c.json({ count: new Set(noteIds).size }, 200)
  })

  app.openapi(listSetsRoute, (c) => c.json(store.listSets(), 200))

  app.openapi(getSetRoute, (c) => {
    const set = store.getSet(c.req.valid('param').id)
    return set ? c.json(set, 200) : c.json({ error: 'not found' }, 404)
  })

  app.openapi(deleteSetRoute, (c) => {
    store.deleteSet(c.req.valid('param').id)
    return c.body(null, 204)
  })

  app.openapi(listTagColorsRoute, (c) => c.json({ tags: store.listTagColors() }, 200))

  app.openapi(addTagColorsRoute, (c) => {
    const { tags } = c.req.valid('json')
    return c.json({ added: store.addTagColors(tags) }, 200)
  })

  return app
}
