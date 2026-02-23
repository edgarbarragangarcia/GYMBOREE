import { Shield, Bell, Layout, Users } from 'lucide-react';

export default function Configuracion() {
    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0, letterSpacing: '-0.5px' }}>Configuración del Sistema</h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Ajustes globales, personalización y control de accesos.</p>
            </div>

            <div className="grid">
                <div className="chart-card glass-panel" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <h3 className="card-title" style={{ marginBottom: '16px' }}>Menú de Ajustes</h3>

                    {[
                        { icon: Layout, label: 'Preferencias Generales', active: true },
                        { icon: Shield, label: 'Seguridad & Roles', active: false },
                        { icon: Users, label: 'Gestión de Staff', active: false },
                        { icon: Bell, label: 'Notificaciones Aut.', active: false },
                    ].map((item, i) => (
                        <div key={i} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            background: item.active ? 'rgba(0, 113, 227, 0.1)' : 'transparent',
                            color: item.active ? 'var(--accent-color)' : 'var(--text-primary)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontWeight: item.active ? 600 : 500,
                            transition: 'background 0.2s'
                        }}>
                            <item.icon size={18} />
                            {item.label}
                        </div>
                    ))}
                </div>

                <div className="chart-card glass-panel" style={{ gridColumn: 'span 8' }}>
                    <h3 className="card-title" style={{ borderBottom: '1px solid var(--surface-border)', paddingBottom: '16px', marginBottom: '24px' }}>Preferencias Generales</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '500px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>Nombre de la Sede</label>
                            <input type="text" className="premium-input" defaultValue="Gymboree Salitre" style={{ height: '44px' }} />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>Correo Electrónico de Contacto</label>
                            <input type="email" className="premium-input" defaultValue="salitre@gymboree.com.co" style={{ height: '44px' }} />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>Moneda Principal</label>
                            <select className="premium-input" style={{ height: '44px', appearance: 'none' }}>
                                <option>COP - Peso Colombiano</option>
                                <option>USD - Dólar Estadounidense</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--surface-color)', borderRadius: '12px', border: '1px solid var(--surface-border)' }}>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '14px' }}>Modo Oscuro Automático</div>
                                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Sincronizar con el sistema operativo</div>
                            </div>
                            <div style={{ width: '44px', height: '24px', background: 'var(--success)', borderRadius: '12px', position: 'relative', cursor: 'pointer' }}>
                                <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', right: '2px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}></div>
                            </div>
                        </div>

                        <div style={{ marginTop: '16px', paddingTop: '24px', borderTop: '1px solid var(--surface-border)' }}>
                            <button className="btn-primary">Guardar Cambios</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
