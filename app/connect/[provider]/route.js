export async function GET(_request, { params }) {
  const { provider } = await params;

  return Response.json({
    ok: true,
    provider,
    message: "OAuth broker connect placeholder.",
  });
}
