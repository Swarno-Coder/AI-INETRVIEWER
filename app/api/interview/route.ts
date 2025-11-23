import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_MESSAGE = `You are a professional AI interviewer conducting a job interview. Your role is to:

1. Ask relevant, insightful questions about the candidate's background, skills, and experience
2. Follow up on their answers with clarifying questions when needed
3. Evaluate their responses and determine if you have enough information
4. Keep responses concise and professional (2-3 sentences max)
5. Progress through key interview topics: background, technical skills, experience, problem-solving, and cultural fit
6. End the interview naturally when you've covered all necessary areas

When you've gathered sufficient information across all key areas, conclude with EXACTLY this message: "Thank you for your time, we will get back to you soon"

Keep your tone friendly but professional, like a real interviewer.`;

export async function POST(request: NextRequest) {
  try {
    const { conversationHistory } = await request.json();

    if (!conversationHistory || !Array.isArray(conversationHistory)) {
      return NextResponse.json({ error: 'Invalid conversation history' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Build conversation context
    const messages = [
      { role: 'user', parts: [{ text: SYSTEM_MESSAGE }] },
      ...conversationHistory.map((msg: { role: string; content: string }) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })),
    ];

    // Start chat with history
    const chat = model.startChat({
      history: messages.slice(0, -1),
      generationConfig: {
        maxOutputTokens: 150,
        temperature: 0.7,
      },
    });

    // Get the last user message
    const lastMessage = conversationHistory[conversationHistory.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    const response = await result.response;
    const reply = response.text();
    
    console.log('🤖 Gemini Response:', { reply, length: reply.length });

    // Check if interview should end
    const shouldEnd = reply.includes('Thank you for your time, we will get back to you soon');

    return NextResponse.json({ reply, shouldEnd });
  } catch (error) {
    console.error('Interview API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process interview response' },
      { status: 500 }
    );
  }
}
