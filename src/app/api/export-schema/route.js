// app/api/export-schema/route.js
import scanFirestoreSchema from '../../../lib/exportSchema';

export async function GET(req) {
  const schema = await scanFirestoreSchema();
  return new Response(JSON.stringify(schema), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
