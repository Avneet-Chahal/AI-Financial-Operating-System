/**
 * Bank statement upload — POST /api/upload  (multipart/form-data, field "file")
 *
 * Parses an uploaded CSV or PDF statement, maps the rows into the Transaction
 * schema, auto-categorizes them (Spending Agent rules), and persists them for the
 * authenticated user. Returns how many transactions were imported.
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/data';
import { clearMemory } from '@/lib/langchain-orchestrator';
import {
  parseCsvStatement,
  parsePdfStatement,
  type ParsedTransaction,
} from '@/lib/statement-parser';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 });
  }

  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: 'File is empty' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File too large (max 10 MB)' }, { status: 413 });
  }

  const name = file.name.toLowerCase();
  const isCsv = name.endsWith('.csv') || file.type === 'text/csv';
  const isPdf = name.endsWith('.pdf') || file.type === 'application/pdf';
  if (!isCsv && !isPdf) {
    return NextResponse.json({ error: 'Unsupported file type. Upload a .csv or .pdf' }, { status: 415 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let parsed: ParsedTransaction[];
  try {
    parsed = isCsv
      ? parseCsvStatement(buffer.toString('utf-8'))
      : await parsePdfStatement(buffer);
  } catch (err) {
    console.error('Statement parse failed:', err);
    return NextResponse.json(
      { error: 'Could not read that statement. Please check the file and try again.' },
      { status: 422 }
    );
  }

  if (parsed.length === 0) {
    return NextResponse.json(
      {
        error:
          'No transactions found in the file. Ensure it contains dated debit rows (CSV columns like Date/Description/Debit).',
      },
      { status: 422 }
    );
  }

  let created: { count: number };
  try {
    created = await prisma.transaction.createMany({
      data: parsed.map((tx) => ({
        userId,
        amount: tx.amount,
        category: tx.category,
        description: tx.description,
        merchant: tx.merchant,
        date: new Date(tx.date),
        isRecurring: tx.isRecurring,
        aiCategorized: true,
        source: isCsv ? 'CSV' : 'PDF',
      })),
    });
  } catch (err) {
    console.error('[api/upload] failed to save transactions:', err);
    return NextResponse.json(
      { error: 'Could not save the imported transactions. Please try again.' },
      { status: 500 }
    );
  }

  // New data invalidates the cached AI briefing. This is best-effort: the import
  // already succeeded, so a cache/Redis hiccup must never turn a good upload into
  // an error. (The cache layer degrades on its own, but we guard here too.)
  try {
    await clearMemory(userId);
  } catch (err) {
    console.error('[api/upload] cache invalidation failed (non-fatal):', err);
  }

  return NextResponse.json(
    { success: true, imported: created.count, source: isCsv ? 'CSV' : 'PDF' },
    { status: 201 }
  );
}
