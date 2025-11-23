import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@deepgram/sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;
    
    console.log('🎵 TTS Request received:', { hasText: !!text, textLength: text?.length, text: text?.substring(0, 50) });

    if (!text || text.trim() === '') {
      console.error('❌ TTS Error: No text provided', body);
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const deepgram = createClient(process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY!);

    const response = await deepgram.speak.request(
      { text },
      {
        model: 'aura-asteria-en',
        encoding: 'linear16',
        container: 'wav',
      }
    );

    const stream = await response.getStream();
    if (!stream) {
      return NextResponse.json({ error: 'Failed to get audio stream' }, { status: 500 });
    }

    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    // Combine chunks into single buffer
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const audioBuffer = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      audioBuffer.set(chunk, offset);
      offset += chunk.length;
    }

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': audioBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('TTS Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    );
  }
}
