import React, { useState } from 'react';
import { Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SearchBar } from '@/components/ui/SearchBar';
import { Select } from '@/components/ui/Select';
import { DataTable } from '@/components/ui/Table';
import { useEvents } from '@/context/EventContext';
import { useToast } from '@/context/AuthContext';
import { formatDateTime, getStatusColor } from '@/utils/helpers';
import type { Attendee } from '@/types';

export function Attendees() {
  const { events, attendees } = useEvents();
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = attendees.filter((a) => {
    const matchSearch = a.fullName.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase()) || a.company.toLowerCase().includes(search.toLowerCase());
    const matchEvent = eventFilter === 'all' || a.eventId === eventFilter;
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchEvent && matchStatus;
  });

  const eventOptions = [{ value: 'all', label: 'All Events' }, ...events.map((e) => ({ value: e.id, label: e.name }))];
  const statusOptions = [{ value: 'all', label: 'All Status' }, { value: 'Pending', label: 'Pending' }, { value: 'Approved', label: 'Approved' }, { value: 'Rejected', label: 'Rejected' }];

  const handleExport = () => {
    const csv = ['Registration ID,Name,Email,Phone,Company,Event,Status,Scan Time,Walk-in'];
    filtered.forEach((a) => {
      const eventName = events.find((e) => e.id === a.eventId)?.name || '';
      csv.push(`${a.registrationId},${a.fullName},${a.email},${a.phone},${a.company},${eventName},${a.status},${a.scanTime},${a.addedOnSpot}`);
    });
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'attendees_export.csv';
    link.click();
    URL.revokeObjectURL(url);
    addToast('success', 'Export complete', `${filtered.length} attendees exported to CSV.`);
  };

  const columns = [
    {
      key: 'registrationId',
      header: 'Reg. ID',
      sortable: true,
      width: '120px',
      render: (a: Attendee) => (
        <span
          className="font-mono text-xs text-surface-400 select-all truncate block max-w-[110px]"
          title={a.registrationId}
        >
          {a.registrationId}
        </span>
      ),
    },
    { key: 'fullName', header: 'Name', sortable: true, render: (a: Attendee) => <span className="font-medium text-surface-100">{a.fullName}</span> },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'phone', header: 'Phone' },
    { key: 'company', header: 'Company', sortable: true },
    { key: 'eventId', header: 'Event', render: (a: Attendee) => <span className="text-surface-400">{events.find((e) => e.id === a.eventId)?.name || '—'}</span> },
    { key: 'status', header: 'Status', sortable: true, render: (a: Attendee) => <Badge variant={getStatusColor(a.status) as 'success' | 'warning' | 'danger' | 'primary' | 'surface'} dot>{a.status}</Badge> },
    { key: 'addedOnSpot', header: 'Type', render: (a: Attendee) => a.addedOnSpot ? <Badge variant="primary" size="sm">Walk-in</Badge> : <span className="text-surface-500">Pre-reg</span> },
    { key: 'scanTime', header: 'Scan Time', render: (a: Attendee) => <span className="text-surface-400 text-xs">{a.scanTime ? formatDateTime(a.scanTime) : '—'}</span> },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Filters bar */}
      <div className="page-header-container">
        <div className="flex flex-wrap items-center gap-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Search attendees..." className="w-64" />
          <Select options={eventOptions} value={eventFilter} onChange={(e) => setEventFilter(e.target.value)} />
          <Select options={statusOptions} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} />
        </div>
        <Button variant="secondary" icon={<Download className="w-4 h-4" />} onClick={handleExport}>Export CSV</Button>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <span className="font-medium text-surface-300">{filtered.length} attendees</span>
        <span className="text-surface-700">·</span>
        <span className="text-success-400 font-medium">{filtered.filter((a) => a.status === 'Approved').length} checked in</span>
        <span className="text-surface-700">·</span>
        <span className="text-warning-400 font-medium">{filtered.filter((a) => a.status === 'Pending').length} pending</span>
      </div>

      <DataTable columns={columns} data={filtered} keyExtractor={(item: any) => item.registrationId} emptyMessage="No attendees match your filters." pageSize={15} />
    </div>
  );
}
