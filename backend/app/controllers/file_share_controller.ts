import type { HttpContext } from '@adonisjs/core/http'
import FileShare from '#models/file_share'
import File from '#models/file'
import User from '#models/user'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'
import { join } from 'node:path'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import app from '@adonisjs/core/services/app'
import ActivityService from '#services/activity_service'
import { EncryptionService } from '#services/encryption_service'

export default class FileShareController {
  /**
   * POST /files/:id/share - Share file with specific user (private share)
   */
  async shareWithUser(ctx: HttpContext) {
    const { params, request, response, auth } = ctx
    try {
      const user = auth.user!
      const fileId = parseInt(params.id)

      if (isNaN(fileId)) {
        return response.badRequest({ message: 'Invalid file ID' })
      }

      // Validate file exists and user owns it
      const file = await File.query()
        .where('id', fileId)
        .where('owner_id', user.id)
        .first()

      if (!file) {
        return response.notFound({ message: 'File not found or access denied' })
      }

      // Validate request
      const { createFileShareValidator } = await import('#validators/create_file_share')
      const payload = await request.validateUsing(createFileShareValidator)

      // Cannot share with self
      if (payload.sharedWithId === user.id) {
        return response.badRequest({ message: 'Cannot share file with yourself' })
      }

      // Validate recipient exists
      const recipient = await User.find(payload.sharedWithId)
      if (!recipient) {
        return response.notFound({ message: 'Recipient user not found' })
      }

      // Check if already shared with this user
      const existingShare = await FileShare.query()
        .where('file_id', fileId)
        .where('shared_with_id', payload.sharedWithId)
        .first()

      if (existingShare) {
        return response.conflict({ message: 'File already shared with this user' })
      }

      // Validate expiration date is in future
      if (payload.expiredAt && DateTime.fromJSDate(payload.expiredAt) <= DateTime.now()) {
        return response.badRequest({ message: 'Expiration date must be in the future' })
      }

      // Handle encryption key sharing for encrypted files
      let encryptedKeyForRecipient = null
      if ((file as any).isEncrypted && (file as any).encryptionKey) {
        // File is encrypted, share the decryption key with recipient
        if (!(user as any).encryptedPrivateKey) {
          return response.badRequest({ message: 'Owner does not have encryption keys. Cannot share encrypted file.' })
        }
        if (!(recipient as any).publicKey) {
          return response.badRequest({ message: 'Recipient does not have encryption keys. Cannot share encrypted file.' })
        }

        // Decrypt AES key using owner's private key
        const aesKey = EncryptionService.decryptAESKey((file as any).encryptionKey, (user as any).encryptedPrivateKey)

        // Encrypt AES key with recipient's public key
        encryptedKeyForRecipient = EncryptionService.encryptAESKey(aesKey, (recipient as any).publicKey)
      }

      // Create share
      const share = await FileShare.create({
        fileId: fileId,
        ownerId: user.id,
        sharedWithId: payload.sharedWithId,
        accessType: payload.accessType,
        isPublic: false,
        publicToken: null,
        expiredAt: payload.expiredAt ? DateTime.fromJSDate(payload.expiredAt) : null,
        encryptedKeyForRecipient: encryptedKeyForRecipient,
      })

      await share.load('file')
      await share.load('owner')
      await share.load('recipient')

      // Log share creation activity
      await ActivityService.logFromContext(ctx, 'share:create', {
        fileId: fileId,
        metadata: {
          sharedWithId: payload.sharedWithId,
          accessType: payload.accessType,
          expiredAt: payload.expiredAt,
          isPublic: false,
        },
      })

      return response.created(share)
    } catch (error) {
      console.error('Share creation error:', error)
      return response.internalServerError({ message: 'Failed to create share', error })
    }
  }

