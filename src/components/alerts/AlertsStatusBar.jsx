import React, { useState, useEffect } from 'react';
import { Bell, BellRing, AlertTriangle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from 'framer-motion';
import { priceAlertSystem } from '@/api/functions';

export default function AlertsStatusBar() {
    const [alertStats, setAlertStats] = useState({
        activeAlerts: 0,
        triggeredAlerts: 0,
        lastCheck: null
    });
    const [recentTriggers, setRecentTriggers] = useState([]);

    useEffect(() => {
        checkAlertStatus();
        
        // Auto-refresh every 2 minutes
        const interval = setInterval(() => {
            checkAlertStatus();
        }, 120000);
        
        return () => clearInterval(interval);
    }, []);

    const checkAlertStatus = async () => {
        try {
            // Get user alerts
            const alertsResponse = await priceAlertSystem({ action: 'list' });
            
            if (alertsResponse.data.success) {
                const alerts = alertsResponse.data.alerts;
                const active = alerts.filter(a => a.isActive).length;
                const triggered = alerts.filter(a => !a.isActive && a.triggeredAt).length;
                
                setAlertStats({
                    activeAlerts: active,
                    triggeredAlerts: triggered,
                    lastCheck: new Date().toISOString()
                });

                // Get recently triggered alerts (last 4 hours)
                const recent = alerts.filter(a => {
                    if (!a.triggeredAt) return false;
                    const triggerTime = new Date(a.triggeredAt).getTime();
                    const fourHoursAgo = Date.now() - (4 * 60 * 60 * 1000);
                    return triggerTime >= fourHoursAgo;
                }).slice(0, 3); // Show max 3 recent

                setRecentTriggers(recent);
            }

            // Run monitoring check
            await priceAlertSystem({ action: 'monitor' });
            
        } catch (error) {
            console.error('Alert status check error:', error);
        }
    };

    return (
        <div className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            {/* Alert Icon & Status */}
            <div className="flex items-center gap-2">
                {alertStats.triggeredAlerts > 0 ? (
                    <motion.div
                        animate={{ 
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0] 
                        }}
                        transition={{ 
                            duration: 0.8, 
                            repeat: Infinity, 
                            repeatDelay: 2 
                        }}
                    >
                        <BellRing className="w-5 h-5 text-red-500" />
                    </motion.div>
                ) : (
                    <Bell className="w-5 h-5 text-slate-400" />
                )}
                
                <div className="text-sm">
                    <div className="text-slate-300 font-medium">
                        {alertStats.activeAlerts} Active
                        {alertStats.triggeredAlerts > 0 && (
                            <Badge className="ml-2 bg-red-600 text-white animate-pulse">
                                {alertStats.triggeredAlerts} Triggered
                            </Badge>
                        )}
                    </div>
                    {alertStats.lastCheck && (
                        <div className="text-xs text-slate-500">
                            Last check: {new Date(alertStats.lastCheck).toLocaleTimeString()}
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Triggers */}
            <AnimatePresence>
                {recentTriggers.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-600"
                    >
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        <div className="text-xs text-slate-300">
                            Recent triggers:
                            <div className="flex gap-1 mt-1">
                                {recentTriggers.map((alert, index) => (
                                    <Badge 
                                        key={index}
                                        variant="outline" 
                                        className="text-xs border-orange-500/50 text-orange-300"
                                    >
                                        {alert.tokenSymbol}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}