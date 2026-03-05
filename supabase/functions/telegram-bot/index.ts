import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// @ts-ignore: Deno-specific import
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Configuración del Bot
const BOT_TOKEN = "8646314018:AAGO8K68wwC77YES_AAFy9Id0oNG4mJdImg";
// @ts-ignore: Deno-specific
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
// @ts-ignore: Deno-specific
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// @ts-ignore: Deno-specific
Deno.serve(async (req: Request) => {
    try {
        const update = await req.json();
        console.log("Mensaje recibido:", update);

        if (update.message) {
            const chatId = update.message.chat.id;
            const text = update.message.text;
            const from = update.message.from;

            // 1. Guardar o actualizar el chat
            await supabase.from("tg_chats").upsert({
                id: chatId,
                username: from.username,
                first_name: from.first_name,
                last_name: from.last_name,
                updated_at: new Date().toISOString()
            });

            // 2. Guardar el mensaje del usuario
            await supabase.from("tg_messages").insert({
                chat_id: chatId,
                text: text,
                from_bot: false
            });

            let responseText = "¡Hola! Soy el bot de GYMBOREE. ¿En qué puedo ayudarte?";

            if (text === "/start") {
                responseText = "Bienvenido al bot oficial de GYMBOREE. 👋\n\nEste bot está conectado a tu sistema de gestión (CRM).\n\nPuedes usarlo para recibir notificaciones de nuevos leads o consultar el estado de tus locales.";
            } else {
                responseText = `Has enviado: ${text}\n(El bot está en fase inicial de desarrollo)`;
            }

            // 3. Guardar la respuesta del bot
            await supabase.from("tg_messages").insert({
                chat_id: chatId,
                text: responseText,
                from_bot: true
            });

            // 4. Responder a Telegram
            const telegramRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: responseText,
                }),
            });

            const telegramData = await telegramRes.json();
            console.log("Respuesta de Telegram:", telegramData);
        }

        return new Response(JSON.stringify({ ok: true }), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error) {
        console.error("Error procesando solicitud:", error);
        return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
});
