import { QRCodeCanvas } from 'qrcode.react';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { Attendee } from '@/types';

/**
 * Render a QR code to a canvas and return as data URL
 */
export async function generateQRDataURL(value: string, size: number = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    document.body.appendChild(container);

    const root = createRoot(container);
    root.render(
      createElement(QRCodeCanvas, {
        value,
        size,
        level: 'H',
        bgColor: '#ffffff',
        fgColor: '#000000',
        style: { display: 'block' },
      })
    );

    // Wait for render
    setTimeout(() => {
      const canvas = container.querySelector('canvas');
      if (canvas) {
        resolve(canvas.toDataURL('image/png'));
      } else {
        reject(new Error('Failed to render QR code'));
      }
      root.unmount();
      document.body.removeChild(container);
    }, 200);
  });
}

/**
 * Download a single QR code as PNG
 */
export async function downloadQR(token: string, fileName: string): Promise<void> {
  const dataUrl = await generateQRDataURL(token, 512);
  const link = document.createElement('a');
  link.download = `${fileName}.png`;
  link.href = dataUrl;
  link.click();
}

/**
 * Bulk download QR codes as a ZIP file
 */
export async function bulkDownloadQR(attendees: Attendee[]): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder('qr-codes');

  if (!folder) throw new Error('Failed to create ZIP folder');

  for (const attendee of attendees) {
    if (!attendee.qrToken) continue;

    const dataUrl = await generateQRDataURL(attendee.qrToken, 512);
    const base64 = dataUrl.split(',')[1];
    const safeName = attendee.fullName.replace(/[^a-zA-Z0-9]/g, '_');
    folder.file(`${safeName}_${attendee.registrationId}.png`, base64, { base64: true });
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, 'qr-codes.zip');
}
