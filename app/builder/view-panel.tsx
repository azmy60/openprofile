"use client";

import { useEffect, useRef, useState } from "react";
import { usePDF } from "@react-pdf/renderer";
import {
  EllipsisVerticalIcon,
  ArrowUpOnSquareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useClickAway } from "../helpers";
import { SimpleButton } from "../ui";
import Script from "next/script";
import pdfjs, { type PDFDocumentProxy, type PDFPageProxy } from "pdfjs-dist";
import Basic from "../templates/basic";
import { Font } from "@react-pdf/renderer";

declare var pdfjsLib: typeof pdfjs;

const FONT_FAMILIES = ["Inter"];

FONT_FAMILIES.forEach((font) => {
  Font.register({
    family: font,
    src: `/fonts/${font}/${font}-Regular.ttf`,
    fontWeight: "normal",
  });
  Font.register({
    family: font,
    src: `/fonts/${font}/${font}-Bold.ttf`,
    fontWeight: "bold",
  });
});

let pageNumIsPending = -1;

const ViewPanel: React.FC = () => {
  const [instance] = usePDF({ document: <Basic /> });
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenu, setOpenMenu] = useState(false);
  const [pageIsRendering, setPageIsRendering] = useState(false);
  const [pdfDoc, setPdfDoc] = useState<null | PDFDocumentProxy>(null);

  const canvas = useRef<HTMLCanvasElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  const pageCount = pdfDoc?.numPages || "-";

  useClickAway(menu, () => setOpenMenu(false));

  useEffect(() => {
    if (instance.url) updatePdfDoc();

    async function updatePdfDoc() {
      try {
        const _pdfDoc = await pdfjsLib.getDocument(instance.url!).promise;
        setPdfDoc(_pdfDoc);
        const page = await _pdfDoc.getPage(currentPage);
        renderPDFPage(page, canvas.current!);
      } catch (e) {}
    }
  }, [instance.url]);

  async function goToPage(num: number) {
    setCurrentPage(num);
    if (pageIsRendering) pageNumIsPending = num;
    else renderPage(num);
  }

  async function renderPage(num: number) {
    try {
      setPageIsRendering(true);
      const page = await pdfDoc!.getPage(num);
      await renderPDFPage(page, canvas.current!);
    } finally {
      setPageIsRendering(false);
    }

    if (pageNumIsPending !== -1) {
      renderPage(pageNumIsPending);
      pageNumIsPending = -1;
    }
  }

  return (
    <div className="sticky left-1/2 top-0 w-1/2 h-full px-8 py-4 flex flex-col gap-4">
      <div className="pdf-viewer relative self-start min-h-0 mx-auto">
        <canvas ref={canvas} className="h-full object-contain" />
        <div className="absolute inset-0" />
      </div>
      <div className="flex gap-2">
        <button
          disabled={currentPage === 1}
          onClick={() => goToPage(currentPage - 1)}
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <span className="flex items-center">
          {currentPage} / {pageCount}
        </span>
        <button
          disabled={currentPage === pageCount}
          onClick={() => goToPage(currentPage + 1)}
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>
        <SimpleButton
          onClick={() => downloadAsPDF(instance.url!)}
          className="ml-auto "
        >
          Download as PDF
        </SimpleButton>
        <div className="relative aspect-square" ref={menu}>
          <button
            className="flex items-center justify-center rounded h-full w-full border border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-600 hover:text-white focus:outline-none focus:ring active:bg-indigo-500"
            onClick={() => setOpenMenu((b) => !b)}
          >
            <span className="sr-only">Menu</span>
            <EllipsisVerticalIcon className="h-6 w-6" />
          </button>

          {openMenu && (
            <div
              className="absolute end-0 bottom-full mb-2 z-10 w-56 rounded-md border border-gray-100 bg-white shadow-lg"
              role="menu"
            >
              <div className="p-2">
                <a
                  href={instance.url!}
                  target="_blank"
                  className="flex gap-2 items-center rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  role="menuitem"
                >
                  <ArrowUpOnSquareIcon className="h-5 w-5" />
                  Open PDF in new tab
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
      <Script
        src="/pdfjs-dist/build/pdf.js"
        onLoad={() => {
          pdfjsLib.GlobalWorkerOptions.workerSrc =
            "/pdfjs-dist/build/pdf.worker.js";
        }}
      />
    </div>
  );
};

export default ViewPanel;

async function renderPDFPage(page: PDFPageProxy, canvas: HTMLCanvasElement) {
  const viewport = page.getViewport({ scale: 2 });
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  return page.render({
    canvasContext: canvas.getContext("2d")!,
    viewport,
  });
}

function downloadAsPDF(url: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = "resume.pdf";
  a.click();
}
