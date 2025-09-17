
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
    ExternalLink, 
    Trash2, 
    Bell, 
    BellOff, 
    Settings, 
    Shield, 
    AlertTriangle,
    CheckCircle,
    Clock,
    Edit3,
    Save,
    X
} from 'lucide-react';
import { performSafetyChecks } from '@/api/functions';

export default function WatchlistCard({ token, onRemove, onUpdate, showNotification }) {
    const [safetyData, setSafetyData] = useState(null);
    const [loadingSafety, setLoadingSafety] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState({
        alertThreshold: token.alertThreshold || 15,
        alertInterval: token.alertInterval || 180,
        notes: token.notes || '',
        tags: (token.tags || []).join(', ')
    });

    const runSafetyCheck = useCallback(async () => {
        try {
            setLoadingSafety(true);
            const response = await performSafetyChecks({
                tokenAddress: token.tokenAddress
            });
            
            if (response.data.success) {
                setSafetyData(response.data.safetyCheck);
            }
        } catch (error) {
            console.error('Safety check error:', error);
        } finally {
            setLoadingSafety(false);
        }
    }, [token.tokenAddress]);

    useEffect(() => {
        // Load safety checks when component mounts
        if (token.tokenAddress) {
            runSafetyCheck();
        }
    }, [token.tokenAddress, runSafetyCheck]);

    const handleSaveSettings = async () => {
        try {
            const updates = {
                alertThreshold: parseFloat(editData.alertThreshold),
                alertInterval: parseInt(editData.alertInterval),
                notes: editData.notes,
                tags: editData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
            };

            await onUpdate(token.id, updates);
            setEditMode(false);
            setShowSettings(false);
        } catch (error) {
            showNotification('❌ Failed to save settings', 'error');
        }
    };

    const toggleAlert = async () => {
        await onUpdate(token.id, { alertEnabled: !token.alertEnabled });
    };

    const calculatePerformance = () => {
        if (!token.peakPrice || !token.addedPrice) return null;
        
        const gain = ((token.peakPrice - token.addedPrice) / token.addedPrice) * 100;
        return {
            percentage: gain,
            isPositive: gain > 0,
            formatted: `${gain > 0 ? '+' : ''}${gain.toFixed(2)}%`
        };
    };

    const performance = calculatePerformance();

    return (
        <div style={{
            backgroundColor: '#1e293b',
            borderRadius: '16px',
            padding: '25px',
            border: `2px solid ${token.alertEnabled ? '#22c55e' : '#374151'}`,
            position: 'relative'
        }}>
            {/* Enhanced Header with DexScreener-style Data */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '20px'
            }}>
                <div>
                    <h3 style={{ 
                        fontSize: '1.5rem', 
                        fontWeight: 'bold',
                        marginBottom: '8px'
                    }}>
                        {token.tokenName} 
                        <span style={{ color: '#22c55e', marginLeft: '10px' }}>
                            ${token.tokenSymbol}
                        </span>
                    </h3>
                    
                    {/* Enhanced Performance Display */}
                    {performance && (
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <Badge style={{
                                backgroundColor: performance.isPositive ? '#22c55e' : '#ef4444',
                                color: 'white',
                                padding: '4px 12px'
                            }}>
                                🚀 Peak: {performance.formatted}
                            </Badge>
                            
                            {/* Add 1H and 24H changes if available */}
                            {token.priceChangeH1 && (
                                <Badge style={{
                                    backgroundColor: token.priceChangeH1 > 0 ? '#22c55e' : '#ef4444',
                                    color: 'white',
                                    padding: '4px 12px'
                                }}>
                                    1H: {token.priceChangeH1 > 0 ? '+' : ''}{token.priceChangeH1?.toFixed(2)}%
                                </Badge>
                            )}
                            
                            {token.priceChangeH24 && (
                                <Badge style={{
                                    backgroundColor: token.priceChangeH24 > 0 ? '#22c55e' : '#ef4444',
                                    color: 'white',
                                    padding: '4px 12px'
                                }}>
                                    24H: {token.priceChangeH24 > 0 ? '+' : ''}{token.priceChangeH24?.toFixed(2)}%
                                </Badge>
                            )}
                        </div>
                    )}
                    
                    {/* Tags */}
                    {token.tags && token.tags.map(tag => (
                        <Badge 
                            key={tag} 
                            style={{
                                marginRight: '4px',
                                backgroundColor: 'transparent',
                                border: '1px solid #3b82f6',
                                color: '#60a5fa'
                            }}
                        >
                            {tag}
                        </Badge>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    {/* Alert Toggle */}
                    <Button
                        onClick={toggleAlert}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: `2px solid ${token.alertEnabled ? '#22c55e' : '#6b7280'}`,
                            backgroundColor: token.alertEnabled ? '#22c55e' : 'transparent',
                            color: token.alertEnabled ? 'white' : '#9ca3af'
                        }}
                    >
                        {token.alertEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                    </Button>

                    {/* Settings */}
                    <Button
                        onClick={() => setShowSettings(!showSettings)}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '2px solid #6b7280',
                            backgroundColor: 'transparent',
                            color: '#9ca3af'
                        }}
                    >
                        <Settings className="w-4 h-4" />
                    </Button>

                    {/* Remove */}
                    <Button
                        onClick={() => onRemove(token.tokenAddress)}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '2px solid #ef4444',
                            backgroundColor: 'transparent',
                            color: '#ef4444'
                        }}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Enhanced Price Info - DexScreener Style */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '15px',
                marginBottom: '20px'
            }}>
                <div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Entry Price</div>
                    <div style={{ fontWeight: 'bold', color: '#94a3b8' }}>
                        ${token.addedPrice?.toFixed(6) || 'N/A'}
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Current Price</div>
                    <div style={{ fontWeight: 'bold', color: '#22c55e' }}>
                        ${token.currentPrice?.toFixed(6) || 'N/A'}
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>💧 Liquidity</div>
                    <div style={{ fontWeight: 'bold', color: '#60a5fa' }}>
                        ${token.liquidity?.toLocaleString() || 'N/A'}
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>📊 Volume 24h</div>
                    <div style={{ fontWeight: 'bold', color: '#f59e0b' }}>
                        ${token.volume?.toLocaleString() || 'N/A'}
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>👥 Makers</div>
                    <div style={{ fontWeight: 'bold', color: '#7c3aed' }}>
                        {token.makersCount?.toLocaleString() || 'N/A'}
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>🎯 Alert At</div>
                    <div style={{ fontWeight: 'bold', color: '#f59e0b' }}>
                        -{token.alertThreshold || 15}%
                    </div>
                </div>
            </div>

            {/* Safety Status */}
            {safetyData && (
                <div style={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    padding: '15px',
                    marginBottom: '20px'
                }}>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        marginBottom: '10px'
                    }}>
                        <span style={{ fontWeight: 'bold' }}>🛡️ Safety Score</span>
                        <Badge style={{
                            backgroundColor: getSafetyBadgeColor(safetyData.overallScore),
                            color: 'white',
                            padding: '4px 12px'
                        }}>
                            {safetyData.overallScore}/100
                        </Badge>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {getSafetyIcon(safetyData.honeypotResult)}
                            <span>Honeypot Check</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {getSafetyIcon(safetyData.liquidityLockResult)}
                            <span>Liquidity Lock</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {getSafetyIcon(safetyData.mintAuthorityResult)}
                            <span>Mint Authority</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {getSafetyIcon(safetyData.rugCheckResult)}
                            <span>Rug Check</span>
                        </div>
                    </div>
                </div>
            )}

            {loadingSafety && (
                <div style={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    padding: '15px',
                    marginBottom: '20px',
                    textAlign: 'center',
                    opacity: 0.7
                }}>
                    <Clock className="w-5 h-5 mx-auto mb-2 animate-spin" />
                    Running Safety Checks...
                </div>
            )}

            {/* Settings Panel */}
            {showSettings && (
                <div style={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    padding: '20px',
                    marginBottom: '20px',
                    border: '1px solid #374151'
                }}>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '15px'
                    }}>
                        <h4 style={{ fontWeight: 'bold' }}>⚙️ Token Settings</h4>
                        <Button
                            onClick={() => setEditMode(!editMode)}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: editMode ? '#ef4444' : '#7c3aed',
                                color: 'white'
                            }}
                        >
                            {editMode ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                        </Button>
                    </div>

                    {editMode ? (
                        <div style={{ display: 'grid', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>
                                    Alert Threshold (%)
                                </label>
                                <Input
                                    type="number"
                                    value={editData.alertThreshold}
                                    onChange={(e) => setEditData({...editData, alertThreshold: e.target.value})}
                                    style={{
                                        backgroundColor: '#374151',
                                        border: '1px solid #6b7280',
                                        color: 'white'
                                    }}
                                />
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>
                                    Check Interval (minutes)
                                </label>
                                <Input
                                    type="number"
                                    value={editData.alertInterval}
                                    onChange={(e) => setEditData({...editData, alertInterval: e.target.value})}
                                    style={{
                                        backgroundColor: '#374151',
                                        border: '1px solid #6b7280',
                                        color: 'white'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>
                                    Tags (comma separated)
                                </label>
                                <Input
                                    value={editData.tags}
                                    onChange={(e) => setEditData({...editData, tags: e.target.value})}
                                    placeholder="e.g. gaming, defi, meme"
                                    style={{
                                        backgroundColor: '#374151',
                                        border: '1px solid #6b7280',
                                        color: 'white'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>
                                    Notes
                                </label>
                                <Textarea
                                    value={editData.notes}
                                    onChange={(e) => setEditData({...editData, notes: e.target.value})}
                                    placeholder="Your notes about this token..."
                                    style={{
                                        backgroundColor: '#374151',
                                        border: '1px solid #6b7280',
                                        color: 'white'
                                    }}
                                />
                            </div>

                            <Button 
                                onClick={handleSaveSettings} 
                                style={{
                                    backgroundColor: '#22c55e',
                                    color: 'white',
                                    padding: '12px 20px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    fontWeight: 'bold'
                                }}
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Save Settings
                            </Button>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '10px', fontSize: '0.9rem' }}>
                            <div>
                                <strong>Alert:</strong> -{token.alertThreshold || 15}% drop from peak
                            </div>
                            <div>
                                <strong>Frequency:</strong> Every {Math.floor((token.alertInterval || 180) / 60)} hours
                            </div>
                            {token.notes && (
                                <div>
                                    <strong>Notes:</strong> {token.notes}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* External Links - ΟΛΑ REAL LINKS */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <a
                    href={`https://dexscreener.com/solana/${token.tokenAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        padding: '12px 18px',
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                    }}
                >
                    📈 DexScreener <ExternalLink className="w-3 h-3" />
                </a>

                <a
                    href={`https://solscan.io/token/${token.tokenAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        padding: '12px 18px',
                        backgroundColor: '#7c3aed',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
                    }}
                >
                    🔍 SolScan <ExternalLink className="w-3 h-3" />
                </a>

                <a
                    href={`https://jup.ag/swap/SOL-${token.tokenAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        padding: '12px 18px',
                        backgroundColor: '#22c55e',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                    }}
                >
                    🔄 Trade Jupiter <ExternalLink className="w-3 h-3" />
                </a>
            </div>

            {/* Token Address with improved copy function */}
            <div style={{
                marginTop: '15px',
                fontSize: '0.7rem',
                opacity: 0.6,
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}>
                <span>📍 {token.tokenAddress}</span>
                <button
                    onClick={async () => {
                        try {
                            await navigator.clipboard.writeText(token.tokenAddress);
                            showNotification(`✅ Address copied: ${token.tokenAddress.slice(0, 8)}...`, 'success');
                        } catch (error) {
                            showNotification('❌ Failed to copy address', 'error');
                        }
                    }}
                    style={{
                        background: '#374151',
                        border: 'none',
                        borderRadius: '4px',
                        color: 'white',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        fontSize: '0.7rem'
                    }}
                >
                    📋 Copy
                </button>
            </div>
        </div>
    );
}

// Helper functions
function getSafetyIcon(result) {
    if (result === true) {
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else if (result === false) {
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
    } else {
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
}

function getSafetyBadgeColor(score) {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#fb923c';
    return '#ef4444';
}
