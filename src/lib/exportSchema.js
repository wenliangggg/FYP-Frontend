// lib/exportSchema.js
import { db } from '../../firebaseAdmin';

async function scanFirestoreSchema() {
  const schema = {};
  const collections = await db.listCollections();

  for (const collection of collections) {
    const collectionName = collection.id;
    const snapshot = await collection.limit(1).get();

    if (snapshot.empty) {
      schema[collectionName] = { fields: {}, subcollections: [] };
      continue;
    }

    const doc = snapshot.docs[0];
    const fields = {};
    const data = doc.data();

    for (const [key, value] of Object.entries(data)) {
      fields[key] = typeof value;
    }

    const subcollections = await doc.ref.listCollections();
    const subcollectionNames = subcollections.map((sub) => sub.id);

    schema[collectionName] = {
      fields,
      subcollections: subcollectionNames,
    };
  }

  return schema;
}

export default scanFirestoreSchema;
