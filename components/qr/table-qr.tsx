"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download, Printer, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TableQrCardProps {
  tableLabel: string;
  token: string;
  onRotate?: () => void;
  isRotating?: boolean;
}

export function TableQrCard({
  tableLabel,
  token,
  onRotate,
  isRotating,
}: TableQrCardProps) {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = origin ? `${origin}/t/${token}` : `/t/${token}`;
    QRCode.toDataURL(url, {
      width: 320,
      margin: 2,
      color: {
        dark: "#1c1917", // crisp dark stone
        light: "#ffffff",
      },
      errorCorrectionLevel: "H", // High tolerance for cafe table stickers
    })
      .then((url) => setDataUrl(url))
      .catch((err) => console.error("Error generating QR code", err));
  }, [token]);

  const handlePrintSingle = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cheezy Dip Cafe - ${tableLabel} QR</title>
          <style>
            @page { size: auto; margin: 10mm; }
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 90vh;
              margin: 0;
              background: #fff;
            }
            .sticker {
              width: 280px;
              padding: 24px;
              border: 3px solid #f59e0b;
              border-radius: 24px;
              text-align: center;
              box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            }
            .brand {
              font-size: 20px;
              font-weight: 900;
              color: #d97706;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin: 0 0 4px;
            }
            .tagline {
              font-size: 11px;
              color: #78716c;
              margin: 0 0 16px;
            }
            .qr-img {
              width: 220px;
              height: 220px;
              display: block;
              margin: 0 auto;
              border-radius: 12px;
            }
            .table-badge {
              display: inline-block;
              margin-top: 14px;
              padding: 6px 18px;
              background: #fef3c7;
              border: 2px solid #f59e0b;
              border-radius: 999px;
              font-size: 16px;
              font-weight: 800;
              color: #92400e;
            }
            .instruction {
              margin-top: 10px;
              font-size: 12px;
              font-weight: 600;
              color: #44403c;
            }
          </style>
        </head>
        <body>
          <div class="sticker">
            <h1 class="brand">Cheezy Dip Cafe</h1>
            <p class="tagline">100% Pure Veg Cafe</p>
            <img class="qr-img" src="${dataUrl}" alt="${tableLabel} QR Code" />
            <div class="table-badge">${tableLabel}</div>
            <p class="instruction">Scan with camera to view menu & order!</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `cheezy-dip-${tableLabel.toLowerCase().replace(/\s+/g, "-")}-qr.png`;
    a.click();
  };

  return (
    <div className="p-4 bg-[var(--bg-raised)] rounded-2xl border border-[var(--border)] space-y-3 shadow-xs">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-extrabold text-sm text-[var(--text)]">{tableLabel}</h4>
          <p className="text-[10px] text-[var(--text-muted)] font-mono truncate max-w-[150px]">
            {token}
          </p>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] border border-[var(--brand-primary)]/30">
          Permanent QR
        </span>
      </div>

      {/* Visual QR Code Display */}
      <div className="bg-white p-3 rounded-2xl border border-stone-200 flex flex-col items-center justify-center space-y-1.5 shadow-inner">
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dataUrl}
            alt={`${tableLabel} QR Code`}
            className="w-40 h-40 object-contain rounded-lg"
          />
        ) : (
          <div className="w-40 h-40 flex items-center justify-center text-[var(--text-muted)]">
            <QrCode className="w-8 h-8 animate-pulse text-[var(--brand-primary)]" />
          </div>
        )}
        <p className="text-[11px] font-bold text-stone-800 tracking-tight">
          Cheezy Dip Cafe • {tableLabel}
        </p>
        <p className="text-[9px] text-stone-500 font-medium">
          Scan to browse menu & order
        </p>
      </div>

      {/* Action Buttons */}
      <div className="pt-1 flex flex-wrap gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrintSingle}
          disabled={!dataUrl}
          className="flex-1 text-xs font-bold min-h-[44px] cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={!dataUrl}
          className="text-xs font-bold min-h-[44px] px-3 cursor-pointer flex items-center justify-center gap-1.5"
          title="Download PNG image"
        >
          <Download className="w-3.5 h-3.5" />
        </Button>

        {onRotate && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRotate}
            disabled={isRotating}
            className="text-xs font-bold min-h-[44px] px-3 cursor-pointer text-amber-600 hover:text-amber-700 dark:text-amber-400"
            title="Rotate compromised token"
          >
            Rotate
          </Button>
        )}
      </div>
    </div>
  );
}

interface AllTablesPrintSheetProps {
  tables: Array<{ id: string; label: string; token: string }>;
  isOpen: boolean;
  onClose: () => void;
}

export function AllTablesPrintSheet({
  tables,
  isOpen,
  onClose,
}: AllTablesPrintSheetProps) {
  const [dataUrls, setDataUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const generateAll = async () => {
      const urls: Record<string, string> = {};
      for (const t of tables) {
        try {
          urls[t.id] = await QRCode.toDataURL(`${origin}/t/${t.token}`, {
            width: 280,
            margin: 2,
            errorCorrectionLevel: "H",
          });
        } catch (e) {
          console.error(e);
        }
      }
      setDataUrls(urls);
    };

    generateAll();
  }, [tables, isOpen]);

  if (!isOpen) return null;

  const handlePrintSheet = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-[var(--bg-raised)] border border-[var(--border)] rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border)] print:hidden">
          <div>
            <h2 className="text-base font-extrabold text-[var(--text)] font-display">
              Table QR Sticker Sheet
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Printable sticker sheet for all cafe dining tables
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handlePrintSheet}
              className="text-xs font-bold min-h-[44px] px-3.5 cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print Sticker Sheet</span>
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-[var(--bg-inset)] text-[var(--text-muted)] hover:text-[var(--text)] flex items-center justify-center cursor-pointer font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-white rounded-2xl border border-stone-200 text-stone-900 grid grid-cols-2 sm:grid-cols-3 gap-4 print:p-0 print:border-none print:shadow-none">
          {tables.map((t) => (
            <div
              key={t.id}
              className="p-3 border-2 border-amber-400 rounded-2xl text-center flex flex-col items-center justify-between space-y-1.5 break-inside-avoid"
            >
              <p className="text-[11px] font-black text-amber-700 uppercase tracking-wider">
                Cheezy Dip Cafe
              </p>
              {dataUrls[t.id] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={dataUrls[t.id]}
                  alt={`${t.label} QR`}
                  className="w-32 h-32 object-contain"
                />
              ) : (
                <div className="w-32 h-32 flex items-center justify-center">
                  <QrCode className="w-6 h-6 animate-pulse text-amber-500" />
                </div>
              )}
              <div className="px-3 py-0.5 rounded-full bg-amber-100 border border-amber-400 font-extrabold text-xs text-amber-900">
                {t.label}
              </div>
              <p className="text-[9px] text-stone-600 font-semibold">
                Scan to Order
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
