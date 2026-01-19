import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Role from '#models/role'
import hash from '@adonisjs/core/services/hash'
import ActivityService from '#services/activity_service'
import { EncryptionService } from '#services/encryption_service'

export default class AuthController {
  // POST /login
  async login({ request, response }: HttpContext) {
    try {
      const { email, password } = request.only(['email', 'password'])

      // Find user by email
      const user = await User.verifyCredentials(email, password)

      // Check if user is active
      if (!user.isActive) {
        return response.unauthorized({ message: 'Account is not active' })
      }

      // Create access token using AdonisJS auth
      const token = await User.accessTokens.create(user, ['*'], {
        expiresIn: '7 days',
      })

      // Log login activity
      // await ActivityService.logAuth(
      //   user.id,
      //   'auth:login',
      //   request.ip(),
      //   request.header('user-agent'),
      //   { email: user.email }
      // )

      // Load roles for response
      await user.load('roles')

      return response.ok({
        message: 'Login successful',
        user: user,
        token: token.value!.release(),
      })
    } catch (error) {
      return response.unauthorized({ message: 'Invalid credentials' })
    }
  }

  // POST /register
  async register({ request, response }: HttpContext) {
    try {
      const { registerUserValidator } = await import('#validators/register_user')
      const payload = await request.validateUsing(registerUserValidator)
      
      // Create user - password will be automatically hashed by withAuthFinder
      const user = await User.create({
        ...payload,
        isActive: true,
        isTotpEnabled: false,
      })

      // Generate RSA key pair for encryption (store plain for demo)
      const { publicKey, privateKey } = EncryptionService.generateRSAKeyPair()

      // Update user with keys
      ;(user as any).publicKey = publicKey
      ;(user as any).encryptedPrivateKey = privateKey // Store plain for demo
      await user.save()

      // Assign default role (User) to new user
      const userRole = await Role.findBy('name', 'User')
      if (userRole) {
        await user.related('roles').attach([userRole.id])
      }

      // Create access token
      const token = await User.accessTokens.create(user, ['*'], {
        expiresIn: '7 days',
      })

      // Log registration activity
      // await ActivityService.logAuth(
      //   user.id,
      //   'auth:register',
      //   request.ip(),
      //   request.header('user-agent'),
      //   { email: user.email, username: user.username }
      // )

      // Load roles for response
      await user.load('roles')

      return response.created({
        message: 'User registered successfully',
        user: user,
        token: token.value!.release(),
      })
    } catch (error) {
      return response.badRequest({ message: 'Registration failed', error })
    }
  }

  // POST /logout
  async logout({ auth, request, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      
      // Log logout activity before deleting token
      await ActivityService.logAuth(
        user.id,
        'auth:logout',
        request.ip(),
        request.header('user-agent')
      )
      
      await User.accessTokens.delete(user, user.currentAccessToken.identifier)
      
      return response.ok({ message: 'Logged out successfully' })
    } catch (error) {
      return response.internalServerError({ message: 'Logout failed', error })
    }
  }

  // GET /me
  async me({ auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      await user.load('roles')
      
      return response.ok({ user: user })
    } catch (error) {
      return response.unauthorized({ message: 'Unauthenticated' })
    }
  }
}
