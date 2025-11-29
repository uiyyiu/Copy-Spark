

// FIX: Switched to Firebase v9 compat libraries to resolve module errors.
// This allows using the older, namespaced API (e.g., firebase.auth()) which is more stable during migrations.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBgCDgFenlAN0N6e_x74QDPC70Rpawqy18",
    authDomain: "spark-688d4.firebaseapp.com",
    projectId: "spark-688d4",
    storageBucket: "spark-688d4.firebasestorage.app",
    messagingSenderId: "413224379989",
    appId: "1:413224379989:web:635e5ceb8ba0b89e2f56dc",
    measurementId: "G-LJ91XW9D9N"
};

// FIX: Using types from the compat library.
let app: firebase.app.App | null = null;
let auth: firebase.auth.Auth | null = null;
let initError: string | null = null;

try {
    // FIX: Using the namespaced firebase.initializeApp() and firebase.auth() from the compat library.
    app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    // FIX: Set persistence to 'none' to avoid web storage errors in sandboxed iframes.
    // This stores auth state in memory for the current session only.
    auth.setPersistence(firebase.auth.Auth.Persistence.NONE)
      .catch((error) => {
        console.error("Firebase setPersistence failed:", error);
        // This might not be a fatal error for the app's initialization.
      });
} catch (error: any) {
    console.error("Firebase initialization failed:", error);
    initError = error.message || "An unknown error occurred during Firebase initialization.";
    auth = null;
}

export { auth, initError };