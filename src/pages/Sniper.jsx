
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fetchTokens } from '@/api/functions';
import { watchlistManager } from '@/api/functions';
import { testAllApisNow } from '@/api/functions';
import { purgeEverythingAndStartFresh } from '@/api/functions';
import { startAllPhases } from '@/api/functions';
import { stopAllPhases } from '@/api/functions';
import { Rocket, Square, Flame, Search, RefreshCw, CheckCircle, Target, AlertTriangle, ExternalLink, Copy, Star } from 'lucide-react';

// --- Helper Components (Memoized for Performance) ---
const StatCard = React.memo(({ title, value, subtext, color, icon: Icon }) => (
    <div style={{ backgroundColor: 'var(--bg-content)', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', color: color, marginBottom: '8px' }}>
            <Icon size={16} />
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>{title}</div>
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: '5px 0' }}>
            {value}
        </div>
        <div style={{ fontSize: '0.8rem', opacity: 0.6, textTransform: 'uppercase' }}>{subtext}</div>
    </div>
));

const ControlButton = React.memo(({ onClick, children, disabled, variant = 'primary', icon: Icon }) => {
    const styles = {
        primary: { backgroundColor: 'var(--accent-green)', color: '#0A0F1A', border: 'none' },
        secondary: { backgroundColor: '#334155', color: 'var(--text-primary)', border: 'none' },
        danger: { backgroundColor: 'var(--accent-red)', color: 'white', border: 'none' },
        warning: { backgroundColor: 'transparent', color: 'var(--accent-orange)', border: '1px solid var(--accent-orange)' },
        info: { backgroundColor: 'transparent', color: 'var(--accent-blue)', border: '1px solid var(--accent-blue)' },
    };
    return (
        <button onClick={onClick} disabled={disabled} style={{ padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: disabled ? 0.6 : 1, flex: 1, minWidth: '150px', ...styles[variant] }}>
            {Icon && <Icon size={18} />}
            {children}
        </button>
    );
});

