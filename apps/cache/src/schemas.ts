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
  grouping: z.string().min(1).optional().meta({
    description:
      'the facet the notes are loaded for; only "sync" includes deleted notes (see their deleted field)',
    example: 'tags',
  }),
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

/** a set is identified by three fields; the id is free text (a tag can contain slashes and colons). */
export const SetKeySchema = z.object({
  source: z.string().min(1).meta({ description: 'where the notes come from', example: 'bear' }),
  grouping: z
    .string()
    .min(1)
    .meta({ description: 'the facet the set belongs to', example: 'tags' }),
  id: z.string().min(1).meta({ description: 'set name within its grouping', example: 'daily' }),
})

export const SetFilterSchema = z.object({
  source: z.string().min(1).optional().meta({ description: 'only sets of this source' }),
  grouping: z.string().min(1).optional().meta({ description: 'only sets of this grouping' }),
})

const ColorSchema = z
  .number()
  .int()
  .nonnegative()
  .meta({ description: 'index into the note palette; not interpreted', example: 3 })

const RankSchema = z
  .number()
  .int()
  .meta({ description: 'order within the grouping, lower first; not interpreted', example: 0 })

export const ReplaceSetBodySchema = SetKeySchema.extend({
  color: ColorSchema,
  rank: RankSchema,
  noteIds: z.array(IdSchema),
}).meta({ id: 'ReplaceSetBody' })

export const ReplaceSetResultSchema = z
  .object({ count: z.number().int().nonnegative() })
  .meta({ id: 'ReplaceSetResult' })

export const SetSummarySchema = SetKeySchema.extend({
  color: ColorSchema,
  rank: RankSchema,
  count: z.number().int().nonnegative(),
  updated: z.string().meta({ description: 'ISO time the set was last replaced' }),
}).meta({ id: 'SetSummary' })

export const SetSummariesSchema = z.array(SetSummarySchema)

export const SetSchema = SetKeySchema.extend({
  color: ColorSchema,
  rank: RankSchema,
  updated: z.string().meta({ description: 'ISO time the set was last replaced' }),
  noteIds: z.array(IdSchema),
}).meta({ id: 'Set' })
