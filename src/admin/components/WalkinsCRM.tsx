import { useState, useEffect } from 'react';
import { Search, Plus, Filter, PhoneCall, FileText, X, Save, Calendar, User, Baby, Hash, Edit2, Clock, Activity, Mail, Phone, ExternalLink, CheckCircle, Circle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Cliente apuntando al proyecto HUNTER
const hunter = createClient(
    'https://epudfdzrxyannpfbydkp.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwdWRmZHpyeHlhbm5wZmJ5ZGtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNDY3NTksImV4cCI6MjA3MTcyMjc1OX0.cAc9vz-DEaWJgsq6fOHeBUvRdh-Gll_pn5EBKQhk5fA'
);

export default function WalkinsCRM() {
    const [activeTab, setActiveTab] = useState<'leads' | 'academic'>('leads');
    const [selectedLead, setSelectedLead] = useState<any>(null);
    const [viewProfileLead, setViewProfileLead] = useState<any>(null);
    const [notes, setNotes] = useState('');
    const [nextTaskDate, setNextTaskDate] = useState('');
    const [nextTaskDesc, setNextTaskDesc] = useState('');
    const [leads, setLeads] = useState<any[]>([]);
    const [loadingLeads, setLoadingLeads] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [deleteConfirmKey, setDeleteConfirmKey] = useState('');
    const [isDeletingLoading, setIsDeletingLoading] = useState(false);
    const [activityStatus, setActivityStatus] = useState('Nuevo');
    const [isSavingActivity, setIsSavingActivity] = useState(false);
    const [leadActivities, setLeadActivities] = useState<any[]>([]);
    const [isLoadingActivities, setIsLoadingActivities] = useState(false);

    const filteredLeads = leads.filter(lead => {
        const search = searchTerm.toLowerCase();
        return (
            (lead.family_name?.toLowerCase().includes(search)) ||
            (lead.child_name?.toLowerCase().includes(search)) ||
            (lead.phone?.toLowerCase().includes(search)) ||
            (lead.telegram_username?.toLowerCase().includes(search))
        );
    });

    const counts = {
        total: leads.length,
        demos: leads.filter(l => l.status === 'Clase Demo Programada').length,
        enrolled: leads.filter(l => l.status === 'Matriculado').length
    };

    const fetchLeads = async () => {
        try {
            setLoadingLeads(true);
            const { data, error } = await hunter
                .from('crm_leads')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setLeads(data || []);
        } catch (err: any) {
            console.error('Error fetching leads:', err.message);
        } finally {
            setLoadingLeads(false);
        }
    };

    const handleDeleteLead = async (leadId: string) => {
        if (deleteConfirmKey !== leadId.split('-')[0]) {
            alert('Código de seguridad incorrecto. Para borrar use los primeros 4 caracteres del ID del prospecto.');
            return;
        }

        try {
            setIsDeletingLoading(true);
            const { error } = await hunter
                .from('crm_leads')
                .delete()
                .eq('id', leadId);

            if (error) throw error;
            setIsDeleting(null);
            setDeleteConfirmKey('');
        } catch (err: any) {
            console.error('Error deleting lead:', err.message);
            alert('Error al eliminar: ' + err.message);
        } finally {
            setIsDeletingLoading(false);
        }
    };

    const handleOpenActivityModal = async (lead: any) => {
        setSelectedLead(lead);
        setActivityStatus(lead.status || 'Nuevo');
        setNotes('');
        setNextTaskDate('');
        setNextTaskDesc('');
        setLeadActivities([]);
        setIsLoadingActivities(true);

        try {
            const { data } = await hunter
                .from('crm_activities')
                .select('*')
                .eq('lead_id', lead.id)
                .order('created_at', { ascending: false });

            if (data) {
                setLeadActivities(data);
            }
        } catch (err) {
            console.error('Error fetching activities:', err);
        } finally {
            setIsLoadingActivities(false);
        }
    };

    const handleToggleTaskStatus = async (activityId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'Realizado' ? 'En espera' : 'Realizado';
        // Optimistic update
        setLeadActivities(prev => prev.map(a => a.id === activityId ? { ...a, task_status: newStatus } : a));
        try {
            const { error } = await hunter
                .from('crm_activities')
                .update({ task_status: newStatus })
                .eq('id', activityId);
            if (error) throw error;
        } catch (err) {
            console.error('Error updating task status:', err);
            // Revert on error
            setLeadActivities(prev => prev.map(a => a.id === activityId ? { ...a, task_status: currentStatus } : a));
            alert('Error al actualizar el estado de la tarea.');
        }
    };

    const handleSaveActivity = async () => {
        if (!selectedLead) return;

        try {
            setIsSavingActivity(true);

            // Actualizar Lead
            const { error: leadError } = await hunter
                .from('crm_leads')
                .update({
                    status: activityStatus,
                    updated_at: new Date().toISOString()
                })
                .eq('id', selectedLead.id);

            if (leadError) throw leadError;

            // Registrar Actividad
            if (notes || nextTaskDate) {
                const { error: activityError } = await hunter
                    .from('crm_activities')
                    .insert({
                        lead_id: selectedLead.id,
                        type: 'Seguimiento',
                        content: notes || 'Actualización de estado',
                        next_task_at: nextTaskDate ? new Date(nextTaskDate).toISOString() : null,
                        next_task_desc: nextTaskDesc,
                        task_status: nextTaskDate ? 'En espera' : null,
                        performed_by: 'Admin'
                    });

                if (activityError) throw activityError;
            }

            setSelectedLead(null);
            setNotes('');
            setNextTaskDate('');
            setNextTaskDesc('');
            fetchLeads();
        } catch (err: any) {
            console.error('Error saving activity:', err.message);
            alert('Error al guardar registro: ' + err.message);
        } finally {
            setIsSavingActivity(false);
        }
    };

    useEffect(() => {
        fetchLeads();

        // Suscripción en tiempo real
        const channel = hunter
            .channel('crm_leads_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'crm_leads' }, () => {
                fetchLeads();
            })
            .subscribe();

        return () => {
            hunter.removeChannel(channel);
        };
    }, []);

    const calculateDaysInactive = (lastContact: string) => {
        if (!lastContact) return 0;
        const last = new Date(lastContact);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - last.getTime());
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '---';
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    };

    const formatTime = (dateStr: string) => {
        if (!dateStr) return '---';
        const date = new Date(dateStr);
        return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    // Academic Tab State
    const [childSearch, setChildSearch] = useState('');
    const [foundChild, setFoundChild] = useState<any>(null);
    const [isScheduling, setIsScheduling] = useState(false);
    const [appointmentDate, setAppointmentDate] = useState('');
    const [appointmentTime, setAppointmentTime] = useState('');
    const [appointmentProgram, setAppointmentProgram] = useState('');

    const handleChildSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const query = childSearch.toLowerCase();
        if (query.includes('agustin') || query.includes('barragan')) {
            setFoundChild({
                id: 'GB-2024-089',
                name: 'Agustín Barragán',
                age: '3 años 4 meses',
                photo: 'https://images.unsplash.com/photo-1519238263530-99bbe18754b9?auto=format&fit=crop&q=80&w=200',
                status: 'Activo',
                programs: [
                    { name: 'Play & Learn', level: 'L3', schedule: 'Lun - Mié 4:00 PM', progress: 85 },
                    { name: 'Gym Music', level: 'L1', schedule: 'Vie 3:00 PM', progress: 40 }
                ],
                attendance: '95%',
                lastPayment: '01 Mar 2026',
                parent: {
                    name: 'Edgar Barragán',
                    phone: '+57 300 123 4567',
                    email: 'edgar@example.com',
                    relation: 'Padre'
                },
                alerts: ['Alergia al maní', 'Recoger puntualmente'],
                nextClass: 'Hoy, 4:00 PM (L3)',
                vencimiento: '30 Mar 2026'
            });
        } else {
            setFoundChild(null);
        }
    };

    const handleSaveAppointment = (e: React.FormEvent) => {
        e.preventDefault();
        alert(`Cita programada para ${foundChild.name} en ${appointmentProgram} el día ${appointmentDate} a las ${appointmentTime}`);
        setIsScheduling(false);
        setAppointmentDate('');
        setAppointmentTime('');
        setAppointmentProgram('');
    };

    return (
        <div style={{ padding: '0 8px' }}>
            <div className="sticky-page-header" style={{ marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 900, margin: 0, letterSpacing: '-1px' }}>CRM</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Gestión integral de prospectos y alumnos activos</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', background: 'rgba(0,0,0,0.05)', padding: '4px', borderRadius: '16px' }}>
                    <button
                        onClick={() => setActiveTab('leads')}
                        style={{
                            padding: '10px 20px',
                            fontSize: '14px',
                            borderRadius: '12px',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 700,
                            background: activeTab === 'leads' ? 'white' : 'transparent',
                            color: activeTab === 'leads' ? 'var(--text-primary)' : 'var(--text-secondary)',
                            boxShadow: activeTab === 'leads' ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        Gestionar Lead (CRM)
                    </button>
                    <button
                        onClick={() => setActiveTab('academic')}
                        style={{
                            padding: '10px 20px',
                            fontSize: '14px',
                            borderRadius: '12px',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 700,
                            background: activeTab === 'academic' ? 'white' : 'transparent',
                            color: activeTab === 'academic' ? 'var(--text-primary)' : 'var(--text-secondary)',
                            boxShadow: activeTab === 'academic' ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        Información Académica
                    </button>
                </div>
            </div>

            {activeTab === 'leads' ? (
                <>
                    {/* CRM Analytics Row */}
                    <div className="dashboard-grid" style={{ marginBottom: '32px' }}>
                        <div className="chart-card glass-panel" style={{ gridColumn: 'span 7', minHeight: 'auto' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 20px' }}>Embudo de Conversión (Funnel)</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {[
                                    { label: 'Leads Totales', value: counts.total, color: 'var(--accent-color)', width: '100%' },
                                    { label: 'Clases Demo', value: counts.demos, color: 'var(--brand-orange)', width: counts.total > 0 ? `${(counts.demos / counts.total) * 100}%` : '0%' },
                                    { label: 'Matrículas Cerradas', value: counts.enrolled, color: 'var(--success)', width: counts.total > 0 ? `${(counts.enrolled / counts.total) * 100}%` : '0%' }
                                ].map((step, i) => (
                                    <div key={i} style={{ position: 'relative' }}>
                                        <div style={{
                                            width: step.width,
                                            height: '32px',
                                            background: step.color,
                                            opacity: 0.1,
                                            borderRadius: '8px',
                                            border: `1px solid ${step.color}`
                                        }}></div>
                                        <div style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: step.width,
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '0 12px',
                                            fontWeight: 700
                                        }}>
                                            <span style={{ fontSize: '12px' }}>{step.label}</span>
                                            <span style={{ fontSize: '14px' }}>{step.value}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop: '16px', display: 'flex', gap: '16px' }}>
                                <div style={{ padding: '8px 12px', borderRadius: '10px', background: 'rgba(52, 199, 89, 0.05)', flex: 1 }}>
                                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600 }}>Tasa Conversión (L2S)</div>
                                    <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--success)' }}>26.1%</div>
                                </div>
                                <div style={{ padding: '8px 12px', borderRadius: '10px', background: 'rgba(0, 113, 227, 0.05)', flex: 1 }}>
                                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600 }}>Costo Adquisición (Avg)</div>
                                    <div style={{ fontSize: '16px', fontWeight: 800 }}>$142,000</div>
                                </div>
                            </div>
                        </div>

                        <div className="chart-card glass-panel" style={{ gridColumn: 'span 5', minHeight: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>Velocidad de Captura</h3>
                                <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '12px', borderRadius: '10px' }}>
                                    <Plus size={14} />
                                    Nuevo Walkin
                                </button>
                            </div>
                            <div style={{ height: '90px', width: '100%', position: 'relative' }}>
                                <svg viewBox="0 0 300 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                                    <path d="M0,80 L50,60 L100,75 L150,30 L200,45 L250,10 L300,20" fill="none" stroke="var(--brand-orange)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                    {[0, 50, 100, 150, 200, 250, 300].map((x, i) => (
                                        <circle key={i} cx={x} cy={[80, 60, 75, 30, 45, 10, 20][i]} r="4" fill="white" stroke="var(--brand-orange)" strokeWidth="2" />
                                    ))}
                                </svg>
                            </div>
                            <div style={{ marginTop: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700 }}>
                                    <span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span>
                                </div>
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '12px', fontStyle: 'italic' }}>
                                    * El volumen de leads aumentó un 18% respecto a la semana pasada.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid">
                        <div className="chart-card glass-panel" style={{ gridColumn: 'span 12' }}>
                            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                                <div className="input-wrapper" style={{ flex: 1 }}>
                                    <Search size={18} className="input-icon" style={{ left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
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
                                        {loadingLeads ? (
                                            <tr>
                                                <td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                                    <Clock size={24} style={{ animation: 'spin 2s linear infinite', marginBottom: '12px' }} />
                                                    <div>Cargando prospectos...</div>
                                                </td>
                                            </tr>
                                        ) : filteredLeads.length === 0 ? (
                                            <tr>
                                                <td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                                    No se encontraron prospectos con "{searchTerm}".
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredLeads.map((lead) => {
                                                const diasInactivo = calculateDaysInactive(lead.updated_at);
                                                return (
                                                    <tr key={lead.id} style={{ borderBottom: '1px solid var(--surface-border)', transition: 'background 0.2s' }}>
                                                        <td style={{ padding: '16px 8px' }}>
                                                            <div style={{ fontWeight: 600 }}>{lead.family_name || 'Sin Apellido'}</div>
                                                            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                                                Niño: {lead.child_name || '---'} ({lead.child_age || '---'})
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '16px 8px', fontSize: '14px' }}>{lead.phone || lead.telegram_username || '---'}</td>
                                                        <td style={{ padding: '16px 8px', fontSize: '14px', color: 'var(--text-secondary)' }}>{formatDate(lead.created_at)}</td>
                                                        <td style={{ padding: '16px 8px', fontSize: '14px', color: 'var(--text-secondary)' }}>{formatDate(lead.updated_at)}, {formatTime(lead.updated_at)}</td>
                                                        <td style={{ padding: '16px 8px', fontSize: '14px', color: diasInactivo > 3 ? 'var(--danger)' : diasInactivo > 0 ? 'var(--warning)' : 'var(--success)', fontWeight: 600, textAlign: 'center' }}>
                                                            {diasInactivo} {diasInactivo === 1 ? 'día' : 'días'}
                                                        </td>
                                                        <td style={{ padding: '16px 8px', fontSize: '13px' }}>{lead.source}</td>
                                                        <td style={{ padding: '16px 8px', fontSize: '14px', fontWeight: 500 }}>{lead.program_interest || '---'}</td>
                                                        <td style={{ padding: '16px 8px' }}>
                                                            <span style={{
                                                                padding: '4px 10px',
                                                                background: lead.status === 'Nuevo' ? 'rgba(0, 113, 227, 0.1)' : lead.status === 'Clase Demo Programada' ? 'rgba(52, 199, 89, 0.1)' : 'rgba(232, 93, 4, 0.1)',
                                                                color: lead.status === 'Nuevo' ? 'var(--accent-color)' : lead.status === 'Clase Demo Programada' ? 'var(--success)' : 'var(--brand-orange)',
                                                                borderRadius: '20px',
                                                                fontSize: '12px',
                                                                fontWeight: 600
                                                            }}>
                                                                {lead.status}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '16px 8px' }}>
                                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                                <button onClick={() => setViewProfileLead(lead)} style={{ background: 'rgba(142, 142, 147, 0.1)', color: 'var(--text-secondary)', border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer' }} title="Ver Perfil"><User size={16} /></button>
                                                                <button onClick={() => handleOpenActivityModal(lead)} style={{ background: 'rgba(255, 149, 0, 0.1)', color: 'var(--brand-orange)', border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer' }} title="Registrar Actividad"><FileText size={16} /></button>
                                                                <button style={{ background: 'rgba(0, 113, 227, 0.1)', color: 'var(--accent-color)', border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer' }} title="Llamar"><PhoneCall size={16} /></button>
                                                                <button onClick={() => setIsDeleting(lead.id)} style={{ background: 'rgba(255, 59, 48, 0.1)', color: 'var(--danger)', border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer' }} title="Borrar Prospecto"><X size={16} /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '0 0 40px' }}>
                    <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', borderRadius: '24px', overflow: 'hidden', minHeight: '600px' }}>
                        <div style={{ padding: '32px', borderBottom: '1px solid rgba(0,0,0,0.05)', background: 'rgba(255,255,255,0.2)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <div style={{ background: 'var(--brand-orange-light)', padding: '10px', borderRadius: '14px' }}>
                                    <Baby size={24} color="var(--brand-orange)" />
                                </div>
                                <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Información Académica</h2>
                            </div>
                            <form onSubmit={handleChildSearch} style={{ background: 'white', borderRadius: '16px', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                                <Search size={20} color="var(--text-secondary)" />
                                <input
                                    type="text"
                                    value={childSearch}
                                    onChange={e => setChildSearch(e.target.value)}
                                    placeholder="Buscar niño (Ej. Agustin)..."
                                    style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '15px', width: '100%', outline: 'none', fontWeight: 500 }}
                                />
                            </form>
                        </div>

                        <div style={{ flex: 1, padding: '32px' }}>
                            {foundChild ? (
                                isScheduling ? (
                                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                                            <button onClick={() => setIsScheduling(false)} style={{ background: 'rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
                                            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Programar Cita</h3>
                                        </div>
                                        <form onSubmit={handleSaveAppointment} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>Programa / Servicio</label>
                                                <select
                                                    required
                                                    value={appointmentProgram}
                                                    onChange={e => setAppointmentProgram(e.target.value)}
                                                    style={{ padding: '14px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', background: 'white', fontSize: '14px' }}
                                                >
                                                    <option value="">Seleccionar programa...</option>
                                                    <option value="Clase Demo Play & Learn">Clase Demo Play & Learn</option>
                                                    <option value="Clase Demo Gym Music">Clase Demo Gym Music</option>
                                                    <option value="Reposición">Reposición</option>
                                                </select>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>Fecha</label>
                                                    <input type="date" required value={appointmentDate} onChange={e => setAppointmentDate(e.target.value)} style={{ padding: '14px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', background: 'white', fontSize: '14px' }} />
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>Hora</label>
                                                    <input type="time" required value={appointmentTime} onChange={e => setAppointmentTime(e.target.value)} style={{ padding: '14px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', background: 'white', fontSize: '14px' }} />
                                                </div>
                                            </div>
                                            <button className="btn-primary" type="submit" style={{ padding: '16px', marginTop: '10px', borderRadius: '14px', fontSize: '15px' }}>Confirmar Cita</button>
                                        </form>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 20px', borderRadius: '60px', overflow: 'hidden', border: '4px solid white', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
                                                <img src={foundChild.photo} alt={foundChild.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <div style={{ position: 'absolute', bottom: 4, right: 4, width: '32px', height: '32px', borderRadius: '16px', background: 'var(--brand-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                                                    <Edit2 size={16} color="white" />
                                                </div>
                                            </div>
                                            <h3 style={{ fontSize: '24px', fontWeight: 900, margin: '0 0 8px', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>{foundChild.name}</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                                                <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 600 }}>{foundChild.age}</span>
                                                <span style={{ padding: '4px 12px', borderRadius: '12px', background: 'rgba(52, 199, 89, 0.1)', color: 'var(--success)', fontSize: '12px', fontWeight: 800 }}>{foundChild.status}</span>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                            <button
                                                onClick={() => setIsScheduling(true)}
                                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '20px', borderRadius: '20px', background: 'rgba(0,113,227,0.04)', border: '1px solid rgba(0,113,227,0.08)', cursor: 'pointer', transition: 'transform 0.2s, background 0.2s' }}
                                            >
                                                <Clock size={24} color="var(--accent-color)" />
                                                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-color)' }}>Programar Cita</span>
                                            </button>
                                            <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '20px', borderRadius: '20px', background: 'rgba(232, 93, 4, 0.04)', border: '1px solid rgba(232, 93, 4, 0.08)', cursor: 'pointer', transition: 'transform 0.2s, background 0.2s' }}>
                                                <FileText size={24} color="var(--brand-orange)" />
                                                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brand-orange)' }}>Pagos / RC</span>
                                            </button>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Programas Activos</label>
                                            {foundChild.programs.map((p: any, idx: number) => (
                                                <div key={idx} style={{ padding: '16px', borderRadius: '16px', background: 'white', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                        <span style={{ fontWeight: 800, fontSize: '15px' }}>{p.name} <span style={{ color: 'var(--brand-orange)', marginLeft: '4px' }}>{p.level}</span></span>
                                                        <Activity size={16} color="var(--text-secondary)" />
                                                    </div>
                                                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                                                        <Calendar size={14} /> {p.schedule}
                                                    </div>
                                                    <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                                        <div style={{ width: `${p.progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--brand-orange), #ff8a00)', borderRadius: '3px' }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Responsable / Acudiente</label>
                                            <div style={{ padding: '20px', borderRadius: '18px', background: 'var(--brand-orange-light)', border: '1px solid rgba(232, 93, 4, 0.1)' }}>
                                                <div style={{ fontWeight: 800, fontSize: '16px', marginBottom: '12px', color: 'var(--brand-orange)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span>{foundChild.parent.name}</span>
                                                    <span style={{ fontSize: '11px', padding: '4px 8px', background: 'white', borderRadius: '8px', fontWeight: 700 }}>{foundChild.parent.relation}</span>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                                                    <a href={`tel:${foundChild.parent.phone}`} style={{ fontSize: '14px', color: 'var(--text-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}><Phone size={14} /> {foundChild.parent.phone}</a>
                                                    <a href={`mailto:${foundChild.parent.email}`} style={{ fontSize: '14px', color: 'var(--text-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}><Mail size={14} /> {foundChild.parent.email}</a>
                                                </div>
                                                <button style={{ width: '100%', background: 'white', border: '1px solid rgba(232, 93, 4, 0.2)', borderRadius: '12px', padding: '12px', fontSize: '13px', color: 'var(--brand-orange)', fontWeight: 800, cursor: 'pointer' }}>Generar Link de Pago (PSE)</button>
                                            </div>
                                        </div>

                                        <button className="btn-primary" style={{ width: '100%', padding: '18px', fontSize: '14px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                            Ver Perfil en HUNTER
                                            <ExternalLink size={16} />
                                        </button>
                                    </div>
                                )
                            ) : (
                                <div style={{ textAlign: 'center', marginTop: '60px', color: 'var(--text-secondary)' }}>
                                    <div style={{ width: '100%', padding: '48px 32px', borderRadius: '24px', background: 'rgba(0,0,0,0.02)', border: '2px dashed rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                                        <div style={{ background: 'white', padding: '16px', borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                                            <Search size={40} style={{ opacity: 0.3 }} />
                                        </div>
                                        <p style={{ fontSize: '15px', margin: 0, maxWidth: '280px', lineHeight: 1.6, fontWeight: 500 }}>Busca un niño por nombre para ver su ficha técnica.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ padding: '20px 32px', borderTop: '1px solid rgba(0,0,0,0.05)', background: 'rgba(0,0,0,0.01)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                <Hash size={14} />
                                <span>ID: {foundChild?.id || '---'}</span>
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', opacity: 0.6 }}>GYMBOREE Intelligence Hub</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Registro de Actividad */}
            {selectedLead && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="glass-panel" style={{ width: '100%', maxWidth: '850px', padding: '24px', background: 'var(--surface-color)', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, fontSize: '20px' }}>Gestión de Prospecto</h2>
                            <button onClick={() => setSelectedLead(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={20} /></button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            {/* Columna Izquierda: Formulario nuevo */}
                            <div>
                                <div style={{ marginBottom: '20px', padding: '16px', background: 'rgba(0,0,0,0.03)', borderRadius: '12px' }}>
                                    <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>{selectedLead.family_name}</div>
                                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Programa de interés: <strong style={{ color: 'var(--brand-orange)' }}>{selectedLead.program_interest}</strong></div>

                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Estado Actual</label>
                                    <select
                                        value={activityStatus}
                                        onChange={(e) => setActivityStatus(e.target.value)}
                                        style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)', background: 'white', fontSize: '15px', fontWeight: 600, color: 'var(--brand-orange)' }}
                                    >
                                        <option value="Nuevo">Nuevo</option>
                                        <option value="Contactado">Contactado</option>
                                        <option value="Clase Demo Programada">Clase Demo Programada</option>
                                        <option value="Demo Asistida">Demo Asistida</option>
                                        <option value="Matriculado">Matriculado</option>
                                        <option value="Perdido / No Interesado">Perdido / No Interesado</option>
                                    </select>
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nueva Nota / Seguimiento</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="premium-input"
                                        rows={4}
                                        style={{ width: '100%', resize: 'vertical', borderRadius: '10px', padding: '14px', fontSize: '15px' }}
                                        placeholder="Registra avances, llamadas o compromisos..."
                                    />
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', marginBottom: '12px', fontWeight: 600, fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Próxima Tarea</label>
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexDirection: 'column' }}>
                                        <div className="input-wrapper" style={{ position: 'relative' }}>
                                            <input
                                                type="datetime-local"
                                                value={nextTaskDate}
                                                onChange={(e) => setNextTaskDate(e.target.value)}
                                                className="premium-input"
                                                style={{ height: '44px', borderRadius: '10px', fontSize: '15px', width: '100%', padding: '0 14px' }}
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="text"
                                                value={nextTaskDesc}
                                                onChange={(e) => setNextTaskDesc(e.target.value)}
                                                className="premium-input"
                                                style={{ height: '44px', borderRadius: '10px', fontSize: '14px', width: '100%', padding: '0 14px' }}
                                                placeholder="Descripción... (Ej. Llamar para confirmar)"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Columna Derecha: Historial */}
                            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <label style={{ display: 'block', marginBottom: '12px', fontWeight: 600, fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Gestión Realizada</label>
                                <div style={{ flex: 1, background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '12px', padding: '16px', overflowY: 'auto', maxHeight: '420px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {isLoadingActivities ? (
                                        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                            <Clock size={20} className="spin" />
                                            <span style={{ fontSize: '13px' }}>Cargando historial...</span>
                                        </div>
                                    ) : leadActivities.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                                            <Activity size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                                            Aún no hay actividades registradas en el CRM.
                                        </div>
                                    ) : (
                                        leadActivities.map((act) => (
                                            <div key={act.id} style={{ background: 'white', padding: '12px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.06)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'white', background: 'var(--brand-orange)', padding: '2px 8px', borderRadius: '10px' }}>{act.type || 'Nota'}</span>
                                                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{formatDate(act.created_at)}</span>
                                                </div>
                                                <div style={{ fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', marginBottom: act.next_task_at ? '8px' : '0' }}>{act.content}</div>

                                                {act.next_task_at && (
                                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', background: act.task_status === 'Realizado' ? 'rgba(52, 199, 89, 0.05)' : 'rgba(0,113,227,0.05)', padding: '8px', borderRadius: '8px', border: act.task_status === 'Realizado' ? '1px solid rgba(52, 199, 89, 0.2)' : '1px solid rgba(0,113,227,0.1)', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => handleToggleTaskStatus(act.id, act.task_status || 'En espera')}>
                                                        <div style={{ marginTop: '2px', color: act.task_status === 'Realizado' ? 'var(--success)' : 'var(--accent-color)' }}>
                                                            {act.task_status === 'Realizado' ? <CheckCircle size={16} /> : <Circle size={16} />}
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                                <div style={{ fontSize: '11px', fontWeight: 600, color: act.task_status === 'Realizado' ? 'var(--success)' : 'var(--accent-color)' }}>Tarea Programada</div>
                                                                <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '6px', background: act.task_status === 'Realizado' ? 'var(--success)' : 'var(--accent-color)', color: 'white', fontWeight: 700 }}>{act.task_status || 'En espera'}</span>
                                                            </div>
                                                            <div style={{ fontSize: '12px', color: act.task_status === 'Realizado' ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: act.task_status === 'Realizado' ? 'line-through' : 'none', marginTop: '2px' }}>{act.next_task_desc || 'Sin descripción'}</div>
                                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Para el {formatDate(act.next_task_at)} {formatTime(act.next_task_at)}</div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--surface-border)', paddingTop: '20px', marginTop: '10px' }}>
                            <button onClick={() => setSelectedLead(null)} style={{ padding: '12px 20px', background: 'transparent', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}>Cerrar</button>
                            <button onClick={handleSaveActivity} disabled={isSavingActivity} className="btn-primary" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '10px', fontWeight: 600, opacity: isSavingActivity ? 0.7 : 1 }}>
                                {isSavingActivity ? <Clock size={16} className="spin" /> : <Save size={16} />}
                                {isSavingActivity ? 'Guardando...' : 'Guardar Registro'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Hoja de Vida */}
            {viewProfileLead && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '24px', background: 'var(--surface-color)', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><User size={24} /> Hoja de Vida del Lead</h2>
                            <button onClick={() => setViewProfileLead(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={20} /></button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                            <div style={{ background: 'rgba(0,0,0,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--surface-border)' }}>
                                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Nombre del Lead</div>
                                <div style={{ fontWeight: 600, fontSize: '16px' }}>{viewProfileLead.family_name}</div>
                            </div>
                            <div style={{ background: 'rgba(0,0,0,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--surface-border)' }}>
                                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Nombre del Niño(a)</div>
                                <div style={{ fontWeight: 600, fontSize: '16px' }}>{viewProfileLead.child_name || '---'}</div>
                            </div>
                            <div style={{ background: 'rgba(0,0,0,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--surface-border)' }}>
                                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Teléfono</div>
                                <div style={{ fontWeight: 600, fontSize: '15px' }}>{viewProfileLead.phone || '---'}</div>
                            </div>
                            <div style={{ background: 'rgba(0,0,0,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--surface-border)' }}>
                                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Programa de Interés</div>
                                <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--brand-orange)' }}>{viewProfileLead.program_interest || '---'}</div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '16px', marginBottom: '12px', borderBottom: '1px solid var(--surface-border)', paddingBottom: '8px' }}>Historial de Actividades (Timeline)</h3>
                            <div style={{ display: 'flex', gap: '12px', position: 'relative', paddingLeft: '8px', marginBottom: '16px' }}>
                                <div style={{ left: '13px', width: '2px', background: 'var(--surface-border)', position: 'absolute', top: '24px', bottom: '-20px' }} />
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--success)', marginTop: '4px', zIndex: 1, flexShrink: 0 }} />
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '14px' }}>Última Actualización</div>
                                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>{formatDate(viewProfileLead.updated_at)} - El estado es {viewProfileLead.status}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', position: 'relative', paddingLeft: '8px' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--brand-orange)', marginTop: '4px', zIndex: 1, flexShrink: 0 }} />
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '14px' }}>Registro Inicial</div>
                                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>{formatDate(viewProfileLead.created_at)} - Lead capturado vía {viewProfileLead.source}</div>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--surface-border)' }}>
                            <button onClick={() => setViewProfileLead(null)} className="btn-primary" style={{ padding: '10px 24px', borderRadius: '8px' }}>Cerrar Perfil</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Seguridad para Borrar */}
            {isDeleting && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
                    <div className="glass-panel" style={{ width: '400px', padding: '32px', borderRadius: '24px', background: 'white' }}>
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <div style={{ background: 'rgba(255, 59, 48, 0.1)', color: 'var(--danger)', width: '64px', height: '64px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                <Activity size={32} />
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 8px' }}>¿Confirmar Eliminación?</h3>
                            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>Acción irreversible. El prospecto será borrado permanentemente.</p>
                        </div>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', textAlign: 'center' }}>
                                Introduce los primeros 4 caracteres del ID: <br />
                                <strong style={{ color: 'var(--text-primary)', fontSize: '14px' }}>{isDeleting.split('-')[0]}</strong>
                            </label>
                            <input
                                type="text"
                                value={deleteConfirmKey}
                                onChange={e => setDeleteConfirmKey(e.target.value)}
                                placeholder="Escribe el código aquí..."
                                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--surface-border)', textAlign: 'center', fontSize: '16px', fontWeight: 700, textTransform: 'uppercase' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => { setIsDeleting(null); setDeleteConfirmKey(''); }} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid var(--surface-border)', background: 'white', fontWeight: 700 }}>Cancelar</button>
                            <button onClick={() => handleDeleteLead(isDeleting)} disabled={isDeletingLoading} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: 'var(--danger)', color: 'white', fontWeight: 700, opacity: isDeletingLoading ? 0.7 : 1 }}>
                                {isDeletingLoading ? 'Borrando...' : 'Confirmar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
