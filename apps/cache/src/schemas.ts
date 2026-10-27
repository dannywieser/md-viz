import { z } from '@hono/zod-openapi'

/** IDs and field names are joined as `<id>/<field>`, so they are non-empty and slash-free. */
export const NameSchema = z.string().regex(/^[^/]+$/, 'must be non-empty and must not contain "/"')

export const IdSchema = NameSchema.meta({ description: 'client-chosen note id', example: 'abc123' })

export const FieldsSchema = z
  .record(NameSchema, z.string())
  .meta({ description: 'string fields by name', example: { title: 'plan', body: 'raised beds' } })

export const NoteInputSchema = z
  .object({ id: IdSchema, fields: FieldsSchema })
  .meta({ id: 'NoteInput' })

export const UpsertBodySchema = z
  .object({ notes: z.array(NoteInputSchema) })
  .meta({ id: 'UpsertBody' })

export const UpsertResultSchema = z
  .object({ upserted: z.number().int().nonnegative() })
  .meta({ id: 'UpsertResult' })

export const ListQuerySchema = z.object({
  fields: z
    .string()
    .min(1)
    .meta({ description: 'comma-separated field names to include', example: 'title,synced' }),
})

/** A list row is the note id plus only the requested fields. */
export const NoteRowSchema = z
  .object({ id: IdSchema, fields: FieldsSchema })
  .meta({ id: 'NoteRow' })

export const NoteRowsSchema = z.array(NoteRowSchema)

export const NoteSchema = z.object({ fields: FieldsSchema }).meta({ id: 'Note' })

export const IdParamSchema = z.object({ id: IdSchema })

export const HealthSchema = z.object({ ok: z.literal(true) }).meta({ id: 'Health' })

export const ErrorSchema = z.object({ error: z.string() }).meta({ id: 'Error' })

export const SetIdSchema = NameSchema.meta({
  description: 'set id, namespaced by source',
  example: 'bear:created-today',
})

export const SetIdParamSchema = z.object({ id: SetIdSchema })

export const ReplaceSetBodySchema = z
  .object({ noteIds: z.array(IdSchema) })
  .meta({ id: 'ReplaceSetBody' })

export const ReplaceSetResultSchema = z
  .object({ count: z.number().int().nonnegative() })
  .meta({ id: 'ReplaceSetResult' })

export const SetSummarySchema = z
  .object({
    id: SetIdSchema,
    count: z.number().int().nonnegative(),
    updated: z.string().meta({ description: 'ISO time the set was last replaced' }),
  })
  .meta({ id: 'SetSummary' })

export const SetSummariesSchema = z.array(SetSummarySchema)

export const SetSchema = z
  .object({
    id: SetIdSchema,
    updated: z.string().meta({ description: 'ISO time the set was last replaced' }),
    noteIds: z.array(IdSchema),
  })
  .meta({ id: 'Set' })
