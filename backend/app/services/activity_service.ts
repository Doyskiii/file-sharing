import Activity, { type ActivityAction } from '#models/activity'
import type { HttpContext } from '@adonisjs/core/http'

interface LogActivityParams {
  userId: number
  action: ActivityAction
  fileId?: number | null
  folderId?: number | null
  metadata?: Record<string, any> | null
  ipAddress?: string | null
  userAgent?: string | null
}

export default class ActivityService {
  /**
   * Log any activity
   */
  static async log(params: LogActivityParams): Promise<Activity> {
    return await Activity.create({
      userId: params.userId,
      action: params.action,
      fileId: params.fileId || null,
      folderId: params.folderId || null,
      metadata: params.metadata || null,
      ipAddress: params.ipAddress || null,
      userAgent: params.userAgent || null,
    })
  }

  /**
   * Log activity from HTTP context
   */
  static async logFromContext(
    ctx: HttpContext,
    action: ActivityAction,
    options: {
      fileId?: number | null
      folderId?: number | null
      metadata?: Record<string, any> | null
    } = {}
  ): Promise<Activity | null> {
    const user = ctx.auth.user
    if (!user) return null

    return await this.log({
      userId: user.id,
      action,
      fileId: options.fileId,
      folderId: options.folderId,
      metadata: options.metadata,
      ipAddress: ctx.request.ip(),
      userAgent: ctx.request.header('user-agent'),
    })
  }

  /**
   * Convenience method: Log authentication activity
   */
  static async logAuth(
    userId: number,
    action: 'auth:login' | 'auth:logout' | 'auth:register',
    ipAddress?: string,
    userAgent?: string,
    metadata?: Record<string, any>
  ): Promise<Activity> {
    return await this.log({
      userId,
      action,
      metadata,
      ipAddress,
      userAgent,
    })
  }

  /**
   * Convenience method: Log file activity
   */
  static async logFile(
    userId: number,
    fileId: number,
    action: 'file:upload' | 'file:download' | 'file:update' | 'file:delete' | 'file:view',
    metadata?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<Activity> {
    return await this.log({
      userId,
      action,
      fileId,
      metadata,
      ipAddress,
      userAgent,
    })
  }

  /**
   * Convenience method: Log folder activity
   */
  static async logFolder(
    userId: number,
    folderId: number,
    action: 'folder:create' | 'folder:update' | 'folder:delete' | 'folder:view',
    metadata?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<Activity> {
    return await this.log({
      userId,
      action,
      folderId,
      metadata,
      ipAddress,
      userAgent,
    })
  }

  /**
   * Convenience method: Log share activity
   */
  static async logShare(
    userId: number,
    fileId: number,
    action: 'share:create' | 'share:update' | 'share:delete' | 'share:access' | 'share:download',
    metadata?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<Activity> {
    return await this.log({
      userId,
      action,
      fileId,
      metadata,
      ipAddress,
      userAgent,
    })
  }

  /**
   * Convenience method: Log user management activity
   */
  static async logUser(
    userId: number,
    action: 'user:create' | 'user:update' | 'user:delete',
    metadata?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<Activity> {
    return await this.log({
      userId,
      action,
      metadata,
      ipAddress,
      userAgent,
    })
  }

  /**
   * Convenience method: Log role activity
   */
  static async logRole(
    userId: number,
    action: 'role:assign' | 'role:revoke',
    metadata?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<Activity> {
    return await this.log({
      userId,
      action,
      metadata,
      ipAddress,
      userAgent,
    })
  }

  /**
   * Get activities for a specific user
   */
  static async getUserActivities(
    userId: number,
    options: {
      limit?: number
      offset?: number
      action?: ActivityAction
      startDate?: Date
      endDate?: Date
    } = {}
  ) {
    const query = Activity.query().where('user_id', userId).orderBy('created_at', 'desc')

    if (options.action) {
      query.where('action', options.action)
    }

    if (options.startDate) {
      query.where('created_at', '>=', options.startDate)
    }

    if (options.endDate) {
      query.where('created_at', '<=', options.endDate)
    }

    if (options.limit) {
      query.limit(options.limit)
    }

    if (options.offset) {
      query.offset(options.offset)
    }

    return await query.preload('file').preload('folder')
  }

  /**
   * Get activities for a specific file
   */
  static async getFileActivities(
    fileId: number,
    options: {
      limit?: number
      offset?: number
    } = {}
  ) {
    const query = Activity.query().where('file_id', fileId).orderBy('created_at', 'desc')

    if (options.limit) {
      query.limit(options.limit)
    }

    if (options.offset) {
      query.offset(options.offset)
    }

    return await query.preload('user').preload('file')
  }

  /**
   * Get all activities (admin only)
   */
  static async getAllActivities(options: {
    limit?: number
    offset?: number
    action?: ActivityAction
    userId?: number
    startDate?: Date
    endDate?: Date
  } = {}) {
    const query = Activity.query().orderBy('created_at', 'desc')

    if (options.action) {
      query.where('action', options.action)
    }

    if (options.userId) {
      query.where('user_id', options.userId)
    }

    if (options.startDate) {
      query.where('created_at', '>=', options.startDate)
    }

    if (options.endDate) {
      query.where('created_at', '<=', options.endDate)
    }

    if (options.limit) {
      query.limit(options.limit)
    }

    if (options.offset) {
      query.offset(options.offset)
    }

    return await query.preload('user').preload('file').preload('folder')
  }

  /**
   * Get activity statistics
   */
  static async getStatistics(options: {
    userId?: number
    startDate?: Date
    endDate?: Date
  } = {}) {
    const query = Activity.query()

    if (options.userId) {
      query.where('user_id', options.userId)
    }

    if (options.startDate) {
      query.where('created_at', '>=', options.startDate)
    }

    if (options.endDate) {
      query.where('created_at', '<=', options.endDate)
    }

    // Get total count
    const totalResult = await query.clone().count('* as total')
    const total = totalResult[0]?.$extras?.total || 0

    // Get count by action
    const byActionResult = await query
      .clone()
      .select('action')
      .count('* as count')
      .groupBy('action')
      .orderBy('count', 'desc')

    const byAction = byActionResult.map((item) => ({
      action: item.action,
      count: item.$extras?.count || 0,
    }))

    // Get most active users
    const topUsersResult = await query
      .clone()
      .select('user_id')
      .count('* as count')
      .groupBy('user_id')
      .orderBy('count', 'desc')
      .limit(10)

    const topUsers = topUsersResult.map((item) => ({
      userId: item.userId,
      count: item.$extras?.count || 0,
    }))

    return {
      total,
      byAction,
      byDate: [], // Simplified - can be implemented later if needed
      topUsers,
    }
  }
}
