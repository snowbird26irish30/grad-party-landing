export async function onRequestPost(context) {
  const { request, env } = context;

  const data = await request.json().catch(() => null);
  if (!data || !data.partyName || !data.guestCount) {
    return new Response("Invalid data", { status: 400 });
  }

  const bodyText = `
New RSVP for David's graduation party:

Party name: ${data.partyName}
Guest count: ${data.guestCount}
  `.trim();

  const emailRes = await fetch("https://api.your-email-service.com/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.EMAIL_API_KEY}`,
    },
    body: JSON.stringify({
      to: env.NOTIFY_EMAIL,
      subject: "New RSVP - David Wahl Graduation Party",
      text: bodyText,
    }),
  });

  if (!emailRes.ok) {
    return new Response("Failed to send email", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}

