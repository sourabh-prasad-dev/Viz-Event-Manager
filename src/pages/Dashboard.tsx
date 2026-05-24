import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, ScanLine, Clock, Plus, ArrowRight, UserPlus, CheckCircle } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { useEvents } from '@/context/EventContext';
import { formatDate } from '@/utils/helpers';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const scanTrendData = [
  { time: '8AM', scans: 12 }, { time: '9AM', scans: 45 }, { time: '10AM', scans: 78 },
  { time: '11AM', scans: 55 }, { time: '12PM', scans: 32 }, { time: '1PM', scans: 28 },
  { time: '2PM', scans: 65 }, { time: '3PM', scans: 42 }, { time: '4PM', scans: 18 },
];

const statusData = [
  { name: 'Approved', value: 382, color: '#22c55e' },
  { name: 'Pending', value: 198, color: '#f59e0b' },
  { name: 'On-Spot', value: 57, color: '#8b5cf6' },
];

const recentActivity = [
  { id: 1, type: 'scan', name: 'Karthik Nair', event: 'Tech Summit 2026', time: '2 min ago', icon: <CheckCircle className="w-4 h-4 text-success-400" /> },
  { id: 2, type: 'register', name: 'Vikram Singh', event: 'Tech Summit 2026', time: '15 min ago', icon: <UserPlus className="w-4 h-4 text-primary-400" /> },
  { id: 3, type: 'scan', name: 'Rahul Verma', event: 'Tech Summit 2026', time: '32 min ago', icon: <CheckCircle className="w-4 h-4 text-success-400" /> },
  { id: 4, type: 'scan', name: 'Aarav Sharma', event: 'Tech Summit 2026', time: '45 min ago', icon: <CheckCircle className="w-4 h-4 text-success-400" /> },
];

const chartTooltipStyle = { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px', color: '#e2e8f0' };

export function Dashboard() {
  const { user } = useAuth();
  const { events, attendees } = useEvents();
  const navigate = useNavigate();

  const totalEvents = events.length;
  const totalAttendees = attendees.length;
  const totalScanned = attendees.filter((a) => a.status === 'Approved').length;
  const totalPending = attendees.filter((a) => a.status === 'Pending').length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page header */}
      <div className="page-header-container">
        <div>
          <h2 className="text-2xl font-bold text-surface-100">Welcome back, {user?.name?.split(' ')[0]} 👋</h2>
          <p className="text-surface-400 text-sm mt-1.5">Here's what's happening with your events today.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" icon={<ScanLine className="w-4 h-4" />} onClick={() => navigate('/scanner')}>Start Scanner</Button>
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/events')}>Create Event</Button>
        </div>
      </div>

      <div className="stat-grid-4col">
        <StatCard title="Total Events" value={totalEvents} icon={<Calendar className="w-5 h-5" />} color="primary" trend={{ value: 12, label: 'from last month' }} />
        <StatCard title="Total Attendees" value={totalAttendees} icon={<Users className="w-5 h-5" />} color="accent" trend={{ value: 24, label: 'from last month' }} />
        <StatCard title="Checked In" value={totalScanned} icon={<ScanLine className="w-5 h-5" />} color="success" trend={{ value: 8, label: 'from yesterday' }} />
        <StatCard title="Pending" value={totalPending} icon={<Clock className="w-5 h-5" />} color="warning" trend={{ value: -5, label: 'from yesterday' }} />
      </div>

      <div className="dashboard-chart-grid">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-surface-100">Scan Activity</h3>
              <p className="text-sm text-surface-500">Hourly check-in trend</p>
            </div>
            <Badge variant="success" dot>Live</Badge>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scanTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scanGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#475569" fontSize={12} />
                <YAxis stroke="#475569" fontSize={12} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Area type="monotone" dataKey="scans" stroke="#6366f1" strokeWidth={2} fill="url(#scanGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-surface-100 mb-2">Status Overview</h3>
          <p className="text-sm text-surface-500 mb-4">Attendee distribution</p>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={48} outerRadius={70} paddingAngle={4} dataKey="value">
                  {statusData.map((entry, index) => (<Cell key={index} fill={entry.color} />))}
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-surface-400">{item.name}</span>
                </div>
                <span className="font-medium text-surface-200">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-7">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-surface-100">Active Events</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/events')}>View All <ArrowRight className="w-3.5 h-3.5" /></Button>
          </div>
          <div className="space-y-3">
            {events.filter((e) => e.status === 'active').slice(0, 3).map((event) => (
              <div key={event.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-800/50 transition-colors cursor-pointer" onClick={() => navigate(`/events/${event.id}`)}>
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400 flex-shrink-0"><Calendar className="w-5 h-5" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-200 truncate">{event.name}</p>
                  <p className="text-xs text-surface-500">{formatDate(event.date)} · {event.venue}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-surface-200">{event.attendeeCount}</p>
                  <p className="text-xs text-surface-500">attendees</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-surface-100">Recent Activity</h3>
            <Badge variant="primary" size="sm">Today</Badge>
          </div>
          <div className="space-y-1">
            {recentActivity.map((a) => (
              <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-800/30 transition-colors">
                <div className="flex-shrink-0">{a.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-surface-200">
                    <span className="font-medium">{a.name}</span>{' '}
                    <span className="text-surface-500">{a.type === 'scan' ? 'checked in at' : 'registered for'}</span>{' '}
                    <span className="text-surface-300">{a.event}</span>
                  </p>
                </div>
                <span className="text-xs text-surface-500 flex-shrink-0">{a.time}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
