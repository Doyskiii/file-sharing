import vine from '@vinejs/vine'

export const updateUserValidator = vine.compile(
  vine.object({
    username: vine.string().optional(),
    email: vine.string().email().optional(),
    isActive: vine.boolean().optional(),
  })
)
