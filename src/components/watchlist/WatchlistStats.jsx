import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Shield } from 'lucide-react';

export default function WatchlistStats({ tokens }) {
    const calculateStats = () => {
        if (!tokens.length) {
            return {
                totalGainers: 0,
                totalLosers: 0,
                alertsActive: 0,
                averageGain: 0
            };
        }

        let gainers = 0;
        let losers = 0;
        let alertsActive = 0;
        let totalGains = 0;
        let tokensWithPriceData = 0;

        tokens.forEach(token => {
            if (token.alertEnabled) alertsActive++;
            
            if (token.peakPrice && token.addedPrice) {
                const gain = ((token.peakPrice - token.addedPrice) / token.addedPrice) * 100;
                totalGains += gain;
                tokensWithPriceData++;
                
                if (gain > 0) gainers++;
                else if (gain < 0) losers++;
            }
        });

        return {
            totalGainers: gainers,
            totalLosers: losers,
            alertsActive,
            averageGain: tokensWithPriceData > 0 ? totalGains / tokensWithPriceData : 0
        };
    };

    const stats = calculateStats();

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '20px'
        }}>
            {/* Total Gainers */}
            <div style={{
                backgroundColor: '#1e293b',
                padding: '20px',
                borderRadius: '12px',
                textAlign: 'center',
                border: '2px solid #22c55e'
            }}>
                <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>🚀 Peak Gainers</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#22c55e' }}>
                    {stats.totalGainers}
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Tokens Above Entry</div>
            </div>

            {/* Total Losers */}
            <div style={{
                backgroundColor: '#1e293b',
                padding: '20px',
                borderRadius: '12px',
                textAlign: 'center',
                border: '2px solid #ef4444'
            }}>
                <TrendingDown className="w-6 h-6 text-red-500 mx-auto mb-2" />
                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>📉 Below Entry</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>
                    {stats.totalLosers}
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Tokens to Monitor</div>
            </div>

            {/* Active Alerts */}
            <div style={{
                backgroundColor: '#1e293b',
                padding: '20px',
                borderRadius: '12px',
                textAlign: 'center',
                border: '2px solid #f59e0b'
            }}>
                <AlertTriangle className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>🔔 Active Alerts</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
                    {stats.alertsActive}
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Monitoring for Drops</div>
            </div>

            {/* Average Performance */}
            <div style={{
                backgroundColor: '#1e293b',
                padding: '20px',
                borderRadius: '12px',
                textAlign: 'center',
                border: '2px solid #7c3aed'
            }}>
                <Shield className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>📊 Avg Peak Gain</div>
                <div style={{ 
                    fontSize: '2rem', 
                    fontWeight: 'bold', 
                    color: stats.averageGain >= 0 ? '#22c55e' : '#ef4444'
                }}>
                    {stats.averageGain > 0 ? '+' : ''}{stats.averageGain.toFixed(1)}%
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Portfolio Performance</div>
            </div>
        </div>
    );
}