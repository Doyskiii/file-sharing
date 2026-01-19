import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Role from '#models/role'
import ActivityService from '#services/activity_service'

export default class UserController {
  // POST new user
  async store(ctx: HttpContext) {
    const { request, response } = ctx
    try {
      const { registerUserValidator } = await import('#validators/register_user')
      const payload = await request.validateUsing(registerUserValidator)
      const user = await User.create(payload)

      // Log user creation activity
      await ActivityService.logFromContext(ctx, 'user:create', {
        metadata: {
          username: user.username,
          email: user.email,
        },
      })

      return response.created(user)
    } catch (error) {
      return response.internalServerError({ message: 'Failed to create user', error })
    }
  }

  // GET All users
  async index({ response }: HttpContext) {
    try {
      const users = await User.query().preload('roles')
      return response.ok(users)
    } catch (error) {
      return response.internalServerError({ message: 'Failed to fetch users', error })
    }
  }

  // GET user by id
  async show({ params, response }: HttpContext) {
    try {
      const userId = parseInt(params.id)
      if (isNaN(userId)) {
        return response.badRequest({ message: 'Invalid user ID' })
      }
      const user = await User.query().where('id', userId).preload('roles').first()
      if (!user) {
        return response.notFound({ message: 'User not found' })
      }
      return response.ok(user)
    } catch (error) {
      return response.internalServerError({ message: 'Failed to fetch user', error })
    }
  }

  // PUT user by id
  async update(ctx: HttpContext) {
    const { params, request, response, auth } = ctx
    try {
      const userId = parseInt(params.id)
      if (isNaN(userId)) {
        return response.badRequest({ message: 'Invalid user ID' })
      }
      const user = await User.find(userId)
      if (!user) {
        return response.notFound({ message: 'User not found' })
      }
      const { updateUserValidator } = await import('#validators/update_user')
      const payload = await request.validateUsing(updateUserValidator)
      user.merge(payload)
      await user.save()
      await user.load('roles')

      // Log user update activity
      await ActivityService.logFromContext(ctx, 'user:update', {
        metadata: {
          userId: userId,
          username: user.username,
          email: user.email,
          changes: payload,
        },
      })

      return response.ok(user)
    } catch (error) {
      return response.internalServerError({ message: 'Failed to update user', error })
    }
  }

  // DELETE user by id (optional)
  async destroy(ctx: HttpContext) {
    const { params, response } = ctx
    try {
      const userId = parseInt(params.id)
      if (isNaN(userId)) {
        return response.badRequest({ message: 'Invalid user ID' })
      }
      const user = await User.find(userId)
      if (!user) {
        return response.notFound({ message: 'User not found' })
      }

      // Log user delete activity before deleting
      await ActivityService.logFromContext(ctx, 'user:delete', {
        metadata: {
          userId: userId,
          username: user.username,
          email: user.email,
        },
      })

      await user.delete()
      return response.ok({ message: 'User deleted successfully' })
    } catch (error) {
      return response.internalServerError({ message: 'Failed to delete user', error })
    }
  }

  // POST assign role for user by id
  async assignRole(ctx: HttpContext) {
    const { params, request, response } = ctx
    try {
      const userId = parseInt(params.id)
      if (isNaN(userId)) {
        return response.badRequest({ message: 'Invalid user ID' })
      }
      const { roleId } = request.only(['roleId']);

      // Validasi: Pastikan user dan role ada
      const user = await User.find(userId);
      const role = await Role.find(roleId);
      if (!user || !role) {
        return response.status(404).send({ error: 'User or Role not found' });
      }

      // Cek apakah role sudah di-assign
      const existingRole = await user.related('roles').query().where('roles.id', roleId).first();
      if (existingRole) {
        return response.status(400).send({ error: 'Role already assigned to this user' });
      }

      // Simpan relasi dengan attach melalui relasi manyToMany
      await user.related('roles').attach([roleId]);

      // Preload roles on user before returning
      await user.load('roles');

      // Log role assignment activity
      await ActivityService.logFromContext(ctx, 'role:assign', {
        metadata: {
          userId: userId,
          roleId: roleId,
          username: user.username,
          roleName: role.name,
        },
      })

      // Return response
      return response.status(200).send({ message: 'Role assigned successfully', user: user, role: role });
    } catch (error) {
      return response.internalServerError({ message: 'Failed to assign role', error });
    }
  }
}
