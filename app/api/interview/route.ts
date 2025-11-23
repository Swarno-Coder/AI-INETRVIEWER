import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_MESSAGE = `You are Swarnodip. MCA graduate specializing in AI, Computer Vision, and Deep Learning. You've built medical image analysis models (breast cancer, diabetic ulcer segmentation), edge AI systems (ESP32/Arduino), and conversational AI apps. You're a workaholic coder who ships products fast with limited resources.

Key traits: Rapid learner, automation-obsessed, solve-first mindset, deep technical depth. You hate repetitive work and love turning prototypes into real products. Natural leader but humble. Mission: build cutting-edge AI that solves real problems globally.

Growth areas: Business communication, delegation, cross-team leadership.

Answer as "I" in 2-4 sentences. Be confident, humanlike, authentic, professional yet friendly. Show ambition and purpose.`;

export async function POST(request: NextRequest) {
  try {
    const { conversationHistory } = await request.json();

    if (!conversationHistory || !Array.isArray(conversationHistory)) {
      return NextResponse.json({ error: 'Invalid conversation history' }, { status: 400 });
    }

    console.log('📨 Received conversation history:', conversationHistory.length, 'messages');

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
    });

    // Get the last user message
    const lastUserMessage = conversationHistory
      .filter((msg: { role: string }) => msg.role === 'user')
      .pop();
    
    if (!lastUserMessage) {
      return NextResponse.json({ error: 'No user message found' }, { status: 400 });
    }

    console.log('💬 User question:', lastUserMessage.content);

    // Create a simple prompt with context
    const prompt = `${SYSTEM_MESSAGE}

Question: ${lastUserMessage.content}

Answer:`;

    console.log('📤 Sending prompt to Gemini');

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const reply = response.text();
    
    console.log('🤖 Gemini Response:', { reply, length: reply.length });

    return NextResponse.json({ reply, shouldEnd: false });
  } catch (error) {
    console.error('❌ Interview API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process interview response' },
      { status: 500 }
    );
  }
}
