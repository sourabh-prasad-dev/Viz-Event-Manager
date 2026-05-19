import React, { useState } from 'react';
import { Download, Printer, Search } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { SearchBar } from '@/components/ui/SearchBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { useEvents } from '@/context/EventContext';
import { useToast } from '@/context/AuthContext';
import { bulkDownloadQR, downloadQR } from '@/services/qr';

export function QRGenerator() {
  const { events, getEventAttendees } = useEvents();
  const { addToast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState(events[0]?.id || '');
  const [search, setSearch] = useState('');
  const [downloading, setDownloading] = useState(false);

  const attendees = selectedEvent ? getEventAttendees(selectedEvent) : [];
  const filtered = attendees.filter((a) => a.fullName.toLowerCase().includes(search.toLowerCase()) && a.qrToken);

  const eventOptions = events.map((e) => ({ value: e.id, label: e.name }));

  const handleBulkDownload = async () => {
    setDownloading(true);
    try {
      await bulkDownloadQR(filtered);
      addToast('success', 'QR codes downloaded', `${filtered.length} QR codes saved as ZIP.`);
    } catch {
      addToast('error', 'Download failed', 'Could not generate QR code ZIP file.');
    }
    setDownloading(false);
  };

  const handleSingleDownload = async (token: string, name: string) => {
    try {
      await downloadQR(token, name);
    } catch {
      addToast('error', 'Download failed', 'Could not download QR code.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="flex flex-wrap items-center gap-3">
          <Select options={eventOptions} value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)} />
          <SearchBar value={search} onChange={setSearch} placeholder="Search attendees..." className="w-64" />
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon={<Printer className="w-4 h-4" />} onClick={() => window.print()}>Print</Button>
          <Button icon={<Download className="w-4 h-4" />} onClick={handleBulkDownload} loading={downloading}>Download All</Button>
        </div>
      </div>

      <p className="text-sm text-surface-400">{filtered.length} QR codes generated</p>

      {filtered.length === 0 ? (
        <EmptyState title="No QR codes to display" description="Select an event with synced attendees to generate QR codes." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 print:grid-cols-4">
          {filtered.map((attendee, idx) => (
            <Card key={attendee.registrationId} padding="sm" className="text-center group animate-fade-in" style={{ animationDelay: `${idx * 30}ms` }}>
              <div className="bg-white rounded-xl p-3 mb-3 mx-auto w-fit">
                <QRCodeCanvas value={attendee.qrToken} size={140} level="H" bgColor="#ffffff" fgColor="#000000" />
              </div>
              <p className="text-sm font-medium text-surface-200 truncate">{attendee.fullName}</p>
              <p className="text-xs text-surface-500 truncate">{attendee.company}</p>
              <p className="text-xs text-surface-600 font-mono mt-1 truncate">{attendee.registrationId}</p>
              <button
                onClick={() => handleSingleDownload(attendee.qrToken, attendee.fullName)}
                className="mt-3 w-full py-1.5 text-xs text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 cursor-pointer print:hidden"
              >
                <Download className="w-3 h-3 inline mr-1" />Download
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
