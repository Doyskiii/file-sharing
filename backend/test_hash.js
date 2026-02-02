import hash from '@adonisjs/core/services/hash'

async function testHash() {
  const password = 'Superadmin123'
  const hashed = '$scrypt$n=16384,r=8,p=1$MlivugDNR2fQ7J+G4N0T0A$wFZT7+s2HrGV2PujxGckZBf0SBsQwwgrSbZGc/zXsUeahLuqO8JZ+LsHkHtldW/doU50oXlIO/BzSog72QKRtg'

  const isValid = await hash.verify(hashed, password)
  console.log('Password valid:', isValid)
}

testHash()
