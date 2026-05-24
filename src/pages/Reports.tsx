import React, { useState, useMemo } from 'react';
import { Download, Printer } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { StatCard } from '@/components/ui/StatCard';
import { useEvents } from '@/context/EventContext';
import { useToast } from '@/context/AuthContext';
import { Users, ScanLine, Clock, UserPlus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const chartTooltipStyle = { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px', color: '#e2e8f0' };

export function Reports() {
  const { events, attendees } = useEvents();
  const { addToast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState('all');

  const eventOptions = [{ value: 'all', label: 'All Events' }, ...events.map((e) => ({ value: e.id, label: e.name }))];

  const filtered = useMemo(() => {
    if (selectedEvent === 'all') return attendees;
    return attendees.filter((a) => a.eventId === selectedEvent);
  }, [attendees, selectedEvent]);

  const totalRegistered = filtered.length;
  const totalCheckedIn = filtered.filter((a) => a.status === 'Approved').length;
  const totalPending = filtered.filter((a) => a.status === 'Pending').length;
  const totalOnSpot = filtered.filter((a) => a.addedOnSpot).length;

  const statusData = [
    { name: 'Checked In', value: totalCheckedIn, color: '#22c55e' },
    { name: 'Pending', value: totalPending, color: '#f59e0b' },
    { name: 'On-Spot', value: totalOnSpot, color: '#8b5cf6' },
  ].filter((d) => d.value > 0);

  const eventComparisonData = events.map((e) => {
    const eventAttendees = attendees.filter((a) => a.eventId === e.id);
    return {
      name: e.name.length > 15 ? e.name.substring(0, 15) + '...' : e.name,
      registered: eventAttendees.length,
      checkedIn: eventAttendees.filter((a) => a.status === 'Approved').length,
    };
  });

  const handleExport = () => {
    const csv = ['Registration ID,Name,Email,Phone,Company,Status,Scan Time,Walk-in'];
    filtered.forEach((a) => csv.push(`${a.registrationId},${a.fullName},${a.email},${a.phone},${a.company},${a.status},${a.scanTime},${a.addedOnSpot}`));
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'report_export.csv';
    link.click();
    URL.revokeObjectURL(url);
    addToast('success', 'Report exported', `${filtered.length} records exported.`);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page header */}
      <div className="page-header-container">
        <Select options={eventOptions} value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)} />
        <div className="flex gap-3">
          <Button variant="secondary" icon={<Printer className="w-4 h-4" />} onClick={() => window.print()}>Print</Button>
          <Button icon={<Download className="w-4 h-4" />} onClick={handleExport}>Export CSV</Button>
        </div>
      </div>

      <div className="stat-grid-4col">
        <StatCard title="Total Registered" value={totalRegistered} icon={<Users className="w-5 h-5" />} color="primary" />
        <StatCard title="Checked In" value={totalCheckedIn} icon={<ScanLine className="w-5 h-5" />} color="success" />
        <StatCard title="Pending / No-show" value={totalPending} icon={<Clock className="w-5 h-5" />} color="warning" />
        <StatCard title="On-Spot" value={totalOnSpot} icon={<UserPlus className="w-5 h-5" />} color="accent" />
      </div>

      <div className="content-grid-2col">
        <Card>
          <h3 className="text-lg font-semibold text-surface-100 mb-1">Event Comparison</h3>
          <p className="text-sm text-surface-500 mb-4">Registered vs Checked In per event</p>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#475569" fontSize={11} />
                <YAxis stroke="#475569" fontSize={12} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                <Bar dataKey="registered" fill="#6366f1" radius={[4, 4, 0, 0]} name="Registered" />
                <Bar dataKey="checkedIn" fill="#22c55e" radius={[4, 4, 0, 0]} name="Checked In" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-surface-100 mb-1">Status Distribution</h3>
          <p className="text-sm text-surface-500 mb-4">Breakdown of attendee statuses</p>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={(props: any) => `${props.name || ''} ${((props.percent || 0) * 100).toFixed(0)}%`}>
                  {statusData.map((entry, index) => (<Cell key={index} fill={entry.color} />))}
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Check-in rate */}
      <Card>
        <h3 className="text-lg font-semibold text-surface-100 mb-4">Check-in Rate</h3>
        <div className="space-y-4">
          {events.map((event) => {
            const eventAttendees = attendees.filter((a) => a.eventId === event.id);
            const checked = eventAttendees.filter((a) => a.status === 'Approved').length;
            const total = eventAttendees.length || 1;
            const pct = Math.round((checked / total) * 100);
            return (
              <div key={event.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-surface-300">{event.name}</span>
                  <span className="text-surface-400">{checked}/{eventAttendees.length} ({pct}%)</span>
                </div>
                <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
                  <div className="h-full gradient-primary rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
