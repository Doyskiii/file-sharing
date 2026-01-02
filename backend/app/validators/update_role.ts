import vine from '@vinejs/vine'

export const updateRoleValidator = vine.compile(
  vine.object({
    name: vine.string().optional(),
    description: vine.string().optional(),
  })
)