const TokenCard = React.memo(({ token, showNotification }) => {
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => showNotification(`✅ Address copied!`, 'success'), () => showNotification('❌ Failed to copy', 'error'));
    };
    const formatNumber = (num) => {
        if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
        if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
        return `$${(num || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    };
    const priceChangeStyle = (change) => ({ color: change >= 0 ? 'var(--accent-green-text)' : 'var(--accent-red)', fontWeight: 'bold' });

    return (
        <div style={{ backgroundColor: 'var(--bg-content)', borderRadius: '16px', padding: '20px', border: `1px solid var(--border-color)`, display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{token.name} <span style={{ color: 'var(--text-secondary)', opacity: 0.8 }}>${token.symbol}</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                        <span style={{ fontSize: '0.8rem', opacity: 0.7, userSelect: 'all' }}>{token.address}</span>
                        <button onClick={() => copyToClipboard(token.address)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}><Copy size={14} /></button>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <a href={token.chartUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}><ExternalLink size={20} /></a>
                    <button style={{ background: 'none', border: 'none', color: 'var(--accent-orange)', cursor: 'pointer', padding: 0 }}><Star size={20} /></button>
                </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '15px', textAlign: 'center' }}>
                <div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '5px' }}>Liquidity</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{formatNumber(token.liquidity)}</div>
                </div>
                <div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '5px' }}>Volume (24h)</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{formatNumber(token.volume)}</div>
                </div>
                <div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '5px' }}>Price</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>${token.price?.toPrecision(4)}</div>
                </div>
                <div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '5px' }}>24h Change</div>
                    <div style={{ fontSize: '1.1rem', ...priceChangeStyle(token.priceChangeH24) }}>{token.priceChangeH24?.toFixed(2)}%</div>
                </div>
            </div>
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', fontSize: '0.8rem', opacity: 0.7, textAlign: 'right' }}>Detected: {new Date(token.pairCreatedAt).toLocaleString()}</div>
        </div>
    );
});

// --- Main Page Component ---
export default function SniperPage() {
    const [tokens, setTokens] = useState({ early: [], confirmed: [], targets: [] });
    const [systemStatus, setSystemStatus] = useState('STANDBY');
    const [isLoading, setIsLoading] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [activeTab, setActiveTab] = useState('early');
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    
    // Using a ref to track system state to avoid stale closures in intervals
    const statusRef = useRef(systemStatus);
    statusRef.current = systemStatus;

    const showNotification = useCallback((message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    }, []);

    const loadAllTokens = useCallback(async (isSilent = false) => {
        if (!isSilent) setIsLoading(true);
        const startTime = performance.now();
        try {
            const [early, confirmed, targets] = await Promise.all([
                fetchTokens({ category: 'early' }),
                fetchTokens({ category: 'confirmed' }),
                fetchTokens({ category: 'targets' })
            ]);
            setTokens({ early: early.data.tokens || [], confirmed: confirmed.data.tokens || [], targets: targets.data.tokens || [] });
            setLastUpdate(new Date());
            
            const executionTime = performance.now() - startTime;
            if (executionTime > 4000) {
                 console.warn(`[PERFORMANCE WARNING] loadAllTokens execution time: ${Math.round(executionTime)}ms`);
            }

            if (!isSilent) console.log(`[UI] Data refreshed. Early: ${early.data.tokens?.length || 0}, Confirmed: ${confirmed.data.tokens?.length || 0}, Targets: ${targets.data.tokens?.length || 0}`);
        } catch (error) {
            if (!isSilent) showNotification('❌ Failed to refresh UI data', 'error');
        } finally {
            if (!isSilent) setIsLoading(false);
        }
    }, [showNotification]);

    const startSystem = async () => {
        if (systemStatus === 'MONITORING') return;
        showNotification('🚀 Activating Real-Time Orchestrator...', 'info');
        setSystemStatus('STARTING...');
        setIsLoading(true);
        try {
            // This triggers the entire backend pipeline
            const response = await startAllPhases({});
            if (response.data.success) {
                setSystemStatus('MONITORING');
                showNotification('✅ All Systems Active! Real-time UI polling initiated.', 'success');
                // Immediately load tokens to show results from the initial scan
                await loadAllTokens();
            } else { throw new Error(response.data.error || 'Failed to start orchestrator'); }
        } catch (err) {
            showNotification(`❌ Activation Failed: ${err.message}`, 'error');
            setSystemStatus('ERROR');
        } finally {
            setIsLoading(false);
        }
    };

    const stopSystem = async () => {
        if (systemStatus !== 'MONITORING') return;
        showNotification('🛑 Deactivating Real-Time Systems...', 'warning');
        setIsLoading(true);
        try {
            await stopAllPhases({});
            setSystemStatus('STANDBY');
            showNotification('⏹️ System is now STANDBY.', 'info');
        } catch (err) {
            showNotification(`❌ Deactivation Failed: ${err.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const runPurge = async () => {
        if (!confirm('DANGER: This will permanently delete ALL token data. Are you sure?')) return;
        setIsLoading(true);
        try {
            // Correctly call the definitive purge function
            const response = await purgeEverythingAndStartFresh({});
            showNotification(`✅ ${response.data.deletedCounts.tokensDeleted} tokens purged!`, 'success');
            loadAllTokens();
        } catch (err) { showNotification(`❌ Purge Error: ${err.message}`, 'error'); } finally { setIsLoading(false); }
    };
    
    const runTest = async () => {
        setIsLoading(true); showNotification('🧪 Running API health checks...', 'info');
        try {
            const response = await testAllApisNow({});
            showNotification(response.data.success ? `✅ API Test OK: ${response.data.message}` : `❌ API Test Failed: ${response.data.error}`, response.data.success ? 'success' : 'error');
        } catch (err) { showNotification(`❌ API Test Failed: ${err.message}`, 'error'); } finally { setIsLoading(false); }
    };

    // PHASE 2 FIX: Robust polling with cleanup
    useEffect(() => {
        let intervalId = null;

        const safeLoadTokens = async () => {
            // only poll if the system is active
            if (statusRef.current === 'MONITORING') {
                 try {
                    await loadAllTokens(true);
                } catch (error) {
                    console.error('UI Polling error:', error);
                }
            }
        };

        if (systemStatus === 'MONITORING') {
            // Clear any existing interval before starting a new one
            if (intervalId) clearInterval(intervalId); // This 'intervalId' will always be null here. The next line correctly assigns.
            intervalId = setInterval(safeLoadTokens, 5000); // Poll every 5 seconds
        }

        // Cleanup function to run when component unmounts or systemStatus changes
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [systemStatus, loadAllTokens]);

    const renderTokenList = (tokenList, emptyMessage) => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', padding: '10px 0' }}>
            {isLoading && tokenList.length === 0 ? <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px', color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Loading Real-Time Data...</div> :
             tokenList.length > 0 ? tokenList.map(token => <TokenCard key={token.address} token={token} showNotification={showNotification} />) :
             <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px', color: 'var(--text-secondary)', fontSize: '1.2rem' }}>{emptyMessage}</div>
            }
        </div>
    );

    const TAB_CONFIG = {
        early: { label: 'Early Detection', icon: Target, color: 'var(--accent-orange)', subtext: '$50K-99K | VERIFIED', empty: 'Waiting for Early Detection Tokens...' },
        confirmed: { label: 'Confirmed Quality', icon: CheckCircle, color: 'var(--accent-blue)', subtext: '$100K-199K | PREMIUM', empty: 'No Confirmed Tokens yet. Waiting for new pools to meet criteria.' },
        targets: { label: 'Sniper Targets', icon: Rocket, color: 'var(--accent-purple)', subtext: '$200K+ | ELITE', empty: 'No Sniper Targets. Waiting for premium pools to emerge.' },
    };

    return (
        <div style={{ padding: '20px', fontFamily: "'Segoe UI', sans-serif", backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)', minHeight: '100vh' }}>
            <style jsx global>{`
                :root {
                    --bg-main: #0A0F1A;
                    --bg-content: #171E2B; 
                    --header-gradient-start: #D2691E;
                    --header-gradient-end: #FF8C00;
                    --text-primary: #F0F4F8;
                    --text-secondary: #8A9BB3;
                    --accent-green: #00f58a;
                    --accent-green-text: #00FF85;
                    --accent-red: #FF4757;
                    --accent-blue: #3B82F6;
                    --accent-orange: #FFA500;
                    --accent-purple: #8b5cf6;
                    --border-color: #2A3B5A;
                }
            `}</style>
            
            {/* Header */}
            <header style={{ 
                textAlign: 'center', 
                marginBottom: '30px', 
                padding: '20px', 
                borderRadius: '16px', 
                background: 'linear-gradient(90deg, var(--header-gradient-start), var(--header-gradient-end))',
                boxShadow: '0 0 25px -5px var(--header-gradient-end)'
            }}>
                <h1 style={{ fontSize: '2.8rem', marginBottom: '10px', color: 'white', textShadow: '1px 1px 3px rgba(0,0,0,0.4)' }}>🎯 Nova Sniper v3.0</h1>
                <p style={{ fontSize: '1.2rem', opacity: 0.9, color: 'white' }}>Real-Time Detection | Liquidity &gt; $50K | Unique Addresses</p>
                <div style={{ 
                    marginTop: '15px', 
                    color: systemStatus === 'MONITORING' ? 'var(--accent-green-text)' : 'var(--text-primary)', 
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    border: `1px solid ${systemStatus === 'MONITORING' ? 'var(--accent-green)' : 'var(--border-color)'}`,
                    padding: '8px 16px',
                    borderRadius: '8px',
                    display: 'inline-block'
                }}>
                    Last Update: {lastUpdate ? lastUpdate.toLocaleTimeString() : 'N/A'} | SYSTEM {systemStatus} {isLoading && '(WORKING...)'}
                </div>
            </header>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '15px', backgroundColor: 'var(--bg-content)', padding: '20px', borderRadius: '16px', marginBottom: '20px', justifyContent: 'center', flexWrap: 'wrap', border: '1px solid var(--border-color)' }}>
                <ControlButton onClick={startSystem} disabled={isLoading || systemStatus === 'MONITORING'} variant="primary" icon={Rocket}>START REAL-TIME</ControlButton>
                <ControlButton onClick={stopSystem} disabled={isLoading || systemStatus !== 'MONITORING'} variant="secondary" icon={Square}>STOP REAL-TIME</ControlButton>
                <ControlButton onClick={runPurge} disabled={isLoading} variant="danger" icon={Flame}>PURGE ALL DATA</ControlButton>
                <ControlButton onClick={runTest} disabled={isLoading} variant="warning" icon={Search}>TEST APIs</ControlButton>
                <ControlButton onClick={() => loadAllTokens(false)} disabled={isLoading} variant="info" icon={RefreshCw}>REFRESH DATA</ControlButton>
            </div>
            
            {/* Stats Dashboard */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                <StatCard title="Early Detection" value={tokens.early.length} subtext={TAB_CONFIG.early.subtext} color={TAB_CONFIG.early.color} icon={TAB_CONFIG.early.icon} />
                <StatCard title="Confirmed Quality" value={tokens.confirmed.length} subtext={TAB_CONFIG.confirmed.subtext} color={TAB_CONFIG.confirmed.color} icon={TAB_CONFIG.confirmed.icon}/>
                <StatCard title="Sniper Targets" value={tokens.targets.length} subtext={TAB_CONFIG.targets.subtext} color={TAB_CONFIG.targets.color} icon={TAB_CONFIG.targets.icon}/>
                <StatCard title="System Status" value={systemStatus} subtext={systemStatus === 'MONITORING' ? 'Live Data Feed' : 'Ready to Start'} color={systemStatus === 'MONITORING' ? 'var(--accent-green-text)' : 'var(--text-secondary)'} icon={systemStatus === 'ERROR' ? AlertTriangle : CheckCircle}/>
            </div>

            {/* Token Tabs */}
            <div style={{ display: 'flex', gap: '5px', marginBottom: '20px', backgroundColor: 'var(--bg-content)', borderRadius: '12px', padding: '5px', border: '2px solid var(--accent-green)', boxShadow: '0 0 15px -2px var(--accent-green)'}}>
                {Object.entries(TAB_CONFIG).map(([key, config]) => (
                    <button 
                        key={key} 
                        onClick={() => setActiveTab(key)} 
                        style={{ 
                            padding: '15px 30px', 
                            border: 'none', 
                            backgroundColor: activeTab === key ? 'var(--accent-green)' : 'transparent', 
                            borderRadius: '8px', 
                            color: activeTab === key ? '#0A0F1A' : 'white', 
                            fontWeight: 'bold', 
                            cursor: 'pointer', 
                            flex: 1, 
                            fontSize: '1.1rem', 
                            transition: 'all 0.3s ease' 
                        }}
                    >
                        {config.label} ({tokens[key]?.length || 0})
                    </button>
                ))}
            </div>

            {/* Token List */}
            {renderTokenList(tokens[activeTab], TAB_CONFIG[activeTab].empty)}

            {/* Notification */}
            {notification.show && (
                <div style={{ position: 'fixed', top: '20px', right: '20px', padding: '15px 25px', borderRadius: '12px', backgroundColor: 'var(--bg-content)', color: 'white', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)', zIndex: 1000, borderLeft: `6px solid ${notification.type === 'success' ? 'var(--accent-green-text)' : notification.type === 'error' ? 'var(--accent-red)' : 'var(--accent-orange)'}` }}>
                    {notification.message}
                </div>
            )}
        </div>
    );
}
