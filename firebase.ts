import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  sendPasswordResetEmail, 
  verifyPasswordResetCode, 
  confirmPasswordReset,
  ActionCodeSettings 
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, setDoc, getDoc, setLogLevel } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';
import { ProfileData } from '../types';

// Resolve API key from environment variable if present, otherwise fallback to config or official key
const envMeta = (typeof import.meta !== 'undefined' ? (import.meta as unknown as Record<string, any>)?.env : {}) || {};
const resolvedApiKey = 
  envMeta.VITE_FIREBASE_API_KEY ||
  envMeta.VITE_NEXT_PUBLIC_FIREBASE_API_KEY ||
  envMeta.NEXT_PUBLIC_FIREBASE_API_KEY ||
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_FIREBASE_API_KEY) ||
  (typeof process !== 'undefined' && process.env?.VITE_FIREBASE_API_KEY) ||
  (firebaseConfig.apiKey && firebaseConfig.apiKey !== 'process.env.NEXT_PUBLIC_FIREBASE_API_KEY' ? firebaseConfig.apiKey : null) ||
  "AIzaSyBFMqVkPrRlaYX2Y-BLI4x-ITUO0DYjLY";

const resolvedFirebaseConfig = {
  ...firebaseConfig,
  apiKey: resolvedApiKey
};

// Initialize Firebase App instance
const app = getApps().length === 0 ? initializeApp(resolvedFirebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
setLogLevel('silent');
export const auth = getAuth(app);
export const storage = getStorage(app);

// Firebase initialized successfully


// Upload executive photo to Firebase Cloud Storage and sync with Firestore database
export async function uploadExecutivePhotoToCloud(
  file: File | Blob, 
  filename?: string,
  onProgress?: (progress: number) => void
): Promise<{ url: string; storageType: 'firebase-storage' | 'server-storage' }> {
  try {
    const cleanName = filename ? filename.replace(/[^a-zA-Z0-9._-]/g, '_') : `executive_photo_${Date.now()}`;
    const storageRef = ref(storage, `executive-photos/${cleanName}`);
    
    // Upload to Firebase Storage
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          if (onProgress) onProgress(progress);
        },
        (error) => {
          console.warn('Firebase Storage upload failed, falling back to server upload:', error);
          // Fallback to server-side persistent upload
          fallbackServerUpload(file, filename)
            .then(res => resolve({ url: res.url, storageType: 'server-storage' }))
            .catch(reject);
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            if (onProgress) onProgress(100);
            
            // Update Firestore Profile document
            try {
              const profileDocRef = doc(db, 'profile', 'main');
              await setDoc(profileDocRef, { 
                avatarUrl: downloadUrl, 
                updatedAt: new Date().toISOString() 
              }, { merge: true });
            } catch (fsErr) {
              console.warn('Firestore profile sync note:', fsErr);
            }
            
            resolve({ url: downloadUrl, storageType: 'firebase-storage' });
          } catch (urlErr) {
            console.warn('Could not get download URL, trying fallback:', urlErr);
            const serverRes = await fallbackServerUpload(file, filename);
            resolve({ url: serverRes.url, storageType: 'server-storage' });
          }
        }
      );
    });
  } catch (err) {
    console.warn('Direct cloud upload failed, executing server upload fallback:', err);
    const serverRes = await fallbackServerUpload(file, filename);
    return { url: serverRes.url, storageType: 'server-storage' };
  }
}

// Fallback upload helper to persistent backend
async function fallbackServerUpload(file: File | Blob, filename?: string): Promise<{ url: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = reader.result as string;
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64,
            filename: filename || `executive_photo_${Date.now()}`,
            folder: 'avatar',
            updateProfileAvatar: true
          })
        });
        const data = await response.json();
        if (data.success && data.url) {
          resolve({ url: data.url });
        } else {
          // If server fails, use base64 data URL directly
          resolve({ url: base64 });
        }
      } catch (e) {
        // Ultimate fallback to data URL
        resolve({ url: reader.result as string });
      }
    };
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

// Fetch Profile from Firestore database
export async function getFirestoreProfile(): Promise<Partial<ProfileData> | null> {
  try {
    const profileDocRef = doc(db, 'profile', 'main');
    const snap = await getDoc(profileDocRef);
    if (snap.exists()) {
      return snap.data() as Partial<ProfileData>;
    }
  } catch (e) {
    console.warn('Firestore profile fetch notice:', e);
  }
  return null;
}

// Save Profile to Firestore database
export async function saveFirestoreProfile(profile: Partial<ProfileData>): Promise<void> {
  try {
    const profileDocRef = doc(db, 'profile', 'main');
    await setDoc(profileDocRef, { 
      ...profile, 
      updatedAt: new Date().toISOString() 
    }, { merge: true });
  } catch (e) {
    console.warn('Firestore profile save notice:', e);
  }
}

// Send Firebase password reset email with configured ActionCodeSettings
export async function sendFirebasePasswordReset(email: string): Promise<{ success: boolean; message: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!isAuthorizedAdmin(cleanEmail)) {
    throw new Error(`Password reset is restricted to authorized admin: ${AUTHORIZED_ADMIN_EMAIL}.`);
  }

  // Construct target app URL so email action links redirect back to the app with mode=resetPassword
  const currentOrigin = typeof window !== 'undefined' && window.location.origin 
    ? window.location.origin 
    : 'https://ais-dev-xwv7zgl5xydvhu4q736ba3-839376945354.asia-southeast1.run.app';

  const actionCodeSettings: ActionCodeSettings = {
    url: `${currentOrigin}/?mode=resetPassword`,
    handleCodeInApp: true,
  };

  try {
    // Attempt with ActionCodeSettings first
    await sendPasswordResetEmail(auth, cleanEmail, actionCodeSettings);
    return {
      success: true,
      message: `Password reset email dispatched to ${cleanEmail}. Click the secure link in your email to set a new password.`
    };
  } catch (err: any) {
    console.warn('sendPasswordResetEmail with ActionCodeSettings notice, trying standard fallback:', err);
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      return {
        success: true,
        message: `Password reset link dispatched to ${cleanEmail}.`
      };
    } catch (fallbackErr: any) {
      console.error('Firebase password reset error:', fallbackErr);
      throw fallbackErr;
    }
  }
}

// Verify Firebase Password Reset Code (oobCode)
export async function verifyResetCode(oobCode: string): Promise<string> {
  try {
    const email = await verifyPasswordResetCode(auth, oobCode);
    return email;
  } catch (err: any) {
    console.error('verifyPasswordResetCode error:', err);
    throw new Error(err.message || 'Invalid or expired password reset link/code.');
  }
}

// Confirm and commit new password with Firebase Auth
export async function confirmNewPassword(oobCode: string, newPass: string): Promise<void> {
  try {
    await confirmPasswordReset(auth, oobCode, newPass);
  } catch (err: any) {
    console.error('confirmPasswordReset error:', err);
    throw new Error(err.message || 'Failed to update password with Firebase Auth.');
  }
}

// Standardized Operation types and Error Handler per skill instructions
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const AUTHORIZED_ADMIN_EMAIL = 'solmanchoudhury66@gmail.com';

export function isAuthorizedAdmin(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase();
}
