import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
}

export const StatCard = ({ title, value, icon: Icon, trend }: StatCardProps) => (
  <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
        {trend && <span className="text-xs text-green-500">{trend}</span>}
      </div>
      <Icon className="text-lux-accent" size={24} />
    </div>
  </div>
);