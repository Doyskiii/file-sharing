import type { HttpContext } from '@adonisjs/core/http'
import Folder from '#models/folder'
import ActivityService from '#services/activity_service'

export default class FolderController {
  /**
   * POST /folders - Create new folder
   */
  async store(ctx: HttpContext) {
    const { request, response, auth } = ctx
    try {
      const user = auth.user!
      const { createFolderValidator } = await import('#validators/create_folder')
      const payload = await request.validateUsing(createFolderValidator)

      // Validate parent folder exists and belongs to user if parentId provided
      if (payload.parentId) {
        const parentFolder = await Folder.query()
          .where('id', payload.parentId)
          .where('owner_id', user.id)
          .first()

        if (!parentFolder) {
          return response.notFound({ message: 'Parent folder not found or access denied' })
        }
      }

      // Check if folder with same name exists in same parent
      let existingQuery = Folder.query()
        .where('name', payload.name)
        .where('owner_id', user.id)

      if (payload.parentId) {
        existingQuery = existingQuery.where('parent_id', payload.parentId)
      } else {
        existingQuery = existingQuery.whereNull('parent_id')
      }

      const existingFolder = await existingQuery.first()

      if (existingFolder) {
        return response.badRequest({ 
          message: 'Folder with this name already exists in this location' 
        })
      }

      const folder = await Folder.create({
        name: payload.name,
        ownerId: user.id,
        parentId: payload.parentId || null,
      })

      await folder.load('owner')
      await folder.load('parent')

      // Log folder creation activity
      await ActivityService.logFromContext(ctx, 'folder:create', {
        folderId: folder.id,
        metadata: {
          name: folder.name,
          parentId: folder.parentId,
        },
      })

      return response.created(folder)
    } catch (error) {
      return response.internalServerError({ message: 'Failed to create folder', error })
    }
  }

  /**
   * GET /folders - List user's folders
   */
  async index({ response, auth, request }: HttpContext) {
    try {
      const user = auth.user!
      const parentId = request.input('parentId')

      let query = Folder.query().where('owner_id', user.id)

      // Filter by parent folder if provided
      if (parentId !== undefined) {
        if (parentId === 'null' || parentId === null) {
          query = query.whereNull('parent_id')
        } else {
          query = query.where('parent_id', parentId)
        }
      }

      const folders = await query
        .preload('owner')
        .preload('parent')
        .preload('children')
        .withCount('files')
        .orderBy('name', 'asc')

      return response.ok(folders)
    } catch (error) {
      return response.internalServerError({ message: 'Failed to fetch folders', error })
    }
  }

  /**
   * GET /folders/:id - Get folder details with files
   */
  async show(ctx: HttpContext) {
    const { params, response, auth } = ctx
    try {
      const user = auth.user!
      const folderId = parseInt(params.id)

      if (isNaN(folderId)) {
        return response.badRequest({ message: 'Invalid folder ID' })
      }

      const folder = await Folder.query()
        .where('id', folderId)
        .where('owner_id', user.id)
        .preload('owner')
        .preload('parent')
        .preload('children')
        .preload('files', (query) => {
          query.orderBy('original_name', 'asc')
        })
        .first()

      if (!folder) {
        return response.notFound({ message: 'Folder not found or access denied' })
      }

      // Log folder view activity
      await ActivityService.logFromContext(ctx, 'folder:view', {
        folderId: folder.id,
        metadata: {
          name: folder.name,
          parentId: folder.parentId,
        },
      })

      return response.ok(folder)
    } catch (error) {
      return response.internalServerError({ message: 'Failed to fetch folder', error })
    }
  }

  /**
   * GET /folders/:id/path - Get folder breadcrumb path
   */
  async getPath({ params, response, auth }: HttpContext) {
    try {
      const user = auth.user!
      const folderId = parseInt(params.id)

      if (isNaN(folderId)) {
        return response.badRequest({ message: 'Invalid folder ID' })
      }

      const folder = await Folder.query()
        .where('id', folderId)
        .where('owner_id', user.id)
        .first()

      if (!folder) {
        return response.notFound({ message: 'Folder not found or access denied' })
      }

      // Build path from root to current folder
      const path: Array<{ id: number; name: string }> = []
      let currentFolder: Folder | null = folder

      while (currentFolder) {
        path.unshift({
          id: currentFolder.id,
          name: currentFolder.name,
        })

        if (currentFolder.parentId) {
          currentFolder = await Folder.find(currentFolder.parentId)
        } else {
          currentFolder = null
        }
      }

      return response.ok({ path })
    } catch (error) {
      return response.internalServerError({ message: 'Failed to get folder path', error })
    }
  }

