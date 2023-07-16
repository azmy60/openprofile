"use client";

import Frame from "react-frame-component";
import dynamic from "next/dynamic";
import { Font } from "@react-pdf/renderer";
import { useEffect } from "react";

const SUPPRESSED_WARNINGS = ["DOCUMENT", "PAGE", "TEXT", "VIEW", "LINK"];

const mustBeSuppressed = (_msg: any, ...args: any[]) => {
  return SUPPRESSED_WARNINGS.some((entry) => args[0]?.includes(entry));
};

/**
 * Suppress ResumePDF development errors.
 * See ResumePDF doc string for context.
 */
function useSuppressedReactPDFError() {
  useEffect(() => {
    if (window.location.hostname !== "localhost") return;

    const origConsoleError = console.error;

    console.error = (...args) => {
      if (!mustBeSuppressed(...args)) origConsoleError(...args);
    };

    return () => {
      console.error = origConsoleError;
    };
  }, []);
}

const A4_WIDTH_PT = 595;
const A4_HEIGHT_PT = 842;

const FONT_FAMILIES = ["Inter"];

const FONT_PRELOAD_LINKS = FONT_FAMILIES.map(
  (font) =>
    `<link rel="preload" as="font" href="/fonts/${font}/${font}-Regular.ttf" type="font/ttf" crossorigin="anonymous">` +
    `<link rel="preload" as="font" href="/fonts/${font}/${font}-Bold.ttf" type="font/ttf" crossorigin="anonymous">`
).join("");

const FONT_FACES_CSS = FONT_FAMILIES.map(
  (font) =>
    `@font-face {font-family: "${font}"; src: url("/fonts/${font}/${font}-Regular.ttf");}` +
    `@font-face {font-family: "${font}"; src: url("/fonts/${font}/${font}-Bold.ttf"); font-weight: bold;}`
).join("");

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

/**
 * IFrame is used here for style isolation, since react pdf uses pt unit.
 * It creates a sandbox document body that uses A4 size as width.
 */
const CustomPDFViewer: React.FC<
  React.ComponentProps<typeof Frame> & {
    iframeRef: React.ComponentProps<typeof Frame>["ref"];
  }
> = ({ iframeRef, ...props }) => {
  useSuppressedReactPDFError();
  return (
    <Frame
      {...props}
      ref={iframeRef}
      style={{
        width: `${A4_WIDTH_PT}pt`,
        height: `${A4_HEIGHT_PT}pt`,
        backgroundColor: "white",
      }}
      initialContent={`
          <!DOCTYPE html>
          <html>
            <head>
              ${FONT_PRELOAD_LINKS}
              <style>${FONT_FACES_CSS}</style>
            </head>
            <body style="overflow: hidden; width: ${A4_WIDTH_PT}pt; margin: 0; padding: 0; -webkit-text-size-adjust:none;">
              <div></div>
            </body>
          </html>
        `}
    />
  );
};

// Iframe can't be server side rendered, so we use dynamic import to load it only on client side
export const CustomDynamicPDFViewer = dynamic(
  () => Promise.resolve(CustomPDFViewer),
  {
    ssr: false,
  }
);
