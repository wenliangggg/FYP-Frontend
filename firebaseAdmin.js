// lib/firebaseAdmin.js

import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

if (!admin.apps.length) {
  const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

export { admin, db };