  /**
   * PUT /folders/:id - Update folder (rename/move)
   */
  async update(ctx: HttpContext) {
    const { params, request, response, auth } = ctx
    try {
      const user = auth.user!
      const folderId = parseInt(params.id)

      if (isNaN(folderId)) {
        return response.badRequest({ message: 'Invalid folder ID' })
      }

      const folder = await Folder.query()
        .where('id', folderId)
        .where('owner_id', user.id)
        .first()

      if (!folder) {
        return response.notFound({ message: 'Folder not found or access denied' })
      }

      const { updateFolderValidator } = await import('#validators/update_folder')
      const payload = await request.validateUsing(updateFolderValidator)

      // Validate parent folder if moving
      if (payload.parentId !== undefined) {
        // Prevent moving folder into itself or its children
        if (payload.parentId === folderId) {
          return response.badRequest({ message: 'Cannot move folder into itself' })
        }

        if (payload.parentId) {
          const parentFolder = await Folder.query()
            .where('id', payload.parentId)
            .where('owner_id', user.id)
            .first()

          if (!parentFolder) {
            return response.notFound({ message: 'Parent folder not found or access denied' })
          }

          // Check if parent is a child of current folder (prevent circular reference)
          const isChild = await FolderController.isChildFolder(folderId, payload.parentId)
          if (isChild) {
            return response.badRequest({ 
              message: 'Cannot move folder into its own subfolder' 
            })
          }
        }
      }

      // Check for duplicate name if renaming
      if (payload.name && payload.name !== folder.name) {
        const targetParentId = payload.parentId !== undefined ? payload.parentId : folder.parentId
        
        let duplicateQuery = Folder.query()
          .where('name', payload.name)
          .where('owner_id', user.id)
          .whereNot('id', folderId)

        if (targetParentId) {
          duplicateQuery = duplicateQuery.where('parent_id', targetParentId)
        } else {
          duplicateQuery = duplicateQuery.whereNull('parent_id')
        }

        const existingFolder = await duplicateQuery.first()

        if (existingFolder) {
          return response.badRequest({ 
            message: 'Folder with this name already exists in this location' 
          })
        }
      }

      folder.merge(payload)
      await folder.save()
      await folder.load('owner')
      await folder.load('parent')
      await folder.load('children')

      // Log folder update activity
      await ActivityService.logFromContext(ctx, 'folder:update', {
        folderId: folder.id,
        metadata: {
          name: folder.name,
          parentId: folder.parentId,
          changes: payload,
        },
      })

      return response.ok(folder)
    } catch (error) {
      return response.internalServerError({ message: 'Failed to update folder', error })
    }
  }

  /**
   * DELETE /folders/:id - Delete folder
   */
  async destroy(ctx: HttpContext) {
    const { params, response, auth } = ctx
    try {
      const user = auth.user!
      const folderId = parseInt(params.id)

      if (isNaN(folderId)) {
        return response.badRequest({ message: 'Invalid folder ID' })
      }

      const folder = await Folder.query()
        .where('id', folderId)
        .where('owner_id', user.id)
        .withCount('children')
        .withCount('files')
        .first()

      if (!folder) {
        return response.notFound({ message: 'Folder not found or access denied' })
      }

      // Check if folder has children or files
      const childrenCount = folder.$extras.children_count || 0
      const filesCount = folder.$extras.files_count || 0

      if (childrenCount > 0 || filesCount > 0) {
        return response.badRequest({ 
          message: 'Cannot delete folder with subfolders or files. Please delete contents first.',
          details: {
            subfolders: childrenCount,
            files: filesCount
          }
        })
      }

      // Log folder delete activity before deleting
      await ActivityService.logFromContext(ctx, 'folder:delete', {
        folderId: folder.id,
        metadata: {
          name: folder.name,
          parentId: folder.parentId,
        },
      })

      await folder.delete()

      return response.ok({ message: 'Folder deleted successfully' })
    } catch (error) {
      return response.internalServerError({ message: 'Failed to delete folder', error })
    }
  }

  /**
   * Helper: Check if targetId is a child of folderId
   */
  private static async isChildFolder(folderId: number, targetId: number): Promise<boolean> {
    try {
      let currentFolder: Folder | null = await Folder.find(targetId)

      while (currentFolder !== null && currentFolder.parentId !== null) {
        if (currentFolder.parentId === folderId) {
          return true
        }
        currentFolder = await Folder.find(currentFolder.parentId)
      }

      return false
    } catch (error) {
      console.error('Error in isChildFolder:', error)
      return false
    }
  }
}
