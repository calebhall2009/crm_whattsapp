// ─────────────────────────────────────────────────────────────
// AI Agent Service
//
// Uses OpenAI function calling to handle WhatsApp messages.
// The agent can:
//   • Answer questions using contact context from the DB
//   • Book appointments
//   • Move contacts through the pipeline
//   • Escalate to a human agent
//
// Falls back to Ollama if OPENAI_API_KEY is not set.
// ─────────────────────────────────────────────────────────────

import { Injectable, Inject, Logger } from "@nestjs/common";
import OpenAI from "openai";
import { DATABASE_TOKEN } from "../database/database.module";
import type { Database } from "@pos/database";
import {
  contacts,
  appointments,
  conversations,
} from "@pos/database";
import { eq, and, desc } from "drizzle-orm";
import { ConversationsService } from "../conversations/conversations.service";
import { ContactsService } from "../contacts/contacts.service";

// ── Tool definitions for OpenAI function calling ──────────────

const TOOLS: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_contact_info",
      description: "Obtiene los datos del cliente actual: nombre, estado en el pipeline, notas y etiquetas.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_conversation_history",
      description: "Obtiene los últimos mensajes de esta conversación para mantener el contexto.",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number", description: "Número de mensajes a obtener (máx 20)" },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_upcoming_appointments",
      description: "Lista las próximas citas del cliente.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "book_appointment",
      description: "Agenda una cita para el cliente. Requiere fecha/hora y título del servicio.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Nombre del servicio o motivo de la cita" },
          scheduledAt: { type: "string", description: "Fecha y hora ISO 8601, ej: 2026-07-10T14:00:00-05:00" },
          durationMinutes: { type: "number", description: "Duración en minutos (default 60)" },
          notes: { type: "string", description: "Notas adicionales" },
        },
        required: ["title", "scheduledAt"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_contact_status",
      description: "Actualiza el estado del contacto en el pipeline de ventas.",
      parameters: {
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: ["new", "contacted", "qualified", "proposal", "closed_won", "closed_lost"],
          },
        },
        required: ["status"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "escalate_to_agent",
      description: "Pasa la conversación a un agente humano cuando la consulta es demasiado compleja o el cliente lo pide.",
      parameters: {
        type: "object",
        properties: {
          reason: { type: "string", description: "Motivo del escalamiento" },
        },
        required: ["reason"],
      },
    },
  },
];

// ── Agent context ─────────────────────────────────────────────

export interface AgentContext {
  companyId: string;
  contactId: string;
  conversationId: string;
  companyName: string;
  businessDescription?: string; // Optional company profile for the system prompt
}

export interface AgentResult {
  reply: string;
  escalated: boolean;
  toolsUsed: string[];
}

