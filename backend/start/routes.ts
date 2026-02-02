/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

import { middleware } from '#start/kernel'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

// Auth routes tanpa prefix
router.get('/login', async ({ response }) => {
  return response.methodNotAllowed({ message: 'Login endpoint requires POST method' })
})
router.post('/register', '#controllers/auth_controller.register')
router.post('/login', '#controllers/auth_controller.login')
router
  .post('/logout', '#controllers/auth_controller.logout')
  .use(middleware.auth({ guards: ['api'] }))
router
  .get('/me', '#controllers/auth_controller.me')
  .use(middleware.auth({ guards: ['api'] }))

// User routes
router
  .group(() => {
    router.post('/users', '#controllers/user_controller.store')
    router.get('/users', '#controllers/user_controller.index')
    router.get('/users/:id', '#controllers/user_controller.show')
    router.put('/users/:id', '#controllers/user_controller.update')
    router.delete('/users/:id', '#controllers/user_controller.destroy')
    router.post('/users/:id/roles', '#controllers/user_controller.assignRole').use(
      middleware.can({ permission: 'user:assign-role' })
    )
    router.delete('/users/:id/roles/:roleId', '#controllers/user_controller.removeRole').use(
      middleware.can({ permission: 'user:assign-role' })
    )
  })
  .use([middleware.auth({ guards: ['api'] }), middleware.is({ role: 'Superadmin' })])

// Role routes
router
  .group(() => {
    router.get('/roles', '#controllers/role_controller.index')
    router.get('/roles/:id', '#controllers/role_controller.show')
    router.post('/roles', '#controllers/role_controller.store')
    router.put('/roles/:id', '#controllers/role_controller.update')
    router.delete('/roles/:id', '#controllers/role_controller.destroy')
    router.post('/roles/:id/assign-permission', '#controllers/role_controller.assignPermission')
  })
  .use([middleware.auth({ guards: ['api'] }), middleware.is({ role: 'Superadmin' })])

// Permission routes
router
  .group(() => {
    router.get('/permissions', '#controllers/permission_controller.index')
  })
  .use([middleware.auth({ guards: ['api'] }), middleware.is({ role: 'Superadmin' })])

// Folder routes
router
  .group(() => {
    router.post('/folders', '#controllers/folder_controller.store')
    router.get('/folders', '#controllers/folder_controller.index')
    router.get('/folders/:id', '#controllers/folder_controller.show')
    router.get('/folders/:id/path', '#controllers/folder_controller.getPath')
    router.put('/folders/:id', '#controllers/folder_controller.update')
    router.delete('/folders/:id', '#controllers/folder_controller.destroy')
    // Handle invalid PUT /folders request
    router.put('/folders', async ({ response }) => {
      return response.badRequest({ message: 'Invalid endpoint. Use PUT /folders/:id to update a specific folder.' })
    })
    // Handle invalid DELETE /folders request
    router.delete('/folders', async ({ response }) => {
      return response.badRequest({ message: 'Invalid endpoint. Use DELETE /folders/:id to delete a specific folder.' })
    })
  })
  .use(middleware.auth({ guards: ['api'] }))

// File routes
router
  .group(() => {
    router.post('/files', '#controllers/file_controller.store')
    router.get('/files', '#controllers/file_controller.index')
    router.get('/files/:id', '#controllers/file_controller.show')
    router.get('/files/:id/download', '#controllers/file_controller.download')
    router.put('/files/:id', '#controllers/file_controller.update')
    router.delete('/files/:id', '#controllers/file_controller.destroy')

    // Encryption routes
    router.post('/files/:id/encrypt', '#controllers/file_controller.encrypt')
    router.post('/files/:id/decrypt', '#controllers/file_controller.decrypt')
    router.get('/files/:id/keys', '#controllers/file_controller.listKeys')
    router.post('/files/:id/keys/share', '#controllers/file_controller.shareKey')

    // File sharing routes (authenticated)
    router.post('/files/:id/share', '#controllers/file_share_controller.shareWithUser')
    router.post('/files/:id/share/public', '#controllers/file_share_controller.createPublicShare')
    router.get('/files/:id/shares', '#controllers/file_share_controller.listFileShares')
    router.get('/files/:id/download/shared', '#controllers/file_share_controller.downloadSharedFile')
  })
  .use(middleware.auth({ guards: ['api'] }))

// Share management routes (authenticated)
router
  .group(() => {
    router.get('/shares/received', '#controllers/file_share_controller.listReceivedShares')
    router.get('/shares/owned', '#controllers/file_share_controller.listOwnedShares')
    router.put('/shares/:id', '#controllers/file_share_controller.update')
    router.delete('/shares/:id', '#controllers/file_share_controller.destroy')
  })
  .use(middleware.auth({ guards: ['api'] }))

// Public share routes (no authentication required)
router.get('/share/:token', '#controllers/file_share_controller.viewPublicShare')
router.get('/share/:token/download', '#controllers/file_share_controller.downloadPublicShare')

// Activity routes (authenticated)
router
  .group(() => {
    // User's own activities
    router.get('/activities/me', '#controllers/activity_controller.myActivities')
    router.get('/activities/stats/me', '#controllers/activity_controller.myStatistics')
    
    // File activities (accessible if user has access to file)
    router.get('/activities/file/:id', '#controllers/activity_controller.fileActivities')
    
    // Admin only routes
    router.get('/activities', '#controllers/activity_controller.index')
      .use(middleware.is({ role: 'Superadmin' }))
    router.get('/activities/user/:id', '#controllers/activity_controller.userActivities')
      .use(middleware.is({ role: 'Superadmin' }))
    router.get('/activities/stats', '#controllers/activity_controller.statistics')
      .use(middleware.is({ role: 'Superadmin' }))
  })
  .use(middleware.auth({ guards: ['api'] }))
