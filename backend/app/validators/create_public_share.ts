import vine from '@vinejs/vine'

export const createPublicShareValidator = vine.compile(
  vine.object({
    accessType: vine.enum(['view', 'edit', 'download']),
    expiredAt: vine.date({ formats: ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DDTHH:mm:ss.SSSZ', 'YYYY-MM-DDTHH:mm:ssZ'] }).optional(),
  })
)
