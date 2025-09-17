import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Filter, SortAsc } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function WatchlistHeader({ 
    user, 
    totalTokens, 
    filteredCount, 
    filterTag, 
    setFilterTag, 
    sortBy, 
    setSortBy, 
    allTags 
}) {
    return (
        <div style={{
            background: 'linear-gradient(135deg, #1e293b, #0f172a)',
            borderRadius: '16px',
            padding: '30px',
            marginBottom: '30px',
            border: '1px solid #334155'
        }}>
            {/* Main Header */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '20px',
                flexWrap: 'wrap',
                gap: '15px'
            }}>
                <div>
                    <h1 style={{ 
                        fontSize: '2.5rem', 
                        marginBottom: '10px',
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        📋 My Crypto Watchlist
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.8 }}>
                            <User className="w-4 h-4" />
                            <span>{user?.full_name || user?.email}</span>
                        </div>
                        <Badge style={{ backgroundColor: '#3b82f6', color: 'white' }}>
                            {filteredCount} / {totalTokens} Tokens
                        </Badge>
                    </div>
                </div>
                
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <Link 
                        to={createPageUrl('Sniper')}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#22c55e',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '1.1rem',
                            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                        }}
                    >
                        🎯 Back to Nova Sniper
                    </Link>
                </div>
            </div>

            {/* Filters and Sorting */}
            <div style={{ 
                display: 'flex', 
                gap: '20px', 
                alignItems: 'center',
                flexWrap: 'wrap'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select 
                        value={filterTag} 
                        onChange={(e) => setFilterTag(e.target.value)}
                        style={{
                            padding: '10px 15px',
                            borderRadius: '8px',
                            backgroundColor: '#374151',
                            border: '2px solid #6b7280',
                            color: 'white',
                            width: '160px',
                            fontWeight: 'bold'
                        }}
                    >
                        <option value="all">All Tags</option>
                        {allTags.map(tag => (
                            <option key={tag} value={tag}>
                                {tag}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <SortAsc className="w-4 h-4 text-gray-400" />
                    <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{
                            padding: '10px 15px',
                            borderRadius: '8px',
                            backgroundColor: '#374151',
                            border: '2px solid #6b7280',
                            color: 'white',
                            width: '160px',
                            fontWeight: 'bold'
                        }}
                    >
                        <option value="dateAdded">Date Added</option>
                        <option value="alphabetical">Alphabetical</option>
                        <option value="performance">Performance</option>
                    </select>
                </div>

                {filteredCount < totalTokens && (
                    <Badge style={{ 
                        backgroundColor: '#f59e0b', 
                        color: 'white',
                        padding: '8px 16px',
                        fontSize: '0.9rem'
                    }}>
                        Filtered: {filteredCount}/{totalTokens}
                    </Badge>
                )}
            </div>
        </div>
    );
}