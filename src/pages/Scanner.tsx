import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CameraOff, CheckCircle, XCircle, Keyboard, Volume2, VolumeX, ScanLine, AlertCircle, Info } from 'lucide-react';
import * as api from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { useEvents } from '@/context/EventContext';
import { useToast } from '@/context/AuthContext';

type ScanResult = { status: 'approved' | 'already_scanned' | 'invalid' | 'not_found'; attendeeName: string; company: string; message: string } | null;

export function Scanner() {
  const { events, attendees, updateAttendeeStatus } = useEvents();
  const { addToast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState(events[0]?.id || '');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult>(null);
  const [manualToken, setManualToken] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const resultTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const eventOptions = events.map((e) => ({ value: e.id, label: e.name }));

  const processToken = useCallback(async (token: string) => {
    setScanning(true);
    const isApiConfigured = import.meta.env.VITE_GAS_URL && import.meta.env.VITE_GAS_URL !== 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

    if (isApiConfigured) {
      try {
        const res = await api.validateQR(token, selectedEvent);
        if (res.status === 'success' && res.data) {
          const { status, message, attendee } = res.data;
          const attendeeName = attendee?.fullName || '';
          const company = attendee?.company || '';
          setResult({ status, message, attendeeName, company });
          if (status === 'approved') {
            setScanCount((c) => c + 1);
            addToast('success', 'Check-in successful', attendeeName);
            // Optimistically update local context so UI reflects it
            const attendee = attendees.find(a => a.qrToken === token);
            if (attendee) {
              updateAttendeeStatus(attendee.registrationId, 'Approved', new Date().toISOString());
            }
          }
        } else {
          setResult({ status: 'invalid', attendeeName: '', company: '', message: res.message || 'Validation failed' });
        }
      } catch (err) {
        setResult({ status: 'invalid', attendeeName: '', company: '', message: 'Network error during validation' });
      }
    } else {
      // Fallback for Demo Mode
      const attendee = attendees.find((a) => a.qrToken === token && a.eventId === selectedEvent);

      if (!attendee) {
        setResult({ status: 'invalid', attendeeName: '', company: '', message: 'Invalid QR code. Token not found.' });
        setScanning(false);
        return;
      }

      if (attendee.status === 'Approved') {
        setResult({ status: 'already_scanned', attendeeName: attendee.fullName, company: attendee.company, message: `Already checked in at ${attendee.scanTime ? new Date(attendee.scanTime).toLocaleTimeString() : 'earlier'}` });
        setScanning(false);
        return;
      }

      updateAttendeeStatus(attendee.registrationId, 'Approved', new Date().toISOString());
      setScanCount((c) => c + 1);
      setResult({ status: 'approved', attendeeName: attendee.fullName, company: attendee.company, message: 'Entry approved! Welcome.' });
      addToast('success', 'Check-in successful', attendee.fullName);
    }
    setScanning(false);
  }, [attendees, selectedEvent, updateAttendeeStatus, addToast]);

  const startScanner = async () => {
    try {
      const html5Qrcode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5Qrcode;

      await html5Qrcode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (text) => {
          processToken(text);
          if (resultTimeoutRef.current) clearTimeout(resultTimeoutRef.current);
          resultTimeoutRef.current = setTimeout(() => setResult(null), 4000);
        },
        () => {}
      );
      setScanning(true);
    } catch (err) {
      addToast('error', 'Camera error', 'Could not access camera. Please check permissions.');
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch {}
      scannerRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => { stopScanner(); };
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualToken.trim()) {
      processToken(manualToken.trim());
      setManualToken('');
      if (resultTimeoutRef.current) clearTimeout(resultTimeoutRef.current);
      resultTimeoutRef.current = setTimeout(() => setResult(null), 4000);
    }
  };

  const getResultStyles = () => {
    if (!result) return {};
    switch (result.status) {
      case 'approved': return { bg: 'bg-success-500/20', border: 'border-success-500/50', icon: <CheckCircle className="w-16 h-16 text-success-400" />, animation: 'animate-fade-in-scale' };
      case 'already_scanned': return { bg: 'bg-danger-500/20', border: 'border-danger-500/50', icon: <XCircle className="w-16 h-16 text-danger-400" />, animation: 'animate-shake' };
      case 'invalid': return { bg: 'bg-danger-500/20', border: 'border-danger-500/50', icon: <XCircle className="w-16 h-16 text-danger-400" />, animation: 'animate-shake' };
      default: return {};
    }
  };

  const styles = getResultStyles();

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      {/* Event selector bar */}
      <div className="page-header-container">
        <Select options={eventOptions} value={selectedEvent} onChange={(e) => { setSelectedEvent(e.target.value); setScanCount(0); }} />
        <div className="flex items-center gap-3">
          <Badge variant="primary" size="md">{scanCount} scanned</Badge>
          <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2 rounded-lg text-surface-400 hover:text-surface-200 transition-colors cursor-pointer">
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Scanner View */}
      <Card padding="none" className="overflow-hidden">
        <div className="relative aspect-square max-h-[400px] bg-black flex items-center justify-center">
          <div id="qr-reader" className="w-full h-full" />
          {!scanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-900/90">
              <Camera className="w-16 h-16 text-surface-500 mb-4" />
              <p className="text-surface-400 text-sm mb-4">Camera is inactive</p>
              <Button icon={<Camera className="w-4 h-4" />} onClick={startScanner}>Start Scanning</Button>
            </div>
          )}
          {scanning && (
            <div className="absolute top-4 right-4">
              <Button variant="danger" size="sm" icon={<CameraOff className="w-4 h-4" />} onClick={stopScanner}>Stop</Button>
            </div>
          )}
        </div>
      </Card>

      {/* Scan Result Overlay */}
      {result && (
        <div className={`rounded-2xl border-2 ${styles.bg} ${styles.border} p-8 text-center ${styles.animation}`}>
          <div className="mb-4">{styles.icon}</div>
          <h3 className={`text-xl font-bold mb-1 ${result.status === 'approved' ? 'text-success-400' : 'text-danger-400'}`}>
            {result.status === 'approved' ? 'APPROVED' : result.status === 'already_scanned' ? 'ALREADY SCANNED' : 'INVALID'}
          </h3>
          {result.attendeeName && <p className="text-lg text-surface-200 font-medium">{result.attendeeName}</p>}
          {result.company && <p className="text-sm text-surface-400">{result.company}</p>}
          <p className="text-sm text-surface-500 mt-2">{result.message}</p>
        </div>
      )}

      {/* Manual Entry */}
      <Card>
        <button onClick={() => setShowManual(!showManual)} className="flex items-center gap-2 text-sm text-surface-400 hover:text-surface-200 transition-colors cursor-pointer w-full">
          <Keyboard className="w-4 h-4" />
          <span>Manual Token Entry</span>
        </button>
        {showManual && (
          <form onSubmit={handleManualSubmit} className="flex gap-3 mt-4">
            <Input placeholder="Enter QR token manually..." value={manualToken} onChange={(e) => setManualToken(e.target.value)} className="flex-1" />
            <Button type="submit">Validate</Button>
          </form>
        )}
      </Card>
    </div>
  );
}
