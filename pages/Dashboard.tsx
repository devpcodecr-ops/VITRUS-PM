import React, { useEffect, useState } from 'react';
import { User, UserRole } from '../types';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Briefcase,
  Activity,
  Building2,
  Loader2,
  UserMinus,
  PlusCircle,
  PieChart as PieChartIcon
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import { getGlobalStats, getStudioStats } from '../services/dashboardService';

interface DashboardProps {
  user: User;
}

const StatCard: React.FC<{ 
  title: string; 
  value: string; 
  trend?: string; 
  trendUp?: boolean; 
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
    {trend && (
      <div className="mt-4 flex items-center text-sm">
        <span className={`font-medium ${trendUp ? 'text-success' : 'text-error'}`}>
          {trend}
        </span>
        <span className="text-textMuted ml-2">{trendUp ? 'incremento' : 'decremento'}</span>
      </div>
    )}
  </div>
);

// Colors for charts
const COLORS = ['#5B4FFF', '#FF6B35', '#10B981', '#F59E0B'];

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
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (isGlobal) {
          const data = await getGlobalStats();
          setStats(data);
        } else {
          const data = await getStudioStats();
          setStats(data);
        }
      } catch (error) {
        console.error("Error loading dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [isGlobal]);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

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
              : `Gestionando Studio ID: ${user.studio_id} | Visión General`}
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={isGlobal ? "MRR (Ingresos Recurrentes)" : "Presupuesto Total"}
          value={`$${(isGlobal ? stats?.mrr : stats?.budget)?.toLocaleString()}`}
          trend="+12.5%"
          trendUp={true}
          icon={DollarSign}
          color="bg-success"
        />
        <StatCard 
          title={isGlobal ? "Estudios Activos" : "Proyectos Totales"}
          value={isGlobal ? stats?.activeStudios : stats?.projectsCount}
          icon={isGlobal ? Building2 : Briefcase}
          color="bg-primary"
        />
        <StatCard 
          title={isGlobal ? "Usuarios Totales" : "Mi Equipo"}
          value={isGlobal ? stats?.totalUsers : stats?.usersCount}
          trend="+2%"
          trendUp={true}
          icon={Users}
          color="bg-secondary"
        />
        
        {isGlobal ? (
             <StatCard 
              title="Churn Rate (Cancelaciones)"
              value={`${stats?.churnRate}%`}
              trend="-0.5%"
              trendUp={true} // Lower churn is good
              icon={UserMinus}
              color="bg-red-500"
            />
        ) : (
            <StatCard 
              title="Proyectos Activos"
              value={stats?.activeProjects}
              icon={Activity}
              color="bg-blue-500"
            />
        )}
      </div>

      {isGlobal && (
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <StatCard 
                title="Nuevas Suscripciones (30d)"
                value={stats?.newSubscriptions || 0}
                icon={PlusCircle}
                color="bg-indigo-500"
              />
         </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-textMain mb-6">
            {isGlobal ? 'Crecimiento de Suscripciones' : 'Actividad Financiera'}
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

        {/* Secondary Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-textMain mb-6">
            {isGlobal ? 'Ingresos por Plan' : 'Tareas Semanales'}
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {isGlobal && stats?.revenueByPlan ? (
                <PieChart>
                  <Pie
                    data={stats.revenueByPlan}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.revenueByPlan.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  <Legend />
                </PieChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" hide />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                  <Tooltip cursor={{fill: '#F3F4F6'}} />
                  <Bar dataKey="value" fill="#FF6B35" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
