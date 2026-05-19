import React, { useState, useEffect } from 'react';
import { Shield, Users, Key, Info, Plus, Edit, Trash2, Save, Loader2 } from 'lucide-react';
import * as api from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { DataTable } from '@/components/ui/Table';
import { useAuth, useToast } from '@/context/AuthContext';
import type { User, UserRole } from '@/types';
import { generateId, capitalize } from '@/utils/helpers';

const DEMO_USERS: User[] = [
  { id: 'usr_001', name: 'Saurabh Admin', email: 'admin@vizevent.com', role: 'super_admin', assignedEvents: [] },
  { id: 'usr_002', name: 'Event Manager', email: 'manager@vizevent.com', role: 'event_admin', assignedEvents: ['evt_001', 'evt_002'] },
  { id: 'usr_003', name: 'Gate Scanner', email: 'scanner@vizevent.com', role: 'scanner', assignedEvents: ['evt_001'] },
];

export function Settings() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<User[]>(DEMO_USERS);
  const [loading, setLoading] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userForm, setUserForm] = useState({ name: '', email: '', role: 'event_admin' as UserRole, password: '' });
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_GAS_URL || '');
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_API_KEY || '');

  const isApiConfigured = import.meta.env.VITE_GAS_URL && import.meta.env.VITE_GAS_URL !== 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

  useEffect(() => {
    async function loadUsers() {
      if (isApiConfigured && activeTab === 'users') {
        setLoading(true);
        const res = await api.getUsers();
        if (res.status === 'success' && res.data) {
          setUsers(res.data);
        }
        setLoading(false);
      }
    }
    loadUsers();
  }, [activeTab, isApiConfigured]);

  const tabs = [
    { key: 'users', label: 'User Management', icon: <Users className="w-4 h-4" /> },
    { key: 'profile', label: 'Profile', icon: <Shield className="w-4 h-4" /> },
    { key: 'api', label: 'API Configuration', icon: <Key className="w-4 h-4" /> },
    { key: 'about', label: 'About', icon: <Info className="w-4 h-4" /> },
  ];

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isApiConfigured) {
      const res = await api.createUser({ name: userForm.name, email: userForm.email, role: userForm.role, assignedEvents: [], password: userForm.password });
      if (res.status === 'success' && res.data) {
        setUsers([...users, res.data]);
        addToast('success', 'User created', `${userForm.name} has been added.`);
      } else {
        addToast('error', 'Error', res.message || 'Failed to create user');
      }
    } else {
      const newUser: User = { id: 'usr_' + generateId(), name: userForm.name, email: userForm.email, role: userForm.role, assignedEvents: [] };
      setUsers([...users, newUser]);
      addToast('success', 'User created', `${userForm.name} has been added.`);
    }
    setShowUserModal(false);
    setUserForm({ name: '', email: '', role: 'event_admin', password: '' });
  };

  const handleDeleteUser = async (userId: string) => {
    if (isApiConfigured) {
      const res = await api.deleteUser(userId);
      if (res.status === 'success') {
        setUsers(users.filter((u) => u.id !== userId));
        addToast('success', 'User removed');
      } else {
        addToast('error', 'Error', res.message || 'Failed to remove user');
      }
    } else {
      setUsers(users.filter((u) => u.id !== userId));
      addToast('success', 'User removed');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPass !== passwordForm.confirm) {
      addToast('error', 'Passwords do not match');
      return;
    }
    
    if (isApiConfigured) {
      const res = await api.changePassword(passwordForm.current, passwordForm.newPass);
      if (res.status === 'success') {
        setPasswordForm({ current: '', newPass: '', confirm: '' });
        addToast('success', 'Password updated');
      } else {
        addToast('error', 'Error', res.message || 'Failed to update password');
      }
    } else {
      setPasswordForm({ current: '', newPass: '', confirm: '' });
      addToast('success', 'Password updated');
    }
  };

  const roleColors: Record<string, 'primary' | 'success' | 'warning'> = { super_admin: 'primary', event_admin: 'success', scanner: 'warning' };

  const userColumns = [
    { key: 'name', header: 'Name', sortable: true, render: (u: User) => <span className="font-medium text-surface-100">{u.name}</span> },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'role', header: 'Role', render: (u: User) => <Badge variant={roleColors[u.role] || 'surface'}>{u.role.replace('_', ' ')}</Badge> },
    { key: 'actions', header: '', width: '80px', render: (u: User) => (
      <button onClick={() => handleDeleteUser(u.id)} className="p-1.5 rounded-lg text-surface-500 hover:text-danger-400 hover:bg-danger-500/10 transition-colors cursor-pointer" title="Delete user"><Trash2 className="w-4 h-4" /></button>
    )},
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-wrap items-center gap-1 bg-surface-800/50 rounded-xl p-1 w-fit">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${activeTab === tab.key ? 'gradient-primary text-white' : 'text-surface-400 hover:text-surface-200'}`}>
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-surface-100 flex items-center gap-2">
              User Management
              {loading && <Loader2 className="w-4 h-4 animate-spin text-surface-400" />}
            </h3>
            <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowUserModal(true)}>Add User</Button>
          </div>
          <DataTable columns={userColumns} data={users} keyExtractor={(item: any) => item.id} emptyMessage="No users found." />
          <Modal isOpen={showUserModal} onClose={() => setShowUserModal(false)} title="Add New User">
            <form onSubmit={handleCreateUser} className="space-y-4">
              <Input label="Full Name" placeholder="John Doe" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} required />
              <Input label="Email" type="email" placeholder="john@vizevent.com" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} required />
              <Select label="Role" options={[{ value: 'super_admin', label: 'Super Admin' }, { value: 'event_admin', label: 'Event Admin' }, { value: 'scanner', label: 'Scanner Operator' }]} value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value as UserRole })} />
              <Input label="Password" type="password" placeholder="Set initial password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} required />
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="secondary" type="button" onClick={() => setShowUserModal(false)}>Cancel</Button>
                <Button type="submit" icon={<Plus className="w-4 h-4" />}>Create User</Button>
              </div>
            </form>
          </Modal>
        </div>
      )}

      {activeTab === 'profile' && (
        <Card className="max-w-lg">
          <h3 className="text-lg font-semibold text-surface-100 mb-6">Change Password</h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <Input label="Current Password" type="password" value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} required />
            <Input label="New Password" type="password" value={passwordForm.newPass} onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })} required />
            <Input label="Confirm New Password" type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} required />
            <Button type="submit" icon={<Save className="w-4 h-4" />}>Update Password</Button>
          </form>
        </Card>
      )}

      {activeTab === 'api' && (
        <Card className="max-w-lg">
          <h3 className="text-lg font-semibold text-surface-100 mb-6">API Configuration</h3>
          <div className="space-y-4">
            <Input label="Google Apps Script URL" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} placeholder="https://script.google.com/macros/s/..." />
            <Input label="API Key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Your API key" />
            <p className="text-xs text-surface-500">These values are configured via environment variables (.env file). Changes here are for display only.</p>
            <Button variant="secondary" icon={<Save className="w-4 h-4" />} onClick={() => addToast('info', 'Configuration note', 'Update your .env file and restart the dev server to apply changes.')}>Save Configuration</Button>
          </div>
        </Card>
      )}

      {activeTab === 'about' && (
        <Card className="max-w-lg">
          <h3 className="text-lg font-semibold text-surface-100 mb-4">About VizEvent</h3>
          <div className="space-y-3 text-sm text-surface-400">
            <p><span className="text-surface-200 font-medium">Version:</span> 1.0.0</p>
            <p><span className="text-surface-200 font-medium">Stack:</span> React + Tailwind CSS + Google Apps Script</p>
            <p><span className="text-surface-200 font-medium">Description:</span> Event Management & QR Ticketing Platform</p>
            <div className="pt-4 border-t border-surface-700/50">
              <p className="text-surface-500">Built with ❤️ for seamless event management.</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
