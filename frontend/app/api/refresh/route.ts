import { EXTERNAL_API_ROOT } from "@/app/constants";
import { NextResponse } from "next/server";
import Cookies from "universal-cookie";

import buildAuthReponse from "@/app/utilities/buildAuthResponse";

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

        const parsedJson = await response.json();
        // Http-Only cookie is attached to the response by the buildAuthResponse function
        return buildAuthReponse(parsedJson);

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error forwarding the refresh request" }, { status: 500 });
    }
}