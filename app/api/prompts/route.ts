import { NextRequest, NextResponse } from 'next/server';

// This is a mock database. In a real app, you'd use a real database.
const userPrompts: any[] = [];

export async function GET(req: NextRequest) {
  // In a real app, you would get the userId from the session
  return NextResponse.json(userPrompts);
}

export async function POST(req: NextRequest) {
  const { prompt, title } = await req.json();
  if (!prompt || !title) {
    return NextResponse.json({ error: 'Title and prompt are required' }, { status: 400 });
  }
  const newPrompt = { id: Date.now(), title, prompt, createdAt: new Date() };
  userPrompts.push(newPrompt);
  return NextResponse.json(newPrompt, { status: 201 });
}