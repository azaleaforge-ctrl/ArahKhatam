export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const now = Date.now();
  return Response.json(
    { now, iso: new Date(now).toISOString() },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
