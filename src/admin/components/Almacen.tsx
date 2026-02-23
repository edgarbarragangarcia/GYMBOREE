import { Box, Search, Plus, Tag, TrendingUp, AlertTriangle } from 'lucide-react';

export default function Almacen() {
    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0, letterSpacing: '-0.5px' }}>Almacén & Merchandising</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Control de inventario físico, ventas de tienda e ingresos adicionales.</p>
                </div>
                <button className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>
                    <Plus size={18} />
                    Nuevo Producto
                </button>
            </div>

            <div className="grid">
                {[
                    { label: 'Productos Activos', val: '142', color: 'var(--accent-color)', icon: Box },
                    { label: 'Valor Inventario', val: '$ 4.5M', color: 'var(--success)', icon: TrendingUp },
                    { label: 'Bajo Stock', val: '12', color: 'var(--brand-orange)', icon: AlertTriangle }
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
                        <h3 className="card-title" style={{ margin: 0 }}>Inventario Actual</h3>
                        <div className="input-wrapper" style={{ width: '300px' }}>
                            <Search size={16} className="input-icon" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input type="text" placeholder="Buscar por SKU, nombre..." className="premium-input" style={{ height: '36px', fontSize: '13px', borderRadius: '8px' }} />
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--surface-border)', color: 'var(--text-secondary)', fontSize: '13px' }}>
                                    <th style={{ padding: '16px 8px' }}>SKU</th>
                                    <th style={{ padding: '16px 8px' }}>Producto</th>
                                    <th style={{ padding: '16px 8px' }}>Categoría</th>
                                    <th style={{ padding: '16px 8px' }}>PVP</th>
                                    <th style={{ padding: '16px 8px' }}>Stock</th>
                                    <th style={{ padding: '16px 8px', textAlign: 'right' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { sku: 'TSH-001', nombre: 'Camiseta Gymbo (Talla 2)', cat: 'Ropa', pvp: '$ 45,000', stock: 15, status: 'ok' },
                                    { sku: 'TSH-002', nombre: 'Camiseta Gymbo (Talla 4)', cat: 'Ropa', pvp: '$ 45,000', stock: 2, status: 'low' },
                                    { sku: 'TOY-105', nombre: 'Burbujas O-Ball', cat: 'Juguetes', pvp: '$ 35,000', stock: 0, status: 'out' },
                                    { sku: 'SNK-022', nombre: 'Jugo en Cajita (Manzana)', cat: 'Bebidas', pvp: '$ 3,500', stock: 45, status: 'ok' },
                                ].map((row, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                                        <td style={{ padding: '16px 8px', fontSize: '13px', color: 'var(--text-secondary)' }}>{row.sku}</td>
                                        <td style={{ padding: '16px 8px', fontWeight: 600 }}>{row.nombre}</td>
                                        <td style={{ padding: '16px 8px', fontSize: '14px' }}>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--surface-color)', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', border: '1px solid var(--surface-border)' }}>
                                                <Tag size={12} /> {row.cat}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 8px', fontWeight: 600 }}>{row.pvp}</td>
                                        <td style={{ padding: '16px 8px' }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                background: row.status === 'ok' ? 'rgba(52, 199, 89, 0.1)' : row.status === 'low' ? 'rgba(232, 93, 4, 0.1)' : 'rgba(255, 59, 48, 0.1)',
                                                color: row.status === 'ok' ? 'var(--success)' : row.status === 'low' ? 'var(--brand-orange)' : 'var(--danger)',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                fontWeight: 600
                                            }}>{row.stock} unid.</span>
                                        </td>
                                        <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                                            <button style={{ background: 'transparent', color: 'var(--accent-color)', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
                                                Editar
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
