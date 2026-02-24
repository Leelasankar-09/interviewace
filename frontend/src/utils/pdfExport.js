/**
 * pdfExport.js — Pure JS PDF generation for practice history.
 * Uses the browser's native Canvas API to build a pixel-perfect PDF
 * without any external library dependencies.
 *
 * Usage:
 *   import { exportHistoryPDF } from '../utils/pdfExport';
 *   exportHistoryPDF(sessions, analytics, userName);
 */

// ── Minimal PDF writer ────────────────────────────────────────────────────────
class MinimalPDF {
    constructor() {
        this.objects = [];
        this.offsets = [];
        this.pageIds = [];
        this._id = 0;
    }

    _newId() { return ++this._id; }

    addPage(contentId, width = 595, height = 842) {
        const id = this._newId();
        this.pageIds.push(id);
        this.objects.push({ id, data: `${id} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Contents ${contentId} 0 R /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> >>\nendobj\n` });
        return id;
    }

    addContent(text) {
        const id = this._newId();
        const stream = `stream\n${text}\nendstream`;
        this.objects.push({ id, data: `${id} 0 obj\n<< /Length ${stream.length} >>\n${stream}\nendobj\n` });
        return id;
    }

    build() {
        const header = '%PDF-1.4\n';
        const catalogId = this._newId();
        const pagesId = 2; // fixed

        // Font objects
        const f1 = { id: 3, data: '3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n' };
        const f2 = { id: 4, data: '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n' };
        const pages = { id: pagesId, data: `2 0 obj\n<< /Type /Pages /Kids [${this.pageIds.map(i => `${i} 0 R`).join(' ')}] /Count ${this.pageIds.length} >>\nendobj\n` };
        const catalog = { id: catalogId, data: `${catalogId} 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n` };

        const allObjs = [f1, f2, pages, ...this.objects, catalog].sort((a, b) => a.id - b.id);

        let body = header;
        const offsets = {};
        for (const obj of allObjs) {
            offsets[obj.id] = body.length;
            body += obj.data;
        }

        // xref
        const xrefPos = body.length;
        const maxId = Math.max(...allObjs.map(o => o.id));
        let xref = `xref\n0 ${maxId + 1}\n0000000000 65535 f \n`;
        for (let i = 1; i <= maxId; i++) {
            xref += (offsets[i] !== undefined ? String(offsets[i]).padStart(10, '0') : '0000000000') + ' 00000 n \n';
        }
        xref += `trailer\n<< /Size ${maxId + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;

        return body + xref;
    }
}

// ── PDF content builder ───────────────────────────────────────────────────────
const esc = (str) => String(str || '').replace(/[()\\]/g, c => '\\' + c).replace(/[^\x20-\x7E]/g, '?');

function buildPageContent(sessions, analytics, userName, page, totalPages) {
    const lines = [];
    const W = 595, margin = 50;

    const t = (x, y, text, size = 10, bold = false) =>
        lines.push(`BT /${bold ? 'F2' : 'F1'} ${size} Tf ${x} ${y} Td (${esc(text)}) Tj ET`);

    const rect = (x, y, w, h, fill = false) =>
        lines.push(`${x} ${y} ${w} ${h} re ${fill ? 'f' : 'S'}`);

    const color = (r, g, b) => lines.push(`${r} ${g} ${b} rg`);
    const strokeColor = (r, g, b) => lines.push(`${r} ${g} ${b} RG`);
    const lineWidth = (w) => lines.push(`${w} w`);

    let y = 800;

    // ── Header bar ──
    color(0.388, 0.4, 0.945); // indigo-500
    rect(0, 820, W, 25, true);
    color(1, 1, 1);
    t(margin, 828, '🎯 InterviewAce — Practice History Report', 12, true);
    color(0, 0, 0);

    y = 790;

    // ── Title ──
    color(0.388, 0.4, 0.945);
    t(margin, y, `Practice Report — ${userName}`, 16, true);
    color(0.4, 0.4, 0.4);
    t(margin, y - 18, `Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}   Page ${page} of ${totalPages}`, 8);
    color(0, 0, 0);

    y -= 40;

    // ── Analytics summary (first page only) ──
    if (page === 1 && analytics) {
        lineWidth(0.5);
        strokeColor(0.8, 0.8, 0.9);
        const statW = (W - margin * 2) / 4;
        const stats = [
            { label: 'Total Sessions', value: analytics.total_sessions || 0 },
            { label: 'Avg Score', value: `${analytics.avg_score || 0}%` },
            { label: 'Best Score', value: `${analytics.best_score || 0}%` },
            { label: 'Streak Days', value: `${analytics.streak_days || 0} 🔥` },
        ];
        stats.forEach((s, i) => {
            const sx = margin + i * statW;
            color(0.95, 0.95, 1);
            rect(sx, y - 30, statW - 6, 40, true);
            color(0.388, 0.4, 0.945);
            t(sx + 6, y - 8, String(s.value), 14, true);
            color(0.45, 0.45, 0.55);
            t(sx + 6, y - 22, s.label, 7);
        });
        color(0, 0, 0);
        y -= 52;

        // Divider
        strokeColor(0.85, 0.85, 0.9);
        lineWidth(0.5);
        lines.push(`${margin} ${y} m ${W - margin} ${y} l S`);
        y -= 16;
    }

    // ── Table header ──
    color(0.15, 0.15, 0.25);
    rect(margin, y - 6, W - margin * 2, 18, true);
    color(1, 1, 1);
    const cols = [margin + 4, margin + 130, margin + 210, margin + 280, margin + 330, margin + 390];
    const headers = ['Date', 'Type', 'Score', 'Grade', 'Duration', 'Question'];
    headers.forEach((h, i) => t(cols[i], y + 2, h, 8, true));
    color(0, 0, 0);
    y -= 22;

    // ── Session rows ──
    sessions.forEach((s, idx) => {
        if (y < 60) return; // safety guard

        // Alternating row bg
        if (idx % 2 === 0) {
            color(0.97, 0.97, 1);
            rect(margin, y - 4, W - margin * 2, 16, true);
        }

        const date = s.created_at ? new Date(s.created_at).toLocaleDateString('en-IN') : '—';
        const type = (s.session_type || '').toUpperCase().slice(0, 10);
        const score = s.overall_score != null ? `${s.overall_score}%` : '—';
        const grade = s.grade || '—';
        const dur = s.duration_secs ? `${Math.round(s.duration_secs / 60)}m` : '—';
        const q = (s.question_text || '').slice(0, 40);

        // Score color
        const sc = parseFloat(s.overall_score || 0);
        if (sc >= 80) color(0.06, 0.73, 0.51);
        else if (sc >= 60) color(0.96, 0.62, 0.04);
        else color(0.94, 0.27, 0.27);
        t(cols[2], y, score, 8, true);

        color(0, 0, 0);
        t(cols[0], y, date, 8);
        t(cols[1], y, type, 8);
        t(cols[3], y, grade, 8);
        t(cols[4], y, dur, 8);
        color(0.3, 0.3, 0.4);
        t(cols[5], y, q, 7);
        color(0, 0, 0);

        y -= 17;
    });

    // ── Footer ──
    strokeColor(0.8, 0.8, 0.9);
    lineWidth(0.5);
    lines.push(`${margin} 40 m ${W - margin} 40 l S`);
    color(0.6, 0.6, 0.7);
    t(margin, 28, 'InterviewAce · AI-Powered Interview Preparation · github.com/Leelasankar-09/interviewace', 7);

    return lines.join('\n');
}

// ── Public export function ────────────────────────────────────────────────────
export function exportHistoryPDF(sessions = [], analytics = null, userName = 'User') {
    try {
        const ROWS_PER_PAGE = 28;
        const pdf = new MinimalPDF();

        const totalPages = Math.max(1, Math.ceil(sessions.length / ROWS_PER_PAGE));

        for (let p = 0; p < totalPages; p++) {
            const pageSessions = sessions.slice(p * ROWS_PER_PAGE, (p + 1) * ROWS_PER_PAGE);
            const contentText = buildPageContent(pageSessions, analytics, userName, p + 1, totalPages);
            const contentId = pdf.addContent(contentText);
            pdf.addPage(contentId);
        }

        const pdfData = pdf.build();
        const blob = new Blob([pdfData], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `interviewace-report-${new Date().toISOString().slice(0, 10)}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        return true;
    } catch (err) {
        console.error('PDF export failed:', err);
        return false;
    }
}
