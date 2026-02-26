import { Users, UserPlus, CreditCard, Activity, Plus } from 'lucide-react';

export default function Dashboard() {
    return (
        <>
            <header className="page-header">
                <div>
                    <h1 className="page-title">Bienvenido de vuelta, Edgar</h1>
                    <p className="page-subtitle">Así van tus métricas en la sede Salitre hoy.</p>
                </div>
                <button className="btn-primary">
                    <Plus size={18} />
                    Nuevo Registro
                </button>
            </header>

            <div className="dashboard-grid">
                {/* KPI Cards */}
                <div className="stat-card glass-panel">
                    <div className="stat-icon icon-blue">
                        <Users size={20} />
                    </div>
                    <div className="stat-value">312</div>
                    <div className="stat-label">Alumnos Activos</div>
                </div>

                <div className="stat-card glass-panel">
                    <div className="stat-icon icon-orange">
                        <UserPlus size={20} />
                    </div>
                    <div className="stat-value">14</div>
                    <div className="stat-label">Walkins por gestionar</div>
                </div>

                <div className="stat-card glass-panel">
                    <div className="stat-icon icon-green">
                        <CreditCard size={20} />
                    </div>
                    <div className="stat-value">$4.2M</div>
                    <div className="stat-label">Ingresos de Hoy</div>
                </div>

                <div className="stat-card glass-panel">
                    <div className="stat-icon icon-purple">
                        <Activity size={20} />
                    </div>
                    <div className="stat-value">8</div>
                    <div className="stat-label">Leads en proceso</div>
                </div>

                {/* Main Chart Area */}
                <div className="chart-card glass-panel">
                    <h2 className="card-title">Distribución por Programas</h2>
                    {/* Custom SVG visualization to remain dependency-free and beautiful */}
                    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', paddingBottom: 40 }}>
                        <div style={{ position: 'relative', width: 200, height: 200 }}>
                            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                                {/* School Skills (Background circle) */}
                                <path
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="#eee"
                                    strokeWidth="3"
                                />
                                {/* Play and Learn */}
                                <path
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="var(--brand-orange)"
                                    strokeWidth="4"
                                    strokeDasharray="65, 100"
                                    style={{ transition: 'stroke-dasharray 1s ease' }}
                                />
                                {/* Gym Music */}
                                <path
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="var(--accent-color)"
                                    strokeWidth="4"
                                    strokeDasharray="20, 100"
                                    strokeDashoffset="-65"
                                    style={{ transition: 'all 1s ease' }}
                                />
                            </svg>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                <span style={{ fontSize: 36, fontWeight: 700, letterSpacing: -1 }}>159</span>
                                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Total Alumnos</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 24, marginTop: 32 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 12, height: 12, borderRadius: 6, background: 'var(--brand-orange)' }}></div>
                                <span style={{ fontSize: 13, fontWeight: 500 }}>Play & Learn (138)</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 12, height: 12, borderRadius: 6, background: 'var(--accent-color)' }}></div>
                                <span style={{ fontSize: 13, fontWeight: 500 }}>Gym Music (21)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action List */}
                <div className="list-card glass-panel">
                    <h2 className="card-title">Pre-Avisos (Vencimientos)</h2>
                    <div className="list-items" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

                        <div className="list-item">
                            <div className="avatar" style={{ background: '#fef2f2', color: 'var(--danger)' }}>AR</div>
                            <div className="item-info">
                                <div className="item-title">Agustín Rodríguez</div>
                                <div className="item-desc">Vence hoy en 1 día</div>
                            </div>
                            <div className="item-action">Cobrar</div>
                        </div>

                        <div className="list-item">
                            <div className="avatar" style={{ background: '#f0fdf4', color: 'var(--success)' }}>DM</div>
                            <div className="item-info">
                                <div className="item-title">Diana Melian</div>
                                <div className="item-desc">Cortesía hoy 4:00 PM</div>
                            </div>
                            <div className="item-action">Ver</div>
                        </div>

                        <div className="list-item">
                            <div className="avatar" style={{ background: '#fffbeb', color: 'var(--warning)' }}>SJ</div>
                            <div className="item-info">
                                <div className="item-title">Santiago Jiménez</div>
                                <div className="item-desc">Walkin sin seguimiento (3d)</div>
                            </div>
                            <div className="item-action">Llamar</div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}
