import type { HttpContext } from '@adonisjs/core/http'
import Role from '#models/role'
import Permission from '#models/permission'

export default class RoleController {
  // GET All roles
  async index({ response }: HttpContext) {
    try {
      const roles = await Role.query().preload('permissions')
      return response.ok(roles)
    } catch (error) {
      return response.internalServerError({ message: 'Failed to fetch roles', error })
    }
  }

  // GET role by id
  async show({ params, response }: HttpContext) {
    try {
      const role = await Role.query().where('id', params.id).preload('permissions').first()
      if (!role) {
        return response.notFound({ message: 'Role not found' })
      }
      return response.ok(role)
    } catch (error) {
      return response.internalServerError({ message: 'Failed to fetch role', error })
    }
  }

  // POST new role
  async store({ request, response }: HttpContext) {
    try {
      const { createRoleValidator } = await import('#validators/create_role')
      const payload = await request.validateUsing(createRoleValidator)
      const role = await Role.create(payload)
      return response.created(role)
    } catch (error) {
      return response.internalServerError({ message: 'Failed to create role', error })
    }
  }

  // PUT role by id
  async update({ params, request, response }: HttpContext) {
    try {
      const role = await Role.find(params.id)
      if (!role) {
        return response.notFound({ message: 'Role not found' })
      }
      const { updateRoleValidator } = await import('#validators/update_role')
      const payload = await request.validateUsing(updateRoleValidator)
      role.merge(payload)
      await role.save()
      await role.load('permissions')
      return response.ok(role)
    } catch (error) {
      return response.internalServerError({ message: 'Failed to update role', error })
    }
  }

  // DELETE role by id
  async destroy({ params, response }: HttpContext) {
    try {
      const role = await Role.find(params.id)
      if (!role) {
        return response.notFound({ message: 'Role not found' })
      }
      await role.delete()
      return response.ok({ message: 'Role deleted successfully' })
    } catch (error) {
      return response.internalServerError({ message: 'Failed to delete role', error })
    }
  }

  // POST assign permission for role by id
  async assignPermission({ params, request, response }: HttpContext) {
    try {
      const role = await Role.find(params.id)
      if (!role) {
        return response.notFound({ message: 'Role not found' })
      }
      const { permissionId } = request.only(['permissionId'])
      const permission = await Permission.find(permissionId)
      if (!permission) {
        return response.notFound({ message: 'Permission not found' })
      }
      await role.related('permissions').attach([permissionId])
      await role.load('permissions')
      return response.ok(role)
    } catch (error) {
      return response.internalServerError({ message: 'Failed to assign permission', error })
    }
  }
}
