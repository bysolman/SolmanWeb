import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User 
} from 'firebase/auth';
import { auth, AUTHORIZED_ADMIN_EMAIL, isAuthorizedAdmin } from './firebase';

// Provider with all requested Google Drive scopes
export const DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.activity',
  'https://www.googleapis.com/auth/drive.activity.readonly',
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/drive.apps.readonly',
  'https://www.googleapis.com/auth/drive.install',
  'https://www.googleapis.com/auth/drive.meet.readonly',
  'https://www.googleapis.com/auth/drive.metadata',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.photos.readonly',
  'https://www.googleapis.com/auth/drive.scripts',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/spreadsheets.readonly'
];

const provider = new GoogleAuthProvider();
DRIVE_SCOPES.forEach(scope => provider.addScope(scope));
provider.setCustomParameters({
  prompt: 'select_account',
  access_type: 'offline'
});

// Flag to indicate if we are in the middle of a sign-in flow.
let isSigningIn = false;
// Cache the access token in memory (never localStorage)
let cachedAccessToken: string | null = null;

export interface AuthCallbackResult {
  user: User;
  token: string;
  isAuthorized: boolean;
  isOwnerEmail: boolean;
}

/**
 * Initialize auth state listener with email verification callback.
 * Checks if the signed-in user's email is exactly solmanchoudhury66@gmail.com.
 * If the email matches, grants access to the editing pages.
 * If it does not match, restricts access and prevents them from editing.
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string, isAuthorized: boolean) => void,
  onAuthFailure?: (errorMsg?: string) => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      const userEmail = (user.email || '').trim().toLowerCase();
      const isOwner = isAuthorizedAdmin(userEmail);

      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken, isOwner);
      } else if (!isSigningIn) {
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Sign in with Google Popup.
 * Verifies if the signed-in user's email is exactly solmanchoudhury66@gmail.com.
 */
export const googleSignIn = async (): Promise<{
  user: User;
  accessToken: string;
  isAuthorized: boolean;
} | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to retrieve access token from Google sign in');
    }

    cachedAccessToken = credential.accessToken;
    const userEmail = (result.user.email || '').trim().toLowerCase();
    const isAuthorized = isAuthorizedAdmin(userEmail);

    return { 
      user: result.user, 
      accessToken: cachedAccessToken, 
      isAuthorized 
    };
  } catch (error: any) {
    console.error('Google sign in error:', error);
    let msg = error.message || 'Google authentication failed.';
    if (error.code === 'auth/internal-error' || error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
      msg = 'Google popups are restricted in this preview frame. Please log in using your Admin Email and Password below, or open the app in a new tab.';
    }
    throw new Error(msg);
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};
