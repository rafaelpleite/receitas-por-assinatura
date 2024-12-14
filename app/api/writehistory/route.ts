// app/api/writehistory/route.ts
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { saveConversation } from '@/lib/conversation-history'; // Assuming this is where your save function is located

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("UnAuthorized", { status: 401 });


    console.log('req is ->', req);
    const { prompt, response } = await req.json();

    if (!userId || !prompt || !response) {
      return new NextResponse("Invalid data", { status: 400 });
    }

    await saveConversation(userId, prompt, response);

    return new NextResponse("Conversation saved successfully", { status: 200 });
  } catch (error) {
    console.error('Error saving conversation:', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
