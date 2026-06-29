import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text, voiceId = 'en-US-natalie', model = 'falcon-2' } = await req.json();

    const apiKey = process.env.MURF_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'MURF_API_KEY is not defined in environment.' }, { status: 500 });
    }

    const response = await fetch('https://global.api.murf.ai/v1/speech/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        voiceId,
        model,
        locale: 'en-US',
        sample_rate: 24000,
        format: 'PCM',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `Murf API error: ${errorText}` }, { status: response.status });
    }

    // Proxy the stream back to the client
    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'audio/pcm',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
