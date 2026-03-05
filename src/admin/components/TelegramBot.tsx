import { useState, useRef, useEffect } from 'react';
import { Send, User, MessageCircle, Search, MoreVertical, Paperclip, Smile, Bot, Baby, Phone, Mail, Calendar, Activity, ExternalLink, Hash, Edit2, Clock, CheckCircle2, X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Cliente apuntando al proyecto HUNTER (no toca la DB de APEG/Gymboree)
const hunter = createClient(
    'https://epudfdzrxyannpfbydkp.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwdWRmZHpyeHlhbm5wZmJ5ZGtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNDY3NTksImV4cCI6MjA3MTcyMjc1OX0.cAc9vz-DEaWJgsq6fOHeBUvRdh-Gll_pn5EBKQhk5fA'
);

interface Chat {
    id: number;
    username: string | null;
    first_name: string | null;
    last_name: string | null;
    created_at: string;
    updated_at: string;
}

interface Message {
    id: string;
    chat_id: number;
    text: string;
    from_bot: boolean;
    created_at: string;
}

const BOT_TOKEN = "8646314018:AAGO8K68wwC77YES_AAFy9Id0oNG4mJdImg";

export default function TelegramBot() {
    const [chats, setChats] = useState<Chat[]>([]);
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [loading, setLoading] = useState(true);
    const [childSearch, setChildSearch] = useState('');
    const [foundChild, setFoundChild] = useState<any>(null);
    const [isScheduling, setIsScheduling] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [appointmentDate, setAppointmentDate] = useState('');
    const [appointmentTime, setAppointmentTime] = useState('');
    const [appointmentProgram, setAppointmentProgram] = useState('');

    const handleSaveAppointment = (e: React.FormEvent) => {
        e.preventDefault();
        alert(`Cita programada para ${foundChild.name} en ${appointmentProgram} el día ${appointmentDate} a las ${appointmentTime}`);
        setIsScheduling(false);
        setAppointmentDate('');
        setAppointmentTime('');
        setAppointmentProgram('');
    };

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
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const selectedChatRef = useRef<Chat | null>(null);

    useEffect(() => {
        selectedChatRef.current = selectedChat;
    }, [selectedChat]);

    useEffect(() => {
        fetchChats();

        // Suscripción Realtime a HUNTER
        const channel = hunter
            .channel('gymboree_telegram')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tg_messages' }, (payload) => {
                const newMsg = payload.new as Message;
                if (selectedChatRef.current && newMsg.chat_id === selectedChatRef.current.id) {
                    setMessages(prev => {
                        if (prev.find(m => m.id === newMsg.id)) return prev;
                        return [...prev, newMsg];
                    });
                }
                fetchChats();
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tg_chats' }, () => {
                fetchChats();
            })
            .subscribe();

        return () => { hunter.removeChannel(channel); };
    }, []);

    useEffect(() => {
        if (selectedChat) fetchMessages(selectedChat.id);
    }, [selectedChat]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const fetchChats = async () => {
        const { data } = await hunter.from('tg_chats').select('*').order('updated_at', { ascending: false });
        setChats(data || []);
        setLoading(false);
    };

    const fetchMessages = async (chatId: number) => {
        const { data } = await hunter.from('tg_messages').select('*').eq('chat_id', chatId).order('created_at', { ascending: true });
        setMessages(data || []);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChat || isTyping) return;

        const textToSend = newMessage;
        setNewMessage('');
        setIsTyping(true);

        try {
            // 1. Enviar al usuario por Telegram
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: selectedChat.id, text: textToSend })
            });

            // 2. Guardar en HUNTER (from_bot=true significa que lo envió el admin)
            await hunter.from('tg_messages').insert({
                chat_id: selectedChat.id,
                text: textToSend,
                from_bot: true
            });

            // 3. Actualizar updated_at del chat
            await hunter.from('tg_chats').update({ updated_at: new Date().toISOString() }).eq('id', selectedChat.id);

        } catch (err) {
            console.error('Error enviando mensaje:', err);
            alert('Error al enviar mensaje');
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div style={{ height: 'calc(100vh - 48px)', display: 'flex', overflow: 'hidden', padding: '24px', gap: '24px' }}>
            {/* Sidebar de Chats */}
            <div className="glass-panel" style={{ width: '280px', display: 'flex', flexDirection: 'column', borderRadius: '20px', overflow: 'hidden', flexShrink: 0 }}>
                <div style={{ padding: '20px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="#0088cc">
                            <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.891 7.007l-2.016 9.531c-.15.672-.547.838-1.11.517l-3.045-2.246-1.47 1.413c-.162.162-.298.3-.61.3l.219-3.111 5.662-5.115c.246-.219-.054-.341-.381-.124l-7.001 4.409-3.012-.942c-.655-.205-.668-.655.137-.97l11.776-4.541c.545-.204 1.021.121.85.858z" />
                        </svg>
                        <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Telegram Bot</h2>
                        <span style={{ marginLeft: 'auto', background: 'var(--brand-orange)', color: 'white', borderRadius: '12px', padding: '2px 8px', fontSize: '12px', fontWeight: 700 }}>
                            {chats.length}
                        </span>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.03)', borderRadius: '10px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(0,0,0,0.05)' }}>
                        <Search size={14} color="var(--text-secondary)" />
                        <input type="text" placeholder="Buscar chats..." style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '13px', width: '100%', outline: 'none' }} />
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {loading ? (
                        <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>Cargando...</div>
                    ) : chats.length === 0 ? (
                        <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                            <MessageCircle size={32} style={{ marginBottom: '12px', opacity: 0.4 }} />
                            <div>No hay chats aún.</div>
                            <div style={{ fontSize: '12px', marginTop: '8px' }}>Cuando alguien escriba al bot aparecerá aquí.</div>
                        </div>
                    ) : (
                        chats.map(chat => (
                            <div
                                key={chat.id}
                                onClick={() => setSelectedChat(chat)}
                                style={{
                                    padding: '14px 18px',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s',
                                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                                    background: selectedChat?.id === chat.id ? 'var(--brand-orange-light)' : 'transparent'
                                }}
                                onMouseEnter={e => { if (selectedChat?.id !== chat.id) (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.02)'; }}
                                onMouseLeave={e => { if (selectedChat?.id !== chat.id) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '42px', height: '42px', borderRadius: '21px', background: 'linear-gradient(135deg, #0088cc, #0055aa)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,136,204,0.2)' }}>
                                        <User size={18} color="white" />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                                            <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                                                {chat.first_name} {chat.last_name || ''}
                                            </span>
                                            <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                                                {new Date(chat.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                            @{chat.username || 'sin_usuario'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.01)' }}>
                    <Bot size={14} color="var(--brand-orange)" />
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Gemini AI · HUNTER DB</span>
                </div>
            </div>

            {/* Ventana de Chat */}
            <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: '20px', overflow: 'hidden' }}>
                {selectedChat ? (
                    <>
                        {/* Header */}
                        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '20px', background: 'linear-gradient(135deg, #0088cc, #0055aa)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,136,204,0.2)' }}>
                                    <User size={18} color="white" />
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>{selectedChat.first_name} {selectedChat.last_name || ''}</div>
                                    <div style={{ fontSize: '12px', color: '#4CAF50', fontWeight: 500 }}>@{selectedChat.username || 'sin_usuario'} · En línea</div>
                                </div>
                            </div>
                            <MoreVertical size={20} color="var(--text-secondary)" style={{ cursor: 'pointer' }} />
                        </div>

                        {/* Mensajes */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(0,0,0,0.015)' }}>
                            {messages.length === 0 && (
                                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px', marginTop: '40px' }}>
                                    No hay mensajes aún en este chat.
                                </div>
                            )}
                            {messages.map(msg => (
                                <div key={msg.id} style={{ display: 'flex', justifyContent: msg.from_bot ? 'flex-end' : 'flex-start' }}>
                                    {!msg.from_bot && (
                                        <div style={{ width: '28px', height: '28px', borderRadius: '14px', background: 'linear-gradient(135deg, #0088cc, #0055aa)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '8px', flexShrink: 0, alignSelf: 'flex-end' }}>
                                            <User size={14} color="white" />
                                        </div>
                                    )}
                                    <div style={{
                                        maxWidth: '75%',
                                        padding: '10px 14px',
                                        borderRadius: msg.from_bot ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                                        fontSize: '14px',
                                        lineHeight: '1.5',
                                        background: msg.from_bot ? 'var(--brand-orange)' : 'white',
                                        color: msg.from_bot ? 'white' : 'var(--text-primary)',
                                        boxShadow: msg.from_bot ? '0 4px 12px rgba(232, 93, 4, 0.2)' : '0 2px 8px rgba(0,0,0,0.05)',
                                        border: msg.from_bot ? 'none' : '1px solid rgba(0,0,0,0.05)'
                                    }}>
                                        {msg.text}
                                        <div style={{ fontSize: '10px', marginTop: '4px', opacity: 0.7, textAlign: 'right', fontWeight: 500 }}>
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            {msg.from_bot && ' ✓✓'}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {isTyping && (
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <div style={{ background: 'rgba(255,120,0,0.2)', padding: '10px 16px', borderRadius: '16px 4px 16px 16px', display: 'flex', gap: '5px', alignItems: 'center' }}>
                                        {[0, 1, 2].map(i => (
                                            <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--brand-orange)', animation: `bounce 1s ${i * 0.2}s infinite` }} />
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(0,0,0,0.05)', background: 'white' }}>
                            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '12px', color: 'var(--text-secondary)' }}>
                                    <Smile size={20} style={{ cursor: 'pointer' }} />
                                    <Paperclip size={20} style={{ cursor: 'pointer' }} />
                                </div>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    placeholder="Escribe una respuesta al cliente..."
                                    style={{
                                        flex: 1,
                                        background: 'rgba(0,0,0,0.02)',
                                        border: '1px solid rgba(0,0,0,0.06)',
                                        borderRadius: '14px',
                                        padding: '11px 16px',
                                        color: 'var(--text-primary)',
                                        fontSize: '14px',
                                        outline: 'none',
                                        transition: 'all 0.2s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--brand-orange)'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(0,0,0,0.06)'}
                                    disabled={isTyping}
                                />
                                <button
                                    type="submit"
                                    disabled={isTyping || !newMessage.trim()}
                                    style={{ width: '44px', height: '44px', borderRadius: '14px', background: newMessage.trim() ? 'var(--brand-orange)' : 'rgba(0,0,0,0.05)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: newMessage.trim() ? 'pointer' : 'default', transition: 'all 0.3s', boxShadow: newMessage.trim() ? '0 4px 12px rgba(232, 93, 4, 0.2)' : 'none' }}
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', padding: '40px', textAlign: 'center' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '40px', background: 'rgba(0,136,204,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', border: '1px solid rgba(0,136,204,0.1)' }}>
                            <MessageCircle size={40} color="#0088cc" />
                        </div>
                        <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px', fontSize: '20px', fontWeight: 700 }}>Bot de Telegram · GYMBOREE</h2>
                        <p style={{ maxWidth: '320px', lineHeight: 1.6 }}>
                            Selecciona un chat activo para responder. Los mensajes llegan cuando alguien escribe a tu bot en Telegram.
                        </p>
                        <div style={{ marginTop: '20px', padding: '10px 18px', background: 'rgba(0,136,204,0.1)', borderRadius: '12px', fontSize: '12px', border: '1px solid rgba(0,136,204,0.2)' }}>
                            <Bot size={13} style={{ display: 'inline', marginRight: '6px' }} color="#0088cc" />
                            Bot activo · Responde con Gemini AI · Datos en HUNTER
                        </div>
                    </div>
                )}
            </div>

            {/* Sidebar de Información del Niño (Nuevo) */}
            {selectedChat && (
                <div className="glass-panel" style={{ width: '320px', display: 'flex', flexDirection: 'column', borderRadius: '20px', overflow: 'hidden', flexShrink: 0, animation: 'fadeIn 0.3s ease' }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                            <Baby size={20} color="var(--brand-orange)" />
                            <h2 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Información Académica</h2>
                        </div>
                        <form onSubmit={handleChildSearch} style={{ background: 'rgba(0,0,0,0.03)', borderRadius: '10px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(0,0,0,0.05)' }}>
                            <Search size={14} color="var(--text-secondary)" />
                            <input
                                type="text"
                                value={childSearch}
                                onChange={e => setChildSearch(e.target.value)}
                                placeholder="Buscar niño (Ej. Agustin)..."
                                style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '13px', width: '100%', outline: 'none' }}
                            />
                        </form>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                        {foundChild ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {/* Profile Header */}
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 12px', borderRadius: '40px', overflow: 'hidden', border: '3px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                                        <img src={foundChild.photo} alt={foundChild.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px', color: 'var(--text-primary)' }}>{foundChild.name}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>{foundChild.age}</span>
                                        <span style={{ padding: '2px 8px', borderRadius: '10px', background: 'rgba(52, 199, 89, 0.1)', color: 'var(--success)', fontSize: '11px', fontWeight: 700 }}>{foundChild.status}</span>
                                    </div>
                                </div>

                                {/* Academic Summary */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Programas Activos</label>
                                    {foundChild.programs.map((p: any, idx: number) => (
                                        <div key={idx} style={{ padding: '12px', borderRadius: '14px', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.03)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                <span style={{ fontWeight: 700, fontSize: '14px' }}>{p.name} <span style={{ color: 'var(--brand-orange)' }}>{p.level}</span></span>
                                                <Activity size={14} color="var(--text-secondary)" />
                                            </div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                                                <Calendar size={12} /> {p.schedule}
                                            </div>
                                            <div style={{ width: '100%', height: '4px', background: 'rgba(0,0,0,0.05)', borderRadius: '2px' }}>
                                                <div style={{ width: `${p.progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--brand-orange), #ff8a00)', borderRadius: '2px' }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Parent Contact */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Responsable / Acudiente</label>
                                    <div style={{ padding: '12px', borderRadius: '14px', background: 'var(--brand-orange-light)', border: '1px solid rgba(232, 93, 4, 0.1)' }}>
                                        <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '8px', color: 'var(--brand-orange)' }}>{foundChild.parent.name} ({foundChild.parent.relation})</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <a href={`tel:${foundChild.parent.phone}`} style={{ fontSize: '12px', color: 'var(--text-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Phone size={12} /> {foundChild.parent.phone}
                                            </a>
                                            <a href={`mailto:${foundChild.parent.email}`} style={{ fontSize: '12px', color: 'var(--text-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Mail size={12} /> {foundChild.parent.email}
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(0,113,227,0.05)', border: '1px solid rgba(0,113,227,0.1)' }}>
                                        <div style={{ fontSize: '10px', color: 'var(--accent-color)', fontWeight: 700, textTransform: 'uppercase' }}>Asistencia</div>
                                        <div style={{ fontSize: '16px', fontWeight: 800 }}>{foundChild.attendance}</div>
                                    </div>
                                    <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(52,199,89,0.05)', border: '1px solid rgba(52,199,89,0.1)' }}>
                                        <div style={{ fontSize: '10px', color: 'var(--success)', fontWeight: 700, textTransform: 'uppercase' }}>Vigencia</div>
                                        <div style={{ fontSize: '13px', fontWeight: 800 }}>{foundChild.vencimiento}</div>
                                    </div>
                                </div>

                                <button className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: '13px' }}>
                                    Ver Historial Completo
                                    <ExternalLink size={14} style={{ marginLeft: '8px' }} />
                                </button>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-secondary)' }}>
                                <div style={{ width: '100%', padding: '20px', borderRadius: '16px', background: 'rgba(0,0,0,0.02)', border: '1px dashed rgba(0,0,0,0.1)' }}>
                                    <Search size={32} style={{ opacity: 0.3, marginBottom: '12px' }} />
                                    <p style={{ fontSize: '13px', margin: 0 }}>Busca un niño por nombre para ver su ficha técnica.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(0,0,0,0.05)', background: 'rgba(0,0,0,0.01)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                            <Hash size={12} />
                            <span>ID: {foundChild?.id || '---'}</span>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes bounce {
                    0%, 60%, 100% { transform: translateY(0); }
                    30% { transform: translateY(-5px); }
                }
            `}</style>
        </div >
    );
}
