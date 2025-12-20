

export default function TrustedBy() {
    return (
        <section className="py-10 border-y border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 overflow-hidden">
            <div className="container mx-auto px-4 mb-6 text-center">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                    Được tin dùng bởi hơn 2000+ giáo viên tại
                </p>
            </div>

            <div className="relative flex overflow-x-hidden group">
                <div className="animate-marquee whitespace-nowrap flex items-center gap-16 px-8">
                    {/* Repeated items for infinite scroll effect */}
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <span key={i} className="text-xl md:text-2xl font-display font-bold text-gray-400 dark:text-gray-600">
                            TRƯỜNG THPT {['CHUYÊN', 'CHU VĂN AN', 'LÊ QUÝ ĐÔN', 'NGUYỄN HUỆ', 'PHAN BỘI CHÂU', 'HÀ NỘI - AMSTERDAM'][i % 6]}
                        </span>
                    ))}
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <span key={`dup-${i}`} className="text-xl md:text-2xl font-display font-bold text-gray-400 dark:text-gray-600">
                            TRƯỜNG THPT {['CHUYÊN', 'CHU VĂN AN', 'LÊ QUÝ ĐÔN', 'NGUYỄN HUỆ', 'PHAN BỘI CHÂU', 'HÀ NỘI - AMSTERDAM'][i % 6]}
                        </span>
                    ))}
                </div>

                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-gray-50 dark:from-black to-transparent pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-gray-50 dark:from-black to-transparent pointer-events-none" />
            </div>
        </section>
    );
}
