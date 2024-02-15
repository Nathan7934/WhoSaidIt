import { EXTERNAL_API_ROOT } from "@/app/constants";
import { NextResponse } from "next/server";
import Cookies from "universal-cookie";

/* 
    This server-side NextJS route is used as an HTTP proxy to the SpringBoot backend API.
    It is used pass a refresh token to the backend and return a new JWT access token.

    This endpoint extracts the refresh token stored as an HTTP-only cookie.
    Assuming the NextJS '/api/auth' endpoint has been used to verify the user's credentials, the refresh token will be
    attached automatically to the request header by the browser when calling '/api/refresh'.
*/

export async function GET(req: Request): Promise<NextResponse> {
    console.log("GET http proxy: /api/refresh");

    const cookies = new Cookies(req.headers.get("cookie"));
    const refreshToken: string = cookies.get("refresh_token");
    const rememberUser: boolean = cookies.get("remember_user");

    if (!refreshToken) {
        return NextResponse.json({ error: "No refresh token found" }, { status: 401 });
    }

    const requestUrl: string = `${EXTERNAL_API_ROOT}/auth/refresh`;

    try {
        const response: Response = await fetch(requestUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${refreshToken}`
            }
        });
        if (!response.ok) {
            return NextResponse.json({ error: response.statusText }, { status: response.status });
        }

        const { user_id, access_token, refresh_token } = await response.json();
        
        // Build the response to be returned to the client
        let authResponse: NextResponse = NextResponse.json(
            { user_id: user_id, access_token: access_token },
            { status: 200, statusText: "User authenticated successfully." }
        );
        // Http-Only cookie is attached to the response to store the refresh token (if rememberUser is false, we use a session cookie instead)
        authResponse.cookies.set({
            name: "refresh_token",
            value: refresh_token,
            httpOnly: true,
            sameSite: "lax",
            path: "/api/refresh",
            // Optionally add maxAge if rememberUser is true
            ...(rememberUser && { maxAge: 60 * 60 * 24 * 7 }) // 7 days
        });
        // If remember user is true, we need to update the remember_user cookie to restart the 7 day timer
        if (rememberUser) {
            authResponse.cookies.set({
                name: "remember_user",
                value: "true",
                sameSite: "lax",
                path: "/api/refresh",
                maxAge: 60 * 60 * 24 * 7 // 7 days
            });
        }

        return authResponse;

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error forwarding the refresh request" }, { status: 500 });
    }
}