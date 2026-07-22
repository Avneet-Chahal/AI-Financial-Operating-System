'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, FileText, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

type Status =
  | { kind: 'idle' }
  | { kind: 'uploading'; fileName: string }
  | { kind: 'success'; imported: number; source: string }
  | { kind: 'error'; message: string };

export default function StatementUpload() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [dragActive, setDragActive] = useState(false);

  async function upload(file: File) {
    setStatus({ kind: 'uploading', fileName: file.name });

    let res: Response;
    try {
      const body = new FormData();
      body.append('file', file);
      res = await fetch('/api/upload', { method: 'POST', body });
    } catch {
      // Only a genuine transport-level failure (offline, DNS, connection reset)
      // lands here — the server never responded.
      setStatus({ kind: 'error', message: 'Could not reach the server. Check your connection and try again.' });
      return;
    }

    // Parse defensively: an unhandled server error can return a non-JSON body,
    // which must surface as a meaningful message rather than a parse crash.
    const raw = await res.text();
    let data: { error?: string; imported?: number; source?: string } = {};
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      /* non-JSON body (e.g. HTML error page) — fall through to status-based message */
    }

    if (!res.ok) {
      const fallback =
        res.status === 401
          ? 'Your session expired. Please sign in again.'
          : res.status === 413
          ? 'That file is too large (max 10 MB).'
          : res.status === 415
          ? 'Unsupported file type. Upload a .csv or .pdf.'
          : res.status >= 500
          ? 'The server hit an error importing your statement. Please try again.'
          : 'Upload failed. Please try again.';
      setStatus({ kind: 'error', message: data.error ?? fallback });
      return;
    }

    setStatus({
      kind: 'success',
      imported: data.imported ?? 0,
      source: data.source ?? 'file',
    });
    // Refresh server components so the dashboard repopulates with new data.
    router.refresh();
  }

  function onFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) void upload(file);
  }

  return (
    <div
      className={`glass-card rounded-2xl p-5 transition-colors ${
        dragActive ? 'border-emerald-500/60 bg-emerald-500/5' : ''
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        onFiles(e.dataTransfer.files);
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br from-emerald-500/20 to-sky-500/20 border border-emerald-500/30 flex items-center justify-center">
          <UploadCloud className="h-6 w-6 text-emerald-400" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-100">Upload a bank statement</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Drag &amp; drop or browse a <span className="text-slate-300">.csv</span> or{' '}
            <span className="text-slate-300">.pdf</span>. We auto-categorize and add it to your dashboard.
          </p>

          {status.kind === 'uploading' && (
            <div className="mt-2 flex items-center gap-2 text-xs text-sky-300">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <FileText className="h-3.5 w-3.5" />
              Parsing {status.fileName}…
            </div>
          )}
          {status.kind === 'success' && (
            <div className="mt-2 flex items-center gap-2 text-xs text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Imported {status.imported} transaction{status.imported === 1 ? '' : 's'} from your {status.source}.
            </div>
          )}
          {status.kind === 'error' && (
            <div className="mt-2 flex items-center gap-2 text-xs text-red-400">
              <AlertCircle className="h-3.5 w-3.5" />
              {status.message}
            </div>
          )}
        </div>

        <button
          onClick={() => inputRef.current?.click()}
          disabled={status.kind === 'uploading'}
          className="shrink-0 rounded-lg bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 transition-opacity"
        >
          Browse file
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.pdf,text/csv,application/pdf"
          className="hidden"
          onChange={(e) => onFiles(e.target.files)}
        />
      </div>
    </div>
  );
}
