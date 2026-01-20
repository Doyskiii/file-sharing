import { NextRequest, NextResponse } from "next/server";
import { REDIRECT_ROUTE } from "./constant/redirect-route";

export default async function middleware(req: NextRequest) {

    const path = req.nextUrl.pathname
    
    if(path in REDIRECT_ROUTE) return NextResponse.redirect(new URL(REDIRECT_ROUTE[path as keyof typeof REDIRECT_ROUTE], req.url))

    // const { decryptedAccessToken } = await getSession()

    // if (!decryptedAccessToken) return NextResponse.redirect(new URL('/login', req.url))


    // if (is_route_public) {
    //     return NextResponse.redirect(new URL('/dashboard', req.url))
    // }

    // const matchedRoute = URL_AND_AVAILABILITY_FOR_MIDDLEWARE.find(route =>
    //     path.startsWith(route.url.toString())
    // )

    // if (matchedRoute) {

    //     const user_role = decryptedAccessToken.role_id

    //     if (!matchedRoute.available_to.includes(user_role)) {
    //         return NextResponse.redirect(new URL('/unauthorized', req.url))
    //     }
    // }

    return NextResponse.next()

}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}