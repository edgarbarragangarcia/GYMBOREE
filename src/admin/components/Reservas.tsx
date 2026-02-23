import { Calendar, Search, Plus, MapPin } from 'lucide-react';

export default function Reservas() {
    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0, letterSpacing: '-0.5px' }}>Reservas & Fiestas</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Gestión de aforo, control de asistencia y eventos especiales.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="glass-panel" style={{ padding: '10px 20px', border: '1px solid var(--surface-border)', borderRadius: '16px', background: 'transparent', cursor: 'pointer', fontWeight: 600 }}>
                        Agendar Fiesta
                    </button>
                    <button className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>
                        <Plus size={18} />
                        Nueva Reserva
                    </button>
                </div>
            </div>

            <div className="grid">
                <div className="chart-card glass-panel" style={{ gridColumn: 'span 4' }}>
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={20} color="var(--brand-orange)" />
                        Calendario (Hoy)
                    </h3>

                    <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[
                            { time: '09:00 AM', title: 'Play & Learn (Nivel 2)', prof: 'Prof. Ana', ocupacion: '12/15 cupos', bg: 'rgba(232, 93, 4, 0.1)', color: 'var(--brand-orange)' },
                            { time: '10:30 AM', title: 'School Skills (Nivel 4)', prof: 'Prof. Carlos', ocupacion: '10/12 cupos', bg: 'rgba(0, 113, 227, 0.1)', color: 'var(--accent-color)' },
                            { time: '12:00 PM', title: 'Arte', prof: 'Prof. Luisa', ocupacion: '5/10 cupos', bg: 'rgba(175, 82, 222, 0.1)', color: '#af52de' },
                            { time: '03:00 PM', title: 'Fiesta: Cumpleaños Mía', prof: 'Salón Principal', ocupacion: 'Reservado', bg: 'rgba(52, 199, 89, 0.1)', color: 'var(--success)' },
                        ].map((clase, i) => (
                            <div key={i} style={{ display: 'flex', gap: '12px', padding: '16px', background: clase.bg, borderRadius: '16px' }}>
                                <div style={{ minWidth: '70px', fontWeight: 700, color: clase.color, fontSize: '13px' }}>{clase.time}</div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>{clase.title}</div>
                                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <MapPin size={12} /> {clase.prof}
                                    </div>
                                    <div style={{ fontSize: '12px', fontWeight: 600, color: clase.color, marginTop: '8px' }}>{clase.ocupacion}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="chart-card glass-panel" style={{ gridColumn: 'span 8' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 className="card-title" style={{ margin: 0 }}>Listado de Asistencia: 09:00 AM</h3>
                        <div className="input-wrapper" style={{ width: '250px' }}>
                            <Search size={16} className="input-icon" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input type="text" placeholder="Buscar en clase..." className="premium-input" style={{ height: '36px', fontSize: '13px', borderRadius: '8px' }} />
                        </div>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--surface-border)', color: 'var(--text-secondary)', fontSize: '13px' }}>
                                <th style={{ padding: '12px 8px' }}>Alumno</th>
                                <th style={{ padding: '12px 8px' }}>Tipo de Reserva</th>
                                <th style={{ padding: '12px 8px', textAlign: 'right' }}>Check-in</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { nombre: 'Santiago Gómez', tipo: 'Clase Regular', check: true },
                                { nombre: 'Valeria Rojas', tipo: 'Reposición', check: true },
                                { nombre: 'Tomás Silva', tipo: 'Clase Demo', check: false },
                                { nombre: 'Isabella M.', tipo: 'Clase Regular', check: false },
                            ].map((row, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                                    <td style={{ padding: '16px 8px', fontWeight: 600 }}>{row.nombre}</td>
                                    <td style={{ padding: '16px 8px', fontSize: '14px', color: 'var(--text-secondary)' }}>{row.tipo}</td>
                                    <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                                        <button style={{
                                            background: row.check ? 'rgba(52, 199, 89, 0.1)' : 'var(--surface-color)',
                                            color: row.check ? 'var(--success)' : 'var(--text-secondary)',
                                            border: row.check ? '1px solid rgba(52,199,89,0.3)' : '1px solid var(--surface-border)',
                                            padding: '6px 16px',
                                            borderRadius: '20px',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}>
                                            {row.check ? 'Asistió' : 'Marcar Asistencia'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
