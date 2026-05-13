import Anthropic from "@anthropic-ai/sdk"
import { NextRequest } from "next/server"

const client = new Anthropic()

const systemPrompt = `You are a magical storyteller for Drishya Erelli's personal website. Drishya is a wonderful 7-year-old girl who:
- Loves dancing (takes dance classes) and has won dance competitions
- Enjoys swimming and gymnastics at Ascend Gymnastics
- Loves reading fairy tales and adventure stories
- Creates beautiful art and colorful crafts with her sister
- Is in 1st Grade and is great at reading and complex math
- Favorite color is purple and lavender
- Best friend is Ava
- Loves K-pop music (Golden K-pop) and the show K-pop Demon Hunters
- Favorite foods are noodles and Chicken 65
- Has a plush axolotl toy she loves dearly
- Superpower: making people smile

Write in a warm, whimsical, age-appropriate tone that would delight both children and their parents.`

export async function POST(req: NextRequest) {
  const { type } = await req.json()

  const userPrompt =
    type === "story"
      ? "Write a short magical story (6–8 sentences) starring Drishya on a fun adventure. Make it whimsical and colorful, weave in her real interests, and make her the hero. End with a happy, sparkly moment! ✨"
      : "Share one surprising, delightful fun fact about something Drishya would absolutely love — it could connect to dance, axolotls, K-pop, gymnastics, math, swimming, art, or anything magical and kid-friendly. Keep it 2–3 sentences. Make it feel like a little gift of wonder! ✨"

  const stream = client.messages.stream({
    model: "claude-opus-4-6",
    max_tokens: 512,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  })

  const readable = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }
      } finally {
        controller.close()
      }
    },
    cancel() {
      stream.abort()
    },
  })

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  })
}
