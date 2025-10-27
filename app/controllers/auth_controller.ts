import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Role from '#models/role'

export default class AuthController {
  // POST /login
  async login({ request, response }: HttpContext) {
    try {
      const { email, password } = request.only(['email', 'password'])

      const user = await User.query().where('email', email).first()
      if (!user) {
        return response.unauthorized({ message: 'Invalid credentials' })
      }

      // Check if user is active
      if (!user.isActive) {
        return response.unauthorized({ message: 'Account is not active' })
      }

      // Simple password check (password stored as plain text for now)
      if (user.password !== password) {
        return response.unauthorized({ message: 'Invalid credentials' })
      }

      // Create a simple token
      const token = `token_${user.id}_${Date.now()}`

      // Load roles for response
      await user.load('roles')

      return response.ok({
        message: 'Login successful',
        user: user,
        token: token,
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
      const user = await User.create(payload)

      // Assign default role (User) to new user
      const userRole = await Role.findBy('name', 'User')
      if (userRole) {
        await user.related('roles').attach([userRole.id])
      }

      // Create a simple token
      const token = `token_${user.id}_${Date.now()}`

      return response.created({
        message: 'User registered successfully',
        user: user,
        token: token,
      })
    } catch (error) {
      return response.badRequest({ message: 'Registration failed', error })
    }
  }

  // POST /logout
  async logout({ response }: HttpContext) {
    try {
      // Simple logout - in production, invalidate token
      return response.ok({ message: 'Logged out successfully' })
    } catch (error) {
      return response.internalServerError({ message: 'Logout failed', error })
    }
  }

  // GET /me
  async me({ response }: HttpContext) {
    try {
      // Get user from custom auth middleware
      const user = (response.ctx as any).user
      if (user) {
        await user.load('roles')
      }
      return response.ok({ user: user })
    } catch (error) {
      return response.internalServerError({ message: 'Failed to get user info', error })
    }
  }
}