  /**
   * POST /files/:id/share/public - Create public share link
   */
  async createPublicShare(ctx: HttpContext) {
    const { params, request, response, auth } = ctx
    try {
      const user = auth.user!
      const fileId = parseInt(params.id)

      if (isNaN(fileId)) {
        return response.badRequest({ message: 'Invalid file ID' })
      }

      // Validate file exists and user owns it
      const file = await File.query()
        .where('id', fileId)
        .where('owner_id', user.id)
        .first()

      if (!file) {
        return response.notFound({ message: 'File not found or access denied' })
      }

      // Validate request
      const { createPublicShareValidator } = await import('#validators/create_public_share')
      const payload = await request.validateUsing(createPublicShareValidator)

      // Validate expiration date is in future
      if (payload.expiredAt && DateTime.fromJSDate(payload.expiredAt) <= DateTime.now()) {
        return response.badRequest({ message: 'Expiration date must be in the future' })
      }

      // Generate unique public token
      const publicToken = randomUUID()

      // Create public share
      const share = await FileShare.create({
        fileId: fileId,
        ownerId: user.id,
        sharedWithId: null,
        accessType: payload.accessType,
        isPublic: true,
        publicToken: publicToken,
        expiredAt: payload.expiredAt ? DateTime.fromJSDate(payload.expiredAt) : null,
      })

      await share.load('file')
      await share.load('owner')

      // Add share URL to response
      const shareUrl = `${request.protocol()}://${request.hostname()}/share/${publicToken}`

      // Log public share creation activity
      await ActivityService.logFromContext(ctx, 'share:create', {
        fileId: fileId,
        metadata: {
          accessType: payload.accessType,
          expiredAt: payload.expiredAt,
          isPublic: true,
          publicToken: publicToken,
        },
      })

      return response.created({
        ...share.toJSON(),
        shareUrl,
      })
    } catch (error) {
      console.error('Public share creation error:', error)
      return response.internalServerError({ message: 'Failed to create public share', error })
    }
  }

  /**
   * GET /files/:id/shares - List all shares for a file
   */
  async listFileShares(ctx: HttpContext) {
    const { params, response, auth, request } = ctx
    try {
      const user = auth.user!
      const fileId = parseInt(params.id)

      if (isNaN(fileId)) {
        return response.badRequest({ message: 'Invalid file ID' })
      }

      // Validate file exists and user owns it
      const file = await File.query()
        .where('id', fileId)
        .where('owner_id', user.id)
        .first()

      if (!file) {
        return response.notFound({ message: 'File not found or access denied' })
      }

      // Get all active shares for this file
      const shares = await FileShare.query()
        .where('file_id', fileId)
        .where('owner_id', user.id)
        .preload('recipient')
        .orderBy('created_at', 'desc')

      // Add share URL for public shares
      const sharesWithUrls = shares.map((share) => {
        const shareJson = share.toJSON()
        if (share.isPublic && share.publicToken) {
          return {
            ...shareJson,
            shareUrl: `${request.protocol()}://${request.hostname()}/share/${share.publicToken}`,
          }
        }
        return shareJson
      })

      return response.ok(sharesWithUrls)
    } catch (error) {
      return response.internalServerError({ message: 'Failed to fetch shares', error })
    }
  }

  /**
   * GET /shares/received - List files shared with current user
   */
  async listReceivedShares({ response, auth }: HttpContext) {
    try {
      const user = auth.user!

      // Get all active shares where user is recipient
      const shares = await FileShare.query()
        .where('shared_with_id', user.id)
        .where((query) => {
          query.whereNull('expired_at').orWhere('expired_at', '>', DateTime.now().toSQL())
        })
        .preload('file')
        .preload('owner')
        .orderBy('created_at', 'desc')

      return response.ok(shares)
    } catch (error) {
      return response.internalServerError({ message: 'Failed to fetch received shares', error })
    }
  }

  /**
   * GET /shares/owned - List files current user has shared
   */
  async listOwnedShares({ response, auth }: HttpContext) {
    try {
      const user = auth.user!

      // Get all shares created by user
      const shares = await FileShare.query()
        .where('owner_id', user.id)
        .preload('file')
        .preload('recipient')
        .orderBy('created_at', 'desc')

      return response.ok(shares)
    } catch (error) {
      return response.internalServerError({ message: 'Failed to fetch owned shares', error })
    }
  }

  /**
   * GET /share/:token - View shared file info (public, no auth)
   */
  async viewPublicShare(ctx: HttpContext) {
    const { params, response, request } = ctx
    try {
      const token = params.token

      // Find share by public token
      const share = await FileShare.query()
        .where('public_token', token)
        .where('is_public', true)
        .where((query) => {
          query.whereNull('expired_at').orWhere('expired_at', '>', DateTime.now().toSQL())
        })
        .preload('file')
        .preload('owner', (query) => {
          query.select('id', 'username', 'email')
        })
        .first()

      if (!share) {
        return response.notFound({ message: 'Share not found or expired' })
      }

      // Log share access activity (no auth required for public shares)
      await ActivityService.log({
        userId: share.ownerId, // Log under owner's ID since public access
        action: 'share:access',
        fileId: share.fileId,
        ipAddress: ctx.request.ip(),
        userAgent: ctx.request.header('user-agent'),
        metadata: {
          token: token,
          accessType: share.accessType,
          isPublic: true,
        },
      })

      return response.ok({
        file: {
          id: share.file.id,
          originalName: share.file.originalName,
          size: share.file.size,
          mimeType: share.file.mimeType,
          createdAt: share.file.createdAt,
        },
        share: {
          accessType: share.accessType,
          expiredAt: share.expiredAt,
          createdAt: share.createdAt,
        },
        owner: {
          username: share.owner.username,
        },
      })
    } catch (error) {
      return response.internalServerError({ message: 'Failed to fetch share', error })
    }
  }

