/**
 * AI Assistant API — POST /api/assistant
 *
 * Answers a plain-language question about the authenticated user's finances.
 * Body: { query: string }. Uses Claude when ANTHROPIC_API_KEY is configured,
 * and a deterministic answer over the user's real data otherwise.
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUserId } from '@/lib/data';
import { answerQuestion } from '@/lib/assistant';

export const runtime = 'nodejs';

const schema = z.object({
  query: z.string().trim().min(1, 'Ask a question').max(500),
});

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
  }

  try {
    const { answer, aiPowered } = await answerQuestion(userId, parsed.data.query);
    return NextResponse.json({ answer, aiPowered });
  } catch (err) {
    console.error('[api/assistant] failed:', err);
    return NextResponse.json({ error: 'Could not answer that right now. Please try again.' }, { status: 500 });
  }
}
