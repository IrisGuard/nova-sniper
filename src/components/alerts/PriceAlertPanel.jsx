import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, BellRing, TrendingDown, TrendingUp, X, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { priceAlertSystem } from '@/api/functions';

export default function PriceAlertPanel({ tokens }) {
    const [alerts, setAlerts] = useState([]);
    const [showCreateAlert, setShowCreateAlert] = useState(false);
    const [newAlert, setNewAlert] = useState({
        tokenAddress: '',
        alertType: 'PRICE_DROP',
        threshold: 15
    });
    const [triggeredAlerts, setTriggeredAlerts] = useState([]);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    const showNotification = useCallback((message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 5000);
    }, []);

    const loadUserAlerts = useCallback(async () => {
        try {
            const response = await priceAlertSystem({
                action: 'list'
            });
            
            if (response.data.success) {
                setAlerts(response.data.alerts);
            }
        } catch (error) {
            console.error('Load alerts error:', error);
        }
    }, []);

    const checkForTriggeredAlerts = useCallback(async () => {
        try {
            const response = await priceAlertSystem({
                action: 'monitor'
            });
            
            if (response.data.success && response.data.monitoring.alertsTriggered > 0) {
                showNotification(`🔔 ${response.data.monitoring.alertsTriggered} PRICE ALERTS TRIGGERED!`, 'alert');
                loadUserAlerts(); // Refresh to show updated status
            }
        } catch (error) {
            console.error('Monitor alerts error:', error);
        }
    }, [showNotification, loadUserAlerts]);

    // Load user alerts on component mount
    useEffect(() => {
        loadUserAlerts();
    }, [loadUserAlerts]);

    // Auto-refresh alerts every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            loadUserAlerts();
            checkForTriggeredAlerts();
        }, 30000);
        
        return () => clearInterval(interval);
    }, [loadUserAlerts, checkForTriggeredAlerts]);

    const createAlert = async () => {
        if (!newAlert.tokenAddress || !newAlert.threshold) {
            showNotification('⚠️ Please select token and threshold', 'warning');
            return;
        }

        try {
            const response = await priceAlertSystem({
                action: 'create',
                tokenAddress: newAlert.tokenAddress,
                alertType: newAlert.alertType,
                threshold: newAlert.threshold
            });

            if (response.data.success) {
                showNotification(`✅ Price alert created for ${response.data.alert.tokenSymbol}`, 'success');
                setShowCreateAlert(false);
                setNewAlert({ tokenAddress: '', alertType: 'PRICE_DROP', threshold: 15 });
                loadUserAlerts();
            } else {
                showNotification(`❌ ${response.data.error}`, 'error');
            }
        } catch (error) {
            showNotification(`❌ Error creating alert: ${error.message}`, 'error');
        }
    };

    const deleteAlert = async (tokenAddress) => {
        try {
            const response = await priceAlertSystem({
                action: 'delete',
                tokenAddress: tokenAddress
            });

            if (response.data.success) {
                showNotification('✅ Alert deleted', 'success');
                loadUserAlerts();
            }
        } catch (error) {
            showNotification(`❌ Error deleting alert: ${error.message}`, 'error');
        }
    };

    const getAlertTypeIcon = (alertType, isTriggered) => {
        if (isTriggered) {
            return <BellRing className="w-4 h-4 text-red-500 animate-pulse" />;
        }
        
        switch (alertType) {
            case 'PRICE_DROP':
                return <TrendingDown className="w-4 h-4 text-orange-500" />;
            case 'PRICE_RISE':
                return <TrendingUp className="w-4 h-4 text-green-500" />;
            default:
                return <Bell className="w-4 h-4 text-blue-500" />;
        }
    };

    const getAlertTypeText = (alertType) => {
        switch (alertType) {
            case 'PRICE_DROP':
                return 'Price Drop';
            case 'PRICE_RISE':
                return 'Price Rise';
            case 'VOLUME_DROP':
                return 'Volume Drop';
            default:
                return 'Unknown';
        }
    };

    return (
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                        <Bell className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">🔔 Price Alert System</h2>
                        <p className="text-sm text-slate-400">Monitor price drops and get notified</p>
                    </div>
                </div>
                <Button 
                    onClick={() => setShowCreateAlert(!showCreateAlert)}
                    className="bg-orange-600 hover:bg-orange-700"
                >
                    <Settings className="w-4 h-4 mr-2" />
                    {showCreateAlert ? 'Cancel' : 'New Alert'}
                </Button>
            </div>

            {/* Create New Alert */}
            <AnimatePresence>
                {showCreateAlert && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 p-4 bg-slate-800 rounded-xl border border-slate-600"
                    >
                        <h3 className="text-lg font-semibold text-white mb-4">Create New Price Alert</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <Select
                                value={newAlert.tokenAddress}
                                onValueChange={(value) => setNewAlert({...newAlert, tokenAddress: value})}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Token" />
                                </SelectTrigger>
                                <SelectContent>
                                    {tokens.slice(0, 20).map(token => (
                                        <SelectItem key={token.address} value={token.address}>
                                            {token.symbol} - ${token.price?.toFixed(6)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={newAlert.alertType}
                                onValueChange={(value) => setNewAlert({...newAlert, alertType: value})}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Alert Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PRICE_DROP">Price Drop Alert</SelectItem>
                                    <SelectItem value="PRICE_RISE">Price Rise Alert</SelectItem>
                                    <SelectItem value="VOLUME_DROP">Volume Drop Alert</SelectItem>
                                </SelectContent>
                            </Select>

                            <Input
                                type="number"
                                placeholder="Threshold %"
                                value={newAlert.threshold}
                                onChange={(e) => setNewAlert({...newAlert, threshold: parseFloat(e.target.value)})}
                                className="bg-slate-700 border-slate-600"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={createAlert} className="bg-orange-600 hover:bg-orange-700">
                                Create Alert
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={() => setShowCreateAlert(false)}
                                className="border-slate-600"
                            >
                                Cancel
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Active Alerts */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Active Alerts ({alerts.length})</h3>
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={loadUserAlerts}
                        className="border-slate-600"
                    >
                        Refresh
                    </Button>
                </div>

                {alerts.length === 0 ? (
                    <Card className="bg-slate-800 border-slate-700">
                        <CardContent className="p-6 text-center">
                            <Bell className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                            <p className="text-slate-400">No price alerts active</p>
                            <p className="text-sm text-slate-500 mt-2">Create alerts to monitor price changes</p>
                        </CardContent>
                    </Card>
                ) : (
                    alerts.map(alert => (
                        <motion.div
                            key={alert.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card className={`border transition-all duration-300 ${
                                !alert.isActive 
                                    ? 'bg-red-900/20 border-red-500/50' 
                                    : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                            }`}>
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            {getAlertTypeIcon(alert.alertType, !alert.isActive)}
                                            <div>
                                                <CardTitle className="text-white text-lg">
                                                    {alert.tokenSymbol}
                                                    {!alert.isActive && (
                                                        <Badge className="ml-2 bg-red-600 animate-pulse">
                                                            TRIGGERED
                                                        </Badge>
                                                    )}
                                                </CardTitle>
                                                <p className="text-sm text-slate-400">
                                                    {getAlertTypeText(alert.alertType)} - {alert.threshold}%
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => deleteAlert(alert.tokenAddress)}
                                            className="text-slate-400 hover:text-red-400"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-slate-400">Current Price:</span>
                                            <span className="text-white ml-2">${alert.currentPrice?.toFixed(6) || '0'}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400">Peak Price:</span>
                                            <span className="text-white ml-2">${alert.peakPrice?.toFixed(6) || '0'}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400">Status:</span>
                                            <span className={`ml-2 ${alert.isActive ? 'text-green-400' : 'text-red-400'}`}>
                                                {alert.isActive ? 'Active' : 'Triggered'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400">Created:</span>
                                            <span className="text-white ml-2">
                                                {alert.createdAt ? new Date(alert.createdAt).toLocaleDateString() : 'Unknown'}
                                            </span>
                                        </div>
                                    </div>
                                    {alert.triggerReason && (
                                        <div className="mt-3 p-2 bg-red-900/30 rounded border border-red-500/30">
                                            <p className="text-sm text-red-300">
                                                <strong>Trigger Reason:</strong> {alert.triggerReason}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Notification */}
            <AnimatePresence>
                {notification.show && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-6 right-6 z-50"
                    >
                        <div className={`p-4 rounded-lg shadow-lg max-w-sm ${
                            notification.type === 'success' ? 'bg-green-600' :
                            notification.type === 'error' ? 'bg-red-600' :
                            notification.type === 'alert' ? 'bg-orange-600' :
                            'bg-blue-600'
                        }`}>
                            <p className="text-white font-medium">{notification.message}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}