import { useServiceWorker } from '../hooks/useServiceWorker';
import { ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline';

export function UpdateNotification() {
    const { updateAvailable, updateServiceWorker, close } = useServiceWorker();

    if (!updateAvailable) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-in-right">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-primary-200 dark:border-primary-900 p-4 max-w-md flex items-start gap-4">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-full shrink-0">
                    <ArrowPathIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                        Cập nhật khả dụng
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        Phiên bản mới của ứng dụng đã sẵn sàng. Cập nhật ngay để trải nghiệm tính năng mới nhất.
                    </p>
                    <div className="flex gap-3 mt-3">
                        <button
                            onClick={() => updateServiceWorker(true)}
                            className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
                        >
                            Cập nhật ngay
                        </button>
                        <button
                            onClick={close}
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-medium px-3 py-2"
                        >
                            Để sau
                        </button>
                    </div>
                </div>
                <button
                    onClick={close}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                    <XMarkIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

export default UpdateNotification;