  /**
   * GET /share/:token/download - Download file via public share (no auth)
   */
  async downloadPublicShare(ctx: HttpContext) {
    const { params, response } = ctx
    try {
      const token = params.token

      // Find share by public token
      const share = await FileShare.query()
        .where('public_token', token)
        .where('is_public', true)
        .where((query) => {
          query.whereNull('expired_at').orWhere('expired_at', '>', DateTime.now().toSQL())
        })
        .preload('file')
        .first()

      if (!share) {
        return response.notFound({ message: 'Share not found or expired' })
      }

      // Check if access type allows download
      if (share.accessType === 'view') {
        return response.forbidden({ message: 'This share does not allow downloads' })
      }

      const file = share.file

      // Log public share download activity
      await ActivityService.log({
        userId: share.ownerId, // Log under owner's ID since public access
        action: 'share:download',
        fileId: share.fileId,
        ipAddress: ctx.request.ip(),
        userAgent: ctx.request.header('user-agent'),
        metadata: {
          token: token,
          accessType: share.accessType,
          isPublic: true,
          originalName: file.originalName,
          size: file.size,
        },
      })

      // Full file path
      const filePath = join(app.makePath(), file.path)

      // Check if file exists on disk
      if (!existsSync(filePath)) {
        return response.notFound({ message: 'File not found on disk' })
      }

      // Set headers for download
      response.header('Content-Type', file.mimeType)
      response.header('Content-Disposition', `attachment; filename="${file.originalName}"`)
      response.header('Content-Length', file.size.toString())

      // Stream file
      return response.download(filePath)
    } catch (error) {
      console.error('Public share download error:', error)
      return response.internalServerError({ message: 'Failed to download file', error })
    }
  }

  /**
   * GET /files/:id/download/shared - Download file via private share (requires auth)
   */
  async downloadSharedFile(ctx: HttpContext) {
    const { params, response, auth } = ctx
    try {
      const user = auth.user!
      const fileId = parseInt(params.id)

      if (isNaN(fileId)) {
        return response.badRequest({ message: 'Invalid file ID' })
      }

      // Check if file is shared with user
      const share = await FileShare.query()
        .where('file_id', fileId)
        .where('shared_with_id', user.id)
        .where((query) => {
          query.whereNull('expired_at').orWhere('expired_at', '>', DateTime.now().toSQL())
        })
        .preload('file')
        .first()

      if (!share) {
        return response.notFound({ message: 'File not shared with you or share expired' })
      }

      // Check if access type allows download
      if (share.accessType === 'view') {
        return response.forbidden({ message: 'You do not have download permission' })
      }

      const file = share.file

      // Handle encrypted file decryption
      let filePath = join(app.makePath(), file.path)
      let finalMimeType = file.mimeType
      let finalSize = file.size

      if ((file as any).isEncrypted) {
        // File is encrypted, need to decrypt it
        if (!share.encryptedKeyForRecipient) {
          return response.badRequest({ message: 'No decryption key available for this shared file' })
        }
        if (!(user as any).encryptedPrivateKey) {
          return response.badRequest({ message: 'You do not have encryption keys to decrypt this file' })
        }

        // Decrypt AES key using recipient's private key
        const aesKey = EncryptionService.decryptAESKey(share.encryptedKeyForRecipient, (user as any).encryptedPrivateKey)

        // Read encrypted file
        let storedBuffer: Buffer
        try {
          storedBuffer = await readFile(filePath)
        } catch (error) {
          return response.notFound({ message: 'File not found on disk' })
        }

        // Extract iv (16 bytes), tag (16 bytes), encrypted
        const iv = storedBuffer.subarray(0, 16)
        const tag = storedBuffer.subarray(16, 32)
        const encrypted = storedBuffer.subarray(32)

        // Decrypt file
        const decryptedBuffer = EncryptionService.decryptAES(encrypted, aesKey, iv, tag)

        // Set temp file or stream directly
        // For simplicity, we'll return the decrypted buffer directly
        // In production, consider streaming or temp files for large files

        // Log private share download activity
        await ActivityService.logFromContext(ctx, 'share:download', {
          fileId: share.fileId,
          metadata: {
            shareId: share.id,
            accessType: share.accessType,
            isPublic: false,
            originalName: file.originalName,
            size: file.size,
            recipientId: user.id,
            decrypted: true,
          },
        })

        // Set headers for download
        response.header('Content-Type', file.mimeType)
        response.header('Content-Disposition', `attachment; filename="${file.originalName}"`)
        response.header('Content-Length', decryptedBuffer.length.toString())

        return response.send(decryptedBuffer)
      }

      // Log private share download activity
      await ActivityService.logFromContext(ctx, 'share:download', {
        fileId: share.fileId,
        metadata: {
          shareId: share.id,
          accessType: share.accessType,
          isPublic: false,
          originalName: file.originalName,
          size: file.size,
          recipientId: user.id,
        },
      })

      // Check if file exists on disk
      if (!existsSync(filePath)) {
        return response.notFound({ message: 'File not found on disk' })
      }

      // Set headers for download
      response.header('Content-Type', file.mimeType)
      response.header('Content-Disposition', `attachment; filename="${file.originalName}"`)
      response.header('Content-Length', file.size.toString())

      // Stream file
      return response.download(filePath)
    } catch (error) {
      console.error('Shared file download error:', error)
      return response.internalServerError({ message: 'Failed to download file', error })
    }
  }

