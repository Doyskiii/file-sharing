# Phase 5: File Encryption Implementation Plan

## Overview
Implement end-to-end encryption for files to ensure data privacy and security. Files will be encrypted at rest and decrypted only for authorized users during access.

## Architecture

### Encryption Approach
- **Algorithm**: AES-256-GCM for symmetric encryption (fast, secure)
- **Key Management**: Hybrid approach - RSA for key exchange, AES for file encryption
- **Key Storage**: Encrypted keys stored in database, master keys derived from user passwords

### Components

#### 1. Encryption Service
- `encryptFile(buffer, key)`: Encrypt file content
- `decryptFile(encryptedBuffer, key)`: Decrypt file content
- `generateFileKey()`: Generate random AES key for each file
- `encryptKey(key, publicKey)`: Encrypt file key with user's public key
- `decryptKey(encryptedKey, privateKey)`: Decrypt file key with user's private key

#### 2. Key Management
- Each user has RSA key pair (generated on registration)
- File keys are encrypted with owner's public key
- For sharing: Re-encrypt file key with recipient's public key

#### 3. Database Changes
- Add `encryption_key` column to `files` table (encrypted file key)
- Add `is_encrypted` boolean flag
- Add user `public_key` and `encrypted_private_key` columns

#### 4. API Changes
- Upload: Encrypt file before storing
- Download: Decrypt file before sending
- Share: Include encrypted key for recipient

### Security Flow

#### File Upload (Encrypted)
1. User uploads file
2. Generate random AES key for file
3. Encrypt file content with AES key
4. Encrypt AES key with user's public key
5. Store encrypted file and encrypted key in DB

#### File Download (Encrypted)
1. User requests file
2. Check permissions
3. Retrieve encrypted file and encrypted key
4. Decrypt AES key with user's private key
5. Decrypt file with AES key
6. Send decrypted file

#### File Sharing (Encrypted)
1. Owner shares file with user
2. Retrieve file's AES key (decrypt with owner's private key)
3. Encrypt AES key with recipient's public key
4. Store encrypted key for recipient in share record

### Implementation Steps

1. **Research & Design** (Current)
   - Review crypto libraries
   - Design key management
   - Plan database schema

2. **Core Encryption Utils**
   - Implement encryption/decryption functions
   - Add RSA key generation for users

3. **Database Updates**
   - Add encryption columns to tables
   - Create migration for schema changes

4. **Backend Updates**
   - Modify file controller for encryption
   - Update share controller for key exchange
   - Add encryption settings

5. **Frontend Updates**
   - Add encryption toggle in upload dialog
   - Handle encrypted downloads

6. **Testing & Security Audit**
   - Test encryption/decryption
   - Verify key security
   - Performance testing

### Security Considerations
- Keys never stored in plain text
- Private keys encrypted with user password
- File keys unique per file
- Secure random key generation
- Proper error handling (no key leaks)

### Performance Impact
- Encryption adds CPU overhead (~10-20% for large files)
- Key operations are fast
- Streaming encryption for large files

### Fallback
- Non-encrypted files remain accessible
- Encryption optional per file

## Timeline
- Design: 1-2 days
- Implementation: 1-2 weeks
- Testing: 3-5 days

## Dependencies
- Node.js crypto module (built-in)
- Additional: `node-forge` for RSA if needed