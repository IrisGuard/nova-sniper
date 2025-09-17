import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
    Play, 
    Pause, 
    RotateCcw, 
    Settings, 
    Zap,
    Activity,
    AlertTriangle,
    CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function RealTimeControls({ 
    isRealTimeActive, 
    onStartRealTime, 
    onStopRealTime, 
    onRefreshData,
    lastUpdate,
    systemHealth = {}
}) {
    const [isStarting, setIsStarting] = useState(false);
    const [isStopping, setIsStopping] = useState(false);

    const handleStartRealTime = async () => {
        setIsStarting(true);
        try {
            await onStartRealTime();
        } finally {
            setIsStarting(false);
        }
    };

    const handleStopRealTime = async () => {
        setIsStopping(true);
        try {
            await onStopRealTime();
        } finally {
            setIsStopping(false);
        }
    };

    const getSystemStatusColor = () => {
        if (!isRealTimeActive) return '#6b7280'; // Gray
        if (systemHealth.overallHealth === 'excellent') return '#22c55e'; // Green
        if (systemHealth.overallHealth === 'good') return '#3b82f6'; // Blue
        if (systemHealth.overallHealth === 'fair') return '#f59e0b'; // Orange
        return '#ef4444'; // Red
    };

    const getSystemStatusText = () => {
        if (!isRealTimeActive) return 'STANDBY';
        if (systemHealth.overallHealth === 'excellent') return 'OPTIMAL';
        if (systemHealth.overallHealth === 'good') return 'GOOD';
        if (systemHealth.overallHealth === 'fair') return 'FAIR';
        return 'ISSUES';
    };

    return (
        <Card className="p-6 bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700/50 backdrop-blur-sm">
            {/* System Status Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <motion.div
                        animate={{ 
                            scale: isRealTimeActive ? [1, 1.1, 1] : 1,
                            boxShadow: isRealTimeActive 
                                ? ['0 0 0 0 rgba(34, 197, 94, 0.7)', '0 0 0 10px rgba(34, 197, 94, 0)', '0 0 0 0 rgba(34, 197, 94, 0)']
                                : '0 0 0 0 rgba(107, 114, 128, 0)'
                        }}
                        transition={{ repeat: isRealTimeActive ? Infinity : 0, duration: 2 }}
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: getSystemStatusColor() }}
                    />
                    <div>
                        <h3 className="text-lg font-bold text-white">
                            Real-Time System
                        </h3>
                        <p className="text-sm text-slate-400">
                            Nova Sniper Detection Engine
                        </p>
                    </div>
                </div>

                <Badge 
                    className="px-3 py-1 text-sm font-bold"
                    style={{
                        backgroundColor: `${getSystemStatusColor()}20`,
                        color: getSystemStatusColor(),
                        borderColor: `${getSystemStatusColor()}50`
                    }}
                >
                    {getSystemStatusText()}
                </Badge>
            </div>

            {/* Control Buttons */}
            <div className="flex flex-wrap gap-3 mb-6">
                {!isRealTimeActive ? (
                    <Button
                        onClick={handleStartRealTime}
                        disabled={isStarting}
                        className="flex-1 min-w-[200px] bg-green-600 hover:bg-green-700 text-white h-12"
                    >
                        {isStarting ? (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            >
                                <Settings className="w-5 h-5 mr-2" />
                            </motion.div>
                        ) : (
                            <Play className="w-5 h-5 mr-2" />
                        )}
                        {isStarting ? 'Starting Real-Time System...' : 'Start Real-Time Detection'}
                    </Button>
                ) : (
                    <Button
                        onClick={handleStopRealTime}
                        disabled={isStopping}
                        className="flex-1 min-w-[200px] bg-red-600 hover:bg-red-700 text-white h-12"
                    >
                        {isStopping ? (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            >
                                <Settings className="w-5 h-5 mr-2" />
                            </motion.div>
                        ) : (
                            <Pause className="w-5 h-5 mr-2" />
                        )}
                        {isStopping ? 'Stopping System...' : 'Stop Real-Time System'}
                    </Button>
                )}

                <Button
                    onClick={onRefreshData}
                    variant="outline"
                    className="border-slate-600 hover:bg-slate-700 text-white"
                >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* System Health Indicators */}
            {isRealTimeActive && systemHealth && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="text-center p-3 rounded-lg bg-slate-700/30">
                        <Activity className="w-4 h-4 mx-auto mb-1 text-blue-400" />
                        <div className="text-xs text-slate-400 mb-1">WebSocket</div>
                        <div className="text-sm font-bold text-blue-400">
                            {systemHealth.websocketStatus || 'Connected'}
                        </div>
                    </div>
                    
                    <div className="text-center p-3 rounded-lg bg-slate-700/30">
                        <Zap className="w-4 h-4 mx-auto mb-1 text-green-400" />
                        <div className="text-xs text-slate-400 mb-1">Detection</div>
                        <div className="text-sm font-bold text-green-400">
                            {systemHealth.detectionRate || 'Active'}
                        </div>
                    </div>
                    
                    <div className="text-center p-3 rounded-lg bg-slate-700/30">
                        <CheckCircle className="w-4 h-4 mx-auto mb-1 text-purple-400" />
                        <div className="text-xs text-slate-400 mb-1">Validation</div>
                        <div className="text-sm font-bold text-purple-400">
                            {systemHealth.validationRate || 'Running'}
                        </div>
                    </div>
                    
                    <div className="text-center p-3 rounded-lg bg-slate-700/30">
                        <AlertTriangle className="w-4 h-4 mx-auto mb-1 text-orange-400" />
                        <div className="text-xs text-slate-400 mb-1">Monitoring</div>
                        <div className="text-sm font-bold text-orange-400">
                            {systemHealth.monitoringRate || 'Active'}
                        </div>
                    </div>
                </div>
            )}

            {/* Last Update Info */}
            <div className="flex items-center justify-between text-sm text-slate-400 border-t border-slate-700 pt-4">
                <span>Last Update:</span>
                <span className="font-mono">{lastUpdate}</span>
            </div>

            {/* Real-time Performance Stats */}
            {isRealTimeActive && (
                <div className="mt-4 text-xs text-slate-500 space-y-1">
                    <div className="flex justify-between">
                        <span>Update Frequency:</span>
                        <span>Every 2-3 seconds</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Detection Latency:</span>
                        <span>&lt; 1 second</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Price Drop Monitoring:</span>
                        <span>15% threshold active</span>
                    </div>
                </div>
            )}
        </Card>
    );
}