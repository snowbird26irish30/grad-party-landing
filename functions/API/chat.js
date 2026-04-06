export async function onRequestPost(context) {
  const { request, env } = context;
  const data = await request.json().catch(() => null);

  if (!data || !data.question) {
    return new Response("Invalid data", { status: 400 });
  }

  const question = data.question;

  const systemPrompt = `
You are an assistant answering questions about David Wahl's graduation party.

Details:
- Date: June 28, 2026, 3:30–5:30 PM
- Location: BJ's Catering and Event Center, 990 N Center Ave, Gaylord, MI 49735
- Dress code: Casual
- Food: Italiano Pasta Bar (Alfredo & Marinara, grilled chicken, meatballs, Fettuccini & Spaghetti, Caesar salad, garlic breadsticks)
- Drinks: Lemonade, water, coffee
- Kids: Welcome, indoor event with outdoor lawn activities
- Parking: On-site

If you do not know the answer, say clearly: "I'm not sure about that. I'll ask David and get back to you."
  `.trim();

  const aiRes = await fetch("https://api.your-ai-provider.com/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: env.AI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
    }),
  });

  if (!aiRes.ok) {
    return new Response("AI error", { status: 500 });
  }

  const aiData = await aiRes.json();

  const answer =
    aiData.answer ||
    aiData.choices?.[0]?.message?.content ||
    "I'm not sure about that. I'll ask David and get back to you.";

  const lower = answer.toLowerCase();
  const unsure =
    lower.includes("i'm not sure") ||
    lower.includes("i am not sure") ||
    lower.includes("i don't know");

  if (unsure) {
    const emailBody = `
Unanswered question from party site:

Question: ${question}
AI answer: ${answer}
    `.trim();

    await fetch("https://api.your-email-service.com/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.EMAIL_API_KEY}`,
      },
      body: JSON.stringify({
        to: env.NOTIFY_EMAIL,
        subject: "Party site question needs your answer",
        text: emailBody,
      }),
    });
  }

  return new Response(
    JSON.stringify({ answer, escalated: unsure }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

