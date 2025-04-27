import {NextResponse} from 'next/server'
import type {NextRequest} from 'next/server'
import {jwtVerify} from "jose";

// JWT 密钥
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    // 如果是公开路径，直接放行
    if (
        pathname === '/login' ||
        pathname === '/register' ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname === '/favicon.ico'
    ) {
        return NextResponse.next()
    }

    // 检查认证状态
    const token = request.cookies.get('token')
    if (!token) {
        return redirectToLogin(request, pathname)
    }

    try {
        // 使用 jose 验证 token
        const {payload} = await jwtVerify(token.value, JWT_SECRET)

        // 如果 token 没有 exp 字段，则拒绝该 token
        if (!payload.exp) {
            throw new Error('Token missing expiration claim')
        }

        // 检查 token 是否过期
        if (Date.now() >= payload.exp * 1000) {
            throw new Error('Token expired')
        }

        return NextResponse.next()
    } catch (error) {
        console.error('Token validation failed:', error)
        const response = redirectToLogin(request, pathname)
        response.cookies.delete('token')
        return response
    }
}

function redirectToLogin(request: NextRequest, from: string) {
    const params = new URLSearchParams()
    params.set('from', from)
    return NextResponse.redirect(new URL(`/login?${params.toString()}`, request.url))
}

// 配置需要进行中间件处理的路径
export const config = {
    matcher: [

        /*
         * 匹配所有路径除了:
         * /login
         * /_next (Next.js 系统文件)
         * /api/public (公开API)
         * /favicon.ico, /images 等静态资源
         */
        '/((?!login|_next|_next/image|api/public|favicon.ico|images|manifest.json|apple-touch-icon.png|apple-touch-icon-precomposed.png).*)',
    ],
}
