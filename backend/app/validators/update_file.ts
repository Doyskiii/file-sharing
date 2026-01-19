import vine from '@vinejs/vine'

export const updateFileValidator = vine.compile(
  vine.object({
    originalName: vine.string().trim().minLength(1).maxLength(255).optional(),
    folderId: vine.number().positive().optional(),
  })
)
