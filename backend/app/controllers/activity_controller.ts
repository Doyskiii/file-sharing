import type { HttpContext } from '@adonisjs/core/http'
import ActivityService from '#services/activity_service'
import type { ActivityAction } from '#models/activity'

export default class ActivityController {
  /**
   * GET /activities - List all activities (admin only)
   */
  async index({ request, response }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const limit = request.input('limit', 50)
      const offset = (page - 1) * limit

      const action = request.input('action') as ActivityAction | undefined
      const userId = request.input('userId') ? parseInt(request.input('userId')) : undefined
      const startDate = request.input('startDate')
        ? new Date(request.input('startDate'))
        : undefined
      const endDate = request.input('endDate') ? new Date(request.input('endDate')) : undefined

      const activities = await ActivityService.getAllActivities({
        limit,
        offset,
        action,
        userId,
        startDate,
        endDate,
      })

      return response.ok({
        data: activities,
        meta: {
          page,
          limit,
        },
      })
    } catch (error) {
      console.error('Get activities error:', error)
      return response.internalServerError({ message: 'Failed to fetch activities', error })
    }
  }

  /**
   * GET /activities/me - List current user's activities
   */
  async myActivities({ request, response, auth }: HttpContext) {
    try {
      const user = auth.user!
      const page = request.input('page', 1)
      const limit = request.input('limit', 50)
      const offset = (page - 1) * limit

      const action = request.input('action') as ActivityAction | undefined
      const startDate = request.input('startDate')
        ? new Date(request.input('startDate'))
        : undefined
      const endDate = request.input('endDate') ? new Date(request.input('endDate')) : undefined

      const activities = await ActivityService.getUserActivities(user.id, {
        limit,
        offset,
        action,
        startDate,
        endDate,
      })

      return response.ok({
        data: activities,
        meta: {
          page,
          limit,
        },
      })
    } catch (error) {
      console.error('Get my activities error:', error)
      return response.internalServerError({ message: 'Failed to fetch activities', error })
    }
  }

  /**
   * GET /activities/file/:id - List activities for specific file
   */
  async fileActivities({ params, request, response, auth }: HttpContext) {
    try {
      const user = auth.user!
      const fileId = parseInt(params.id)

      if (isNaN(fileId)) {
        return response.badRequest({ message: 'Invalid file ID' })
      }

      // TODO: Check if user has access to this file
      // For now, we'll allow it if they're the owner or have it shared with them

      const page = request.input('page', 1)
      const limit = request.input('limit', 50)
      const offset = (page - 1) * limit

      const activities = await ActivityService.getFileActivities(fileId, {
        limit,
        offset,
      })

      return response.ok({
        data: activities,
        meta: {
          page,
          limit,
        },
      })
    } catch (error) {
      console.error('Get file activities error:', error)
      return response.internalServerError({ message: 'Failed to fetch file activities', error })
    }
  }

  /**
   * GET /activities/user/:id - List activities for specific user (admin only)
   */
  async userActivities({ params, request, response }: HttpContext) {
    try {
      const userId = parseInt(params.id)

      if (isNaN(userId)) {
        return response.badRequest({ message: 'Invalid user ID' })
      }

      const page = request.input('page', 1)
      const limit = request.input('limit', 50)
      const offset = (page - 1) * limit

      const action = request.input('action') as ActivityAction | undefined
      const startDate = request.input('startDate')
        ? new Date(request.input('startDate'))
        : undefined
      const endDate = request.input('endDate') ? new Date(request.input('endDate')) : undefined

      const activities = await ActivityService.getUserActivities(userId, {
        limit,
        offset,
        action,
        startDate,
        endDate,
      })

      return response.ok({
        data: activities,
        meta: {
          page,
          limit,
        },
      })
    } catch (error) {
      console.error('Get user activities error:', error)
      return response.internalServerError({ message: 'Failed to fetch user activities', error })
    }
  }

  /**
   * GET /activities/stats - Get activity statistics (admin only)
   */
  async statistics({ request, response }: HttpContext) {
    try {
      const userId = request.input('userId') ? parseInt(request.input('userId')) : undefined
      const startDate = request.input('startDate')
        ? new Date(request.input('startDate'))
        : undefined
      const endDate = request.input('endDate') ? new Date(request.input('endDate')) : undefined

      const stats = await ActivityService.getStatistics({
        userId,
        startDate,
        endDate,
      })

      return response.ok(stats)
    } catch (error) {
      console.error('Get activity statistics error:', error)
      return response.internalServerError({
        message: 'Failed to fetch activity statistics',
        error,
      })
    }
  }

  /**
   * GET /activities/stats/me - Get current user's activity statistics
   */
  async myStatistics({ request, response, auth }: HttpContext) {
    try {
      const user = auth.user!
      const startDate = request.input('startDate')
        ? new Date(request.input('startDate'))
        : undefined
      const endDate = request.input('endDate') ? new Date(request.input('endDate')) : undefined

      const stats = await ActivityService.getStatistics({
        userId: user.id,
        startDate,
        endDate,
      })

      return response.ok(stats)
    } catch (error) {
      console.error('Get my activity statistics error:', error)
      return response.internalServerError({
        message: 'Failed to fetch activity statistics',
        error,
      })
    }
  }
}
