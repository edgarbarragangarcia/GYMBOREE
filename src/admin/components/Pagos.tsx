import { useState } from 'react';
import { FileText, Plus, Search, ArrowUpRight, ArrowDownRight, Filter } from 'lucide-react';

export default function Pagos() {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all'); // all, in, out
    const [dateFilter, setDateFilter] = useState('all'); // all, today, week

    const allMovements = [
        { doc: 'RC-20140', fecha: 'Hoy, 11:30 AM', titular: 'María Fernanda V.', concepto: 'Mensualidad Play & Learn', medio: 'T. Crédito', total: '+ $ 350,000', type: 'in', relativeDate: 'today' },
        { doc: 'RC-20139', fecha: 'Hoy, 09:15 AM', titular: 'Andrés Rojas', concepto: 'Matrícula Anual', medio: 'Efectivo', total: '+ $ 890,000', type: 'in', relativeDate: 'today' },
        { doc: 'EG-0542', fecha: 'Ayer, 05:00 PM', titular: 'Papelería Panamericana', concepto: 'Insumos de oficina', medio: 'Caja Menor', total: '- $ 150,000', type: 'out', relativeDate: 'yesterday' },
        { doc: 'RC-20138', fecha: 'Ayer, 03:20 PM', titular: 'Diana Gómez', concepto: 'Excedente Fiesta', medio: 'T. Débito', total: '+ $ 200,000', type: 'in', relativeDate: 'yesterday' },
        { doc: 'EG-0541', fecha: 'Hace 3 días', titular: 'Mantenimiento S.A.', concepto: 'Reparación AC', medio: 'Transferencia', total: '- $ 250,000', type: 'out', relativeDate: 'week' },
        { doc: 'RC-20137', fecha: 'Hace 4 días', titular: 'Camilo Pérez', concepto: 'Mensualidad Art', medio: 'Enlace de Pago', total: '+ $ 350,000', type: 'in', relativeDate: 'week' },
    ];

    const filteredMovements = allMovements.filter(m => {
        const matchesSearch = m.titular.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.doc.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.concepto.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || m.type === typeFilter;
        let matchesDate = true;
        if (dateFilter === 'today') matchesDate = m.relativeDate === 'today';
        if (dateFilter === 'week') matchesDate = ['today', 'yesterday', 'week'].includes(m.relativeDate);

        return matchesSearch && matchesType && matchesDate;
    });

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '32px',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                padding: '24px 0',
                margin: '-24px 0 32px'
            }}>
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

            <div className="dashboard-grid">
                {[
                    { label: 'Ingresos Mensuales', val: '$ 45.2M', trend: '+15%', color: 'var(--success)', icon: ArrowUpRight, bg: 'rgba(52, 199, 89, 0.05)', data: [20, 35, 28, 45] },
                    { label: 'Egresos Mensuales', val: '$ 12.8M', trend: '-2%', color: 'var(--danger)', icon: ArrowDownRight, bg: 'rgba(255, 59, 48, 0.05)', data: [15, 12, 14, 12.8] },
                    { label: 'Utilidad Operativa', val: '$ 32.4M', trend: '+18%', color: 'var(--accent-color)', icon: FileText, bg: 'rgba(0, 113, 227, 0.05)', data: [5, 23, 14, 32.4] }
                ].map((stat, i) => (
                    <div key={i} className="stat-card glass-panel premium-stat-card" style={{
                        gridColumn: 'span 4',
                        padding: '24px',
                        borderLeft: `5px solid ${stat.color}`,
                        background: stat.bg,
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{stat.label}</div>
                            <div style={{ fontSize: '11px', fontWeight: 800, color: stat.color }}>{stat.trend}</div>
                        </div>
                        <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '12px' }}>{stat.val}</div>
                        <svg viewBox="0 0 100 20" style={{ width: '100%', height: '30px' }}>
                            <polyline
                                fill="none"
                                stroke={stat.color}
                                strokeWidth="2"
                                strokeLinecap="round"
                                points={stat.data.map((v, idx) => `${(idx / 3) * 100},${20 - (v / 50) * 15}`).join(' ')}
                            />
                        </svg>
                    </div>
                ))}

                <div className="chart-card glass-panel" style={{ gridColumn: 'span 12', marginTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900 }}>Análisis de Flujo de Caja</h3>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Ingresos vs Egresos - Últimos 4 meses</p>
                        </div>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600 }}>
                                <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--success)' }}></div> Ingresos
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600 }}>
                                <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--danger)' }}></div> Egresos
                            </div>
                        </div>
                    </div>

                    <div style={{ height: '180px', width: '100%', display: 'flex', alignItems: 'flex-end', gap: '40px', padding: '0 40px' }}>
                        {[
                            { month: 'NOV', in: 60, out: 40 },
                            { month: 'DIC', in: 90, out: 45 },
                            { month: 'ENE', in: 75, out: 30 },
                            { month: 'FEB', in: 100, out: 35 },
                        ].map((m, i) => (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '140px', width: '100%', justifyContent: 'center' }}>
                                    <div style={{ width: '12px', height: `${m.in}%`, background: 'var(--success)', borderRadius: '4px 4px 0 0', opacity: 0.8 }}></div>
                                    <div style={{ width: '12px', height: `${m.out}%`, background: 'var(--danger)', borderRadius: '4px 4px 0 0', opacity: 0.8 }}></div>
                                </div>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>{m.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="chart-card glass-panel" style={{ gridColumn: 'span 12', marginTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 className="card-title" style={{ margin: 0 }}>Últimos Movimientos</h3>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div className="input-wrapper" style={{ width: '250px' }}>
                                <Search size={16} className="input-icon" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="text"
                                    placeholder="Buscar..."
                                    className="premium-input"
                                    style={{ height: '36px', fontSize: '13px', borderRadius: '8px', paddingLeft: '32px' }}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div style={{ position: 'relative' }}>
                                <select
                                    className="premium-input"
                                    style={{ height: '36px', fontSize: '13px', borderRadius: '8px', padding: '0 32px 0 12px', appearance: 'none', background: 'var(--surface-color)', cursor: 'pointer' }}
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                >
                                    <option value="all">Todo (Ing./Egr.)</option>
                                    <option value="in">Solo Ingresos (+)</option>
                                    <option value="out">Solo Egresos (-)</option>
                                </select>
                                <Filter size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
                            </div>
                            <div style={{ position: 'relative' }}>
                                <select
                                    className="premium-input"
                                    style={{ height: '36px', fontSize: '13px', borderRadius: '8px', padding: '0 32px 0 12px', appearance: 'none', background: 'var(--surface-color)', cursor: 'pointer' }}
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                >
                                    <option value="all">Cualquier fecha</option>
                                    <option value="today">Hoy</option>
                                    <option value="week">Esta semana</option>
                                </select>
                                <Filter size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
                            </div>
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
                                {filteredMovements.length > 0 ? filteredMovements.map((row, i) => (
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
                                )) : (
                                    <tr>
                                        <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                            No se encontraron movimientos con los filtros aplicados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
