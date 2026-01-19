import vine from '@vinejs/vine'

export const updateFolderValidator = vine.compile(
  vine.object({
    name: vine
      .string()
      .trim()
      .minLength(1)
      .maxLength(100)
      .regex(/^[a-zA-Z0-9\s\-_\.]+$/)
      .optional(),
    parentId: vine.number().optional().nullable(),
  })
)
