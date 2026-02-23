import { FileText, Plus, Search, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function Pagos() {
    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0, letterSpacing: '-0.5px' }}>Pagos & Facturación</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Control de ingresos, egresos y recibos de caja.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="glass-panel" style={{ padding: '10px 20px', border: '1px solid var(--surface-border)', borderRadius: '16px', background: 'transparent', cursor: 'pointer', fontWeight: 600, color: 'var(--danger)', display: 'flex', alignItems: 'center' }}>
                        <ArrowDownRight size={18} style={{ marginRight: '4px' }} />
                        Registrar Egreso
                    </button>
                    <button className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px', background: 'var(--success)', display: 'flex', alignItems: 'center' }}>
                        <Plus size={18} style={{ marginRight: '4px' }} />
                        Nuevo Ingreso (RC)
                    </button>
                </div>
            </div>

            <div className="grid">
                {[
                    { label: 'Ingresos del Día', val: '$ 1,240,000', color: 'var(--success)', icon: ArrowUpRight },
                    { label: 'Egresos del Día', val: '$ 150,000', color: 'var(--danger)', icon: ArrowDownRight },
                    { label: 'Facturas Emitidas', val: '12', color: 'var(--accent-color)', icon: FileText }
                ].map((stat, i) => (
                    <div key={i} className="stat-card glass-panel" style={{ gridColumn: 'span 4', padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>{stat.label}</div>
                            <stat.icon size={20} color={stat.color} />
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>{stat.val}</div>
                    </div>
                ))}

                <div className="chart-card glass-panel" style={{ gridColumn: 'span 12', marginTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 className="card-title" style={{ margin: 0 }}>Últimos Movimientos</h3>
                        <div className="input-wrapper" style={{ width: '300px' }}>
                            <Search size={16} className="input-icon" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input type="text" placeholder="Buscar por consecutivo, titular..." className="premium-input" style={{ height: '36px', fontSize: '13px', borderRadius: '8px' }} />
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--surface-border)', color: 'var(--text-secondary)', fontSize: '13px' }}>
                                    <th style={{ padding: '16px 8px' }}>Recibo/Doc</th>
                                    <th style={{ padding: '16px 8px' }}>Fecha y Hora</th>
                                    <th style={{ padding: '16px 8px' }}>Titular / Proveedor</th>
                                    <th style={{ padding: '16px 8px' }}>Concepto</th>
                                    <th style={{ padding: '16px 8px' }}>Medio de Pago</th>
                                    <th style={{ padding: '16px 8px', textAlign: 'right' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { doc: 'RC-20140', fecha: 'Hoy, 11:30 AM', titular: 'María Fernanda V.', concepto: 'Mensualidad Play & Learn', medio: 'T. Crédito', total: '+ $ 350,000', type: 'in' },
                                    { doc: 'RC-20139', fecha: 'Hoy, 09:15 AM', titular: 'Andrés Rojas', concepto: 'Matrícula Anual', medio: 'Efectivo', total: '+ $ 890,000', type: 'in' },
                                    { doc: 'EG-0542', fecha: 'Ayer, 05:00 PM', titular: 'Papelería Panamericana', concepto: 'Insumos de oficina', medio: 'Caja Menor', total: '- $ 150,000', type: 'out' },
                                    { doc: 'RC-20138', fecha: 'Ayer, 03:20 PM', titular: 'Diana Gómez', concepto: 'Excedente Fiesta', medio: 'T. Débito', total: '+ $ 200,000', type: 'in' },
                                ].map((row, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                                        <td style={{ padding: '16px 8px', fontWeight: 600, color: 'var(--accent-color)' }}>{row.doc}</td>
                                        <td style={{ padding: '16px 8px', fontSize: '13px', color: 'var(--text-secondary)' }}>{row.fecha}</td>
                                        <td style={{ padding: '16px 8px', fontSize: '14px' }}>{row.titular}</td>
                                        <td style={{ padding: '16px 8px', fontSize: '14px' }}>{row.concepto}</td>
                                        <td style={{ padding: '16px 8px', fontSize: '13px' }}>
                                            <span style={{ background: 'var(--surface-color)', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--surface-border)' }}>
                                                {row.medio}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 8px', textAlign: 'right', fontWeight: 700, color: row.type === 'in' ? 'var(--success)' : 'var(--danger)' }}>
                                            {row.total}
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
