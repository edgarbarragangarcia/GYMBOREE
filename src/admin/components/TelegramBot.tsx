import { useState, useRef, useEffect } from 'react';
import { Send, User, MessageCircle, Search, MoreVertical, Paperclip, Smile, Bot } from 'lucide-react';

interface Message {
    id: string;
    text: string;
    from_bot: boolean;
    created_at: string;
}

interface MockChat {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    lastMessage: string;
    time: string;
    messages: Message[];
}

const GEMINI_API_KEY = "AIzaSyAIALRCFQMFmOi-r9SmDRu7EXYXP8H6wuE";

const GYMBOREE_SYSTEM_PROMPT = `Eres el asistente virtual de atención al cliente de GYMBOREE, un jardín infantil para niños de 0 a 5 años en Colombia. 
Respondes preguntas sobre:
- Programas: Play & Learn (2-5 años), Gym Music (3-5 años), Bebés Activos (0-2 años)
- Horarios: Lunes a Viernes 7am-6pm, Sábados 8am-1pm
- Sedes: Santa Bárbara (Bogotá), Salitre (Bogotá), Medellín
- Precios: Membresía mensual desde $350.000 COP según programa
- Actividades: música, movimiento, arte, lenguaje y exploración sensorial
- Inscripciones: pueden hacerse en la web o en sede
Eres amable, conciso y usas emojis ocasionalmente. Responde siempre en español.`;

const MOCK_CHATS: MockChat[] = [
    {
        id: 1,
        first_name: 'Carlos',
        last_name: 'Martínez',
        username: 'carlosmtz',
        lastMessage: '¿Tienen cupo para bebés de 8 meses?',
        time: '03:22 p.m.',
        messages: [
            { id: '1', text: '¡Hola! Quisiera saber sobre los programas para mi bebé', from_bot: false, created_at: '2026-03-04T15:20:00Z' },
            { id: '2', text: '¡Hola Carlos! 👶 En GYMBOREE tenemos el programa Bebés Activos especialmente diseñado para niños de 0 a 2 años. ¿Cuántos meses tiene tu bebé?', from_bot: true, created_at: '2026-03-04T15:20:30Z' },
            { id: '3', text: '¿Tienen cupo para bebés de 8 meses?', from_bot: false, created_at: '2026-03-04T15:22:00Z' },
        ]
    },
    {
        id: 2,
        first_name: 'Valentina',
        last_name: 'Ríos',
        username: 'vale_rios',
        lastMessage: '¿Cuánto cuesta la matrícula?',
        time: '02:45 p.m.',
        messages: [
            { id: '4', text: '¿Cuánto cuesta la matrícula?', from_bot: false, created_at: '2026-03-04T14:44:00Z' },
            { id: '5', text: '¡Hola Valentina! 😊 La matrícula tiene un costo único de $180.000 COP e incluye materiales del semestre. La mensualidad varía según el programa, desde $350.000. ¿Te gustaría más información sobre algún programa en particular?', from_bot: true, created_at: '2026-03-04T14:44:45Z' },
        ]
    },
    {
        id: 3,
        first_name: 'Andrés',
        last_name: 'López',
        username: 'andreslopez',
        lastMessage: 'Muchas gracias!',
        time: '01:10 p.m.',
        messages: [
            { id: '6', text: '¿En qué sedes tienen el programa Play & Learn?', from_bot: false, created_at: '2026-03-04T13:08:00Z' },
            { id: '7', text: '🏫 El programa Play & Learn está disponible en nuestras 3 sedes: Santa Bárbara, Salitre (Bogotá) y Medellín. Todas con horarios de lunes a viernes 7am-6pm.', from_bot: true, created_at: '2026-03-04T13:08:30Z' },
            { id: '8', text: 'Muchas gracias!', from_bot: false, created_at: '2026-03-04T13:10:00Z' },
        ]
    }
];

async function askGemini(userMessage: string, history: Message[]): Promise<string> {
    const contents = [
        {
            role: 'user',
            parts: [{ text: GYMBOREE_SYSTEM_PROMPT }]
        },
        {
            role: 'model',
            parts: [{ text: 'Entendido. Soy el asistente de GYMBOREE, listo para ayudar.' }]
        },
        ...history.slice(-6).map(m => ({
            role: m.from_bot ? 'model' : 'user',
            parts: [{ text: m.text }]
        })),
        {
            role: 'user',
            parts: [{ text: userMessage }]
        }
    ];

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents })
        }
    );

    if (!response.ok) throw new Error('Error de Gemini API');
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No pude generar una respuesta.';
}

