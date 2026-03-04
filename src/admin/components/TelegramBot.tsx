import { useState, useRef, useEffect } from 'react';
import { Send, User, MessageCircle, Search, MoreVertical, Paperclip, Smile, Bot } from 'lucide-react';
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

const GEMINI_API_KEY = "AIzaSyAIALRCFQMFmOi-r9SmDRu7EXYXP8H6wuE";
const BOT_TOKEN = "8646314018:AAGO8K68wwC77YES_AAFy9Id0oNG4mJdImg";

const GYMBOREE_SYSTEM_PROMPT = `Eres el asistente administrador de GYMBOREE respondiendo a clientes en Telegram. 
Sé amable, conciso y profesional. Responde en español.`;

async function askGemini(userMessage: string, history: Message[]): Promise<string> {
    const contents = [
        { role: 'user', parts: [{ text: GYMBOREE_SYSTEM_PROMPT }] },
        { role: 'model', parts: [{ text: 'Entendido.' }] },
        ...history.slice(-6).map(m => ({
            role: m.from_bot ? 'model' : 'user',
            parts: [{ text: m.text }]
        })),
        { role: 'user', parts: [{ text: userMessage }] }
    ];
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents }) }
    );
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No pude generar respuesta.';
}

export default function TelegramBot() {
    const [chats, setChats] = useState<Chat[]>([]);
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [loading, setLoading] = useState(true);
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
        <div style={{ height: 'calc(100vh - 48px)', display: 'flex', overflow: 'hidden', padding: '24px' }}>
            {/* Sidebar de Chats */}
            <div className="glass-panel" style={{ width: '300px', display: 'flex', flexDirection: 'column', marginRight: '24px', borderRadius: '20px', overflow: 'hidden', flexShrink: 0 }}>
                <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="#0088cc">
                            <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.891 7.007l-2.016 9.531c-.15.672-.547.838-1.11.517l-3.045-2.246-1.47 1.413c-.162.162-.298.3-.61.3l.219-3.111 5.662-5.115c.246-.219-.054-.341-.381-.124l-7.001 4.409-3.012-.942c-.655-.205-.668-.655.137-.97l11.776-4.541c.545-.204 1.021.121.85.858z" />
                        </svg>
                        <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Telegram Bot</h2>
                        <span style={{ marginLeft: 'auto', background: 'var(--brand-orange)', color: 'white', borderRadius: '12px', padding: '2px 8px', fontSize: '12px', fontWeight: 700 }}>
                            {chats.length}
                        </span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Search size={14} color="var(--text-secondary)" />
                        <input type="text" placeholder="Buscar chats..." style={{ background: 'none', border: 'none', color: 'white', fontSize: '13px', width: '100%', outline: 'none' }} />
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
                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                    background: selectedChat?.id === chat.id ? 'rgba(255,255,255,0.08)' : 'transparent'
                                }}
                                onMouseEnter={e => { if (selectedChat?.id !== chat.id) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                                onMouseLeave={e => { if (selectedChat?.id !== chat.id) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '42px', height: '42px', borderRadius: '21px', background: 'linear-gradient(135deg, #0088cc, #0055aa)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <User size={18} color="white" />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                                            <span style={{ fontWeight: 600, fontSize: '14px' }}>
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

                <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bot size={14} color="var(--brand-orange)" />
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Gemini AI · HUNTER DB</span>
                </div>
            </div>

            {/* Ventana de Chat */}
            <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: '20px', overflow: 'hidden' }}>
                {selectedChat ? (
                    <>
                        {/* Header */}
                        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '20px', background: 'linear-gradient(135deg, #0088cc, #0055aa)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <User size={18} color="white" />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '15px' }}>{selectedChat.first_name} {selectedChat.last_name || ''}</div>
                                    <div style={{ fontSize: '12px', color: '#4CAF50' }}>@{selectedChat.username || 'sin_usuario'} · En línea</div>
                                </div>
                            </div>
                            <MoreVertical size={20} color="var(--text-secondary)" style={{ cursor: 'pointer' }} />
                        </div>

                        {/* Mensajes */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(0,0,0,0.08)' }}>
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
                                        maxWidth: '65%',
                                        padding: '10px 14px',
                                        borderRadius: msg.from_bot ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                                        fontSize: '14px',
                                        lineHeight: '1.5',
                                        background: msg.from_bot ? 'var(--brand-orange)' : 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                    }}>
                                        {msg.text}
                                        <div style={{ fontSize: '10px', marginTop: '4px', opacity: 0.65, textAlign: 'right' }}>
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
                        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
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
                                    style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '11px 16px', color: 'white', fontSize: '14px', outline: 'none' }}
                                    disabled={isTyping}
                                />
                                <button
                                    type="submit"
                                    disabled={isTyping || !newMessage.trim()}
                                    style={{ width: '44px', height: '44px', borderRadius: '22px', background: newMessage.trim() ? 'var(--brand-orange)' : 'rgba(255,255,255,0.1)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: newMessage.trim() ? 'pointer' : 'default', transition: 'all 0.2s' }}
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', padding: '40px', textAlign: 'center' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '40px', background: 'rgba(0,136,204,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                            <MessageCircle size={40} color="#0088cc" />
                        </div>
                        <h2 style={{ color: 'white', marginBottom: '8px', fontSize: '20px' }}>Bot de Telegram · GYMBOREE</h2>
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

            <style>{`
                @keyframes bounce {
                    0%, 60%, 100% { transform: translateY(0); }
                    30% { transform: translateY(-5px); }
                }
            `}</style>
        </div>
    );
}
