import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, MapPin, Users, MoreVertical, Edit, Trash2, ExternalLink, LayoutGrid, List } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SearchBar } from '@/components/ui/SearchBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { useEvents } from '@/context/EventContext';
import { useToast } from '@/context/AuthContext';
import { formatDate, getStatusColor } from '@/utils/helpers';
import type { Event } from '@/types';

export function Events() {
  const { events, addEvent, deleteEvent } = useEvents();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', date: '', venue: '', description: '', sheetUrl: '', status: 'draft' as Event['status'] });

  const filtered = events.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()) || e.venue.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    addEvent(form);
    setShowCreateModal(false);
    setForm({ name: '', date: '', venue: '', description: '', sheetUrl: '', status: 'draft' });
    addToast('success', 'Event created', `${form.name} has been created successfully.`);
  };

  const handleDelete = (eventId: string, eventName: string) => {
    deleteEvent(eventId);
    setMenuOpen(null);
    addToast('success', 'Event deleted', `${eventName} has been removed.`);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div className="flex items-center gap-4 flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="Search events..." className="max-w-xs" />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-surface-800 rounded-xl p-1">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-surface-700 text-surface-100' : 'text-surface-500'}`}><LayoutGrid className="w-4 h-4" /></button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-surface-700 text-surface-100' : 'text-surface-500'}`}><List className="w-4 h-4" /></button>
          </div>
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowCreateModal(true)}>Create Event</Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No events found" description="Create your first event to get started." action={<Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowCreateModal(true)}>Create Event</Button>} />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((event, idx) => (
            <Card key={event.id} hover className="relative" style={{ animationDelay: `${idx * 60}ms` }} onClick={() => navigate(`/events/${event.id}`)}>
              <div className="absolute top-4 right-4 z-10">
                <button onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === event.id ? null : event.id); }} className="p-1.5 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-700/50 transition-colors cursor-pointer"><MoreVertical className="w-4 h-4" /></button>
                {menuOpen === event.id && (
                  <div className="absolute right-0 mt-1 w-40 glass rounded-xl shadow-xl py-1 animate-fade-in-scale">
                    <button onClick={(e) => { e.stopPropagation(); navigate(`/events/${event.id}`); }} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-surface-300 hover:bg-surface-700/50 cursor-pointer"><Edit className="w-3.5 h-3.5" /> Edit</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(event.id, event.name); }} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-danger-400 hover:bg-danger-500/10 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                  </div>
                )}
              </div>
              <Badge variant={getStatusColor(event.status) as 'success' | 'warning' | 'danger' | 'primary' | 'surface'} dot>{event.status}</Badge>
              <h3 className="text-lg font-semibold text-surface-100 mt-3 mb-2">{event.name}</h3>
              <p className="text-sm text-surface-500 mb-4 line-clamp-2">{event.description}</p>
              <div className="space-y-2 text-sm text-surface-400">
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-surface-500" />{formatDate(event.date)}</div>
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-surface-500" />{event.venue}</div>
                <div className="flex items-center gap-2"><Users className="w-4 h-4 text-surface-500" />{event.attendeeCount || 0} attendees</div>
              </div>
              {event.sheetUrl && (
                <div className="mt-4 pt-4 border-t border-surface-700/50">
                  <a href={event.sheetUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300"><ExternalLink className="w-3 h-3" /> Google Sheet</a>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((event, idx) => (
            <div key={event.id} className="glass rounded-xl p-4 flex items-center gap-4 hover:border-primary-500/30 transition-all cursor-pointer animate-fade-in" style={{ animationDelay: `${idx * 40}ms` }} onClick={() => navigate(`/events/${event.id}`)}>
              <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400 flex-shrink-0"><Calendar className="w-5 h-5" /></div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-surface-200">{event.name}</p>
                <p className="text-xs text-surface-500">{formatDate(event.date)} · {event.venue}</p>
              </div>
              <Badge variant={getStatusColor(event.status) as 'success' | 'warning' | 'danger' | 'primary' | 'surface'} dot>{event.status}</Badge>
              <span className="text-sm text-surface-400">{event.attendeeCount} attendees</span>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(event.id, event.name); }} className="p-2 rounded-lg text-surface-500 hover:text-danger-400 hover:bg-danger-500/10 transition-colors cursor-pointer"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Event" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Event Name" placeholder="Tech Summit 2026" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            <Select label="Status" options={[{ value: 'draft', label: 'Draft' }, { value: 'active', label: 'Active' }, { value: 'completed', label: 'Completed' }]} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Event['status'] })} />
          </div>
          <Input label="Venue" placeholder="Convention Center, Bangalore" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} icon={<MapPin className="w-4 h-4" />} required />
          <Input label="Description" placeholder="Brief description of the event" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Input label="Google Sheet URL" placeholder="https://docs.google.com/spreadsheets/d/..." value={form.sheetUrl} onChange={(e) => setForm({ ...form, sheetUrl: e.target.value })} icon={<ExternalLink className="w-4 h-4" />} />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button type="submit" icon={<Plus className="w-4 h-4" />}>Create Event</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
