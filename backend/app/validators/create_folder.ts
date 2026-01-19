import vine from '@vinejs/vine'

export const createFolderValidator = vine.compile(
  vine.object({
    name: vine
      .string()
      .trim()
      .minLength(1)
      .maxLength(100)
      .regex(/^[a-zA-Z0-9\s\-_\.]+$/),
    parentId: vine.number().optional().nullable(),
  })
)
