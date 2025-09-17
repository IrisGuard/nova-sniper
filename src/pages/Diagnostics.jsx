import React, { useState } from 'react';
import { runDiagnostics } from '@/api/functions';

export default function DiagnosticsPage() {
    const [report, setReport] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleRunDiagnostics = async () => {
        setIsLoading(true);
        setReport(null);
        try {
            const response = await runDiagnostics();
            setReport(response.data);
        } catch (error) {
            setReport({
                overallStatus: 'CRITICAL_FAIL',
                error: `Frontend error calling diagnostics function: ${error.message}`,
                steps: []
            });
        }
        setIsLoading(false);
    };

    const StatusIndicator = ({ status }) => {
        const styles = {
            PENDING: { bg: 'bg-gray-500', text: 'PENDING' },
            OK: { bg: 'bg-green-500', text: 'OK' },
            PASS: { bg: 'bg-green-500', text: 'PASS' },
            FAIL: { bg: 'bg-red-500', text: 'FAIL' },
            CRITICAL_FAIL: { bg: 'bg-red-700', text: 'CRITICAL FAIL' },
        };
        const style = styles[status] || styles.PENDING;
        return (
            <span className={`px-2 py-1 text-xs font-bold text-white rounded ${style.bg}`}>
                {style.text}
            </span>
        );
    };

    return (
        <div style={{
            fontFamily: "'Segoe UI', sans-serif",
            backgroundColor: '#0a0a0a',
            color: '#f8fafc',
            minHeight: '100vh',
            padding: '40px',
        }}>
            <header style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>🩺 System Diagnostics</h1>
                <p style={{ color: '#94a3b8', marginTop: '10px' }}>
                    Αυτό το εργαλείο ελέγχει κάθε βήμα της pipeline για να εντοπίσει προβλήματα.
                </p>
            </header>

            <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                <button
                    onClick={handleRunDiagnostics}
                    disabled={isLoading}
                    style={{
                        padding: '15px 40px',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        color: 'white',
                        backgroundColor: isLoading ? '#4f46e5' : '#6366f1',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.3s',
                    }}
                >
                    {isLoading ? 'Running Diagnostics...' : '▶️ Run Full System Check'}
                </button>
            </div>

            {report && (
                <div style={{
                    marginTop: '40px',
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    padding: '30px',
                    maxWidth: '800px',
                    margin: '40px auto 0 auto'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '20px', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Diagnostics Report</h2>
                        <div>
                            <span style={{ color: '#94a3b8', marginRight: '10px' }}>Overall Status:</span>
                            <StatusIndicator status={report.overallStatus} />
                        </div>
                    </div>
                    
                    {report.error && (
                         <div style={{ backgroundColor: '#7f1d1d', padding: '15px', borderRadius: '8px', marginBottom: '20px', color: 'white' }}>
                            <strong>CRITICAL ERROR:</strong> {report.error}
                         </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {report.steps.map((step, index) => (
                            <div key={index} style={{ backgroundColor: '#293548', padding: '20px', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{step.name}</h3>
                                    <StatusIndicator status={step.status} />
                                </div>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {step.details.map((detail, i) => (
                                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                                            <StatusIndicator status={detail.status} />
                                            <span><strong>{detail.service || 'Detail'}:</strong> {detail.message}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}