import vine from '@vinejs/vine'

export const registerUserValidator = vine.compile(
  vine.object({
    username: vine.string().minLength(3).maxLength(50),
    email: vine.string().email(),
    password: vine.string().minLength(8),
    isActive: vine.boolean().optional(),
  })
)
