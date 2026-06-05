/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

// Initialize the Firebase app
const app = initializeApp(firebaseConfig);

// Detect if we are running in local simulation state
export const isMockFirebase = firebaseConfig.apiKey === "mock-api-key" || firebaseConfig.projectId === "mock-project";

// Initialize service SDKs
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Apply Google custom parameter to prompt account selection
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Firebase initialized. Note: Admin path is protected until user login.

// System defined enum and handler for robust telemetry diagnostics
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
  console.error('[Firestore Permission Failure Diagnostic]: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
