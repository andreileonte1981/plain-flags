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

function getTestServiceEmail(): string | null {
    const explicit = process.env.TEST_SERVICE_EMAIL?.trim();
    if (explicit) return explicit;

    const firebaseProjectId = process.env.FIREBASE_PROJECT_ID?.trim();
    if (!firebaseProjectId) return null;

    return `test-runner@${firebaseProjectId}.cloud.test`;
}

/**
 * Fastify preHandler that verifies the Authorization Bearer token.
 *
 * Accepts Firebase ID tokens issued by Firebase Auth for users that were
 * explicitly provisioned in Plain Flags.
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
        const tokenEmail = decodedToken.email ?? "";
        const configuredTestEmail = getTestServiceEmail();

        if (configuredTestEmail && tokenEmail && tokenEmail.toLowerCase() === configuredTestEmail.toLowerCase()) {
            const existingByEmail = await User.findOneBy({ email: tokenEmail });

            if (existingByEmail) {
                if (existingByEmail.firebase_uid !== decodedToken.uid) {
                    existingByEmail.firebase_uid = decodedToken.uid;
                    await existingByEmail.save();
                }
                user = existingByEmail;
            } else {
                user = User.create({
                    firebase_uid: decodedToken.uid,
                    email: tokenEmail,
                    role: Role.USER,
                });
                await user.save();
            }
        } else {
            reply.code(403).send({ message: "Forbidden" });
            return;
        }
    }

    (request as any).user = user;
}
