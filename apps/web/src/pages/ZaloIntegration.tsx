import { Bell, CheckCircle, MessageCircle, QrCode, Smartphone } from 'lucide-react';
import { useState } from 'react';

export default function ZaloIntegration() {
    const [connected, setConnected] = useState(false);
    const [sending, setSending] = useState(false);

    const handleConnect = () => {
        // Mock connection simulation
        const width = 600;
        const height = 600;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        // Simulating a popup opening for Zalo Login
        const popup = window.open('', 'Zalo Login', `width=${width},height=${height},top=${top},left=${left}`);
        if (popup) {
            popup.document.write('<div style="display:flex;justify-content:center;align-items:center;height:100%;font-family:sans-serif;"><h1>Đang kết nối Zalo...</h1></div>');
            setTimeout(() => {
                popup.close();
                setConnected(true);
            }, 1500);
        }
    };

    const handleSendTest = () => {
        setSending(true);
        setTimeout(() => {
            setSending(false);
            alert('Đã gửi tin nhắn test thành công!');
        }, 1000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg" className="w-8 h-8" alt="Zalo" />
                    Tích hợp Zalo
                </h1>
                <p className="text-gray-500">Kết nối tài khoản Zalo OA để gửi thông báo điểm và lịch thi tự động cho phụ huynh/học sinh.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Connection Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col items-center text-center">
                    {!connected ? (
                        <>
                            <div className="w-48 h-48 bg-gray-100 dark:bg-gray-900 rounded-xl flex items-center justify-center mb-6">
                                <QrCode className="w-24 h-24 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Quét mã để kết nối</h3>
                            <p className="text-sm text-gray-500 mb-6">Sử dụng ứng dụng Zalo trên điện thoại để quét mã QR và cấp quyền cho Kiến Tạo Việt.</p>
                            <button onClick={handleConnect} className="btn-primary w-full">
                                Kết nối Zalo OA
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 animate-scale-in">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Đã kết nối thành công</h3>
                            <p className="text-sm text-gray-500 mb-6">Tài khoản <strong>Trường THPT Demo</strong> đã được liên kết.</p>
                            <button onClick={() => setConnected(false)} className="btn-secondary w-full">
                                Ngắt kết nối
                            </button>
                        </>
                    )}
                </div>

                {/* Features List */}
                <div className="space-y-4">
                    <div className="card p-6 flex items-start gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                            <Bell className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Thông báo Lịch thi</h3>
                            <p className="text-sm text-gray-500">Tự động nhắc nhở học sinh trước giờ thi 30 phút qua tin nhắn Zalo.</p>
                        </div>
                    </div>
                    <div className="card p-6 flex items-start gap-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600">
                            <MessageCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Gửi Kết quả thi</h3>
                            <p className="text-sm text-gray-500">Gửi điểm số và nhận xét chi tiết cho phụ huynh ngay khi chấm xong.</p>
                        </div>
                    </div>

                    {connected && (
                        <div className="card p-6 border-green-200 bg-green-50 dark:bg-green-900/10">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Kiểm tra kết nối</h3>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Nhập số điện thoại test..."
                                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm"
                                />
                                <button
                                    onClick={handleSendTest}
                                    disabled={sending}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    {sending ? <div className="spinner w-3 h-3" /> : <Smartphone className="w-4 h-4" />}
                                    Gửi
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
