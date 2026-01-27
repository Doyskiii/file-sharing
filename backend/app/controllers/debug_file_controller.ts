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

export default class DebugFileController {
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
   * POST /debug-files - Upload file with detailed logging
   */
  async debugStore(ctx: HttpContext) {
    const { request, response, auth } = ctx
    try {
      console.log('=== DEBUG FILE UPLOAD START ===')
      
      const user = auth.user!
      console.log('Authenticated user:', { id: user.id, email: user.email })

      // Get multipart file
      const fileData = request.file('file', {
        size: DebugFileController.MAX_FILE_SIZE,
        extnames: ['pdf', 'doc', 'docx', 'txt', 'csv', 'xls', 'xlsx', 'ppt', 'pptx',
                   'jpg', 'jpeg', 'png', 'gif', 'svg', 'webp',
                   'zip', 'rar', '7z', 'json', 'xml'],
      })

      console.log('File data received:', !!fileData)
      if (fileData) {
        console.log('File details:', {
          clientName: fileData.clientName,
          size: fileData.size,
          type: fileData.type,
          hasErrors: fileData.hasErrors,
          errors: fileData.errors
        })
      }

      if (!fileData) {
        console.log('ERROR: No file uploaded')
        return response.badRequest({ message: 'No file uploaded' })
      }

      // Validate file
      if (fileData.hasErrors) {
        console.log('ERROR: File validation failed', fileData.errors)
        return response.badRequest({
          message: 'File validation failed',
          errors: fileData.errors
        })
      }

      // Validate MIME type - AdonisJS may return simplified types like 'text' instead of 'text/plain'
      // So we check if the type starts with an allowed prefix or matches exactly
      const mimeType = fileData.type || 'application/octet-stream'
      const isAllowed = DebugFileController.ALLOWED_MIME_TYPES.some(allowedType =>
        mimeType === allowedType ||
        (allowedType.startsWith(mimeType + '/') || mimeType.startsWith(allowedType.split('/')[0]))
      )

      if (!isAllowed) {
        console.log('ERROR: File type not allowed', { mimeType, isAllowed })
        return response.badRequest({
          message: 'File type not allowed',
          receivedType: mimeType,
          allowedTypes: DebugFileController.ALLOWED_MIME_TYPES
        })
      }

      // Get optional folderId and encrypt flag from request body
      const folderId = request.input('folderId')
      const encrypt = request.input('encrypt', false)

      console.log('Upload parameters:', { folderId, encrypt })

      // Validate folder if provided
      if (folderId) {
        console.log('Validating folder access...')
        const folder = await Folder.query()
          .where('id', folderId)
          .where('owner_id', user.id)
          .first()

        console.log('Folder found:', !!folder)
        if (!folder) {
          console.log('ERROR: Folder not found or access denied')
          return response.notFound({ message: 'Folder not found or access denied' })
        }
      }

      // Generate unique stored name
      const fileExtension = extname(fileData.clientName)
      const storedName = `${randomUUID()}${fileExtension}`

      // Create user directory if not exists
      const userUploadDir = join(app.makePath('uploads'), user.id.toString())
      if (!existsSync(userUploadDir)) {
        console.log('Creating upload directory:', userUploadDir)
        await mkdir(userUploadDir, { recursive: true })
      }

      // Full file path
      const filePath = join(userUploadDir, storedName)
      const relativePath = join('uploads', user.id.toString(), storedName)

      console.log('File paths:', { filePath, relativePath })

      // Read file buffer and handle encryption
      console.log('Reading file buffer from:', fileData.tmpPath)
      const fileBuffer = await readFile(fileData.tmpPath!)

      console.log('File buffer size:', fileBuffer.length)

      // Handle encryption if requested
      let finalBuffer = fileBuffer
      let isEncrypted = false
      let encryptionKey = null
      let encryptionMethod = null

      if (encrypt) {
        console.log('Processing encryption...')
        if (!(user as any).publicKey) {
          console.log('ERROR: User does not have encryption keys')
          return response.badRequest({ message: 'User does not have encryption keys. Please re-register or contact support.' })
        }

        const aesKey = EncryptionService.generateAESKey()
        const encrypted = EncryptionService.encryptAES(fileBuffer, aesKey)

        // Store iv + tag + encrypted
        finalBuffer = Buffer.concat([encrypted.iv, encrypted.tag, encrypted.encrypted])
        encryptionKey = EncryptionService.encryptAESKey(aesKey, (user as any).publicKey)
        isEncrypted = true
        encryptionMethod = 'AES-256-GCM'
        
        console.log('Encryption completed')
      }

      // Save final buffer to disk
      console.log('Saving file to disk...')
      await writeFile(filePath, finalBuffer)

      // Create database record
      console.log('Creating database record...')
      const file = await File.create({
        ownerId: user.id,
        folderId: folderId || null,
        originalName: fileData.clientName,
        storedName: storedName,
        mimeType: fileData.type || 'application/octet-stream',
        size: fileData.size,
        path: relativePath,
        isEncrypted: isEncrypted,
        encryptionKey: encryptionKey,
        encryptionMethod: encryptionMethod,
      })

      console.log('Database record created:', { id: file.id, name: file.originalName })

      await file.load('owner')
      if (folderId) {
        await file.load('folder')
      }

      try {
        // Log file upload activity
        console.log('Logging activity...')
        await ActivityService.logFromContext(ctx, 'file:upload', {
          fileId: file.id,
          metadata: {
            originalName: file.originalName,
            mimeType: file.mimeType,
            size: file.size,
            folderId: file.folderId,
          },
        })
        console.log('Activity logged successfully')
      } catch (activityError) {
        console.error('Activity logging error:', activityError)
        console.error('Activity error stack:', activityError.stack)
        // Don't fail the whole upload if activity logging fails
      }

      console.log('SUCCESS: File upload completed', { id: file.id, name: file.originalName })
      return response.created(file)
    } catch (error) {
      console.error('File upload error:', error)
      console.error('Error stack:', error.stack)
      return response.internalServerError({ message: 'Failed to upload file', error: error.message })
    }
  }
}