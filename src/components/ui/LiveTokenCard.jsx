import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
    TrendingUp, 
    TrendingDown, 
    Eye, 
    ExternalLink, 
    Copy,
    Star,
    AlertTriangle,
    CheckCircle,
    Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LiveTokenCard({ token, onAddToWatchlist, showNotification, isLive = true }) {
    const [copied, setCopied] = useState(false);
    const [priceAnimation, setPriceAnimation] = useState(null);
    const [lastPrice, setLastPrice] = useState(token.price);

    useEffect(() => {
        if (token.price !== lastPrice) {
            setPriceAnimation(token.price > lastPrice ? 'up' : 'down');
            setLastPrice(token.price);
            setTimeout(() => setPriceAnimation(null), 1000);
        }
    }, [token.price, lastPrice]);

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            showNotification(`✅ Address copied: ${text.slice(0, 8)}...`, 'success');
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            showNotification('❌ Failed to copy address', 'error');
        }
    };

    const formatLiquidity = (liquidity) => {
        if (!liquidity) return '$0';
        if (liquidity >= 1000000) return `$${(liquidity / 1000000).toFixed(1)}M`;
        if (liquidity >= 1000) return `$${(liquidity / 1000).toFixed(0)}K`;
        return `$${liquidity.toLocaleString()}`;
    };

    const formatPrice = (price) => {
        if (!price) return '$0.000000';
        if (price >= 1) return `$${price.toFixed(4)}`;
        if (price >= 0.01) return `$${price.toFixed(6)}`;
        return `$${price.toFixed(8)}`;
    };

    const getRiskColor = () => {
        if (token.qualityScore >= 85) return '#22c55e'; // Green
        if (token.qualityScore >= 70) return '#f59e0b'; // Orange
        return '#ef4444'; // Red
    };

    const getLiquidityColor = () => {
        if (token.liquidity >= 200000) return '#7c3aed'; // Purple for 200k+
        if (token.liquidity >= 100000) return '#3b82f6'; // Blue for 100k+
        return '#22c55e'; // Green for 50k+
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            layout
            className={`
                relative overflow-hidden rounded-xl p-6 
                bg-gradient-to-br from-slate-800/90 to-slate-900/90 
                border border-slate-700/50 backdrop-blur-sm
                hover:border-slate-600/50 hover:shadow-xl
                transition-all duration-300
                ${isLive ? 'ring-1 ring-green-500/30' : ''}
            `}
            style={{
                background: `linear-gradient(135deg, 
                    rgba(15, 23, 42, 0.95) 0%, 
                    rgba(30, 41, 59, 0.90) 100%)`
            }}
        >
            {/* Live Indicator */}
            {isLive && (
                <div className="absolute top-2 right-2">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 border border-green-500/30"
                    >
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-xs text-green-400 font-medium">LIVE</span>
                    </motion.div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-white">
                            {token.name}
                        </h3>
                        <Badge 
                            className="text-sm font-bold px-2 py-1"
                            style={{ 
                                backgroundColor: getRiskColor(),
                                color: 'white'
                            }}
                        >
                            ${token.symbol}
                        </Badge>
                    </div>
                    
                    {/* Age & Quality Score */}
                    <div className="flex items-center gap-2">
                        {token.ageMinutes < 60 && (
                            <Badge className="bg-red-500/20 text-red-400 border border-red-500/30">
                                <Zap className="w-3 h-3 mr-1" />
                                {token.ageMinutes}m old
                            </Badge>
                        )}
                        <Badge 
                            className="border"
                            style={{
                                backgroundColor: `${getRiskColor()}20`,
                                borderColor: `${getRiskColor()}50`,
                                color: getRiskColor()
                            }}
                        >
                            Quality: {token.qualityScore || 0}/100
                        </Badge>
                    </div>
                </div>

                <Button
                    onClick={() => onAddToWatchlist(token)}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                    <Star className="w-4 h-4 mr-1" />
                    Watch
                </Button>
            </div>

            {/* Price Display */}
            <div className="mb-4">
                <motion.div
                    animate={{
                        color: priceAnimation === 'up' ? '#22c55e' : 
                               priceAnimation === 'down' ? '#ef4444' : '#f8fafc'
                    }}
                    className="text-2xl font-bold mb-1"
                >
                    {formatPrice(token.price)}
                </motion.div>
                
                {/* Price Changes */}
                <div className="flex items-center gap-3">
                    {token.priceChangeH1 !== undefined && (
                        <div className={`flex items-center gap-1 ${
                            token.priceChangeH1 >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                            {token.priceChangeH1 >= 0 ? 
                                <TrendingUp className="w-3 h-3" /> : 
                                <TrendingDown className="w-3 h-3" />
                            }
                            <span className="text-sm font-medium">
                                {token.priceChangeH1 >= 0 ? '+' : ''}
                                {token.priceChangeH1?.toFixed(2)}% (1h)
                            </span>
                        </div>
                    )}
                    
                    {token.priceChangeH24 !== undefined && (
                        <div className={`flex items-center gap-1 ${
                            token.priceChangeH24 >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                            {token.priceChangeH24 >= 0 ? 
                                <TrendingUp className="w-3 h-3" /> : 
                                <TrendingDown className="w-3 h-3" />
                            }
                            <span className="text-sm font-medium">
                                {token.priceChangeH24 >= 0 ? '+' : ''}
                                {token.priceChangeH24?.toFixed(2)}% (24h)
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 rounded-lg bg-slate-700/30">
                    <div className="text-xs text-slate-400 mb-1">Liquidity</div>
                    <div 
                        className="text-lg font-bold"
                        style={{ color: getLiquidityColor() }}
                    >
                        {formatLiquidity(token.liquidity)}
                    </div>
                </div>
                
                <div className="text-center p-3 rounded-lg bg-slate-700/30">
                    <div className="text-xs text-slate-400 mb-1">Volume 24h</div>
                    <div className="text-lg font-bold text-blue-400">
                        {formatLiquidity(token.volume)}
                    </div>
                </div>
                
                <div className="text-center p-3 rounded-lg bg-slate-700/30">
                    <div className="text-xs text-slate-400 mb-1">Makers</div>
                    <div className="text-lg font-bold text-purple-400">
                        {token.makersCount?.toLocaleString() || 'N/A'}
                    </div>
                </div>
                
                <div className="text-center p-3 rounded-lg bg-slate-700/30">
                    <div className="text-xs text-slate-400 mb-1">DEX</div>
                    <div className="text-sm font-bold text-orange-400 uppercase">
                        {token.dexId || 'RAYDIUM'}
                    </div>
                </div>
            </div>

            {/* Security Indicators */}
            {token.validationScore && (
                <div className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-slate-700/20">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-400">
                        Security Validated ({token.validationScore}/100)
                    </span>
                    {token.authenticationStatus === 'VALIDATED' && (
                        <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs">
                            VERIFIED
                        </Badge>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 mb-4">
                <Button
                    asChild
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                >
                    <a
                        href={`https://jup.ag/swap/SOL-${token.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Trade
                    </a>
                </Button>
                
                <Button
                    asChild
                    size="sm"
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                >
                    <a
                        href={token.chartUrl || `https://dexscreener.com/solana/${token.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Eye className="w-4 h-4 mr-1" />
                        Chart
                    </a>
                </Button>
            </div>

            {/* Address */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-700/20">
                <span className="text-xs text-slate-400 font-mono">
                    {token.address?.slice(0, 8)}...{token.address?.slice(-8)}
                </span>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(token.address)}
                    className="h-6 px-2 text-slate-400 hover:text-white"
                >
                    <Copy className="w-3 h-3" />
                    {copied ? 'Copied!' : 'Copy'}
                </Button>
            </div>

            {/* Real-time update timestamp */}
            {isLive && (
                <div className="absolute bottom-2 left-2">
                    <span className="text-xs text-slate-500">
                        Updated: {new Date().toLocaleTimeString()}
                    </span>
                </div>
            )}
        </motion.div>
    );
}