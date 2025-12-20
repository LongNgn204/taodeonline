
import { useEffect, useState } from 'react';
import { UserPresence, collabService } from '../../services/CollaborationService';
import { motion } from 'framer-motion';

export default function CollaborationCursors({ examId }: { examId: string }) {
    const [users, setUsers] = useState<UserPresence[]>([]);

    useEffect(() => {
        collabService.connect(examId);
        const unsubscribe = collabService.subscribe(setUsers);
        return () => {
            unsubscribe();
            collabService.disconnect();
        };
    }, [examId]);

    return (
        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
            {users.map(user => (
                <motion.div
                    key={user.id}
                    className="absolute flex flex-col items-start"
                    initial={false}
                    animate={{ x: user.cursor?.x, y: user.cursor?.y }}
                    transition={{ type: "spring", stiffness: 50, damping: 20 }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill={user.color}
                        className="transform -rotate-12"
                    >
                        <path d="M5.5 3.21a.5.5 0 0 1 .84 0l10.25 18a.5.5 0 0 1-.9.49l-3.32-6.64-5.32 5.32a.5.5 0 0 1-.84-.36v-16.8z" />
                    </svg>
                    <span
                        className="px-2 py-0.5 rounded-full text-[10px] text-white font-bold ml-2 shadow-sm"
                        style={{ backgroundColor: user.color }}
                    >
                        {user.name}
                    </span>
                </motion.div>
            ))}

            <div className="fixed bottom-4 right-4 flex gap-2 pointer-events-auto">
                {users.map(user => (
                    <div
                        key={user.id}
                        className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-lg"
                        style={{ backgroundColor: user.color }}
                        title={user.name}
                    >
                        {user.name.charAt(0)}
                    </div>
                ))}
            </div>
        </div>
    );
}
