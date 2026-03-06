import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const BOT_TOKEN = "8646314018:AAGO8K68wwC77YES_AAFy9Id0oNG4mJdImg";

// Rotacion de API Keys de Gemini
const GEMINI_API_KEYS = [
    "AIzaSyDmdIWANgS8IVvXbwQwGrmC3U1ztCxQCSI",
    "AIzaSyB6FWa7XRb5DX0B9DWfliSVBmdsl0CPDb0",
    "AIzaSyBJFR63ea8Q43mGHXM34fMOIeL_CK2BtJM"
];

const hunter = createClient(
    "https://epudfdzrxyannpfbydkp.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwdWRmZHpyeHlhbm5wZmJ5ZGtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNDY3NTksImV4cCI6MjA3MTcyMjc1OX0.cAc9vz-DEaWJgsq6fOHeBUvRdh-Gll_pn5EBKQhk5fA"
);

const GYMBOREE_PROMPT = `Eres el asistente virtual oficial de GYMBOREE Play & Music Colombia. 

=== REGLA DE ORO DE SALUDO Y TRATO ===
- Usa una ortografia IMPECABLE en espanol. Tildes y signos correctos (¡ ! ¿ ?).
- Tienes que saludar al usuario SOLO UNA VEZ al inicio de la conversacion.
- Al principio de la conversacion, si no sabes el nombre del usuario, preguntale su nombre.
- Cuando sepas su nombre, dirigete a él/ella por su nombre de forma natural. 
- NO VUELVAS A SALUDAR en cada mensaje despues del primer contacto. Ve directo a la respuesta o pregunta.

=== REGLAS DE RESPUESTA ===
- Responde siempre de forma amable, clara y breve. 
- Usa emojis para ser cercano. 
- NUNCA inventes informacion.
- Si preguntan precios exactos: indica que varian por sede e invita a contactar la sucursal deseada.
- Sugiere siempre la clase de demostracion GRATUITA.
- Maximo 3 parrafos cortos. Se breve.

=== INFORMACION DE GYMBOREE ===
Sedes Bogota: Cedritos, Chico, Colina, Salitre, Santa Barbara.
Sedes Medellin: Poblado, Laureles.
Sedes Otras: Bucaramanga, Ibague, Cajica.
Clases: Play & Learn, Music, Art, School Skills, Play Lab (STEAM), Baby Lab.
Web: https://gymboreeclases.co/`;

function getSaludoHorario(): string {
    const date = new Date();
    const hour = (date.getUTCHours() - 5 + 24) % 24;
    if (hour >= 6 && hour < 12) return "Buenos días";
    if (hour >= 12 && hour < 19) return "Buenas tardes";
    return "Buenas noches";
}

const SCHEDULING_KEYWORDS = [
    "agendar", "agenda", "cita", "programar", "reservar", "reserva",
    "quiero agendar", "me gustaria agendar", "puedo agendar",
    "quiero una cita", "clase demo", "clase de prueba",
    "visitar", "conocer la sede", "ir a conocer",
    "apartar", "separar cupo", "inscribir"
];

function hasSchedulingIntent(text: string): boolean {
    const lower = text.toLowerCase();
    return SCHEDULING_KEYWORDS.some(keyword => lower.includes(keyword));
}

function smartFallback(text: string, isFirstMessage: boolean, userName: string | null): string {
    const msg = text.toLowerCase();

    if (isFirstMessage) {
        if (msg.includes("precio") || msg.includes("costo") || msg.includes("cuanto") || msg.includes("valor")) {
            return `¡Hola! ${getSaludoHorario()}.\n\n💰 Los precios en Gymboree varían según la sede y el programa. Te invitamos a contactar la sucursal de tu interés para una cotización personalizada.\n\n📍 Ubica tu sede: https://gymboreeclases.co/ubica-tu-sede/\n\nPor cierto, ¿cómo te llamas para poder atenderte mejor?`;
        }
        return `¡Hola! ${getSaludoHorario()}. Soy el asistente virtual de Gymboree Play & Music Colombia 👶.\n\n¿En qué te puedo ayudar hoy? Y cuéntame, ¿cuál es tu nombre?`;
    }

    if (msg.includes("precio") || msg.includes("costo") || msg.includes("cuanto") || msg.includes("valor")) {
        return `💰 Los precios en Gymboree varían según la sede y el programa. Te invitamos a contactar la sucursal de tu interés para una cotización personalizada.\n\n📍 Ubica tu sede: https://gymboreeclases.co/ubica-tu-sede/`;
    }
    if (msg.includes("sede") || msg.includes("donde") || msg.includes("ubicados")) {
        return `📍 Tenemos sedes en Bogotá, Medellín, Bucaramanga, Ibagué y Cajicá. ¿En qué ciudad te encuentras ${userName ? userName : ''}?`;
    }
    return `Con gusto te ayudaré. Para darte información exacta, dime de qué sede te gustaría saber más. 😊`;
}