@Injectable()
export class AiAgentService {
  private readonly logger = new Logger(AiAgentService.name);
  private readonly openai: OpenAI;
  private readonly useOllama: boolean;

  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: Database,
    private readonly contactsService: ContactsService,
    private readonly conversationsService: ConversationsService
  ) {
    const openaiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (geminiKey) {
      this.logger.log("Using Google Gemini API via OpenAI compatibility layer ✅");
      this.openai = new OpenAI({
        apiKey: geminiKey,
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
      });
      this.useOllama = false;
    } else if (openaiKey) {
      this.logger.log("Using OpenAI API ✅");
      this.openai = new OpenAI({ apiKey: openaiKey });
      this.useOllama = false;
    } else {
      this.logger.warn(
        "No AI API keys set — using Ollama (http://localhost:11434). " +
        "Function calling may be limited. Set GEMINI_API_KEY or OPENAI_API_KEY for production."
      );
      this.openai = new OpenAI({
        apiKey: "ollama",
        baseURL: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/v1",
      });
      this.useOllama = true;
    }
  }

  async processMessage(
    userMessage: string,
    ctx: AgentContext
  ): Promise<AgentResult> {
    const toolsUsed: string[] = [];
    let escalated = false;

    // Build system prompt
    const systemPrompt = `Eres un asistente de atención al cliente de "${ctx.companyName}" por WhatsApp.
Tu objetivo es ayudar al cliente, responder sus preguntas, agendar citas y escalar cuando sea necesario.
Reglas:
- Sé amable, conciso y profesional. Responde siempre en español.
- Consulta el contexto del cliente antes de responder para dar información personalizada.
- Si el cliente quiere agendar una cita, usa la herramienta book_appointment.
- Si la consulta es muy compleja o el cliente pide hablar con una persona, usa escalate_to_agent.
- NO inventes precios, disponibilidad ni información que no tengas.
${ctx.businessDescription ? `\nInformación del negocio:\n${ctx.businessDescription}` : ""}`;

    const chatMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ];

    // Resolve model once — selection is constant for the lifetime of the service
    // and re-evaluating env vars on every iteration was wasted work.
    let model = "gpt-4o-mini";
    if (process.env.GEMINI_API_KEY) {
      model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    } else if (this.useOllama) {
      model = process.env.OLLAMA_MODEL || "llama3";
    } else {
      model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    }

    // ── Agentic loop (up to 5 iterations) ────────────────────
    for (let iteration = 0; iteration < 5; iteration++) {
      const response = await this.openai.chat.completions.create({
        model,
        messages: chatMessages,
        tools: this.useOllama ? undefined : TOOLS,
        tool_choice: this.useOllama ? undefined : "auto",
        temperature: 0.3,
        max_tokens: 500,
      });

      const choice = response.choices[0];
      const assistantMsg = choice.message;

      // If no tool calls — we have the final reply
      if (!assistantMsg.tool_calls || assistantMsg.tool_calls.length === 0) {
        return {
          reply: assistantMsg.content ?? "Lo siento, no pude procesar tu mensaje.",
          escalated,
          toolsUsed,
        };
      }

      // Push assistant message with tool calls
      chatMessages.push(assistantMsg);

      // Execute each tool call
      for (const toolCall of assistantMsg.tool_calls) {
        const fnName = toolCall.function.name;
        // Wrap JSON.parse in try/catch — malformed tool arguments from the LLM
        // would otherwise throw out of the agentic loop and abort the whole
        // response, leaving the user with no reply.
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(toolCall.function.arguments || "{}");
        } catch (parseErr: any) {
          this.logger.warn(
            `Failed to parse tool arguments for ${fnName}: ${parseErr.message}`
          );
          chatMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify({
              error: `Invalid JSON arguments: ${parseErr.message}`,
            }),
          });
          continue;
        }
        toolsUsed.push(fnName);

        const result = await this.executeTool(fnName, args, ctx);

        if (fnName === "escalate_to_agent") {
          escalated = true;
          // Mark conversation for human takeover
          await this.conversationsService.assignToAgent(
            ctx.companyId,
            ctx.conversationId,
            "unassigned" // Will be picked up by next available agent
          );
        }

        chatMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      }
    }

    return {
      reply: "Un momento, te comunicaré con un agente para ayudarte mejor.",
      escalated: true,
      toolsUsed,
    };
  }

  // ── Tool implementations ──────────────────────────────────────

  private async executeTool(
    name: string,
    args: Record<string, unknown>,
    ctx: AgentContext
  ): Promise<unknown> {
    try {
      switch (name) {
        case "get_contact_info": {
          const contact = await this.contactsService.findById(ctx.companyId, ctx.contactId);
          return {
            name: contact.name,
            phone: contact.phone,
            email: contact.email,
            status: contact.status,
            tags: contact.tags,
            notes: contact.notes,
            lastContactedAt: contact.lastContactedAt,
            nextFollowUpAt: contact.nextFollowUpAt,
          };
        }

        case "get_conversation_history": {
          const limit = Math.min((args.limit as number) ?? 10, 20);
          const msgs = await this.conversationsService.getMessages(
            ctx.companyId,
            ctx.conversationId,
            limit
          );
          return msgs.reverse().map((m) => ({
            role: m.role,
            body: m.body,
            sentAt: m.sentAt,
          }));
        }

        case "get_upcoming_appointments": {
          const rows = await this.db
            .select()
            .from(appointments)
            .where(
              and(
                eq(appointments.contactId, ctx.contactId),
                eq(appointments.companyId, ctx.companyId)
              )
            )
            .orderBy(desc(appointments.scheduledAt))
            .limit(5);
          return rows;
        }

        case "book_appointment": {
          const [apt] = await this.db
            .insert(appointments)
            .values({
              companyId: ctx.companyId,
              contactId: ctx.contactId,
              title: args.title as string,
              scheduledAt: new Date(args.scheduledAt as string),
              durationMinutes: (args.durationMinutes as number) ?? 60,
              notes: args.notes as string | undefined,
              status: "pending",
            } as any)
            .returning();

          // Move contact to "qualified" after booking
          await this.contactsService.update(ctx.companyId, ctx.contactId, {
            status: "qualified",
          });

          return { success: true, appointment: apt };
        }

        case "update_contact_status": {
          await this.contactsService.update(ctx.companyId, ctx.contactId, {
            status: args.status as any,
          });
          return { success: true, newStatus: args.status };
        }

        case "escalate_to_agent": {
          return { escalated: true, reason: args.reason };
        }

        default:
          return { error: `Unknown tool: ${name}` };
      }
    } catch (err: any) {
      this.logger.error(`Tool ${name} failed: ${err.message}`);
      return { error: err.message };
    }
  }
}
