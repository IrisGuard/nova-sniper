import React, { useState, useEffect, useCallback } from 'react';
import { User } from '@/api/entities';
import { WatchlistToken } from '@/api/entities';
import { performSafetyChecks } from '@/api/functions';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import WatchlistCard from '../components/watchlist/WatchlistCard';
import WatchlistHeader from '../components/watchlist/WatchlistHeader';
import WatchlistStats from '../components/watchlist/WatchlistStats';

export default function WatchlistPage() {
    const [user, setUser] = useState(null);
    const [watchlistTokens, setWatchlistTokens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [filterTag, setFilterTag] = useState('all');
    const [sortBy, setSortBy] = useState('dateAdded');

    const showNotification = useCallback((message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 5000);
    }, []);

    const loadUserAndWatchlist = useCallback(async () => {
        try {
            setLoading(true);
            const currentUser = await User.me();
            setUser(currentUser);

            const userWatchlist = await WatchlistToken.filter({ 
                userEmail: currentUser.email 
            });
            
            console.log(`📋 WATCHLIST LOADED: ${userWatchlist.length} tokens for ${currentUser.email}`);
            setWatchlistTokens(userWatchlist);
            
        } catch (error) {
            console.error('Load watchlist error:', error);
            showNotification('❌ Failed to load watchlist', 'error');
        } finally {
            setLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        loadUserAndWatchlist();
    }, [loadUserAndWatchlist]);

    const removeFromWatchlist = useCallback(async (tokenAddress) => {
        try {
            const tokenToRemove = watchlistTokens.find(t => t.tokenAddress === tokenAddress);
            if (tokenToRemove) {
                await WatchlistToken.delete(tokenToRemove.id);
                await loadUserAndWatchlist();
                showNotification(`✅ ${tokenToRemove.tokenSymbol} removed from watchlist`, 'success');
            }
        } catch (error) {
            console.error('Remove from watchlist error:', error);
            showNotification('❌ Failed to remove token', 'error');
        }
    }, [watchlistTokens, loadUserAndWatchlist, showNotification]);

    const updateWatchlistToken = useCallback(async (tokenId, updates) => {
        try {
            await WatchlistToken.update(tokenId, updates);
            await loadUserAndWatchlist();
            showNotification('✅ Token settings updated', 'success');
        } catch (error) {
            console.error('Update watchlist token error:', error);
            showNotification('❌ Failed to update settings', 'error');
        }
    }, [loadUserAndWatchlist, showNotification]);

    const getFilteredAndSortedTokens = useCallback(() => {
        let filtered = watchlistTokens;

        // Filter by tag
        if (filterTag !== 'all') {
            filtered = filtered.filter(token => 
                token.tags && token.tags.includes(filterTag)
            );
        }

        // Sort tokens
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'dateAdded':
                    return new Date(b.created_date) - new Date(a.created_date);
                case 'alphabetical':
                    return a.tokenSymbol.localeCompare(b.tokenSymbol);
                case 'performance':
                    const aPeakGain = a.peakPrice && a.addedPrice ? ((a.peakPrice - a.addedPrice) / a.addedPrice) * 100 : 0;
                    const bPeakGain = b.peakPrice && b.addedPrice ? ((b.peakPrice - b.addedPrice) / b.addedPrice) * 100 : 0;
                    return bPeakGain - aPeakGain;
                default:
                    return 0;
            }
        });

        return filtered;
    }, [watchlistTokens, filterTag, sortBy]);

    const filteredTokens = getFilteredAndSortedTokens();
    const allTags = [...new Set(watchlistTokens.flatMap(token => token.tags || []))];

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                backgroundColor: '#0a0a0a',
                color: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📋</div>
                    <h2>Loading Your Watchlist...</h2>
                    <p style={{ opacity: 0.7 }}>Fetching your saved tokens</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            margin: 0,
            padding: '20px',
            boxSizing: 'border-box',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            backgroundColor: '#0a0a0a',
            color: '#f8fafc',
            minHeight: '100vh'
        }}>
            {/* Header */}
            <WatchlistHeader 
                user={user}
                totalTokens={watchlistTokens.length}
                filteredCount={filteredTokens.length}
                filterTag={filterTag}
                setFilterTag={setFilterTag}
                sortBy={sortBy}
                setSortBy={setSortBy}
                allTags={allTags}
            />

            {/* Stats Dashboard */}
            <WatchlistStats tokens={watchlistTokens} />

            {/* Watchlist Cards */}
            <div style={{ display: 'grid', gap: '20px', marginTop: '30px' }}>
                {filteredTokens.length === 0 ? (
                    <div style={{
                        backgroundColor: '#1e293b',
                        borderRadius: '16px',
                        padding: '60px',
                        textAlign: 'center',
                        border: '2px dashed #374151'
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '20px', opacity: 0.5 }}>📋</div>
                        <h2>Your Personal Watchlist is Empty</h2>
                        <p style={{ opacity: 0.7, fontSize: '1.1rem', marginBottom: '30px' }}>
                            Go to the main Sniper page and add tokens you want to monitor closely
                        </p>
                        <Link
                            to={createPageUrl('Sniper')}
                            style={{
                                display: 'inline-block',
                                padding: '15px 30px',
                                backgroundColor: '#22c55e',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '8px',
                                fontWeight: 'bold'
                            }}
                        >
                            🎯 Go to Nova Sniper
                        </Link>
                    </div>
                ) : (
                    filteredTokens.map(token => (
                        <WatchlistCard
                            key={token.id}
                            token={token}
                            onRemove={removeFromWatchlist}
                            onUpdate={updateWatchlistToken}
                            showNotification={showNotification}
                        />
                    ))
                )}
            </div>

            {/* Notification */}
            {notification.show && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    padding: '15px 25px',
                    borderRadius: '12px',
                    backgroundColor: '#1e293b',
                    color: 'white',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
                    zIndex: 1000,
                    borderLeft: `6px solid ${
                        notification.type === 'success' ? '#22c55e' :
                        notification.type === 'error' ? '#ef4444' : '#f59e0b'
                    }`,
                    maxWidth: '350px'
                }}>
                    {notification.message}
                </div>
            )}
        </div>
    );
}