import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import User from '#models/user'

/**
 * Permission middleware is used to check if the authenticated user has a specific permission
 */
export default class PermissionMiddleware {
  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      permission: string
    }
  ) {
    const user = (ctx as any).user as User

    if (!user) {
      return ctx.response.unauthorized({ message: 'Authentication required' })
    }

    await user.load('roles')
    for (const role of user.roles) {
      await role.load('permissions')
    }

    const hasPermission = user.roles.some(role =>
      role.permissions?.some((permission: any) => permission.name === options.permission)
    )

    if (!hasPermission) {
      return ctx.response.forbidden({ message: `Access denied. Required permission: ${options.permission}` })
    }

    return next()
  }
}
