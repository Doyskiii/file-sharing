import { BaseCommand } from '@adonisjs/core/ace'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'

export default class HashExistingPasswords extends BaseCommand {
  static commandName = 'hash:passwords'
  static description = 'Hash existing plain text passwords'

  async run() {
    const users = await User.all()
    
    for (const user of users) {
      // Check if password is already hashed (bcrypt/scrypt hashes start with $)
      if (!user.password.startsWith('$')) {
        this.logger.info(`Hashing password for user: ${user.email}`)
        user.password = await hash.make(user.password)
        await user.save()
      }
    }
    
    this.logger.success('All passwords hashed!')
  }
}