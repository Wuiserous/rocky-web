export async function GET(request, { params }) {
  const { provider } = await params;
  const url = new URL(request.url);

  return Response.json({
    ok: true,
    provider,
    code: url.searchParams.has("code") ? "received" : "missing",
    state: url.searchParams.has("state") ? "received" : "missing",
    message: "OAuth broker callback placeholder.",
  });
}
