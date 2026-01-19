import type { HttpContext } from '@adonisjs/core/http'
import File from '#models/file'
import Folder from '#models/folder'
import FileKey from '#models/file_key'
import User from '#models/user'
import { randomUUID } from 'node:crypto'
import { mkdir, writeFile, unlink, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, extname } from 'node:path'
import app from '@adonisjs/core/services/app'
import ActivityService from '#services/activity_service'
import { EncryptionService } from '#services/encryption_service'

export default class FileController {
  // Configuration
  private static readonly MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
  private static readonly ALLOWED_MIME_TYPES = [
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/svg+xml',
    'image/webp',
    // Archives
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    // Others
    'application/json',
    'application/xml',
    'text/xml',
  ]

  /**
   * POST /files - Upload file
   */
  async store(ctx: HttpContext) {
    const { request, response, auth } = ctx
    try {
      const user = auth.user!

      // Get multipart file
      const fileData = request.file('file', {
        size: FileController.MAX_FILE_SIZE,
        extnames: ['pdf', 'doc', 'docx', 'txt', 'csv', 'xls', 'xlsx', 'ppt', 'pptx', 
                   'jpg', 'jpeg', 'png', 'gif', 'svg', 'webp',
                   'zip', 'rar', '7z', 'json', 'xml'],
      })

      if (!fileData) {
        return response.badRequest({ message: 'No file uploaded' })
      }

      // Validate file
      if (fileData.hasErrors) {
        return response.badRequest({ 
          message: 'File validation failed', 
          errors: fileData.errors 
        })
      }

      // Validate MIME type - AdonisJS may return simplified types like 'text' instead of 'text/plain'
      // So we check if the type starts with an allowed prefix or matches exactly
      const mimeType = fileData.type || 'application/octet-stream'
      const isAllowed = FileController.ALLOWED_MIME_TYPES.some(allowedType => 
        mimeType === allowedType || 
        (allowedType.startsWith(mimeType + '/') || mimeType.startsWith(allowedType.split('/')[0]))
      )

      if (!isAllowed) {
        return response.badRequest({ 
          message: 'File type not allowed',
          receivedType: mimeType,
          allowedTypes: FileController.ALLOWED_MIME_TYPES
        })
      }

      // Get optional folderId and encrypt flag from request body
      const folderId = request.input('folderId')
      const encrypt = request.input('encrypt', false)

      // Validate folder if provided
      if (folderId) {
        const folder = await Folder.query()
          .where('id', folderId)
          .where('owner_id', user.id)
          .first()

        if (!folder) {
          return response.notFound({ message: 'Folder not found or access denied' })
        }
      }

      // Generate unique stored name
      const fileExtension = extname(fileData.clientName)
      const storedName = `${randomUUID()}${fileExtension}`
      
      // Create user directory if not exists
      const userUploadDir = join(app.makePath('uploads'), user.id.toString())
      if (!existsSync(userUploadDir)) {
        await mkdir(userUploadDir, { recursive: true })
      }

      // Full file path
      const filePath = join(userUploadDir, storedName)
      const relativePath = join('uploads', user.id.toString(), storedName)

      // Read file buffer and handle encryption
      const fileBuffer = await readFile(fileData.tmpPath!)

      // Handle encryption if requested
      let finalBuffer = fileBuffer
      let isEncrypted = false
      let encryptionKey = null
      let encryptionMethod = null

      if (encrypt) {
        if (!(user as any).publicKey) {
          return response.badRequest({ message: 'User does not have encryption keys. Please re-register or contact support.' })
        }

        const aesKey = EncryptionService.generateAESKey()
        const encrypted = EncryptionService.encryptAES(fileBuffer, aesKey)

        // Store iv + tag + encrypted
        finalBuffer = Buffer.concat([encrypted.iv, encrypted.tag, encrypted.encrypted])
        encryptionKey = EncryptionService.encryptAESKey(aesKey, (user as any).publicKey)
        isEncrypted = true
        encryptionMethod = 'AES-256-GCM'
      }

      // Save final buffer to disk
      await writeFile(filePath, finalBuffer)

      // Create database record
      const file = await File.create({
        ownerId: user.id,
        folderId: folderId || null,
        originalName: fileData.clientName,
        storedName: storedName,
        mimeType: fileData.type || 'application/octet-stream',
        size: fileData.size,
        path: relativePath,
        isEncrypted: false,
        encryptionMethod: null,
      })

      await file.load('owner')
      if (folderId) {
        await file.load('folder')
      }

      // Log file upload activity
      await ActivityService.logFromContext(ctx, 'file:upload', {
        fileId: file.id,
        metadata: {
          originalName: file.originalName,
          mimeType: file.mimeType,
          size: file.size,
          folderId: file.folderId,
        },
      })

      return response.created(file)
    } catch (error) {
      console.error('File upload error:', error)
      return response.internalServerError({ message: 'Failed to upload file', error })
    }
  }

