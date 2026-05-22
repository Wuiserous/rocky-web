export async function POST(request) {
  let body = null;

  try {
    body = await request.json();
  } catch {
    body = null;
  }

  return Response.json({
    ok: true,
    received: Boolean(body),
    message: "Connection exchange placeholder.",
  });
}
