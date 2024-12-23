'use server';

import { streamText } from 'ai';
import { createOpenAI } from "@ai-sdk/openai";
import { createStreamableValue } from 'ai/rsc';

import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import { auth } from '@clerk/nextjs/server';

export async function generate(input: string) {
    const { userId } = await auth();

    if (!userId) return { status: 401 };
    if (!input) return { status: 400 };

    const freeTrial = await checkApiLimit(userId);
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) return { status: 403 };

    const apiKey = process.env.OPENAI_API_SK;

    // Validation and Logging
    if (!apiKey) {
        console.error('OPENAI_API_KEY is not defined.');
        return { status: 500, message: 'Internal Server Error' };
    }

    const stream = createStreamableValue('');
    const openai = createOpenAI({ apiKey });

    (async () => {
        const model = openai('gpt-4o-mini'); // Adjust based on your SDK's method

        const { textStream } = streamText({
            model,
            prompt: `Gerar uma receita detalhada para: ${input}. Por favor, forneça instruções passo a passo adequadas para todos os níveis de habilidade culinária, de iniciantes a avançados. Inclua medidas, técnicas de cozimento e quaisquer dicas especiais que possam ajudar na preparação do prato.`,
        });

        for await (const delta of textStream) {
            stream.update(delta);
        }

        stream.done();

        // Post-processing after streaming is complete
        if (!isPro) {
            await increaseApiLimit(userId);
        }
    })();

    return { output: stream.value };
}
