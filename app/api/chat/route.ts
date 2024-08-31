import { auth } from '@clerk/nextjs/server';
import { NextResponse } from "next/server";
// import { Configuration, OpenAIApi } from "openai";

import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

import { openai } from '@ai-sdk/openai';
import { streamText, convertToCoreMessages } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

/* 
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
*/

// const openai = new OpenAIApi(configuration);

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { messages } = body// body.map((item: string) => { return `Gerar uma receita detalhada para: ${item}. Por favor, forneça instruções passo a passo adequadas para todos os níveis de habilidade culinária, de iniciantes a avançados. Inclua medidas, técnicas de cozimento e quaisquer dicas especiais que possam ajudar na preparação do prato.` });;

    const promptMessages = messages.map((message: { content: any; }) => ({
      ...message,
      content: `Gerar uma receita detalhada para: ${message.content}. Por favor, forneça instruções passo a passo adequadas para todos os níveis de habilidade culinária, de iniciantes a avançados. Inclua medidas, técnicas de cozimento e quaisquer dicas especiais que possam ajudar na preparação do prato.`
  }));

    if (!userId) return new NextResponse("UnAuthorized", { status: 401 });

    if (!messages)
      return new NextResponse("Messages Are Required", { status: 400 });

    const freeTrial = await checkApiLimit(userId);
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro)
      return new NextResponse("Free Trial Has Expired", { status: 403 });

    const response = await streamText({
      model: openai('gpt-4-turbo'),
      messages: convertToCoreMessages(promptMessages),
    });

    if (!isPro) await increaseApiLimit(userId);

    return response.toDataStreamResponse();
  } catch (error) {
    console.error("[CONVERSATION_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
