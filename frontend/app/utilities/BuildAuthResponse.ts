import { NextResponse } from "next/server";

/* 
    This function takes an AuthenticationResponseDTO object returned from the backend, extracts its fields, and builds
    a NextResponse object that can be returned from an internal API endpoint.
    
    Only the access token is returned in the response body. The refresh token is set in an HTTP-only cookie.
*/

export default function buildAuthReponse(parsedJson: any) : NextResponse {
    const userId: number = parsedJson.user_id;
    const accessToken: string = parsedJson.access_token;
    const refreshToken: string = parsedJson.refresh_token;

    // Return the access token in the response body and set the refresh token in an HTTP-only cookie.
    let authResponse: NextResponse = NextResponse.json(
        { user_id: userId, access_token: accessToken },
        { status: 200, statusText: "User authenticated successfully."}
    );
    authResponse.cookies.set({
        name: "refresh_token",
        value: refreshToken,
        httpOnly: true,
        sameSite: "lax",
        path: "/api/refresh" // To be attached to all requests to the refresh endpoint.
    });
    return authResponse;
}