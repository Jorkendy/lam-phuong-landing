import { getDatabase } from "@/app/database";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: unknown;
  const database = getDatabase();
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const email =
    typeof body === "object" && body !== null && "email" in body
      ? String((body as { email: unknown }).email).trim()
      : "";

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return Response.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  try {
    await database(process.env.SUBSCRIBERS_TABLE || "tble5saHr6dCQlOeS").create([
      { fields: { Email: email } },
    ]);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("[/api/subscribe] error", error);
    return Response.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
