

import type { Peer } from '../hooks/useCollaboration';

interface PresenceIndicatorProps {
    connected: boolean;
    peers: Peer[];
    currentUserId?: string;
}

export default function PresenceIndicator({ connected, peers, currentUserId }: PresenceIndicatorProps) {
    // Filter out self from peers display if desired, or show everyone.
    // Usually "Others viewing" is better.
    const otherPeers = peers.filter(p => p.user.id !== currentUserId);

    return (
        <div className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1 shadow-sm">
            <div className={`flex items-center gap-2 text-xs font-medium ${connected ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                {connected ? 'Trực tuyến' : 'Mất kết nối'}
            </div>

            {otherPeers.length > 0 && (
                <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
            )}

            <div className="flex -space-x-2">
                {otherPeers.slice(0, 3).map((peer, idx) => (
                    <div
                        key={idx}
                        className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-[10px] text-white font-bold uppercase relative group cursor-help"
                        style={{ backgroundColor: peer.color }}
                        title={peer.user.name}
                    >
                        {peer.user.name[0]}
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                            {peer.user.name}
                        </div>
                    </div>
                ))}
                {otherPeers.length > 3 && (
                    <div className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-500">
                        +{otherPeers.length - 3}
                    </div>
                )}
            </div>

            {otherPeers.length === 0 && connected && (
                <div className="text-xs text-gray-400 italic">
                    Chỉ mình bạn
                </div>
            )}
        </div>
    );
}
