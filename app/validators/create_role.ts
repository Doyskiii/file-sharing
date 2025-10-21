import vine from '@vinejs/vine'

export const createRoleValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(1),
    description: vine.string().optional(),
  })
)
