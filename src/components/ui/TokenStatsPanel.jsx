import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
    TrendingUp, 
    TrendingDown, 
    Zap, 
    Activity,
    DollarSign,
    Users,
    Target,
    AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function TokenStatsPanel({ 
    earlyTokens, 
    confirmedTokens, 
    sniperTargets,
    isRealTimeActive 
}) {
    const [animatedStats, setAnimatedStats] = useState({});

    // Calculate real-time stats
    const stats = React.useMemo(() => {
        const allTokens = [...earlyTokens, ...confirmedTokens, ...sniperTargets];
        
        const totalLiquidity = allTokens.reduce((sum, token) => sum + (token.liquidity || 0), 0);
        const totalVolume = allTokens.reduce((sum, token) => sum + (token.volume || 0), 0);
        const avgQualityScore = allTokens.length > 0 
            ? allTokens.reduce((sum, token) => sum + (token.qualityScore || 0), 0) / allTokens.length
            : 0;
        
        const newTokensLast10Min = allTokens.filter(token => 
            token.ageMinutes && token.ageMinutes <= 10
        ).length;

        const priceGainers = allTokens.filter(token => 
            token.priceChangeH1 && token.priceChangeH1 > 0
        ).length;

        const priceLosers = allTokens.filter(token => 
            token.priceChangeH1 && token.priceChangeH1 < 0
        ).length;

        const highQualityTokens = allTokens.filter(token => 
            token.qualityScore >= 80
        ).length;

        return {
            totalTokens: allTokens.length,
            earlyCount: earlyTokens.length,
            confirmedCount: confirmedTokens.length,
            targetsCount: sniperTargets.length,
            totalLiquidity,
            totalVolume,
            avgQualityScore,
            newTokensLast10Min,
            priceGainers,
            priceLosers,
            highQualityTokens
        };
    }, [earlyTokens, confirmedTokens, sniperTargets]);

    // Animation effect for changing numbers
    useEffect(() => {
        Object.keys(stats).forEach(key => {
            if (animatedStats[key] !== stats[key]) {
                setAnimatedStats(prev => ({ ...prev, [key]: stats[key] }));
            }
        });
    }, [stats, animatedStats]);

    const formatNumber = (num) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
        return num.toLocaleString();
    };

    const formatCurrency = (amount) => {
        if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
        if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
        return `$${amount.toLocaleString()}`;
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
            {/* Total Active Tokens */}
            <motion.div
                key={stats.totalTokens}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.3 }}
            >
                <Card className="p-4 bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-slate-300">Total Active</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {stats.totalTokens}
                    </div>
                    {isRealTimeActive && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs mt-1">
                            LIVE
                        </Badge>
                    )}
                </Card>
            </motion.div>

            {/* Early Detection */}
            <motion.div
                key={stats.earlyCount}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.3 }}
            >
                <Card className="p-4 bg-gradient-to-br from-green-800/20 to-green-900/20 border-green-700/30">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-slate-300">Early Detection</span>
                    </div>
                    <div className="text-2xl font-bold text-green-400">
                        {stats.earlyCount}
                    </div>
                    <div className="text-xs text-green-400/70">
                        $50K-99K Liquidity
                    </div>
                </Card>
            </motion.div>

            {/* Confirmed Quality */}
            <motion.div
                key={stats.confirmedCount}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.3 }}
            >
                <Card className="p-4 bg-gradient-to-br from-blue-800/20 to-blue-900/20 border-blue-700/30">
                    <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-slate-300">Confirmed</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-400">
                        {stats.confirmedCount}
                    </div>
                    <div className="text-xs text-blue-400/70">
                        $100K-199K Liquidity
                    </div>
                </Card>
            </motion.div>

            {/* Sniper Targets */}
            <motion.div
                key={stats.targetsCount}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.3 }}
            >
                <Card className="p-4 bg-gradient-to-br from-purple-800/20 to-purple-900/20 border-purple-700/30">
                    <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-slate-300">Targets</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-400">
                        {stats.targetsCount}
                    </div>
                    <div className="text-xs text-purple-400/70">
                        $200K+ Premium
                    </div>
                </Card>
            </motion.div>

            {/* Total Liquidity */}
            <motion.div
                key={stats.totalLiquidity}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.3 }}
            >
                <Card className="p-4 bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm text-slate-300">Total Liquidity</span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-400">
                        {formatCurrency(stats.totalLiquidity)}
                    </div>
                    <div className="text-xs text-emerald-400/70">
                        All Active Tokens
                    </div>
                </Card>
            </motion.div>

            {/* Price Movers */}
            <motion.div
                key={`${stats.priceGainers}-${stats.priceLosers}`}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.3 }}
            >
                <Card className="p-4 bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-slate-300">Price Movers</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="text-green-400 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            <span className="font-bold">{stats.priceGainers}</span>
                        </div>
                        <div className="text-red-400 flex items-center gap-1">
                            <TrendingDown className="w-3 h-3" />
                            <span className="font-bold">{stats.priceLosers}</span>
                        </div>
                    </div>
                    <div className="text-xs text-slate-400">
                        1H Change
                    </div>
                </Card>
            </motion.div>

            {/* New Tokens Detected */}
            <motion.div
                key={stats.newTokensLast10Min}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.3 }}
            >
                <Card className="p-4 bg-gradient-to-br from-orange-800/20 to-orange-900/20 border-orange-700/30">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-orange-400" />
                        <span className="text-sm text-slate-300">New (10m)</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-400">
                        {stats.newTokensLast10Min}
                    </div>
                    <div className="text-xs text-orange-400/70">
                        Ultra-Fresh Tokens
                    </div>
                </Card>
            </motion.div>

            {/* Average Quality Score */}
            <motion.div
                key={Math.round(stats.avgQualityScore)}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.3 }}
            >
                <Card className="p-4 bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-slate-300">Avg Quality</span>
                    </div>
                    <div className="text-2xl font-bold text-yellow-400">
                        {Math.round(stats.avgQualityScore)}
                    </div>
                    <div className="text-xs text-yellow-400/70">
                        Out of 100
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}