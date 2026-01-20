import env from '#start/env'
import { defineConfig } from '@adonisjs/drive'

const driveConfig = defineConfig({
  default: env.get('DRIVE_DISK', 'local'),
  disks: {
    local: {
      driver: 'local',
      basePath: './uploads',
      serveFiles: true,
      visibility: 'public',
    },
  },
})

export default driveConfig
