import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import User from '#models/user'

/**
 * Role middleware is used to check if the authenticated user has a specific role
 */
export default class RoleMiddleware {
  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      role: string
    }
  ) {
    const user = ctx.auth.user

    if (!user) {
      return ctx.response.unauthorized({ message: 'Authentication required' })
    }

    await user.load('roles')

    const hasRole = user.roles?.some((role: any) => role.name === options.role)

    if (!hasRole) {
      return ctx.response.forbidden({ message: `Access denied. Required role: ${options.role}` })
    }

    return next()
  }
}
