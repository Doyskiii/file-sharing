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

router.get('/user', '#controllers/user_controller.index')

// Auth routes
router
  .group(() => {
    router.post('/register', '#controllers/auth_controller.register')
    router.post('/login', '#controllers/auth_controller.login')
    router.post('/logout', '#controllers/auth_controller.logout').use(middleware.auth())
    router.get('/me', '#controllers/auth_controller.me').use(middleware.auth())
  })
  .prefix('/auth')

// User routes
router
  .group(() => {
    router.post('/users', '#controllers/user_controller.store')
    router.get('/users', '#controllers/user_controller.index')
    router.get('/users/:id', '#controllers/user_controller.show')
    router.put('/users/:id', '#controllers/user_controller.update')
    router.delete('/users/:id', '#controllers/user_controller.destroy')
    router
      .post('/users/:id/assign-role', '#controllers/user_controller.assignRole')
      .use(middleware.can({ permission: 'user:assign-role' }))
  })
  .use([middleware.auth(), middleware.is({ role: 'Superadmin' })])

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
  .use([middleware.auth(), middleware.is({ role: 'Superadmin' })])

// Permission routes
router
  .group(() => {
    router.get('/permissions', '#controllers/permission_controller.index')
  })
  .use([middleware.auth(), middleware.is({ role: 'Superadmin' })])
