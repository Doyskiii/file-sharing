import vine from '@vinejs/vine'

export const updateFileShareValidator = vine.compile(
  vine.object({
    accessType: vine.enum(['view', 'edit', 'download']).optional(),
    expiredAt: vine.date({ formats: ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DDTHH:mm:ss.SSSZ', 'YYYY-MM-DDTHH:mm:ssZ'] }).optional().nullable(),
  })
)
