import React from 'react';
import { Warehouse, Layers } from 'lucide-react';

interface Props {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export const GenericOperationsModule: React.FC<Props> = ({ title, description, icon = <Warehouse className="w-8 h-8 text-amber-500" /> }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in fade-in duration-300">
      <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">{title}</h2>
      <p className="text-slate-500 max-w-md">{description}</p>
      <div className="mt-8 px-4 py-2 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg border border-amber-200">
        Módulo en fase de implementación
      </div>
    </div>
  );
};
