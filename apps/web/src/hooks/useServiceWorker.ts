import { useRegisterSW } from 'virtual:pwa-register/react';

export function useServiceWorker() {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered:', r);
        },
        onRegisterError(error) {
            console.log('SW registration error', error);
        },
    });

    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    return {
        updateAvailable: needRefresh,
        offlineReady,
        updateServiceWorker,
        close,
    };
}
