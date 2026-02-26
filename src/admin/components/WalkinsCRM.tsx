import { useState } from 'react';
import { Search, Plus, Filter, MessageSquare, PhoneCall, FileText, X, Save } from 'lucide-react';

export default function WalkinsCRM() {
    const [selectedLead, setSelectedLead] = useState<any>(null);
    const [notes, setNotes] = useState('');

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0, letterSpacing: '-0.5px' }}>Walkins & CRM</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Gestión de prospectos, seguimientos y captura de leads.</p>
                </div>
                <button className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>
                    <Plus size={18} />
                    Nuevo Walkin
                </button>
            </div>

            <div className="grid">
                <div className="chart-card glass-panel" style={{ gridColumn: 'span 12' }}>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                        <div className="input-wrapper" style={{ flex: 1 }}>
                            <Search size={18} className="input-icon" style={{ left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                placeholder="Buscar prospectos por nombre, teléfono o email..."
                                className="premium-input"
                                style={{ height: '44px', borderRadius: '12px' }}
                            />
                        </div>
                        <button className="glass-panel" style={{ padding: '0 20px', border: '1px solid var(--surface-border)', borderRadius: '12px', background: 'transparent', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
                            <Filter size={18} />
                            Filtros
                        </button>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--surface-border)', color: 'var(--text-secondary)', fontSize: '13px' }}>
                                    <th style={{ padding: '16px 8px' }}>Prospecto</th>
                                    <th style={{ padding: '16px 8px' }}>Contacto</th>
                                    <th style={{ padding: '16px 8px' }}>Día de Registro</th>
                                    <th style={{ padding: '16px 8px' }}>Día de Contacto</th>
                                    <th style={{ padding: '16px 8px', textAlign: 'center' }}>Días sin Actividad</th>
                                    <th style={{ padding: '16px 8px' }}>Canal / Origen</th>
                                    <th style={{ padding: '16px 8px' }}>Programa Interés</th>
                                    <th style={{ padding: '16px 8px' }}>Estado</th>
                                    <th style={{ padding: '16px 8px' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { nombre: 'Familia Gómez', tel: '311 555 1234', nino: 'Santiago (2 años)', diaRegistro: 'Hoy', fecha: 'Hoy, 10:30 AM', diasInactivo: 0, origen: 'WhatsApp / Pauta IG', programa: 'Play & Learn', estado: 'Nuevo' },
                                    { nombre: 'Carolina Ruiz', tel: '320 888 9999', nino: 'Mía (4 años)', diaRegistro: 'Ayer', fecha: 'Ayer, 4:15 PM', diasInactivo: 1, origen: 'Presencial / Referido', programa: 'School Skills', estado: 'Clase Demo Programada' },
                                    { nombre: 'Jorge Silva', tel: '300 111 2222', nino: 'Tomás (1 año)', diaRegistro: '18 Feb', fecha: '20 Feb', diasInactivo: 6, origen: 'Llamada / Web', programa: 'Play & Learn', estado: 'En Seguimiento' },
                                ].map((lead, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid var(--surface-border)', transition: 'background 0.2s' }}>
                                        <td style={{ padding: '16px 8px' }}>
                                            <div style={{ fontWeight: 600 }}>{lead.nombre}</div>
                                            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Niño: {lead.nino}</div>
                                        </td>
                                        <td style={{ padding: '16px 8px', fontSize: '14px' }}>{lead.tel}</td>
                                        <td style={{ padding: '16px 8px', fontSize: '14px', color: 'var(--text-secondary)' }}>{lead.diaRegistro}</td>
                                        <td style={{ padding: '16px 8px', fontSize: '14px', color: 'var(--text-secondary)' }}>{lead.fecha}</td>
                                        <td style={{ padding: '16px 8px', fontSize: '14px', color: lead.diasInactivo > 3 ? 'var(--danger)' : lead.diasInactivo > 0 ? 'var(--warning)' : 'var(--success)', fontWeight: 600, textAlign: 'center' }}>
                                            {lead.diasInactivo} {lead.diasInactivo === 1 ? 'día' : 'días'}
                                        </td>
                                        <td style={{ padding: '16px 8px', fontSize: '13px' }}>{lead.origen}</td>
                                        <td style={{ padding: '16px 8px', fontSize: '14px', fontWeight: 500 }}>{lead.programa}</td>
                                        <td style={{ padding: '16px 8px' }}>
                                            <span style={{
                                                padding: '4px 10px',
                                                background: lead.estado === 'Nuevo' ? 'rgba(0, 113, 227, 0.1)' : lead.estado === 'Clase Demo Programada' ? 'rgba(52, 199, 89, 0.1)' : 'rgba(232, 93, 4, 0.1)',
                                                color: lead.estado === 'Nuevo' ? 'var(--accent-color)' : lead.estado === 'Clase Demo Programada' ? 'var(--success)' : 'var(--brand-orange)',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: 600
                                            }}>
                                                {lead.estado}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 8px' }}>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => setSelectedLead(lead)} style={{ background: 'rgba(255, 149, 0, 0.1)', color: 'var(--brand-orange)', border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer' }} title="Registrar Actividad"><FileText size={16} /></button>
                                                <button style={{ background: 'rgba(52, 199, 89, 0.1)', color: 'var(--success)', border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer' }} title="WhatsApp"><MessageSquare size={16} /></button>
                                                <button style={{ background: 'rgba(0, 113, 227, 0.1)', color: 'var(--accent-color)', border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer' }} title="Llamar"><PhoneCall size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {/* Modal de Registro de Actividad */}
            {selectedLead && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '24px', background: 'var(--surface-color)', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, fontSize: '20px' }}>Registrar Actividad</h2>
                            <button onClick={() => setSelectedLead(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={20} /></button>
                        </div>

                        <div style={{ marginBottom: '20px', padding: '16px', background: 'rgba(0,0,0,0.03)', borderRadius: '8px' }}>
                            <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>{selectedLead.nombre}</div>
                            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Programa de interés: {selectedLead.programa}</div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>¿Qué actividad se realizó?</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="premium-input"
                                rows={4}
                                style={{ width: '100%', resize: 'vertical', borderRadius: '8px', padding: '12px' }}
                                placeholder="Ej. Se llamó a la mamá y quedó en confirmar asistencia mañana..."
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button onClick={() => setSelectedLead(null)} style={{ padding: '10px 16px', background: 'transparent', border: '1px solid var(--surface-border)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    // Simulated save action
                                    setSelectedLead(null);
                                    setNotes('');
                                }}
                                className="btn-primary"
                                style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '8px' }}
                            >
                                <Save size={16} />
                                Guardar Registro
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
