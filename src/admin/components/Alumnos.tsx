import { Search, Plus, ExternalLink } from 'lucide-react';

export default function Alumnos() {
    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0, letterSpacing: '-0.5px' }}>Directorio de Alumnos</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Gestión central del módulo académico, programas y acudientes.</p>
                </div>
                <button className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>
                    <Plus size={18} />
                    Matricular Alumno
                </button>
            </div>

            <div className="grid">
                {[
                    { label: 'Matrículas Activas', val: '438', color: 'var(--accent-color)', bg: 'rgba(0, 113, 227, 0.1)' },
                    { label: 'Play & Learn', val: '210', color: 'var(--brand-orange)', bg: 'rgba(232, 93, 4, 0.1)' },
                    { label: 'Pre School Steps', val: '86', color: 'var(--success)', bg: 'rgba(52, 199, 89, 0.1)' },
                    { label: 'School Skills', val: '94', color: '#af52de', bg: 'rgba(175, 82, 222, 0.1)' }
                ].map((stat, i) => (
                    <div key={i} className="stat-card glass-panel" style={{ gridColumn: 'span 3', padding: '20px' }}>
                        <div style={{ fontSize: '28px', fontWeight: 800, color: stat.color }}>{stat.val}</div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>{stat.label}</div>
                    </div>
                ))}

                <div className="chart-card glass-panel" style={{ gridColumn: 'span 12', marginTop: '16px' }}>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                        <div className="input-wrapper" style={{ flex: 1 }}>
                            <Search size={18} className="input-icon" style={{ left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                placeholder="Buscar alumno por ID, nombre o acudiente..."
                                className="premium-input"
                                style={{ height: '44px', borderRadius: '12px' }}
                            />
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--surface-border)', color: 'var(--text-secondary)', fontSize: '13px' }}>
                                    <th style={{ padding: '16px 8px' }}>Nombre del Alumno</th>
                                    <th style={{ padding: '16px 8px' }}>Acudiente</th>
                                    <th style={{ padding: '16px 8px' }}>Programa Actual</th>
                                    <th style={{ padding: '16px 8px' }}>Nivel</th>
                                    <th style={{ padding: '16px 8px' }}>Vencimiento</th>
                                    <th style={{ padding: '16px 8px', textAlign: 'right' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { nombre: 'Luciana M.', titular: 'María Fernanda V.', prog: 'Play & Learn', nivel: 'Nivel 3', venc: '15 Mar 2026', status: 'Activo' },
                                    { nombre: 'Martín S.', titular: 'Juan Pablo S.', prog: 'School Skills', nivel: 'Nivel 5', venc: '28 Feb 2026', status: 'Por Vencer' },
                                    { nombre: 'Valeria G.', titular: 'Diana Gómez', prog: 'Arte', nivel: 'Nivel 2', venc: '10 Abr 2026', status: 'Activo' },
                                    { nombre: 'Emilio R.', titular: 'Andrés Rojas', prog: 'Gym Music', nivel: 'Nivel 1', venc: '02 Mar 2026', status: 'Activo' },
                                ].map((row, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                                        <td style={{ padding: '16px 8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: 32, height: 32, borderRadius: 16, background: 'var(--bg-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'var(--brand-orange)' }}>
                                                {row.nombre.charAt(0)}
                                            </div>
                                            {row.nombre}
                                        </td>
                                        <td style={{ padding: '16px 8px', fontSize: '14px' }}>{row.titular}</td>
                                        <td style={{ padding: '16px 8px', fontSize: '14px', fontWeight: 500 }}>{row.prog}</td>
                                        <td style={{ padding: '16px 8px', fontSize: '13px', color: 'var(--text-secondary)' }}>{row.nivel}</td>
                                        <td style={{ padding: '16px 8px' }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                background: row.status === 'Activo' ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 59, 48, 0.1)',
                                                color: row.status === 'Activo' ? 'var(--success)' : 'var(--danger)',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                fontWeight: 600
                                            }}>{row.venc}</span>
                                        </td>
                                        <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                                            <button style={{ background: 'transparent', color: 'var(--accent-color)', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                Ver Perfil <ExternalLink size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
