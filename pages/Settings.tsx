import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { getSettings, updateSettings } from '../services/settingsService';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getSettings();
      setSettings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await updateSettings(settings);
      setMessage('Configuración actualizada correctamente');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textMain flex items-center gap-2">
            <SettingsIcon className="text-gray-600" /> Configuración Global
          </h1>
          <p className="text-textMuted mt-1">Ajustes generales de la plataforma SaaS.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-8">
        {/* Branding */}
        <div>
          <h3 className="text-lg font-bold text-textMain mb-4 border-b pb-2">Identidad & Branding</h3>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre de Plataforma</label>
              <input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" 
                value={settings['platform_name'] || ''} onChange={e => handleChange('platform_name', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email de Soporte</label>
              <input type="email" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" 
                value={settings['support_email'] || ''} onChange={e => handleChange('support_email', e.target.value)} />
            </div>
          </div>
        </div>

        {/* API Keys */}
        <div>
          <h3 className="text-lg font-bold text-textMain mb-4 border-b pb-2">Integraciones (API Keys)</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Stripe Secret Key</label>
              <input type="password" placeholder="sk_live_..." className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-gray-50" 
                value={settings['stripe_key'] || ''} onChange={e => handleChange('stripe_key', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SendGrid API Key</label>
              <input type="password" placeholder="SG...." className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-gray-50" 
                value={settings['sendgrid_key'] || ''} onChange={e => handleChange('sendgrid_key', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">AWS S3 Access Key</label>
              <input type="password" placeholder="AKIA..." className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-gray-50" 
                value={settings['aws_key'] || ''} onChange={e => handleChange('aws_key', e.target.value)} />
            </div>
          </div>
        </div>

        {/* System */}
        <div>
          <h3 className="text-lg font-bold text-textMain mb-4 border-b pb-2">Sistema</h3>
          <div className="flex items-center gap-4">
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" 
                checked={settings['maintenance_mode'] === 'true'} 
                onChange={e => handleChange('maintenance_mode', e.target.checked ? 'true' : 'false')} />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              <span className="ms-3 text-sm font-medium text-gray-900">Modo Mantenimiento</span>
            </label>
            <p className="text-xs text-textMuted">Si se activa, solo los administradores podrán acceder.</p>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          {message && <span className="mr-4 text-success font-medium self-center">{message}</span>}
          <Button type="submit" isLoading={saving}>
            <Save size={18} className="mr-2" /> Guardar Configuración
          </Button>
        </div>
      </form>
    </div>
  );
};
