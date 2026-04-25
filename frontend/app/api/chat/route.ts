import { ollama } from 'ollama-ai-provider';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: ollama('granite4:7b-a1b-h'),
    messages,
  });

  return result.toDataStreamResponse();
}