export default function TelegramBot() {
    const [chats, setChats] = useState<MockChat[]>(MOCK_CHATS);
    const [selectedChat, setSelectedChat] = useState<MockChat | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const messages = selectedChat
        ? chats.find(c => c.id === selectedChat.id)?.messages || []
        : [];

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChat || isTyping) return;

        const textToSend = newMessage;
        setNewMessage('');

        const userMsg: Message = {
            id: Date.now().toString(),
            text: textToSend,
            from_bot: true,
            created_at: new Date().toISOString()
        };

        // Añadir el mensaje del admin al chat
        setChats(prev => prev.map(c =>
            c.id === selectedChat.id
                ? { ...c, messages: [...c.messages, userMsg], lastMessage: textToSend }
                : c
        ));

        setIsTyping(true);

        try {
            // Simular respuesta del usuario con Gemini
            const currentMessages = chats.find(c => c.id === selectedChat.id)?.messages || [];
            const aiResponse = await askGemini(
                `[Admin responde]: ${textToSend}. Simula cómo respondería el cliente de forma realista y breve.`,
                currentMessages
            );

            const clientMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: aiResponse,
                from_bot: false,
                created_at: new Date().toISOString()
            };

            setChats(prev => prev.map(c =>
                c.id === selectedChat.id
                    ? { ...c, messages: [...c.messages, userMsg, clientMsg], lastMessage: aiResponse.substring(0, 40) + '...' }
                    : c
            ));
        } catch (err) {
            console.error('Error Gemini:', err);
        } finally {
            setIsTyping(false);
        }
    };

    const handleClientMessage = async (chatId: number) => {
        // Simula que el cliente escribe y Gemini responde automáticamente
        const chat = chats.find(c => c.id === chatId);
        if (!chat || isTyping) return;

        const questions = [
            '¿Cuáles son los horarios?',
            '¿Tienen servicio de transporte?',
            '¿Puedo visitar la sede antes de inscribir a mi hijo?',
            '¿Qué actividades incluye el programa?',
        ];
        const randomQ = questions[Math.floor(Math.random() * questions.length)];

        const userMsg: Message = {
            id: Date.now().toString(),
            text: randomQ,
            from_bot: false,
            created_at: new Date().toISOString()
        };

        setChats(prev => prev.map(c =>
            c.id === chatId ? { ...c, messages: [...c.messages, userMsg] } : c
        ));

        setIsTyping(true);
        try {
            const botResponse = await askGemini(randomQ, chat.messages);
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: botResponse,
                from_bot: true,
                created_at: new Date().toISOString()
            };
            setChats(prev => prev.map(c =>
                c.id === chatId
                    ? { ...c, messages: [...c.messages, userMsg, botMsg], lastMessage: botResponse.substring(0, 40) + '...' }
                    : c
            ));
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
                    {chats.map(chat => (
                        <div
                            key={chat.id}
                            onClick={() => setSelectedChat(chat)}
                            style={{
                                padding: '14px 18px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
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
                                        <span style={{ fontWeight: 600, fontSize: '14px' }}>{chat.first_name} {chat.last_name}</span>
                                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{chat.time}</span>
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {chat.lastMessage}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Badge de Demo */}
                <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bot size={14} color="var(--brand-orange)" />
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Gemini AI · Modo Demo</span>
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
                                    <div style={{ fontWeight: 600, fontSize: '15px' }}>{selectedChat.first_name} {selectedChat.last_name}</div>
                                    <div style={{ fontSize: '12px', color: '#4CAF50' }}>@{selectedChat.username} · En línea</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <button
                                    onClick={() => handleClientMessage(selectedChat.id)}
                                    disabled={isTyping}
                                    style={{ background: 'rgba(0,136,204,0.15)', border: '1px solid rgba(0,136,204,0.3)', borderRadius: '8px', padding: '6px 12px', color: '#0088cc', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                                >
                                    Simular mensaje
                                </button>
                                <MoreVertical size={20} color="var(--text-secondary)" style={{ cursor: 'pointer' }} />
                            </div>
                        </div>

                        {/* Mensajes */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(0,0,0,0.08)' }}>
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
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '28px', height: '28px', borderRadius: '14px', background: 'linear-gradient(135deg, #0088cc, #0055aa)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <User size={14} color="white" />
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.08)', padding: '10px 16px', borderRadius: '4px 16px 16px 16px', display: 'flex', gap: '5px', alignItems: 'center' }}>
                                        {[0, 1, 2].map(i => (
                                            <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ccc', animation: `bounce 1s ${i * 0.2}s infinite` }} />
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
                                    style={{ width: '44px', height: '44px', borderRadius: '22px', background: newMessage.trim() ? 'var(--brand-orange)' : 'rgba(255,255,255,0.1)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
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
                        <p style={{ maxWidth: '300px', lineHeight: 1.6 }}>Selecciona un chat activo para ver la conversación y responder directamente.</p>
                        <div style={{ marginTop: '20px', padding: '10px 18px', background: 'rgba(0,136,204,0.1)', borderRadius: '12px', fontSize: '12px', border: '1px solid rgba(0,136,204,0.2)' }}>
                            <Bot size={13} style={{ display: 'inline', marginRight: '6px' }} color="#0088cc" />
                            Potenciado por Gemini AI
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes bounce {
                    0%, 60%, 100% { transform: translateY(0); }
                    30% { transform: translateY(-6px); }
                }
            `}</style>
        </div>
    );
}
