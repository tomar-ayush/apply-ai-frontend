import { pdfjs } from "react-pdf";
import "@/lib/pdf-worker"; // side-effect: configures the pdf.js worker

export interface DiffPage {
  /** Data URL of the diff overlay for this page (transparent = unchanged). */
  overlayUrl: string;
  width: number;
  height: number;
}

export interface RasterDiffResult {
  pages: DiffPage[];
  error?: string;
}

const ADDED = { r: 34, g: 197, b: 94 }; // emerald-500
const REMOVED = { r: 244, g: 63, b: 94 }; // rose-500
const THRESHOLD = 60; // per-channel diff to count as "changed"

async function renderPageToImage(
  url: string,
  pageNumber: number,
  scale: number
): Promise<{ canvas: HTMLCanvasElement; width: number; height: number } | null> {
  const res = await fetch(url);
  if (!res.ok) return null;
  const buffer = await res.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
  if (pageNumber > pdf.numPages) return null;
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  await page.render({ canvas, canvasContext: ctx, viewport }).promise;
  return { canvas, width: canvas.width, height: canvas.height };
}

/**
 * Raster diff: renders both PDFs to images and, page-by-page, builds a transparent
 * overlay where added ink is green and removed ink is red. Pages are aligned by index
 * (best-effort); an extra page in either file is marked fully added/removed.
 */
export async function buildRasterDiff(
  originalUrl: string,
  optimizedUrl: string,
  scale = 1.5
): Promise<RasterDiffResult> {
  try {
    // Probe page counts from each doc.
    const [origProbe, optProbe] = await Promise.all([
      fetch(originalUrl).then((r) => r.arrayBuffer()),
      fetch(optimizedUrl).then((r) => r.arrayBuffer()),
    ]);
    const origPdf = await pdfjs.getDocument({ data: new Uint8Array(origProbe) }).promise;
    const optPdf = await pdfjs.getDocument({ data: new Uint8Array(optProbe) }).promise;
    const pageCount = Math.max(origPdf.numPages, optPdf.numPages);

    const pages: DiffPage[] = [];
    for (let p = 1; p <= pageCount; p++) {
      const orig = await renderPageToImage(originalUrl, p, scale);
      const opt = await renderPageToImage(optimizedUrl, p, scale);

      // Extra page only in optimized -> fully added (green wash).
      if (!orig && opt) {
        pages.push(makeSolidOverlay(opt.width, opt.height, ADDED, 0.28));
        continue;
      }
      // Extra page only in original -> fully removed (red wash).
      if (orig && !opt) {
        pages.push(makeSolidOverlay(orig.width, orig.height, REMOVED, 0.28));
        continue;
      }
      if (!orig || !opt) {
        pages.push({ overlayUrl: transparentPixel(), width: 1, height: 1 });
        continue;
      }

      const w = Math.min(orig.width, opt.width);
      const h = Math.min(orig.height, opt.height);
      const oCtx = orig.canvas.getContext("2d")!;
      const nCtx = opt.canvas.getContext("2d")!;
      const oData = oCtx.getImageData(0, 0, w, h).data;
      const nData = nCtx.getImageData(0, 0, w, h).data;

      const out = document.createElement("canvas");
      out.width = w;
      out.height = h;
      const oCtxOut = out.getContext("2d")!;
      const img = oCtxOut.createImageData(w, h);
      for (let i = 0; i < oData.length; i += 4) {
        const dr = Math.abs(oData[i] - nData[i]);
        const dg = Math.abs(oData[i + 1] - nData[i + 1]);
        const db = Math.abs(oData[i + 2] - nData[i + 2]);
        if (dr > THRESHOLD || dg > THRESHOLD || db > THRESHOLD) {
          // Added: new has ink (dark text) where old had none (white bg).
          const oldInk = oData[i] + oData[i + 1] + oData[i + 2] < 600;
          const newInk = nData[i] + nData[i + 1] + nData[i + 2] < 600;
          if (newInk && !oldInk) {
            img.data[i] = ADDED.r; img.data[i + 1] = ADDED.g; img.data[i + 2] = ADDED.b; img.data[i + 3] = 150;
          } else if (oldInk && !newInk) {
            img.data[i] = REMOVED.r; img.data[i + 1] = REMOVED.g; img.data[i + 2] = REMOVED.b; img.data[i + 3] = 150;
          }
          // changed-but-both-ink -> leave transparent (too noisy to color)
        }
      }
      oCtxOut.putImageData(img, 0, 0);
      pages.push({ overlayUrl: out.toDataURL(), width: w, height: h });
    }

    return { pages };
  } catch (e) {
    return { pages: [], error: e instanceof Error ? e.message : "Could not diff PDFs" };
  }
}

function makeSolidOverlay(w: number, h: number, color: { r: number; g: number; b: number }, alpha: number): DiffPage {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = `rgba(${color.r},${color.g},${color.b},${alpha})`;
  ctx.fillRect(0, 0, w, h);
  return { overlayUrl: c.toDataURL(), width: w, height: h };
}

function transparentPixel(): string {
  const c = document.createElement("canvas");
  c.width = 1;
  c.height = 1;
  return c.toDataURL();
}
