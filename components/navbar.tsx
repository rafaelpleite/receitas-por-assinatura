import MobileSidebar from "@/components/mobile-sidbar";
import { UserButton } from '@clerk/nextjs';
import { getApiLimitCount } from '@/lib/api-limit';
import { auth } from '@clerk/nextjs/server';
import { checkSubscription } from '@/lib/subscription';

const Navbar = async () => {
    const { userId } : { userId: string | null } = auth();

    const apiLimitCount = userId ? await getApiLimitCount(userId) : 0;

    const isPro = await checkSubscription();


    return (
        <div className="flex items-center p-4">
            <MobileSidebar isPro={isPro} apiLimitCount={apiLimitCount}/>
            <div className='flex w-full justify-end'>
                <UserButton afterSignOutUrl='/' />
            </div>
        </div>
    )
}

export default Navbar;