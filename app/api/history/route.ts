import { auth } from '@clerk/nextjs/server';
import { NextResponse } from "next/server";
import { conversationHistory } from '@/lib/conversation-history';


export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) return new NextResponse("UnAuthorized", { status: 401 });

    const history = await conversationHistory(userId);

    return new NextResponse(JSON.stringify(history), { status: 200 });
 
  } catch (error) {
    console.error("[CONVERSATION_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
