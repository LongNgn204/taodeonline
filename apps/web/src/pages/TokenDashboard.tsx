// Chú thích: Token Dashboard page
// Theo dõi sử dụng API, chi phí và hiệu suất

import { useState, useEffect } from 'react';
import {
    Coins,
    Zap,
    TrendingUp,
    AlertCircle,
    Clock,
    CheckCircle,
    XCircle,
    Calendar,
} from 'lucide-react';

interface UsageSummary {
    totalRequests: number;
    totalTokens: number;
    totalCostUsd: number;
    successCount: number;
    errorCount: number;
}

interface DailyUsage {
    date: string;
    total_requests: number;
    total_tokens: number;
    total_cost_usd: number;
}

interface RecentUsage {
    id: string;
    provider: string;
    model: string;
    endpoint: string;
    input_tokens: number;
    output_tokens: number;
    cost_usd: number;
    success: number;
    latency_ms: number;
    created_at: string;
}

export default function TokenDashboard() {
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<UsageSummary | null>(null);
    const [dailyUsage, setDailyUsage] = useState<DailyUsage[]>([]);
    const [recentUsage, setRecentUsage] = useState<RecentUsage[]>([]);
    const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('7d');

    useEffect(() => {
        fetchUsageData();
    }, [dateRange]);

    const fetchUsageData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/usage?range=${dateRange}`, {
                credentials: 'include',
            });
            if (res.ok) {
                const data = await res.json();
                setSummary(data.summary);
                setDailyUsage(data.daily || []);
                setRecentUsage(data.recent || []);
            }
        } catch (error) {
            console.error('Error fetching usage:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCost = (cost: number) => {
        if (cost < 0.01) return `< $0.01`;
        return `$${cost.toFixed(2)}`;
    };

    const formatTokens = (tokens: number) => {
        if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
        if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`;
        return tokens.toString();
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="spinner w-8 h-8 border-primary-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Token & Chi phí
                    </h1>
                    <p className="text-gray-500">Theo dõi sử dụng API và ước tính chi phí</p>
                </div>
                <div className="flex gap-2">
                    {(['7d', '30d', '90d'] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setDateRange(range)}
                            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${dateRange === range
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                                }`}
                        >
                            {range === '7d' ? '7 ngày' : range === '30d' ? '30 ngày' : '90 ngày'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Zap className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Tổng requests</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {summary?.totalRequests || 0}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Tổng tokens</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {formatTokens(summary?.totalTokens || 0)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <Coins className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Chi phí ước tính</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {formatCost(summary?.totalCostUsd || 0)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Tỷ lệ thành công</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {summary && summary.totalRequests > 0
                                    ? Math.round((summary.successCount / summary.totalRequests) * 100)
                                    : 0}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Daily Usage Chart */}
            {dailyUsage.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary-500" />
                        Sử dụng theo ngày
                    </h2>
                    <div className="flex items-end gap-1 h-40">
                        {dailyUsage.map((day) => {
                            const maxTokens = Math.max(...dailyUsage.map(d => d.total_tokens));
                            const height = maxTokens > 0 ? (day.total_tokens / maxTokens) * 100 : 0;
                            return (
                                <div
                                    key={day.date}
                                    className="flex-1 flex flex-col items-center gap-1 group relative"
                                >
                                    <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                                        {day.date}<br />
                                        {formatTokens(day.total_tokens)} tokens<br />
                                        {formatCost(day.total_cost_usd)}
                                    </div>
                                    <div
                                        className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t transition-all hover:from-primary-700 hover:to-primary-500"
                                        style={{ height: `${height}%`, minHeight: day.total_tokens > 0 ? '4px' : '0' }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Recent Usage */}
            {recentUsage.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary-500" />
                            Hoạt động gần đây
                        </h2>
                    </div>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Thời gian</th>
                                    <th>Provider</th>
                                    <th>Model</th>
                                    <th>Endpoint</th>
                                    <th>Tokens</th>
                                    <th>Chi phí</th>
                                    <th>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentUsage.slice(0, 10).map((usage) => (
                                    <tr key={usage.id}>
                                        <td className="text-gray-500 text-sm">
                                            {new Date(usage.created_at).toLocaleString('vi-VN')}
                                        </td>
                                        <td>
                                            <span className="capitalize">{usage.provider}</span>
                                        </td>
                                        <td className="font-mono text-sm">{usage.model}</td>
                                        <td className="text-gray-500">{usage.endpoint || '-'}</td>
                                        <td>
                                            <span className="text-sm">
                                                {formatTokens(usage.input_tokens + usage.output_tokens)}
                                            </span>
                                        </td>
                                        <td className="font-medium">{formatCost(usage.cost_usd)}</td>
                                        <td>
                                            {usage.success ? (
                                                <span className="flex items-center gap-1 text-green-600">
                                                    <CheckCircle className="w-4 h-4" />
                                                    <span className="text-xs">{usage.latency_ms}ms</span>
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-red-600">
                                                    <XCircle className="w-4 h-4" />
                                                    Error
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!summary && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 text-center">
                    <Coins className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">Chưa có dữ liệu sử dụng</p>
                    <p className="text-sm text-gray-400 mt-1">
                        Bắt đầu tạo đề thi để theo dõi chi phí
                    </p>
                </div>
            )}
        </div>
    );
}
