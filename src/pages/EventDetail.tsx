import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, ScanLine, QrCode, Settings, RefreshCw, UserPlus, Download, Calendar, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { DataTable } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/EmptyState';
import { useEvents } from '@/context/EventContext';
import { useToast } from '@/context/AuthContext';
import { formatDate, formatDateTime, getStatusColor, generateId } from '@/utils/helpers';
import type { Attendee } from '@/types';

export function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { events, getEventAttendees, addAttendee, refreshData } = useEvents();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('attendees');
  const [showOnSpotModal, setShowOnSpotModal] = useState(false);
  const [onSpotForm, setOnSpotForm] = useState({ fullName: '', email: '', phone: '', company: '' });

  const event = events.find((e) => e.id === id);
  const attendees = id ? getEventAttendees(id) : [];

  if (!event) {
    return (
      <div className="animate-fade-in">
        <EmptyState title="Event not found" description="This event doesn't exist or has been deleted." action={<Button onClick={() => navigate('/events')}>Back to Events</Button>} />
      </div>
    );
  }

  const approved = attendees.filter((a) => a.status === 'Approved').length;
  const pending = attendees.filter((a) => a.status === 'Pending').length;
  const onSpot = attendees.filter((a) => a.addedOnSpot).length;

  const handleOnSpotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAttendee: Attendee = {
      registrationId: 'REG' + generateId().substring(0, 6).toUpperCase(),
      fullName: onSpotForm.fullName,
      email: onSpotForm.email,
      phone: onSpotForm.phone,
      company: onSpotForm.company,
      eventId: event.id,
      qrToken: 'EVT_' + event.id + '_tkn_' + generateId(),
      status: 'Pending',
      scanTime: '',
      addedOnSpot: true,
    };
    addAttendee(newAttendee);
    setShowOnSpotModal(false);
    setOnSpotForm({ fullName: '', email: '', phone: '', company: '' });
    addToast('success', 'Walk-in registered', `${onSpotForm.fullName} has been added.`);
  };

  const handleSyncSheet = async () => {
    addToast('info', 'Syncing...', 'Fetching latest data from Google Sheets.');
    await refreshData();
    addToast('success', 'Sync complete', 'Latest attendees loaded.');
  };

  const tabs = [
    { key: 'attendees', label: 'Attendees', icon: <Users className="w-4 h-4" /> },
    { key: 'qr', label: 'QR Codes', icon: <QrCode className="w-4 h-4" /> },
    { key: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const columns = [
    { key: 'registrationId', header: 'Reg. ID', sortable: true, width: '120px' },
    { key: 'fullName', header: 'Name', sortable: true, render: (a: Attendee) => <span className="font-medium text-surface-100">{a.fullName}</span> },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'company', header: 'Company', sortable: true },
    { key: 'status', header: 'Status', sortable: true, render: (a: Attendee) => <Badge variant={getStatusColor(a.status) as 'success' | 'warning' | 'danger' | 'primary' | 'surface'} dot>{a.status}</Badge> },
    { key: 'addedOnSpot', header: 'Type', render: (a: Attendee) => a.addedOnSpot ? <Badge variant="accent" size="sm">Walk-in</Badge> : <Badge variant="surface" size="sm">Pre-reg</Badge> },
    { key: 'scanTime', header: 'Scan Time', render: (a: Attendee) => <span className="text-surface-400">{a.scanTime ? formatDateTime(a.scanTime) : '—'}</span> },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <button onClick={() => navigate('/events')} className="flex items-center gap-2 text-sm text-surface-400 hover:text-surface-200 transition-colors cursor-pointer">
        <ArrowLeft className="w-4 h-4" /> Back to Events
      </button>

      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <h2 className="text-3xl font-bold text-surface-100">{event.name}</h2>
              <Badge variant={getStatusColor(event.status) as 'success' | 'warning' | 'danger' | 'primary' | 'surface'} dot>{event.status}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-5 text-sm text-surface-400">
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4" />{formatDate(event.date)}</span>
              <span className="flex items-center gap-2"><MapPin className="w-4 h-4" />{event.venue}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" icon={<RefreshCw className="w-4 h-4" />} onClick={handleSyncSheet}>Sync Sheet</Button>
            <Button variant="secondary" icon={<UserPlus className="w-4 h-4" />} onClick={() => setShowOnSpotModal(true)}>Walk-in</Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-5 mt-8">
          <div className="text-center p-3 rounded-xl bg-surface-800/50">
            <p className="text-2xl font-bold text-surface-100">{attendees.length}</p>
            <p className="text-xs text-surface-500">Total Registered</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-success-500/10">
            <p className="text-2xl font-bold text-success-400">{approved}</p>
            <p className="text-xs text-surface-500">Checked In</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-warning-500/10">
            <p className="text-2xl font-bold text-warning-400">{pending}</p>
            <p className="text-xs text-surface-500">Pending</p>
          </div>
        </div>
      </Card>

      <div className="flex items-center gap-1 bg-surface-800/50 rounded-xl p-1 w-fit">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${activeTab === tab.key ? 'gradient-primary text-white' : 'text-surface-400 hover:text-surface-200'}`}>
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'attendees' && (
        <DataTable columns={columns} data={attendees} keyExtractor={(item: any) => item.registrationId} emptyMessage="No attendees yet. Sync from Google Sheets or add walk-in registrations." />
      )}

      {activeTab === 'qr' && (
        <Card>
          <div className="text-center py-8">
            <QrCode className="w-12 h-12 text-surface-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-surface-200 mb-2">Generate QR Codes</h3>
            <p className="text-sm text-surface-500 mb-6">Generate QR codes for all attendees of this event.</p>
            <Button icon={<Download className="w-4 h-4" />} onClick={() => navigate('/qr-generator')}>Go to QR Generator</Button>
          </div>
        </Card>
      )}

      {activeTab === 'settings' && (
        <Card>
          <h3 className="text-lg font-semibold text-surface-100 mb-4">Event Settings</h3>
          <div className="space-y-4 max-w-lg">
            <Input label="Event Name" value={event.name} readOnly />
            <Input label="Date" type="date" value={event.date} readOnly />
            <Input label="Venue" value={event.venue} readOnly />
            <Input label="Google Sheet URL" value={event.sheetUrl || 'Not linked'} readOnly />
          </div>
        </Card>
      )}

      <Modal isOpen={showOnSpotModal} onClose={() => setShowOnSpotModal(false)} title="On-Spot Registration">
        <form onSubmit={handleOnSpotSubmit} className="space-y-4">
          <Input label="Full Name" placeholder="John Doe" value={onSpotForm.fullName} onChange={(e) => setOnSpotForm({ ...onSpotForm, fullName: e.target.value })} required />
          <Input label="Email" type="email" placeholder="john@example.com" value={onSpotForm.email} onChange={(e) => setOnSpotForm({ ...onSpotForm, email: e.target.value })} required />
          <Input label="Phone" placeholder="+91-9876543210" value={onSpotForm.phone} onChange={(e) => setOnSpotForm({ ...onSpotForm, phone: e.target.value })} />
          <Input label="Company" placeholder="Acme Corp" value={onSpotForm.company} onChange={(e) => setOnSpotForm({ ...onSpotForm, company: e.target.value })} />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => setShowOnSpotModal(false)}>Cancel</Button>
            <Button type="submit" icon={<UserPlus className="w-4 h-4" />}>Register</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
