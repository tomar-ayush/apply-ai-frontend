import { pdfjs } from "react-pdf";
import "@/lib/pdf-worker"; // side-effect: configures the pdf.js worker

export interface PdfPageText {
    pageNumber: number;
    text: string;
}

export interface PdfTextDocument {
    pages: PdfPageText[];
    totalPages: number;
}

/**
 * Extract text from a PDF URL, preserving line breaks by tracking Y positions
 * (mirrors the reference pdf-diff implementation).
 */
export async function extractTextFromPdfUrl(url: string): Promise<PdfTextDocument> {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Could not fetch PDF");
    const buffer = await res.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
    const pages: PdfPageText[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        let lastY = -1;
        const text = textContent.items
            .map((item, index) => {
                if (!("str" in item)) return "";
                const currentY = item.transform[5];
                const needsNewline = lastY !== -1 && Math.abs(currentY - lastY) > 5;
                lastY = currentY;
                const nextItem = textContent.items[index + 1];
                const needsSpace =
                    nextItem && "str" in nextItem && nextItem.transform[4] - (item.transform[4] + item.width) > 2;
                return (needsNewline ? "\n" : "") + item.str + (needsSpace ? " " : "");
            })
            .join("");

        pages.push({ pageNumber: i, text });
    }

    return { pages, totalPages: pdf.numPages };
}
