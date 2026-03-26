import * as admin from "firebase-admin";
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

/**
 * Fastify preHandler that verifies the Authorization Bearer token.
 *
 * Accepts Firebase ID tokens issued by Firebase Auth (dashboard users and
 * cloud-test runner). Users are auto-provisioned with Role.USER on their
 * first authenticated request.
 */
export async function requireAuth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        reply.code(401).send({ message: "Unauthorized" });
        return;
    }

    const idToken = authHeader.substring(7);

    let decodedToken: admin.auth.DecodedIdToken;
    try {
        decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch {
        reply.code(401).send({ message: "Unauthorized" });
        return;
    }

    let user = await User.findOneBy({ firebase_uid: decodedToken.uid });
    if (!user) {
        try {
            user = User.create({
                firebase_uid: decodedToken.uid,
                email: decodedToken.email ?? "",
                role: Role.USER,
            });
            await user.save();
        } catch {
            // Unique constraint — concurrent first-request race; fall back to email lookup
            user = await User.findOneBy({ email: decodedToken.email ?? "" }) ?? null;
            if (!user) {
                reply.code(403).send({ message: "Forbidden" });
                return;
            }
        }
    }

    (request as any).user = user;
}
