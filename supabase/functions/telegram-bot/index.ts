// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const BOT_TOKEN = "8646314018:AAGO8K68wwC77YES_AAFy9Id0oNG4mJdImg";

// Rotacion de API Keys de Gemini
const GEMINI_API_KEYS = [
    "AIzaSyBemLnOiGuljYvL6nbW2FF2gqx3S9q3e7I",
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
- BASA TUS RESPUESTAS EXCLUSIVAMENTE en la informacion de este prompt.
- Si no sabes algo, indica que la sede respectiva brindará los detalles.
- Sugiere siempre la clase de demostracion GRATUITA (Clase Demo).
- Maximo 3 parrafos cortos. Se breve.

=== INFORMACION DE GYMBOREE ===
Sedes Bogota: Cedritos, Chico, Colina, Salitre, Santa Barbara.
Sedes Medellin: Poblado, Laureles.
Sedes Otras: Bucaramanga, Ibague, Cajica.
Edades y Enfoque: Estimulación y desarrollo infantil a través del juego dirigido. Atendemos a niños desde recién nacidos (0 meses) hasta los 5 años. Las clases son acompañadas por un adulto para fortalecer el vínculo y guiados por expertos.
Clases: 
👉 Play & Learn: Desarrollo cognitivo y motriz fino y grueso.
👉 Music: Ritmo, canciones e instrumentos.
👉 Art: Fomenta la imaginación y la expresión.
👉 School Skills: Preparación preescolar, independencia, lectoescritura sin acompañante.
👉 STEAM y Baby Lab: Experimentación y ciencia adaptada.
Horarios: Funcionamos de Lunes a Sabado, e incluso domingos (varía por sede). Nuestros horarios incluyen múltiples franjas en la mañana y en la tarde. El horario exacto depende de la edad o etapa de desarrollo del niño, ¡así lo agrupamos con bebés de su misma etapa!
Precios: Varían según la sede y se manejan paquetes de 1 vez a la semana, 2 o más. Tenemos mensualidad o distintos planes. Lo mejor es asistir a una Clase Demo para obtener una cotización a la medida.
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
    const nombre = userName ? `, ${userName}` : '';

    if (isFirstMessage) {
        if (msg.includes("precio") || msg.includes("costo") || msg.includes("cuanto") || msg.includes("valor")) {
            return `¡Hola! ${getSaludoHorario()}.\n\n💰 Los precios en Gymboree varían según la sede y el programa. Manejamos paquetes de 1, 2 o más veces por semana.\n\n¡Te invitamos a una Clase Demo GRATUITA para conocernos y recibir una cotización personalizada! 🎉\n\n📍 Ubica tu sede: https://gymboreeclases.co/\n\nPor cierto, ¿cómo te llamas para poder atenderte mejor?`;
        }
        if (msg.includes("horario") || msg.includes("hora") || msg.includes("cuando") || msg.includes("día") || msg.includes("dia")) {
            return `¡Hola! ${getSaludoHorario()}. Soy el asistente virtual de Gymboree 👶.\n\n🕐 Funcionamos de Lunes a Sábado (algunas sedes también domingos). Tenemos franjas en la mañana y en la tarde. El horario exacto depende de la edad de tu bebé, ¡así agrupamos niños de la misma etapa!\n\nPara darte los horarios específicos, ¿me dices la edad de tu bebé y en qué sede estás interesada? Y cuéntame, ¿cuál es tu nombre?`;
        }
        if (msg.includes("clase") || msg.includes("programa") || msg.includes("actividad")) {
            return `¡Hola! ${getSaludoHorario()}. Soy el asistente de Gymboree Play & Music 👶.\n\nOfrecemos estos programas:\n👉 Play & Learn: Desarrollo cognitivo y motriz\n👉 Music: Ritmo y canciones\n👉 Art: Imaginación y expresión\n👉 School Skills: Preparación preescolar\n👉 STEAM y Baby Lab\n\nTodas nuestras clases son de 45 minutos. ¡Te invitamos a una Clase Demo GRATUITA! 🎉\n\n¿Cómo te llamas para poder atenderte mejor?`;
        }
        if (msg.includes("edad") || msg.includes("meses") || msg.includes("años") || msg.includes("bebe") || msg.includes("bebé") || msg.includes("recien nacido") || msg.includes("recién nacido")) {
            return `¡Hola! ${getSaludoHorario()}. Soy el asistente de Gymboree 👶.\n\n🎒 Atendemos niños desde recién nacidos (0 meses) hasta los 5 años. Hasta los 3 años las clases requieren acompañamiento de un adulto (papá, mamá o cuidador).\n\n¿Cuántos meses o años tiene tu bebé? Así te puedo orientar mejor sobre qué programa le conviene. Y cuéntame, ¿cuál es tu nombre?`;
        }
        return `¡Hola! ${getSaludoHorario()}. Soy el asistente virtual de Gymboree Play & Music Colombia 👶.\n\n¿En qué te puedo ayudar hoy? Y cuéntame, ¿cuál es tu nombre?`;
    }

    // --- Mensajes posteriores (no primer mensaje) ---
    if (msg.includes("precio") || msg.includes("costo") || msg.includes("cuanto") || msg.includes("valor") || msg.includes("mensualidad") || msg.includes("pagar")) {
        return `💰 Los precios en Gymboree varían según la sede y el programa${nombre}. Manejamos paquetes de 1, 2 o más clases por semana.\n\n¡Lo mejor es asistir a una Clase Demo GRATUITA para recibir una cotización a tu medida! 🎉\n\n📍 https://gymboreeclases.co/`;
    }
    if (msg.includes("horario") || msg.includes("hora") || msg.includes("cuando") || msg.includes("que dia") || msg.includes("qué día") || msg.includes("lunes") || msg.includes("martes") || msg.includes("sabado") || msg.includes("sábado") || msg.includes("domingo") || msg.includes("mañana") || msg.includes("tarde")) {
        return `🕐 Funcionamos de Lunes a Sábado${nombre}, e incluso domingos en algunas sedes. Tenemos múltiples franjas en la mañana y en la tarde.\n\nEl horario exacto depende de la edad de tu bebé, ya que agrupamos a los niños por etapa de desarrollo. ¿Me dices la edad de tu hijo/a y la sede de tu interés para darte los horarios específicos? 😊`;
    }
    if (msg.includes("clase") || msg.includes("programa") || msg.includes("actividad") || msg.includes("que ofrecen") || msg.includes("qué ofrecen")) {
        return `🎓 En Gymboree ofrecemos${nombre}:\n\n👉 Play & Learn: Desarrollo cognitivo y motriz\n👉 Music: Ritmo, canciones e instrumentos\n👉 Art: Imaginación y expresión creativa\n👉 School Skills: Preparación preescolar\n👉 STEAM y Baby Lab: Ciencia adaptada\n\nLas clases duran 45 minutos. ¡Te invitamos a una Clase Demo GRATUITA! 🎉`;
    }
    if (msg.includes("edad") || msg.includes("meses") || msg.includes("años") || msg.includes("bebe") || msg.includes("bebé") || msg.includes("recien nacido") || msg.includes("recién nacido") || msg.includes("pequeño") || msg.includes("hijo") || msg.includes("hija")) {
        return `🎒 Atendemos niños desde recién nacidos (0 meses) hasta los 5 años${nombre}. Hasta los 3 años las clases son con acompañamiento de un adulto para fortalecer el vínculo.\n\nCuéntame, ¿cuántos meses o años tiene tu bebé? Así te oriento al programa ideal. 😊`;
    }
    if (msg.includes("sede") || msg.includes("donde") || msg.includes("ubicados") || msg.includes("dirección") || msg.includes("direccion") || msg.includes("ciudad")) {
        return `📍 Tenemos sedes en:\n🏢 Bogotá: Cedritos, Chico, Colina, Salitre, Santa Bárbara\n🏢 Medellín: Poblado, Laureles\n🏢 También: Bucaramanga, Ibagué, Cajicá\n\n¿En qué ciudad te encuentras${nombre}?`;
    }
    if (msg.includes("demo") || msg.includes("prueba") || msg.includes("conocer") || msg.includes("visitar")) {
        return `🎉 ¡Claro${nombre}! La Clase Demo es totalmente GRATUITA. Es la mejor forma de conocer nuestras instalaciones y vivir la experiencia Gymboree con tu bebé.\n\nPor favor dime tu sede de interés y la edad de tu hijo/a para orientarte. 😊`;
    }
    if (msg.includes("gracias") || msg.includes("thank") || msg.includes("ok ")) {
        return `¡Con mucho gusto${nombre}! 😊 Estoy aquí para lo que necesites. Si quieres agendar una Clase Demo gratuita, ¡solo dime! 🎉`;
    }
    return `Con gusto te ayudo${nombre}. 😊 Puedo darte información sobre:\n\n🕐 Horarios\n🎓 Clases y programas\n🎒 Edades\n💰 Precios\n📍 Sedes\n🎉 Clase Demo gratuita\n\n¿Sobre qué tema te gustaría saber?`;
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
            console.log(`[GEMINI] Trying key ending in ...${apiKey.slice(-6)}`);
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
            console.log(`[GEMINI] Response status: ${res.status}`);
            if (!res.ok) {
                const errText = await res.text();
                console.error(`[GEMINI] API error ${res.status}: ${errText}`);
                continue;
            }
            const json = await res.json();
            const text = json.candidates?.[0]?.content?.parts?.[0]?.text || null;
            console.log(`[GEMINI] Got response: ${text ? text.substring(0, 80) + '...' : 'NULL'}`);
            return text;
        } catch (e) { console.error("[GEMINI] Exception:", e); }
    }
    console.error("[GEMINI] ALL keys failed, using smartFallback");
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
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
    }
});
