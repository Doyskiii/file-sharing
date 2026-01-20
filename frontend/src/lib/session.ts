import 'server-only'
import { EncryptJWT, SignJWT, base64url, decodeJwt, decodeProtectedHeader, jwtDecrypt, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
// import { SessionType } from '@/types/session.type'
import { jwtDecode } from 'jwt-decode'
// import { Mutex } from 'async-mutex'

const isSecureCookies = process.env.BASE_URL_INTERNAL?.startsWith('https://')
const secretKey = base64url.decode(process.env.SESSION_SECRET as string)

// const sessionMutex = new Mutex()

export async function encrypt(payload: any) {
  return new EncryptJWT(payload)
    .setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
    .setIssuedAt()
    .setExpirationTime('5h')
    .encrypt(secretKey)
}

export async function decrypt<T extends Object>(session: string | undefined = '') {

  try {
    const { payload, protectedHeader } = await jwtDecrypt<T>(session, secretKey)
    return payload
  } catch (error: any) {
    throw new Error(error)
  }
}

export async function getSession() {

  try {

    const encryptedAccessToken = (await cookies()).get('sietik-enc-auth-AT')?.value
    // const encryptedRefreshToken = (await cookies()).get('sietik-enc-auth-RT')?.value

    const decryptedAccessToken = await decrypt<any>(encryptedAccessToken)
    // const decryptedRefreshToken = await decrypt<Pick<SessionType.UserData, 'refresh_token'>>(encryptedRefreshToken)
    
    return { 
        decryptedAccessToken,
        // decryptedRefreshToken 
    }

  } catch (error) {

    return { decryptedAccessToken: null, decryptedRefreshToken: null }
  }
}

export async function createSession(data: any ) { //SessionType.UserData

//   return await sessionMutex.runExclusive(async () => {
    try {

      // THIS IS FOR TOKEN-WRAPPER EXPIRATION, SO USER CAN NAVIGATE WEBSITE EVEN THOUGH AT/RT EXPIRED 
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

      // AT & RT ORIGINAL EXPIRATION FROM BACKEND TO ROTATE STALE TOKEN FOR DATA REQUEST
      const accessTokenExpirationOrigin = jwtDecode(data.access_token).exp
      const refreshTokenExpirationOrigin = jwtDecode(data.refresh_token).exp ?? 1

      const accessToken = await encrypt({ ...data })
      const refreshToken = await encrypt({ refresh_token: data.refresh_token})

      const cookieStore = await cookies()

      cookieStore.set('sietik-enc-auth-AT', accessToken, {
        httpOnly: true,
        secure: isSecureCookies,
        expires: expiresAt,
        sameSite: 'lax',
        path: '/',
      })

      cookieStore.set('sietik-enc-auth-RT', refreshToken, {
        httpOnly: true,
        secure: isSecureCookies,
        expires: new Date(Number(refreshTokenExpirationOrigin) * 1000),
        sameSite: 'lax',
        path: '/'
      })

    } catch (error: any) {
      throw new Error(error)
    }
//   })

}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('sietik-enc-auth-AT')
  cookieStore.delete('sietik-enc-auth-RT')
} 