async function sendTypingAction(chatId: number) {
    try {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendChatAction`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, action: "typing" })
        });
    } catch (e) { console.error("Typing error:", e); }
}

async function askGemini(contents: any[], isFirstMessage: boolean, saludo: string): Promise<string | null> {
    let customPrompt = GYMBOREE_PROMPT;
    if (isFirstMessage) {
        customPrompt += `\n\n[INSTRUCCION ESTRICTA]: Esta es la PRIMERA vez que hablas con este usuario. El momento del dia es: ${saludo}. Debes presentarte, saludar formalmente y LUEGO preguntarle su nombre para dirigirte a él o ella de ahora en adelante.`;
    } else {
        customPrompt += `\n\n[INSTRUCCION ESTRICTA]: Esta NO es la primera interaccion (tienes el historial). NO saludes al usuario de nuevo (prohibido decir "Hola", "Buenos dias", "Buenas tardes", etc.). Debes responder a su pregunta actual empleando su nombre si lo deduces de la conversacion. Ve directo a la respuesta.`;
    }

    for (const apiKey of GEMINI_API_KEYS) {
        try {
            const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        system_instruction: { parts: [{ text: customPrompt }] },
                        contents: contents,
                        generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
                    })
                }
            );
            if (!res.ok) continue;
            const json = await res.json();
            return json.candidates?.[0]?.content?.parts?.[0]?.text || null;
        } catch (e) { console.error("Gemini error:", e); }
    }
    return null;
}

Deno.serve(async (req) => {
    try {
        const update = await req.json();
        if (update.message) {
            const chatId = update.message.chat.id;
            const text = update.message.text || "";
            const from = update.message.from;
            const saludo = getSaludoHorario();

            await hunter.from("gym_tg_chats").upsert({
                id: chatId,
                username: from.username || null,
                first_name: from.first_name || null,
                last_name: from.last_name || null,
                updated_at: new Date().toISOString()
            });

            await hunter.from("gym_tg_messages").insert({ chat_id: chatId, text: text, from_bot: false });

            const { data: chatData } = await hunter.from("gym_tg_chats").select("ai_paused").eq("id", chatId).single();
            if (chatData?.ai_paused) return new Response(JSON.stringify({ ok: true }));

            if (hasSchedulingIntent(text)) {
                await hunter.from("gym_tg_chats").update({ ai_paused: true, updated_at: new Date().toISOString() }).eq("id", chatId);
                return new Response(JSON.stringify({ ok: true }));
            }

            await sendTypingAction(chatId);

            // HISTORY
            const { data: historyData } = await hunter.from("gym_tg_messages")
                .select("text, from_bot")
                .eq("chat_id", chatId)
                .order("created_at", { ascending: false })
                .limit(10);

            let isFirstMessage = true;
            const contents = [];

            if (historyData && historyData.length > 0) {
                if (historyData.length > 1) { // includes the current message
                    isFirstMessage = false;
                }
                // Supabase returns newest first. the gemini API needs oldest first.
                const reversedHistory = [...historyData].reverse();
                for (const msg of reversedHistory) {
                    contents.push({
                        role: msg.from_bot ? "model" : "user",
                        parts: [{ text: msg.text }]
                    });
                }
            } else {
                contents.push({ role: "user", parts: [{ text: text }] });
            }

            let responseText: string;
            const geminiResponse = await askGemini(contents, isFirstMessage, saludo);
            responseText = geminiResponse ?? smartFallback(text, isFirstMessage, from.first_name || null);

            const typingDelay = Math.min(Math.max(responseText.length * 20, 1000), 4000);
            await new Promise(r => setTimeout(r, typingDelay));

            await hunter.from("gym_tg_messages").insert({ chat_id: chatId, text: responseText, from_bot: true });
            await hunter.from("gym_tg_chats").update({ updated_at: new Date().toISOString() }).eq("id", chatId);

            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chat_id: chatId, text: responseText })
            });
        }
        return new Response(JSON.stringify({ ok: true }));
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
});