  /**
   * PUT /shares/:id - Update share
   */
  async update(ctx: HttpContext) {
    const { params, request, response, auth } = ctx
    try {
      const user = auth.user!
      const shareId = parseInt(params.id)

      if (isNaN(shareId)) {
        return response.badRequest({ message: 'Invalid share ID' })
      }

      // Find share and validate ownership
      const share = await FileShare.query()
        .where('id', shareId)
        .where('owner_id', user.id)
        .first()

      if (!share) {
        return response.notFound({ message: 'Share not found or access denied' })
      }

      // Validate request
      const { updateFileShareValidator } = await import('#validators/update_file_share')
      const payload = await request.validateUsing(updateFileShareValidator)

      // Validate expiration date is in future if provided
      if (
        payload.expiredAt &&
        payload.expiredAt !== null &&
        DateTime.fromJSDate(payload.expiredAt) <= DateTime.now()
      ) {
        return response.badRequest({ message: 'Expiration date must be in the future' })
      }

      // Update share
      if (payload.accessType) {
        share.accessType = payload.accessType
      }
      if (payload.expiredAt !== undefined) {
        share.expiredAt = payload.expiredAt ? DateTime.fromJSDate(payload.expiredAt) : null
      }

      await share.save()
      await share.load('file')
      await share.load('owner')
      await share.load('recipient')

      // Log share update activity
      await ActivityService.logFromContext(ctx, 'share:update', {
        fileId: share.fileId,
        metadata: {
          shareId: shareId,
          accessType: payload.accessType,
          expiredAt: payload.expiredAt,
          isPublic: share.isPublic,
        },
      })

      return response.ok(share)
    } catch (error) {
      return response.internalServerError({ message: 'Failed to update share', error })
    }
  }

  /**
   * DELETE /shares/:id - Revoke share
   */
  async destroy(ctx: HttpContext) {
    const { params, response, auth } = ctx
    try {
      const user = auth.user!
      const shareId = parseInt(params.id)

      if (isNaN(shareId)) {
        return response.badRequest({ message: 'Invalid share ID' })
      }

      // Find share and validate ownership
      const share = await FileShare.query()
        .where('id', shareId)
        .where('owner_id', user.id)
        .first()

      if (!share) {
        return response.notFound({ message: 'Share not found or access denied' })
      }

      // Log share deletion activity
      await ActivityService.logFromContext(ctx, 'share:delete', {
        fileId: share.fileId,
        metadata: {
          shareId: shareId,
          isPublic: share.isPublic,
        },
      })

      // Delete share
      await share.delete()

      return response.ok({ message: 'Share revoked successfully' })
    } catch (error) {
      console.error('Share deletion error:', error)
      return response.internalServerError({ message: 'Failed to revoke share', error })
    }
  }
}