  /**
   * GET /files - List user's files
   */
  async index({ response, auth, request }: HttpContext) {
    try {
      const user = auth.user!
      const folderId = request.input('folderId')
      const search = request.input('search')
      const type = request.input('type')
      const sortBy = request.input('sortBy', 'date')
      const sortOrder = request.input('sortOrder', 'desc')

      let query = File.query().where('owner_id', user.id)

      // Filter by folder if provided
      if (folderId !== undefined) {
        if (folderId === 'null' || folderId === null) {
          query = query.whereNull('folder_id')
        } else {
          query = query.where('folder_id', folderId)
        }
      }

      // Search by filename
      if (search) {
        query = query.where('original_name', 'ILIKE', `%${search}%`)
      }

      // Filter by file type
      if (type) {
        switch (type) {
          case 'image':
            query = query.where('mime_type', 'ILIKE', 'image/%')
            break
          case 'video':
            query = query.where('mime_type', 'ILIKE', 'video/%')
            break
          case 'audio':
            query = query.where('mime_type', 'ILIKE', 'audio/%')
            break
          case 'document':
            query = query.where((query) => {
              query
                .where('mime_type', 'ILIKE', 'application/pdf')
                .orWhere('mime_type', 'ILIKE', 'application/msword')
                .orWhere('mime_type', 'ILIKE', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
                .orWhere('mime_type', 'ILIKE', 'text/%')
                .orWhere('mime_type', 'ILIKE', 'application/vnd.ms-excel')
                .orWhere('mime_type', 'ILIKE', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            })
            break
          case 'archive':
            query = query.where((query) => {
              query
                .where('mime_type', 'ILIKE', 'application/zip')
                .orWhere('mime_type', 'ILIKE', 'application/x-rar-compressed')
                .orWhere('mime_type', 'ILIKE', 'application/x-7z-compressed')
            })
            break
        }
      }

      // Sorting
      let sortColumn = 'created_at'
      switch (sortBy) {
        case 'name':
          sortColumn = 'original_name'
          break
        case 'size':
          sortColumn = 'size'
          break
        case 'date':
        default:
          sortColumn = 'created_at'
          break
      }

      query = query.orderBy(sortColumn, sortOrder === 'asc' ? 'asc' : 'desc')

      const files = await query
        .preload('owner')
        .preload('folder')

      return response.ok(files)
    } catch (error) {
      return response.internalServerError({ message: 'Failed to fetch files', error })
    }
  }

  /**
   * GET /files/:id - Get file details
   */
  async show(ctx: HttpContext) {
    const { params, response, auth } = ctx
    try {
      const user = auth.user!
      const fileId = parseInt(params.id)

      if (isNaN(fileId)) {
        return response.badRequest({ message: 'Invalid file ID' })
      }

      const file = await File.query()
        .where('id', fileId)
        .where('owner_id', user.id)
        .preload('owner')
        .preload('folder')
        .first()

      if (!file) {
        return response.notFound({ message: 'File not found or access denied' })
      }

      // Log file view activity
      await ActivityService.logFromContext(ctx, 'file:view', {
        fileId: file.id,
        metadata: {
          originalName: file.originalName,
          mimeType: file.mimeType,
          size: file.size,
        },
      })

      return response.ok(file)
    } catch (error) {
      return response.internalServerError({ message: 'Failed to fetch file', error })
    }
  }

  /**
   * GET /files/:id/download - Download file
   */
  async download(ctx: HttpContext) {
    const { params, response, auth } = ctx
    try {
      const user = auth.user!
      const fileId = parseInt(params.id)

      if (isNaN(fileId)) {
        return response.badRequest({ message: 'Invalid file ID' })
      }

      const file = await File.query()
        .where('id', fileId)
        .where('owner_id', user.id)
        .first()

      if (!file) {
        return response.notFound({ message: 'File not found or access denied' })
      }

      // Full file path
      const filePath = join(app.makePath(), file.path)

      // Check if file exists on disk
      if (!existsSync(filePath)) {
        return response.notFound({ message: 'File not found on disk' })
      }

      // Log file download activity
      await ActivityService.logFromContext(ctx, 'file:download', {
        fileId: file.id,
        metadata: {
          originalName: file.originalName,
          mimeType: file.mimeType,
          size: file.size,
        },
      })

      // Handle encrypted files
      if ((file as any).isEncrypted) {
        const storedBuffer = await readFile(filePath)

        // Extract iv (16 bytes), tag (16 bytes), encrypted
        const iv = storedBuffer.subarray(0, 16)
        const tag = storedBuffer.subarray(16, 32)
        const encrypted = storedBuffer.subarray(32)

        // Get AES key
        const encryptedAESKey = (file as any).encryptionKey
        const aesKey = EncryptionService.decryptAESKey(encryptedAESKey, (user as any).encryptedPrivateKey)

        // Decrypt file
        const decryptedBuffer = EncryptionService.decryptAES(encrypted, aesKey, iv, tag)

        // Set headers for download
        response.header('Content-Type', file.mimeType)
        response.header('Content-Disposition', `attachment; filename="${file.originalName}"`)
        response.header('Content-Length', decryptedBuffer.length.toString())

        return response.send(decryptedBuffer)
      }

      // Set headers for download
      response.header('Content-Type', file.mimeType)
      response.header('Content-Disposition', `attachment; filename="${file.originalName}"`)
      response.header('Content-Length', file.size.toString())

      // Stream file
      return response.download(filePath)
    } catch (error) {
      console.error('File download error:', error)
      return response.internalServerError({ message: 'Failed to download file', error })
    }
  }

  /**
   * PUT /files/:id - Rename or move file
   */
  async update(ctx: HttpContext) {
    const { params, request, response, auth } = ctx
    try {
      const user = auth.user!
      const fileId = parseInt(params.id)

      if (isNaN(fileId)) {
        return response.badRequest({ message: 'Invalid file ID' })
      }

      const file = await File.query()
        .where('id', fileId)
        .where('owner_id', user.id)
        .first()

      if (!file) {
        return response.notFound({ message: 'File not found or access denied' })
      }

      const { updateFileValidator } = await import('#validators/update_file')
      const payload = await request.validateUsing(updateFileValidator)

      // Validate folder if moving
      if (payload.folderId !== undefined) {
        if (payload.folderId) {
          const folder = await Folder.query()
            .where('id', payload.folderId)
            .where('owner_id', user.id)
            .first()

          if (!folder) {
            return response.notFound({ message: 'Folder not found or access denied' })
          }
        }
      }

      // Update file
      file.merge(payload)
      await file.save()
      await file.load('owner')
      await file.load('folder')

      // Log file update activity
      await ActivityService.logFromContext(ctx, 'file:update', {
        fileId: file.id,
        metadata: {
          originalName: file.originalName,
          mimeType: file.mimeType,
          size: file.size,
          folderId: file.folderId,
          changes: payload,
        },
      })

      return response.ok(file)
    } catch (error) {
      return response.internalServerError({ message: 'Failed to update file', error })
    }
  }

  /**
   * POST /files/:id/encrypt - Encrypt existing file
   */
  async encrypt(ctx: HttpContext) {
    const { params, response, auth } = ctx
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

      // Check if already encrypted
      if ((file as any).isEncrypted) {
        return response.badRequest({ message: 'File is already encrypted' })
      }

      // Check if user has encryption keys
      if (!(user as any).publicKey) {
        return response.badRequest({ message: 'User does not have encryption keys. Please re-register.' })
      }

      // Full file path
      const filePath = join(app.makePath(), file.path)

      // Check if file exists on disk
      if (!existsSync(filePath)) {
        return response.notFound({ message: 'File not found on disk' })
      }

      // Read file buffer
      const fileBuffer = await readFile(filePath)

      // Generate AES key and encrypt
      const aesKey = EncryptionService.generateAESKey()
      const encrypted = EncryptionService.encryptAES(fileBuffer, aesKey)

      // Store iv + tag + encrypted
      const finalBuffer = Buffer.concat([encrypted.iv, encrypted.tag, encrypted.encrypted])

      // Write encrypted file back
      await writeFile(filePath, finalBuffer)

      // Encrypt AES key with user's public key
      const encryptedAESKey = EncryptionService.encryptAESKey(aesKey, (user as any).publicKey)

      // Update file record
      file.isEncrypted = true
      file.encryptionKey = encryptedAESKey
      file.encryptionMethod = 'AES-256-GCM'
      file.size = finalBuffer.length // Update size to encrypted size
      await file.save()

      // Log encryption activity
      await ActivityService.logFromContext(ctx, 'file:encrypt', {
        fileId: fileId,
        metadata: {
          originalSize: fileBuffer.length,
          encryptedSize: finalBuffer.length,
          encryptionMethod: 'AES-256-GCM',
        },
      })

      return response.ok({
        message: 'File encrypted successfully',
        file: {
          id: file.id,
          isEncrypted: true,
          size: finalBuffer.length,
        },
      })
    } catch (error) {
      console.error('File encryption error:', error)
      return response.internalServerError({ message: 'Failed to encrypt file', error })
    }
  }

  /**
   * POST /files/:id/decrypt - Decrypt existing file
   */
  async decrypt(ctx: HttpContext) {
    const { params, response, auth } = ctx
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

      // Check if encrypted
      if (!(file as any).isEncrypted) {
        return response.badRequest({ message: 'File is not encrypted' })
      }

      // Check if user has encryption keys
      if (!(user as any).encryptedPrivateKey) {
        return response.badRequest({ message: 'User does not have encryption keys.' })
      }

      // Full file path
      const filePath = join(app.makePath(), file.path)

      // Check if file exists on disk
      if (!existsSync(filePath)) {
        return response.notFound({ message: 'File not found on disk' })
      }

      // Read encrypted file
      const storedBuffer = await readFile(filePath)

      // Extract iv (16 bytes), tag (16 bytes), encrypted
      const iv = storedBuffer.subarray(0, 16)
      const tag = storedBuffer.subarray(16, 32)
      const encrypted = storedBuffer.subarray(32)

      // Get AES key
      const encryptedAESKey = (file as any).encryptionKey
      const aesKey = EncryptionService.decryptAESKey(encryptedAESKey, (user as any).encryptedPrivateKey)

      // Decrypt file
      const decryptedBuffer = EncryptionService.decryptAES(encrypted, aesKey, iv, tag)

      // Write decrypted file back
      await writeFile(filePath, decryptedBuffer)

      // Update file record
      file.isEncrypted = false
      file.encryptionKey = null
      file.encryptionMethod = null
      file.size = decryptedBuffer.length // Update size to decrypted size
      await file.save()

      // Log decryption activity
      await ActivityService.logFromContext(ctx, 'file:decrypt', {
        fileId: fileId,
        metadata: {
          encryptedSize: storedBuffer.length,
          decryptedSize: decryptedBuffer.length,
        },
      })

      return response.ok({
        message: 'File decrypted successfully',
        file: {
          id: file.id,
          isEncrypted: false,
          size: decryptedBuffer.length,
        },
      })
    } catch (error) {
      console.error('File decryption error:', error)
      return response.internalServerError({ message: 'Failed to decrypt file', error })
    }
  }

