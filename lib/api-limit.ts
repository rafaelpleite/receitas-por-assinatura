import prismadb from '@/lib/prismadb';
import { MAX_FREE_COUNT } from '../constants';


export const increaseApiLimit = async (userId: string) => {

    if (!userId) {
        return;
    }

    console.log("increaseApiLimit: userId is ->", userId);

    const userApiLimit = await prismadb.userApiLimit.findUnique({
        where: { userId }
    });

    if (userApiLimit) {
        await prismadb.userApiLimit.update({
            where: { userId: userId },
            data: { count:  userApiLimit.count + 1},
        });
    } else {
        await prismadb.userApiLimit.create({
            data: { userId: userId, count: 1 },
        });
    }
};


export const checkApiLimit = async (userId: string) => {

    console.log('checkApiLimit: userId ->', userId);

    if (!userId) {
        return false;
    }

    const userApiLimit = await prismadb.userApiLimit.findUnique({
        where: { userId }
    });

    if (!userApiLimit || userApiLimit.count < MAX_FREE_COUNT) {
        return true;
    } else {
        return false;
    }
};


export const getApiLimitCount = async (userId: string) => {
    
    if (!userId) {
        return 0;
    }

    const userApiLimit = await prismadb.userApiLimit.findUnique({
        where: { userId }
    });

    if (!userApiLimit) {
        return 0;
    }

    return userApiLimit.count;
}