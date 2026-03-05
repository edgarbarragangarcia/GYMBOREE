import { Plus, TrendingUp, TrendingDown } from 'lucide-react';

// Reusable Sparkline component for trends
const Sparkline = ({ data, color }: { data: number[], color: string }) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    const points = data.map((v, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 20 - ((v - min) / range) * 15;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg viewBox="0 0 100 20" style={{ width: '100%', height: '30px', marginTop: '10px' }}>
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
                points={points}
            />
        </svg>
    );
};

export default function Dashboard() {
    return (
        <div style={{ padding: '0 8px' }}>
            <header className="page-header" style={{
                marginBottom: '32px',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                padding: '24px 8px',
                margin: '0 -8px 32px'
            }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: '30px', fontWeight: 900, letterSpacing: '-1px' }}>Intelligence Hub</h1>
                    <p className="page-subtitle">Análisis de Desempeño & Métricas Financieras</p>
                </div>
                <button className="btn-primary" style={{ borderRadius: '12px', background: 'linear-gradient(90deg, #ff8a00, #e85d04)' }}>
                    <Plus size={18} />
                    Nuevo Registro
                </button>
            </header>

            <div className="dashboard-grid">
                {/* KPI Cards with Trend Analysis */}
                <div className="stat-card glass-panel" style={{ borderLeft: 'none', background: 'rgba(255,255,255,0.7)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="stat-label">Alumnos Activos</div>
                            <div className="stat-value" style={{ fontSize: '28px', margin: '4px 0' }}>312</div>
                        </div>
                        <div style={{ background: 'rgba(52, 199, 89, 0.1)', color: 'var(--success)', padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <TrendingUp size={14} /> +12%
                        </div>
                    </div>
                    <Sparkline data={[280, 285, 292, 305, 301, 312]} color="var(--accent-color)" />
                </div>

                <div className="stat-card glass-panel" style={{ borderLeft: 'none', background: 'rgba(255,255,255,0.7)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="stat-label">Ingresos Diarios</div>
                            <div className="stat-value" style={{ fontSize: '28px', margin: '4px 0' }}>$4.2M</div>
                        </div>
                        <div style={{ background: 'rgba(52, 199, 89, 0.1)', color: 'var(--success)', padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <TrendingUp size={14} /> +8%
                        </div>
                    </div>
                    <Sparkline data={[2.1, 3.5, 2.8, 4.0, 3.9, 4.2]} color="var(--success)" />
                </div>

                <div className="stat-card glass-panel" style={{ borderLeft: 'none', background: 'rgba(255,255,255,0.7)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="stat-label">Leads por Gestionar</div>
                            <div className="stat-value" style={{ fontSize: '28px', margin: '4px 0' }}>14</div>
                        </div>
                        <div style={{ background: 'rgba(232, 93, 4, 0.1)', color: 'var(--brand-orange)', padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <TrendingDown size={14} /> -2
                        </div>
                    </div>
                    <Sparkline data={[20, 18, 22, 15, 16, 14]} color="var(--brand-orange)" />
                </div>

                <div className="stat-card glass-panel" style={{ borderLeft: 'none', background: 'rgba(255,255,255,0.7)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="stat-label">Tasa Retención</div>
                            <div className="stat-value" style={{ fontSize: '28px', margin: '4px 0' }}>94%</div>
                        </div>
                        <div style={{ background: 'rgba(175, 82, 222, 0.1)', color: '#af52de', padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <TrendingUp size={14} /> +1%
                        </div>
                    </div>
                    <Sparkline data={[92, 92.5, 93, 93.2, 93.8, 94]} color="#af52de" />
                </div>

                {/* Main Financial Analysis Chart */}
                <div className="chart-card glass-panel" style={{ gridColumn: 'span 8' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div>
                            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Tendencia de Ingresos vs. Proyección</h2>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Consolidado mensual Salitre</p>
                        </div>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600 }}>
                                <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--accent-color)' }}></div> Real
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600 }}>
                                <div style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(0,0,0,0.1)' }}></div> Meta
                            </div>
                        </div>
                    </div>

                    <div style={{ height: '280px', width: '100%', position: 'relative' }}>
                        <svg viewBox="0 0 800 280" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                            {/* Proyección (Dashed Line) */}
                            <path d="M40,220 L180,200 L320,170 L460,150 L600,120 L740,100" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="2" strokeDasharray="6,4" />

                            {/* Real Area Chart */}
                            <defs>
                                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--accent-color)" stopOpacity="0.2" />
                                    <stop offset="100%" stopColor="var(--accent-color)" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path d="M40,240 L180,220 L320,180 L460,130 L600,150 L740,110 L740,280 L40,280 Z" fill="url(#areaGradient)" />
                            <path d="M40,240 L180,220 L320,180 L460,130 L600,150 L740,110" fill="none" stroke="var(--accent-color)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />

                            {/* Data Points */}
                            {[40, 180, 320, 460, 600, 740].map((x, i) => {
                                const y = [240, 220, 180, 130, 150, 110][i];
                                return (
                                    <g key={i}>
                                        <circle cx={x} cy={y} r="5" fill="white" stroke="var(--accent-color)" strokeWidth="3" />
                                        <text x={x} y={y - 12} textAnchor="middle" style={{ fontSize: '10px', fontWeight: 800, fill: 'var(--text-primary)' }}>
                                            {['42M', '58M', '85M', '112M', '98M', '124M'][i]}
                                        </text>
                                    </g>
                                );
                            })}

                            {/* Month Labels */}
                            {['SEP', 'OCT', 'NOV', 'DIC', 'ENE', 'FEB'].map((m, i) => (
                                <text key={i} x={40 + i * 140} y="275" textAnchor="middle" style={{ fontSize: '11px', fontWeight: 600, fill: 'var(--text-secondary)' }}>{m}</text>
                            ))}
                        </svg>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--surface-border)' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>Crecimiento Anual</div>
                            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--success)' }}>+24.8%</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>Costo Adquisición (CAC)</div>
                            <div style={{ fontSize: '18px', fontWeight: 800 }}>$142K</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>Retorno Inv. (ROI)</div>
                            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-color)' }}>4.2x</div>
                        </div>
                    </div>
                </div>

                {/* Donut Distribution - Upgraded */}
                <div className="chart-card glass-panel" style={{ gridColumn: 'span 4' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '24px' }}>Distribución por Programas</h2>
                    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '32px' }}>
                        <div style={{ position: 'relative', width: 220, height: 220 }}>
                            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                                {/* Background */}
                                <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth="3" />
                                {/* Play and Learn - 65% */}
                                <circle cx="18" cy="18" r="16" fill="none" stroke="var(--brand-orange)" strokeWidth="3.5" strokeDasharray="65, 35" strokeLinecap="round" />
                                {/* Gym Music - 20% */}
                                <circle cx="18" cy="18" r="16" fill="none" stroke="var(--accent-color)" strokeWidth="3.5" strokeDasharray="20, 80" strokeDashoffset="-65" strokeLinecap="round" />
                                {/* Others - 15% */}
                                <circle cx="18" cy="18" r="16" fill="none" stroke="#af52de" strokeWidth="3.5" strokeDasharray="15, 85" strokeDashoffset="-85" strokeLinecap="round" />
                            </svg>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                <span style={{ fontSize: 36, fontWeight: 900, color: 'var(--text-primary)' }}>159</span>
                                <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Matrículas</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                            {[
                                { color: 'var(--brand-orange)', label: 'Play & Learn', value: '138', pct: '65%' },
                                { color: 'var(--accent-color)', label: 'Gym Music', value: '21', pct: '20%' },
                                { color: '#af52de', label: 'School Skills', value: '12', pct: '15%' },
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderRadius: '10px', background: 'rgba(0,0,0,0.02)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: 8, height: 8, borderRadius: 2, background: item.color }}></div>
                                        <span style={{ fontSize: '13px', fontWeight: 600 }}>{item.label}</span>
                                    </div>
                                    <div style={{ fontSize: '13px', fontWeight: 800 }}>{item.value} <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>({item.pct})</span></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Alerts Section - Unchanged structure but refined */}
                <div className="list-card glass-panel" style={{ gridColumn: 'span 12' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Pre-Avisos & Vencimientos</h2>
                        <button className="glass-panel" style={{ padding: '6px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', background: 'transparent', border: '1px solid var(--surface-border)' }}>Ver Todo</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                        {[
                            { initial: 'AR', name: 'Agustín Rodríguez', status: 'Vence en 1 día', action: 'Cobrar', color: 'var(--danger)', bg: '#fef2f2' },
                            { initial: 'DM', name: 'Diana Melian', status: 'Cortesía Hoy 4:00 PM', action: 'Ver', color: 'var(--success)', bg: '#f0fdf4' },
                            { initial: 'SJ', name: 'Santiago Jiménez', status: 'Lead sin actividad (3d)', action: 'Llamar', color: 'var(--warning)', bg: '#fffbeb' }
                        ].map((item, i) => (
                            <div key={i} className="list-item" style={{ padding: '16px', borderRadius: '16px', border: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.5)' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <div className="avatar" style={{ background: item.bg, color: item.color, fontWeight: 800 }}>{item.initial}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 800, fontSize: '14px' }}>{item.name}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.status}</div>
                                    </div>
                                    <button style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'white', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>{item.action}</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                .stat-card:hover { transform: translateY(-3px); border-color: var(--accent-color); transition: all 0.2s ease; }
                .list-item:hover { background: white !important; box-shadow: 0 4px 12px rgba(0,0,0,0.05); transition: all 0.2s ease; }
            `}</style>
        </div>
    );
}
