import User, { Role } from "../entities/User";
import { firebaseAdmin } from "../middleware/firebaseAuth";

export default class Users {
    /**
     * If no users exist, create the superadmin from SUPERADMIN_EMAIL.
     * Creates a Firebase Auth user (or reuses an existing one) and inserts a DB row.
     */
    static async makeAdminIfNone(): Promise<void> {
        const count = await User.count();
        if (count > 0) return;

        const email = process.env.SUPERADMIN_EMAIL;
        if (!email) {
            throw new Error("SUPERADMIN_EMAIL env var is required to bootstrap the superadmin");
        }

        // Create or retrieve the Firebase Auth user
        let firebaseUser: import("firebase-admin/auth").UserRecord;
        try {
            firebaseUser = await firebaseAdmin.auth().getUserByEmail(email);
        } catch {
            // User doesn't exist in Firebase — create without a password;
            // the admin must use the "forgot password" flow or Firebase Console to set one.
            firebaseUser = await firebaseAdmin.auth().createUser({ email });
        }

        const superadmin = new User();
        superadmin.firebase_uid = firebaseUser.uid;
        superadmin.email = email;
        superadmin.role = Role.SUPERADMIN;
        await User.insert(superadmin);

        console.log(`Superadmin created: ${email}`);
        try {
            const resetLink = await firebaseAdmin.auth().generatePasswordResetLink(email);
            console.log(`Superadmin password reset link: ${resetLink}`);
        } catch (err) {
            console.log(`Could not generate superadmin reset link: ${err}`);
        }
    }
}
