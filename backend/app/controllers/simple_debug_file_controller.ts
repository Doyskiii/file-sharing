import type { HttpContext } from '@adonisjs/core/http'
import File from '#models/file'
import Folder from '#models/folder'
import User from '#models/user'
import { randomUUID } from 'node:crypto'
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, extname } from 'node:path'
import app from '@adonisjs/core/services/app'
import { EncryptionService } from '#services/encryption_service'

export default class SimpleDebugFileController {
  /**
   * POST /simple-debug-files - Upload file dengan logging minimal
   */
  async simpleDebugStore(ctx: HttpContext) {
    const { request, response, auth } = ctx
    try {
      console.log('=== SIMPLE DEBUG UPLOAD START ===')
      
      // Cek autentikasi
      const user = auth.user
      if (!user) {
        console.log('❌ User not authenticated')
        return response.unauthorized({ message: 'Authentication required' })
      }
      console.log('✅ User authenticated:', { id: user.id, email: user.email })

      // Cek apakah ada file
      const fileData = request.file('file')
      if (!fileData) {
        console.log('❌ No file in request')
        return response.badRequest({ message: 'No file uploaded' })
      }
      console.log('✅ File received:', {
        clientName: fileData.clientName,
        size: fileData.size,
        type: fileData.type,
        tmpPath: fileData.tmpPath,
        hasErrors: fileData.hasErrors
      })

      if (fileData.hasErrors) {
        console.log('❌ File has validation errors:', fileData.errors)
        return response.badRequest({ message: 'File validation failed', errors: fileData.errors })
      }

      // Ambil parameter opsional
      const folderId = request.input('folderId')
      const encrypt = request.input('encrypt', false)
      console.log('Parameters:', { folderId, encrypt })

      // Validasi folder jika disediakan
      if (folderId) {
        const folder = await Folder.query()
          .where('id', folderId)
          .where('owner_id', user.id)
          .first()
        if (!folder) {
          console.log('❌ Folder not found or access denied')
          return response.notFound({ message: 'Folder not found or access denied' })
        }
      }

      // Generate nama unik
      const fileExtension = extname(fileData.clientName)
      const storedName = `${randomUUID()}${fileExtension}`
      console.log('Generated name:', storedName)

      // Buat direktori user
      const userUploadDir = join(app.makePath('uploads'), user.id.toString())
      if (!existsSync(userUploadDir)) {
        console.log('Creating upload directory:', userUploadDir)
        await mkdir(userUploadDir, { recursive: true })
      }

      // Path file
      const filePath = join(userUploadDir, storedName)
      const relativePath = join('uploads', user.id.toString(), storedName)
      console.log('File paths:', { filePath, relativePath })

      // Baca dan proses file
      const fileBuffer = await readFile(fileData.tmpPath!)
      console.log('File buffer size:', fileBuffer.length)

      // Proses enkripsi jika diminta
      let finalBuffer = fileBuffer
      let isEncrypted = false
      let encryptionKey = null
      let encryptionMethod = null

      if (encrypt) {
        if (!(user as any).publicKey) {
          console.log('❌ User does not have encryption keys')
          return response.badRequest({ message: 'User does not have encryption keys' })
        }

        const aesKey = EncryptionService.generateAESKey()
        const encrypted = EncryptionService.encryptAES(fileBuffer, aesKey)
        finalBuffer = Buffer.concat([encrypted.iv, encrypted.tag, encrypted.encrypted])
        encryptionKey = EncryptionService.encryptAESKey(aesKey, (user as any).publicKey)
        isEncrypted = true
        encryptionMethod = 'AES-256-GCM'
      }

      // Simpan ke disk
      await writeFile(filePath, finalBuffer)
      console.log('✅ File saved to disk')

      // Buat record di database
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
      console.log('✅ File record created in database:', { id: file.id, name: file.originalName })

      // Load relasi
      await file.load('owner')
      if (folderId) {
        await file.load('folder')
      }

      console.log('✅ UPLOAD COMPLETED SUCCESSFULLY')
      return response.created({
        message: 'File uploaded successfully',
        file: file
      })
    } catch (error) {
      console.error('🚨 UPLOAD ERROR:', error)
      console.error('Error stack:', error.stack)
      return response.internalServerError({ 
        message: 'Upload failed', 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    }
  }
}