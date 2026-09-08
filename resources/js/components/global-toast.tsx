import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

type FlashProps = {
    success?: string;
    error?: string;
    warning?: string;
};

export default function GlobalToast() {
    useEffect(() => {
        const showFlash = (flash?: FlashProps) => {
            if (flash?.success) {
                toast.success(flash.success);
            }

            if (flash?.error) {
                toast.error(flash.error);
            }

            if (flash?.warning) {
                toast(flash.warning);
            }
        };

        const removeSuccessListener = router.on('success', (event) => {
            showFlash(event.detail.page.props.flash as FlashProps | undefined);
        });

        return () => {
            removeSuccessListener();
        };
    }, []);

    return null;
}