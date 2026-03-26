import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";

function getFirebaseConfig() {
    if (typeof window !== "undefined" && window.ENV?.FIREBASE_CONFIG) {
        return JSON.parse(window.ENV.FIREBASE_CONFIG);
    }
    // Fallback: never reached in production (SSR renders the config into the page)
    throw new Error("Firebase config not available");
}

function getApp() {
    const apps = getApps();
    if (apps.length > 0) return apps[0];
    return initializeApp(getFirebaseConfig());
}

export function getFirebaseAuth() {
    return getAuth(getApp());
}

export async function getIdToken(): Promise<string | null> {
    const auth = getFirebaseAuth();
    const user = auth.currentUser;
    if (!user) return null;
    return user.getIdToken();
}

export async function login(email: string, password: string): Promise<User> {
    const auth = getFirebaseAuth();
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
}

export async function logout(): Promise<void> {
    const auth = getFirebaseAuth();
    await signOut(auth);
}

export function getCurrentUser(): User | null {
    if (typeof window === "undefined") return null;
    return getFirebaseAuth().currentUser;
}
