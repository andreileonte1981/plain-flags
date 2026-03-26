import * as admin from "firebase-admin";
import { OAuth2Client } from "google-auth-library";
import { FastifyReply, FastifyRequest } from "fastify";
import User, { Role } from "../entities/User";

// Initialize Firebase Admin SDK using Application Default Credentials
// (Cloud Run service account will automatically be used)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
    });
}

export const firebaseAdmin = admin;

const googleAuthClient = new OAuth2Client();

/**
 * Decode a JWT without verifying signature (for inspecting claims).
 */
function decodeJwt(token: string): Record<string, any> | null {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;
        const payload = Buffer.from(parts[1], "base64url").toString("utf8");
        return JSON.parse(payload);
    } catch {
        return null;
    }
}

/**
 * Fastify preHandler that verifies the Authorization Bearer token.
 *
 * Accepts two token types:
 *  1. Firebase ID token — issued by Firebase Auth to dashboard users.
 *  2. Google OIDC identity token — issued by GCP to service accounts (e.g. the cloud-test runner).
 *     The service account email must match CLOUD_TEST_SERVICE_ACCOUNT env var, and is
 *     granted USER role automatically so authenticated requests can reach flag endpoints.
 */
export async function requireAuth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        reply.code(401).send({ message: "Unauthorized" });
        return;
    }

    const idToken = authHeader.substring(7);

    // Peek at the issuer to decide how to verify
    const payload = decodeJwt(idToken);
    const issuer: string = payload?.iss ?? "";

    // Google OIDC service account token (issued by Google's OAuth server)
    if (
        issuer === "https://accounts.google.com" ||
        issuer.startsWith("https://securetoken.google.com/") === false &&
        issuer.includes("accounts.google.com")
    ) {
        const allowedServiceAccount = process.env.CLOUD_TEST_SERVICE_ACCOUNT;
        if (!allowedServiceAccount) {
            reply.code(403).send({ message: "Service account calls not configured" });
            return;
        }

        try {
            // Verify Google OIDC service account token using google-auth-library.
            // tokeninfo does not work for tokens with custom audience values (Cloud Run URLs).
            const ticket = await googleAuthClient.verifyIdToken({ idToken });
            const tokenPayload = ticket.getPayload();
            if (!tokenPayload || tokenPayload.email !== allowedServiceAccount) {
                reply.code(403).send({ message: "Forbidden: service account not permitted" });
                return;
            }
            // Synthesise a User object for the request — no DB look-up needed for service accounts
            const syntheticUser = new User();
            syntheticUser.firebase_uid = tokenPayload.sub ?? tokenPayload.email!;
            syntheticUser.email = tokenPayload.email!;
            syntheticUser.role = Role.USER;
            (request as any).user = syntheticUser;
            return;
        } catch {
            reply.code(401).send({ message: "Unauthorized" });
            return;
        }
    }

    // Firebase ID token
    let decodedToken: admin.auth.DecodedIdToken;
    try {
        decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch {
        reply.code(401).send({ message: "Unauthorized" });
        return;
    }

    const user = await User.findOneBy({ firebase_uid: decodedToken.uid });
    if (!user) {
        reply.code(403).send({ message: "Forbidden: user not provisioned" });
        return;
    }

    (request as any).user = user;
}
