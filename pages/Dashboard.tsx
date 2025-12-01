import React from 'react';
import { User, UserRole } from '../types';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Briefcase,
  Activity,
  Building2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';

interface DashboardProps {
  user: User;
}

const StatCard: React.FC<{ 
  title: string; 
  value: string; 
  trend: string; 
  trendUp: boolean; 
  icon: React.ElementType;
  color: string;
}> = ({ title, value, trend, trendUp, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-textMuted mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-textMain">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${color} shadow-sm`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
    <div className="mt-4 flex items-center text-sm">
      <span className={`font-medium ${trendUp ? 'text-success' : 'text-error'}`}>
        {trend}
      </span>
      <span className="text-textMuted ml-2">vs mes anterior</span>
    </div>
  </div>
);

const chartData = [
  { name: 'Ene', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 5000 },
  { name: 'Abr', value: 2780 },
  { name: 'May', value: 1890 },
  { name: 'Jun', value: 2390 },
  { name: 'Jul', value: 3490 },
];

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const isGlobal = user.role === UserRole.ADMIN_GLOBAL;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-textMain">
            {isGlobal ? 'Plataforma Global (SaaS Master)' : `Dashboard de ${user.name}`}
          </h1>
          <p className="text-textMuted mt-1">
            {isGlobal 
              ? 'Vista maestra de todos los tenants y métricas de suscripción.' 
              : `Gestionando Studio ID: ${user.studio_id} | Plan Studio Pro`}
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-textMuted">
          {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={isGlobal ? "MRR (Ingresos Recurrentes)" : "Presupuesto Activo"}
          value={isGlobal ? "$124,500" : "$45,200"}
          trend="+12.5%"
          trendUp={true}
          icon={DollarSign}
          color="bg-success"
        />
        <StatCard 
          title={isGlobal ? "Total Estudios (Tenants)" : "Proyectos en Curso"}
          value={isGlobal ? "124" : "8"}
          trend={isGlobal ? "+12 nuevos" : "+2 este mes"}
          trendUp={true}
          icon={isGlobal ? Building2 : Briefcase}
          color="bg-primary"
        />
        <StatCard 
          title={isGlobal ? "Usuarios Totales" : "Tareas Pendientes"}
          value={isGlobal ? "1,240" : "34"}
          trend="-2%"
          trendUp={false}
          icon={Users}
          color="bg-secondary"
        />
        <StatCard 
          title="Tasa de Eficiencia"
          value="94%"
          trend="+1.2%"
          trendUp={true}
          icon={isGlobal ? Activity : TrendingUp}
          color="bg-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-textMain mb-6">
            {isGlobal ? 'Crecimiento de Suscripciones' : 'Avance Financiero de Proyectos'}
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5B4FFF" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#5B4FFF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                />
                <Area type="monotone" dataKey="value" stroke="#5B4FFF" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-textMain mb-6">
            {isGlobal ? 'Distribución de Planes' : 'Estado de Tareas'}
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} hide />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                <Tooltip 
                  cursor={{fill: '#F3F4F6'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                />
                <Bar dataKey="value" fill="#FF6B35" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
