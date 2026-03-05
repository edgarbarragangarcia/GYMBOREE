import { useState, useEffect } from 'react';
import { Search, Plus, Filter, PhoneCall, FileText, X, Save, User, Clock, Activity, Phone, LayoutGrid, List, CheckCircle, Circle } from 'lucide-react';
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
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 7;

    const KANBAN_STATUSES = ['Nuevo', 'Contactado', 'En Seguimiento', 'Clase Demo Programada', 'Demo Asistida', 'Matriculado', 'Perdido / No Interesado'];

    const handleDragStart = (e: React.DragEvent, leadId: string) => {
        e.dataTransfer.setData('leadId', leadId);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = async (e: React.DragEvent, newStatus: string) => {
        e.preventDefault();
        const leadId = e.dataTransfer.getData('leadId');
        if (!leadId) return;

        // Optimistic UI
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus, updated_at: new Date().toISOString() } : l));

        try {
            const { error } = await hunter
                .from('gym_crm_leads')
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq('id', leadId);
            if (error) throw error;
        } catch (err) {
            console.error('Error updating status via drag-drop:', err);
            fetchLeads(); // Rollback
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, viewMode]);

    const filteredLeads = leads.filter(lead => {
        const search = searchTerm.toLowerCase();
        return (
            (lead.family_name?.toLowerCase().includes(search)) ||
            (lead.child_name?.toLowerCase().includes(search)) ||
            (lead.phone?.toLowerCase().includes(search)) ||
            (lead.telegram_username?.toLowerCase().includes(search))
        );
    });

    const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE);
    const paginatedLeads = filteredLeads.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const counts = {
        total: leads.length,
        demos: leads.filter(l => l.status === 'Clase Demo Programada').length,
        enrolled: leads.filter(l => l.status === 'Matriculado').length
    };

    const fetchLeads = async () => {
        try {
            setLoadingLeads(true);
            const { data, error } = await hunter
                .from('gym_crm_leads')
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
                .from('gym_crm_leads')
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
                .from('gym_crm_activities')
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
                .from('gym_crm_activities')
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
                .from('gym_crm_leads')
                .update({
                    status: activityStatus,
                    updated_at: new Date().toISOString()
                })
                .eq('id', selectedLead.id);

            if (leadError) throw leadError;

            // Registrar Actividad
            if (notes || nextTaskDate) {
                const { error: activityError } = await hunter
                    .from('gym_crm_activities')
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
            .on('postgres_changes', { event: '*', schema: 'public', table: 'gym_crm_leads' }, () => {
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
    const [childSearch, _setChildSearch] = useState('');
    const [foundChild, setFoundChild] = useState<any>(null);
    const [_isScheduling, setIsScheduling] = useState(false);
    const [appointmentDate, setAppointmentDate] = useState('');
    const [appointmentTime, setAppointmentTime] = useState('');
    const [appointmentProgram, setAppointmentProgram] = useState('');

    const _handleChildSearch = (e: React.FormEvent) => {
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

    const _handleSaveAppointment = (e: React.FormEvent) => {
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
                        Listado de Prospectos
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
                        <div className="chart-card glass-panel" style={{ gridColumn: 'span 12', minHeight: 'auto' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                                <Activity size={20} color="var(--danger)" />
                                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--danger)' }}>Alertas: Leads sin atención</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {leads.filter(l => calculateDaysInactive(l.updated_at) > 1).length === 0 ? (
                                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>No hay prospectos desatendidos. ¡Buen trabajo!</div>
                                ) : (
                                    leads.filter(l => calculateDaysInactive(l.updated_at) > 1).map(lead => (
                                        <div key={lead.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,59,48,0.05)', border: '1px solid rgba(255,59,48,0.1)', borderRadius: '12px', transition: 'all 0.2s' }}>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '15px' }}>{lead.family_name || 'Sin Apellido'}</div>
                                                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>{lead.phone || 'Sin teléfono'} • Último contacto hace <strong style={{ color: 'var(--danger)' }}>{calculateDaysInactive(lead.updated_at)} días</strong></div>
                                            </div>
                                            <button onClick={() => handleOpenActivityModal(lead)} className="btn-primary" style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', background: 'var(--danger)', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Atender ahora</button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </>
            ) : (
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
                            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.03)', borderRadius: '12px', padding: '4px' }}>
                                <button onClick={() => setViewMode('list')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: viewMode === 'list' ? 'white' : 'transparent', color: viewMode === 'list' ? 'var(--text-primary)' : 'var(--text-secondary)', boxShadow: viewMode === 'list' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                                    <List size={16} /> Lista
                                </button>
                                <button onClick={() => setViewMode('kanban')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: viewMode === 'kanban' ? 'white' : 'transparent', color: viewMode === 'kanban' ? 'var(--text-primary)' : 'var(--text-secondary)', boxShadow: viewMode === 'kanban' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                                    <LayoutGrid size={16} /> Kanban
                                </button>
                            </div>
                            <button className="glass-panel" style={{ padding: '0 20px', border: '1px solid var(--surface-border)', borderRadius: '12px', background: 'transparent', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
                                <Filter size={18} />
                                Filtros
                            </button>
                        </div>

                        {viewMode === 'list' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '520px' }}>
                                <div style={{ overflowX: 'auto', flex: 1 }}>
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
                                                paginatedLeads.map((lead) => {
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
                        ) : (
                            <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '24px', minHeight: '520px' }}>
                                {KANBAN_STATUSES.map(status => {
                                    const statusLeads = paginatedLeads.filter(l => l.status === status);
                                    let columnColor = 'var(--text-secondary)';
                                    let columnBg = 'rgba(0,0,0,0.02)';

                                    if (status === 'Nuevo') { columnColor = 'var(--accent-color)'; columnBg = 'rgba(0, 113, 227, 0.03)'; }
                                    if (status === 'Clase Demo Programada') { columnColor = 'var(--success)'; columnBg = 'rgba(52, 199, 89, 0.03)'; }
                                    if (status === 'En Seguimiento' || status === 'Contactado') { columnColor = 'var(--brand-orange)'; columnBg = 'rgba(232, 93, 4, 0.03)'; }

                                    return (
                                        <div key={status} style={{ minWidth: '320px', background: columnBg, borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <div
                                                onDragOver={handleDragOver}
                                                onDrop={(e) => handleDrop(e, status)}
                                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}
                                            >
                                                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: columnColor }}>{status}</h4>
                                                <span style={{ padding: '2px 10px', background: 'white', borderRadius: '12px', fontSize: '12px', fontWeight: 700, color: columnColor, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>{statusLeads.length}</span>
                                            </div>

                                            {statusLeads.map(lead => {
                                                const diasInactivo = calculateDaysInactive(lead.updated_at);
                                                return (
                                                    <div
                                                        key={lead.id}
                                                        draggable
                                                        onDragStart={(e) => handleDragStart(e, lead.id)}
                                                        style={{ background: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', cursor: 'grab', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid rgba(0,0,0,0.05)', transition: 'all 0.2s ease', position: 'relative' }}
                                                        className="kanban-card"
                                                    >
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                            <div>
                                                                <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px' }}>{lead.family_name || 'Sin Apellido'}</div>
                                                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Niño: <strong style={{ color: 'var(--text-primary)' }}>{lead.child_name || '---'} ({lead.child_age || '---'})</strong></div>
                                                            </div>
                                                            {diasInactivo > 0 && (
                                                                <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 8px', borderRadius: '8px', background: diasInactivo > 3 ? 'rgba(255, 59, 48, 0.1)' : 'rgba(255, 149, 0, 0.1)', color: diasInactivo > 3 ? 'var(--danger)' : 'var(--warning)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                    <Clock size={12} /> {diasInactivo}d
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} /> {lead.phone || lead.telegram_username || '---'}</div>
                                                        <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '12px', display: 'flex', gap: '8px' }}>
                                                            <button onClick={() => setViewProfileLead(lead)} style={{ background: 'rgba(142, 142, 147, 0.06)', color: 'var(--text-secondary)', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', flex: 1, display: 'flex', justifyContent: 'center', transition: 'background 0.2s' }} title="Ver Perfil"><User size={16} /></button>
                                                            <button onClick={() => handleOpenActivityModal(lead)} style={{ background: 'var(--brand-orange)', color: 'white', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', flex: 1, display: 'flex', justifyContent: 'center', fontWeight: 700, transition: 'background 0.2s' }} title="Gestionar"><FileText size={16} /></button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {statusLeads.length === 0 && (
                                                <div
                                                    onDragOver={handleDragOver}
                                                    onDrop={(e) => handleDrop(e, status)}
                                                    style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)', fontSize: '13px', fontStyle: 'italic', opacity: 0.6, flex: 1, minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed rgba(0,0,0,0.03)', borderRadius: '12px' }}
                                                >
                                                    Suelta aquí
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', padding: '16px', borderTop: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.5)', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', background: currentPage === 1 ? 'transparent' : 'white', cursor: currentPage === 1 ? 'default' : 'pointer', fontWeight: 600, color: currentPage === 1 ? 'var(--text-secondary)' : 'var(--text-primary)', opacity: currentPage === 1 ? 0.3 : 1 }}
                                >
                                    Anterior
                                </button>
                                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.04)', padding: '6px 12px', borderRadius: '8px' }}>
                                    Página {currentPage} de {totalPages}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', background: currentPage === totalPages ? 'transparent' : 'white', cursor: currentPage === totalPages ? 'default' : 'pointer', fontWeight: 600, color: currentPage === totalPages ? 'var(--text-secondary)' : 'var(--text-primary)', opacity: currentPage === totalPages ? 0.3 : 1 }}
                                >
                                    Siguiente
                                </button>
                            </div>
                        )}
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
