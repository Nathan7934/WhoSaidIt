import { EXTERNAL_API_ROOT } from "@/app/constants";
import { NextResponse } from "next/server";

/*
    This server-side NextJS route is used as an HTTP proxy to the SpringBoot backend API.
    It is used to authenticate a user's credentials and return a JWT access token.

    We use a proxy so that we can store the refresh token in an HTTP-only cookie.
    This prevents the refresh token from being accessed by client-side JavaScript, which is a security risk.
*/

interface ClientRequest {
    username: string;
    password: string;
    rememberUser: boolean;
}
interface AuthRequest {
    username: string;
    password: string;
}
export async function POST(req: Request): Promise<NextResponse> {

    console.log("POST http proxy: /api/auth");

    const clientRequestBody: ClientRequest = await req.json();
    const rememberUser: boolean = clientRequestBody.rememberUser;
    const authRequestBody: AuthRequest = {
        username: clientRequestBody.username,
        password: clientRequestBody.password
    };

    const requestUrl: string = `${EXTERNAL_API_ROOT}/auth/authenticate`;

    try {
        const response: Response = await fetch(requestUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(authRequestBody)
        });
        if (!response.ok) {
            return NextResponse.json({ error: response.statusText }, { status: response.status });
        }

        const { user_id, access_token, refresh_token } = await response.json(); // Extract the response from the SpringBoot backend

        // Build the response to be returned to the client
        let authResponse: NextResponse = NextResponse.json(
            { user_id: user_id, access_token: access_token },
            { status: 200, statusText: "User authenticated successfully." }
        );
        // Http-Only cookie is attached to the response to store the refresh token (if rememberUser is false, we use a session cookie instead)
        // The browser will store this token and automatically send it with every request to the /api/refresh endpoint
        authResponse.cookies.set({
            name: "refresh_token",
            value: refresh_token,
            httpOnly: true,
            sameSite: "lax",
            path: "/api/refresh",
            // Optionally add maxAge if rememberUser is true
            ...(rememberUser && { maxAge: 60 * 60 * 24 * 7 }) // 7 days
        });
        // Set an additional cookie to indicate whether the user wants to be remembered.
        // This is used to determine whether to set the maxAge of the refresh token cookie on future requests to /api/refresh.
        // (Since we cannot directly read the maxAge of the refresh token cookie)
        authResponse.cookies.set({
            name: "remember_user",
            value: rememberUser.toString(),
            sameSite: "lax",
            path: "/api/refresh",
            // Optionally add maxAge if rememberUser is true
            ...(rememberUser && { maxAge: 60 * 60 * 24 * 7 }) // 7 days
        });

        return authResponse;

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error forwarding the authentication request" }, { status: 500 });
    }
}
