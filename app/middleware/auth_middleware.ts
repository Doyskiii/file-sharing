import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import User from '#models/user'

/**
 * Auth middleware is used authenticate HTTP requests and deny
 * access to unauthenticated users.
 */
export default class AuthMiddleware {
  /**
   * The URL to redirect to, when authentication fails
   */
  redirectTo = '/login'

  async handle(ctx: HttpContext, next: NextFn) {
    // Simple token-based auth for now
    const authHeader = ctx.request.header('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ctx.response.unauthorized({ message: 'Authentication required' })
    }

    const token = authHeader.substring(7) // Remove 'Bearer '
    if (!token.startsWith('token_')) {
      return ctx.response.unauthorized({ message: 'Invalid token' })
    }

    // Extract user ID from token (simple implementation)
    const parts = token.split('_')
    if (parts.length < 3) {
      return ctx.response.unauthorized({ message: 'Invalid token format' })
    }

    const userId = parseInt(parts[1])
    const user = await User.find(userId)
    if (!user) {
      return ctx.response.unauthorized({ message: 'User not found' })
    }

    // Set user in context using a custom property
    ;(ctx as any).user = user
    return next()
  }
}
