import axios from "axios";
import { getServerSession } from "next-auth/next";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "../auth/authOptions";
import { IGoogleApiTokenResponse } from "../../../../interfaces/IGoogleApiTokenResponse.interface";

/**
 * Handles the GET request to refresh the Google access token.
 * @param req The request object containing necessary information.
 * @returns A response containing the refreshed access token.
 */
export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  const session = await getServerSession(authOptions);
  try {
    if (session && token) {
      const url =
        "https://oauth2.googleapis.com/token?" +
        new URLSearchParams({
          clientId: process.env.GOOGLE_ID as string,
          clientSecret: process.env.GOOGLE_SECRET as string,
          grant_type: "refresh_token",
          refresh_token: token.refreshToken!,
        });

      const response = await axios.post<IGoogleApiTokenResponse>(url, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      return NextResponse.json({ ...response.data });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: `Cannot not be able to refresh the access token.`,
    });
  }
}
