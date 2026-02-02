import type { HttpContext } from '@adonisjs/core/http'
import ActivityService from '#services/activity_service'
import Activity from '#models/activity'
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
      const search = request.input('search')
      const entityType = request.input('entityType')

      // For now, we'll get all activities and filter client-side since the service doesn't support search/entityType
      // TODO: Update ActivityService to support search and entityType filtering
      const activities = await ActivityService.getAllActivities({
        limit: search || entityType ? 1000 : limit, // Get more if filtering
        offset: search || entityType ? 0 : offset,
        action,
        userId,
        startDate,
        endDate,
      })

      // Apply client-side filtering if needed
      let filteredActivities = activities
      if (search) {
        const searchLower = search.toLowerCase()
        filteredActivities = filteredActivities.filter(activity =>
          activity.user.username.toLowerCase().includes(searchLower) ||
          activity.action.toLowerCase().includes(searchLower) ||
          (activity.metadata && JSON.stringify(activity.metadata).toLowerCase().includes(searchLower))
        )
      }

      if (entityType) {
        filteredActivities = filteredActivities.filter(activity => {
          if (entityType === 'file') return activity.fileId !== null
          if (entityType === 'folder') return activity.folderId !== null
          if (entityType === 'user') return !activity.fileId && !activity.folderId
          return true
        })
      }

      // Apply pagination after filtering
      const paginatedActivities = (search || entityType) ?
        filteredActivities.slice(offset, offset + limit) : filteredActivities

      // Transform activities to include entityType and details for frontend compatibility
      const transformedActivities = paginatedActivities.map(activity => {
        let entityType = 'unknown'
        let entityId = null
        let details = activity.metadata || null

        if (activity.fileId) {
          entityType = 'file'
          entityId = activity.fileId
          // Merge metadata with file data
          if (activity.file) {
            details = {
              ...details,
              id: activity.file.id,
              originalName: activity.file.originalName,
              mimeType: activity.file.mimeType,
              size: activity.file.size,
            }
          }
        } else if (activity.folderId) {
          entityType = 'folder'
          entityId = activity.folderId
          // Merge metadata with folder data
          if (activity.folder) {
            details = {
              ...details,
              id: activity.folder.id,
              name: activity.folder.name,
            }
          }
        } else {
          // For user-related activities
          entityType = 'user'
          entityId = activity.userId
        }

        return {
          id: activity.id,
          action: activity.action,
          entityType,
          entityId,
          details,
          ipAddress: activity.ipAddress,
          userAgent: activity.userAgent,
          createdAt: activity.createdAt.toISO(),
          user: {
            id: activity.user.id,
            username: activity.user.username,
            email: activity.user.email,
          },
        }
      })

      return response.ok({
        data: transformedActivities,
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

      // Get total count for meta
      const totalQuery = Activity.query().where('user_id', user.id)
      if (action) {
        totalQuery.where('action', action)
      }
      if (startDate) {
        totalQuery.where('created_at', '>=', startDate)
      }
      if (endDate) {
        totalQuery.where('created_at', '<=', endDate)
      }
      const totalResult = await totalQuery.count('* as total')
      const total = totalResult[0]?.$extras?.total || 0

      return response.ok({
        data: activities,
        meta: {
          page,
          limit,
          total,
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