  /**
   * GET /files/:id/keys - List encryption keys for a file
   */
  async listKeys(ctx: HttpContext) {
    const { params, response, auth } = ctx
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

      // Get all keys for this file from file_keys table
      const keys = await FileKey.query()
        .where('file_id', fileId)
        .preload('user')
        .orderBy('created_at', 'desc')

      return response.ok(keys.map((key: FileKey) => ({
        id: key.id,
        userId: key.userId,
        algorithm: key.algorithm,
        createdAt: key.createdAt,
        user: {
          id: key.user.id,
          username: key.user.username,
          email: key.user.email,
        },
      })))
    } catch (error) {
      console.error('List keys error:', error)
      return response.internalServerError({ message: 'Failed to list keys', error })
    }
  }

  /**
   * POST /files/:id/keys/share - Share encryption key with user
   */
  async shareKey(ctx: HttpContext) {
    const { params, request, response, auth } = ctx
    try {
      const user = auth.user!
      const fileId = parseInt(params.id)

      if (isNaN(fileId)) {
        return response.badRequest({ message: 'Invalid file ID' })
      }

      // Validate request
      const { userId } = await request.validateUsing({
        userId: 'number',
      } as any)

      // Validate file exists and user owns it
      const file = await File.query()
        .where('id', fileId)
        .where('owner_id', user.id)
        .first()

      if (!file) {
        return response.notFound({ message: 'File not found or access denied' })
      }

      // Check if file is encrypted
      if (!(file as any).isEncrypted) {
        return response.badRequest({ message: 'File is not encrypted' })
      }

      // Check if user has encryption keys
      if (!(user as any).encryptedPrivateKey) {
        return response.badRequest({ message: 'You do not have encryption keys.' })
      }

      // Validate recipient exists
      const recipient = await User.find(userId)
      if (!recipient) {
        return response.notFound({ message: 'Recipient user not found' })
      }

      // Check if key already shared with this user
      const existingKey = await FileKey.query()
        .where('file_id', fileId)
        .where('user_id', userId)
        .first()

      if (existingKey) {
        return response.conflict({ message: 'Key already shared with this user' })
      }

      // Check if recipient has public key
      if (!(recipient as any).publicKey) {
        return response.badRequest({ message: 'Recipient does not have encryption keys.' })
      }

      // Get AES key and share it
      const encryptedAESKey = (file as any).encryptionKey
      const aesKey = EncryptionService.decryptAESKey(encryptedAESKey, (user as any).encryptedPrivateKey)
      const encryptedKeyForRecipient = EncryptionService.encryptAESKey(aesKey, (recipient as any).publicKey)

      // Create key record
      const keyRecord = await FileKey.create({
        fileId: fileId,
        userId: userId,
        encryptedKey: encryptedKeyForRecipient,
        algorithm: (file as any).encryptionMethod || 'AES-256-GCM',
      })

      await keyRecord.load('user')

      // Log key sharing activity
      await ActivityService.logFromContext(ctx, 'key:share', {
        fileId: fileId,
        metadata: {
          sharedWithId: userId,
          algorithm: keyRecord.algorithm,
        },
      })

      return response.created(keyRecord)
    } catch (error) {
      console.error('Key sharing error:', error)
      return response.internalServerError({ message: 'Failed to share key', error })
    }
  }

  /**
   * DELETE /files/:id - Delete file
   */
  async destroy(ctx: HttpContext) {
    const { params, response, auth } = ctx
    try {
      const user = auth.user!
      const fileId = parseInt(params.id)

      if (isNaN(fileId)) {
        return response.badRequest({ message: 'Invalid file ID' })
      }

      const file = await File.query()
        .where('id', fileId)
        .where('owner_id', user.id)
        .first()

      if (!file) {
        return response.notFound({ message: 'File not found or access denied' })
      }

      // Delete from disk
      const filePath = join(app.makePath(), file.path)
      if (existsSync(filePath)) {
        await unlink(filePath)
      }

      // Log file delete activity before deleting
      await ActivityService.logFromContext(ctx, 'file:delete', {
        fileId: file.id,
        metadata: {
          originalName: file.originalName,
          mimeType: file.mimeType,
          size: file.size,
          folderId: file.folderId,
        },
      })

      // Delete from database
      await file.delete()

      return response.ok({ message: 'File deleted successfully' })
    } catch (error) {
      console.error('File delete error:', error)
      return response.internalServerError({ message: 'Failed to delete file', error })
    }
  }
}
