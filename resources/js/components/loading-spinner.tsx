import { router } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function LoadingSpinner() {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Show spinner when navigation starts
        const handleStart = () => {
            setIsLoading(true);
        };

        // Hide spinner when navigation finishes
        const handleFinish = () => {
            setIsLoading(false);
        };

        const removeStartListener = router.on('start', handleStart);
        const removeFinishListener = router.on('finish', handleFinish);

        return () => {
            removeStartListener();
            removeFinishListener();
        };
    }, []);

    if (!isLoading){
        return null;
    }

    return (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center pt-2 pointer-events-none">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md animate-pulse">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Loading...</span>
            </div>
        </div>
    );
}
