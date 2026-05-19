import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'accent';
}

export function StatCard({ title, value, icon, trend, color = 'primary' }: StatCardProps) {
  const colorMap: Record<string, { bg: string; text: string; glow: string }> = {
    primary: { bg: 'bg-primary-500/10', text: 'text-primary-400', glow: 'shadow-primary-500/10' },
    success: { bg: 'bg-success-500/10', text: 'text-success-400', glow: 'shadow-success-500/10' },
    warning: { bg: 'bg-warning-500/10', text: 'text-warning-400', glow: 'shadow-warning-500/10' },
    danger: { bg: 'bg-danger-500/10', text: 'text-danger-400', glow: 'shadow-danger-500/10' },
    accent: { bg: 'bg-accent-500/10', text: 'text-accent-400', glow: 'shadow-accent-500/10' },
  };

  const colors = colorMap[color];

  return (
    <div className={`glass rounded-2xl p-6 hover:shadow-lg ${colors.glow} transition-all duration-300 group`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${colors.bg} ${colors.text} group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              trend.value > 0 ? 'text-success-400' : trend.value < 0 ? 'text-danger-400' : 'text-surface-400'
            }`}
          >
            {trend.value > 0 ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : trend.value < 0 ? (
              <TrendingDown className="w-3.5 h-3.5" />
            ) : (
              <Minus className="w-3.5 h-3.5" />
            )}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-surface-100">{value}</p>
        <p className="text-sm text-surface-400">{title}</p>
      </div>
      {trend && (
        <p className="text-xs text-surface-500 mt-2">{trend.label}</p>
      )}
    </div>
  );
}
