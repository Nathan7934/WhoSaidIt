import { EXTERNAL_API_ROOT } from "@/app/constants";
import { NextResponse } from "next/server";

import buildAuthReponse from "@/app/utilities/buildAuthResponse";

/*
    This server-side NextJS route is used as an HTTP proxy to the SpringBoot backend API.
    It is used to authenticate a user's credentials and return a JWT access token.

    We use a proxy so that we can store the refresh token in an HTTP-only cookie.
    This prevents the refresh token from being accessed by client-side JavaScript, which is a security risk.
*/

interface AuthRequest {
    username: string;
    password: string;
}
export async function POST(req: Request): Promise<NextResponse> {

    console.log("POST http proxy: /api/auth");

    const requestBody: AuthRequest = await req.json();

    const requestUrl: string = `${EXTERNAL_API_ROOT}/auth/authenticate`;

    try {
        const response: Response = await fetch(requestUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });
        if (!response.ok) {
            return NextResponse.json({ error: response.statusText }, { status: response.status });
        }

        const parsedJson = await response.json();
        // Http-Only cookie is attached to the response by the buildAuthResponse function
        return buildAuthReponse(parsedJson);

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error forwarding the authentication request" }, { status: 500 });
    }
}
