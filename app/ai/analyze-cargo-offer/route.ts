// Cargo analysis endpoint - will be implemented when AI analysis features are ready
export async function POST() {
  return Response.json({ error: 'This endpoint is temporarily disabled' }, { status: 501 });
} 
