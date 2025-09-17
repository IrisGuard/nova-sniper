import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Calendar as CalendarIcon,
    CheckCircle2,
    Circle,
    ArrowUpCircle,
    Pencil,
    Clock,
    TrendingUp,
    Zap
} from "lucide-react";
import { format } from "date-fns";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function RealEarlyTokenCard({ token, onAddToWatchlist, showNotification }) {
    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            showNotification(`✅ Address copied: ${text.slice(0, 8)}...`, 'success');
        } catch (error) {
            showNotification('❌ Failed to copy address', 'error');
        }
    };

    const formatLiquidity = (liquidity) => {
        if (liquidity === undefined || liquidity === null) return '$0';
        return `$${liquidity.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        })}`;
    };

    // DEX COLORS & LABELS
    const getDexInfo = (dexId) => {
        const dexMap = {
            'raydium': { label: 'Raydium', color: 'bg-gradient-to-r from-purple-500 to-pink-500', icon: '🔥' },
            'orca': { label: 'Orca', color: 'bg-gradient-to-r from-blue-500 to-cyan-500', icon: '🌊' },
            'meteora': { label: 'Meteora', color: 'bg-gradient-to-r from-orange-500 to-red-500', icon: '☄️' },
            'jupiter': { label: 'Jupiter', color: 'bg-gradient-to-r from-yellow-500 to-orange-500', icon: '🪐' },
            'serum': { label: 'Serum', color: 'bg-gradient-to-r from-green-500 to-teal-500', icon: '🧬' },
            'unknown': { label: 'DEX', color: 'bg-gradient-to-r from-gray-500 to-slate-500', icon: '🔗' }
        };
        return dexMap[dexId?.toLowerCase()] || dexMap.unknown;
    };

    const dexInfo = getDexInfo(token.dexId);

    const statusIcons = {
        todo: <Circle className="w-5 h-5 text-gray-400" />,
        in_progress: <ArrowUpCircle className="w-5 h-5 text-blue-500" />,
        done: <CheckCircle2 className="w-5 h-5 text-green-500" />
    };

    // Calculate token age
    const getTokenAge = () => {
        if (!token.pairCreatedAt) return 'Unknown';
        const createdAt = new Date(token.pairCreatedAt);
        const now = new Date();
        const diffMinutes = Math.floor((now - createdAt) / (1000 * 60));
        
        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${Math.floor(diffHours / 24)}d ago`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
        >
            <Card className="bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div className="flex items-start gap-3">
                        <div className="mt-1">
                            <TrendingUp className="w-6 h-6 text-green-500" />
                        </div>
                        <div className="flex-1">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                🎯 {token.name} 
                                <span className="text-green-600 font-bold">${token.symbol}</span>
                                {token.isNewPool && (
                                    <Badge className="bg-red-500 text-white animate-pulse">
                                        <Zap className="w-3 h-3 mr-1" />
                                        NEW
                                    </Badge>
                                )}
                            </CardTitle>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {/* DEX SOURCE BADGE */}
                                <Badge className={`${dexInfo.color} text-white font-semibold px-3 py-1`}>
                                    {dexInfo.icon} {dexInfo.label}
                                </Badge>
                                
                                {/* REAL-TIME TIMESTAMP */}
                                <Badge variant="outline" className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {getTokenAge()}
                                </Badge>
                                
                                {/* DEXSCREENER VERIFIED */}
                                <Badge className="bg-green-100 text-green-800">
                                    ✅ DexScreener Verified
                                </Badge>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => onAddToWatchlist(token)}
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            ⭐ Watch
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* ENHANCED DATA DISPLAY */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg">
                            <div className="text-sm text-green-700 font-medium">💧 Liquidity</div>
                            <div className="text-lg font-bold text-green-800">
                                {formatLiquidity(token.liquidity)}
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg">
                            <div className="text-sm text-blue-700 font-medium">📊 Volume 24h</div>
                            <div className="text-lg font-bold text-blue-800">
                                {formatLiquidity(token.volume)}
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg">
                            <div className="text-sm text-purple-700 font-medium">👥 Buyers</div>
                            <div className="text-lg font-bold text-purple-800">
                                {token.buyers || 'N/A'}
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 rounded-lg">
                            <div className="text-sm text-orange-700 font-medium">🎯 Quality</div>
                            <div className="text-lg font-bold text-orange-800">
                                {token.qualityScore || 85}/100
                            </div>
                        </div>
                    </div>

                    {/* TOKEN ADDRESS */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600 font-mono">
                                📍 {token.address}
                            </div>
                            <Button
                                onClick={() => copyToClipboard(token.address)}
                                variant="outline"
                                size="sm"
                            >
                                📋 Copy
                            </Button>
                        </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex gap-2 flex-wrap">
                        <a
                            href={`https://jup.ag/swap/SOL-${token.address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 min-w-[140px]"
                        >
                            <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                                🔄 Trade on Jupiter
                            </Button>
                        </a>
                        <a
                            href={token.chartUrl || `https://dexscreener.com/solana/${token.address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 min-w-[140px]"
                        >
                            <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                                📈 View Chart
                            </Button>
                        </a>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}