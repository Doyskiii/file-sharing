import crypto from 'node:crypto'

export interface EncryptedAES {
  encrypted: Buffer
  iv: Buffer
  tag: Buffer
}

export class EncryptionService {
  /**
   * Generate RSA key pair for a user
   */
  static generateRSAKeyPair(): { publicKey: string; privateKey: string } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    })

    return { publicKey, privateKey }
  }

  /**
   * Generate a random AES-256 key
   */
  static generateAESKey(): Buffer {
    return crypto.randomBytes(32) // 256 bits
  }

  /**
   * Encrypt data using AES-256-GCM
   */
  static encryptAES(data: Buffer, key: Buffer): EncryptedAES {
    const iv = crypto.randomBytes(16) // 128 bits
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)

    const encrypted = Buffer.concat([
      cipher.update(data),
      cipher.final(),
    ])

    const tag = cipher.getAuthTag()

    return { encrypted, iv, tag }
  }

  /**
   * Decrypt data using AES-256-GCM
   */
  static decryptAES(encrypted: Buffer, key: Buffer, iv: Buffer, tag: Buffer): Buffer {
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(tag)

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ])

    return decrypted
  }

  /**
   * Encrypt data using RSA public key
   */
  static encryptRSA(data: Buffer, publicKey: string): Buffer {
    return crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      data
    )
  }

  /**
   * Decrypt data using RSA private key
   */
  static decryptRSA(encrypted: Buffer, privateKey: string): Buffer {
    return crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      encrypted
    )
  }

  /**
   * Encrypt AES key with RSA public key
   */
  static encryptAESKey(aESKey: Buffer, publicKey: string): string {
    const encrypted = this.encryptRSA(aESKey, publicKey)
    return encrypted.toString('base64')
  }

  /**
   * Decrypt AES key with RSA private key
   */
  static decryptAESKey(encryptedAESKey: string, privateKey: string): Buffer {
    const encrypted = Buffer.from(encryptedAESKey, 'base64')
    return this.decryptRSA(encrypted, privateKey)
  }
}