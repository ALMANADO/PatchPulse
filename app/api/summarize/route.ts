import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { title, synopsis, url } = await req.json();

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GROQ_API_KEY not set' }, { status: 500 });
  }

  if (!title && !synopsis) {
    return NextResponse.json({ error: 'Missing title or synopsis' }, { status: 400 });
  }

  const prompt = `You are a concise technical writer. Summarize the following Oracle software update in 3–4 bullet points that a developer or admin would care about. Keep each point short and practical. Do NOT add any intro or outro — just the bullets.

Update title: ${title}
Synopsis: ${synopsis}
Reference URL: ${url}`;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_completion_tokens: 400,
        temperature: 0.4,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`Groq API error ${res.status}:`, errText);
      return NextResponse.json({ error: 'Could not load summary.' }, { status: res.status });
    }

    const data = await res.json();
    const summary: string = data.choices?.[0]?.message?.content ?? '';

    if (!summary) {
      return NextResponse.json({ error: 'Empty response from Groq.' }, { status: 502 });
    }

    return NextResponse.json({ summary });
  } catch (e: any) {
    console.error('Summarize fetch error:', e.message);
    return NextResponse.json({ error: 'Could not load summary.' }, { status: 500 });
  }
}
