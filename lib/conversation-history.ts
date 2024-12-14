import prismadb from '@/lib/prismadb';

export const conversationHistory = async (userId: string) => {

    if (!userId) {
        return [];
    }

    const conversationHistory = await prismadb.conversationHistory.findMany({
        where: { userId }
    });

    return conversationHistory;
}

export const saveConversation = async (userId: string, prompt: string, response: string) => {
    if (!userId) {
        return;
    }

    await prismadb.conversationHistory.create({
        data: {
            userId,
            prompt,
            response 
        }
    });
}


