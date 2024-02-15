import { NextResponse } from "next/server";

// This server-side NextJS route is used to log a user out by clearing the refresh token cookie.
// This operation must be done server-side (NextJS) because the refresh token cookie is HTTP-only.

export async function POST(): Promise<NextResponse> {

    let response: NextResponse = new NextResponse(null, { status: 200, statusText: "User logged out successfully." });

    // Clear the refresh token cookie; Set the cookie's expiration date to the past.
    response.cookies.set({
        name: "refresh_token",
        value: "",
        httpOnly: true,
        sameSite: "lax",
        path: "/api/refresh",
        expires: new Date(0)
    });

    // Clear the remember_user cookie; Set the cookie's expiration date to the past.
    response.cookies.set({
        name: "remember_user",
        value: "",
        sameSite: "lax",
        path: "/api/refresh",
        expires: new Date(0)
    });

    return response;
}