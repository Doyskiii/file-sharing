import type { HttpContext } from '@adonisjs/core/http'
import Permission from '#models/permission'

export default class PermissionController {
  // GET All permissions
  async index({ response }: HttpContext) {
    try {
      const permissions = await Permission.all()
      return response.ok(permissions)
    } catch (error) {
      return response.internalServerError({ message: 'Failed to fetch permissions', error })
    }
  }
}
