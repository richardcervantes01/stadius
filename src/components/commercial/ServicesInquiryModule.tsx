import React, { useState } from 'react';
import {
  Search,
  Warehouse,
  Building,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  Percent,
  Calendar,
  Layers,
  ShieldCheck,
  Filter,
  DollarSign
} from 'lucide-react';
import { ContractedService, ClientAccount, User } from '../../types/inventory';

interface ServicesInquiryModuleProps {
  services: ContractedService[];
  clients: ClientAccount[];
  currentUser: User;
}

export const ServicesInquiryModule: React.FC<ServicesInquiryModuleProps> = ({
  services,
  clients,
  currentUser,
}) => {
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('ALL');
  const [selectedClient, setSelectedClient] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Total warehouse capacity calculation
  const totalContractedPallets = services.reduce((acc, s) => acc + s.contractedPallets, 0);
  const totalOccupiedPallets = services.reduce((acc, s) => acc + s.occupiedPallets, 0);
  const totalAvailablePallets = Math.max(0, totalContractedPallets - totalOccupiedPallets);
  const avgOccupancy = totalContractedPallets > 0 ? ((totalOccupiedPallets / totalContractedPallets) * 100).toFixed(1) : '0';

  // Filtered services
  const filteredServices = services.filter(s => {
    const matchesWarehouse = selectedWarehouse === 'ALL' || s.warehouse === selectedWarehouse;
    const matchesClient = selectedClient === 'ALL' || s.clientName === selectedClient;
    const matchesSearch = 
      s.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.serviceType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesWarehouse && matchesClient && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Search className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Módulo Comercial · Consultas de Servicios & Disponibilidad
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Verificación en tiempo real del estado de servicios contratados, disponibilidad de espacios y cumplimiento de SLA logísticos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-mono font-bold text-slate-700">Telemetría de Ocupación Online</span>
        </div>
      </div>

      {/* Warehouse Capacity Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Espacios Contratados</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalContractedPallets}</div>
          <span className="text-[11px] text-slate-500">Pallets posición garantizada</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Pallets Ocupados</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{totalOccupiedPallets}</div>
          <span className="text-[11px] text-slate-500">En racks y piso de almacenaje</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Espacio Disponible</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{totalAvailablePallets}</div>
          <span className="text-[11px] text-emerald-700">Pallets libres para asignación</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Ocupación Global</span>
          <div className="text-2xl font-black text-sky-600 mt-1">{avgOccupancy}%</div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
            <div className="h-full bg-sky-500 rounded-full" style={{ width: `${avgOccupancy}%` }} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar servicio o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium focus:outline-none"
            >
              <option value="ALL">Todas las Bodegas</option>
              <option value="B01 - Bodega Central">B01 - Bodega Central</option>
              <option value="B02 - Cadena Frío">B02 - Cadena Frío</option>
            </select>

            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium focus:outline-none"
            >
              <option value="ALL">Todos los Clientes</option>
              {clients.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <span className="text-xs text-slate-400 font-mono">
          {filteredServices.length} contratos auditados
        </span>
      </div>

      {/* Detailed Services Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredServices.map(srv => {
          const availableClientPallets = srv.contractedPallets - srv.occupiedPallets;
          const isCapacityWarning = srv.occupancyPercent >= 85;

          return (
            <div
              key={srv.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs space-y-4 transition-all hover:shadow-md ${
                isCapacityWarning ? 'border-amber-300' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-black text-slate-900 tracking-tight">{srv.clientName}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{srv.serviceType}</div>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                  srv.status === 'ACTIVO'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {srv.status}
                </span>
              </div>

              {/* Warehouse & Contract Dates */}
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block font-medium">Bodega Asignada</span>
                  <span className="font-bold text-slate-800">{srv.warehouse}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Vigencia Contrato</span>
                  <span className="font-mono text-slate-700">{srv.contractStart} al {srv.contractEnd}</span>
                </div>
              </div>

              {/* Space Occupancy Meter */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Ocupación de Espacios:</span>
                  <span className="font-mono font-black text-slate-900">{srv.occupancyPercent}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      srv.occupancyPercent > 90
                        ? 'bg-rose-500'
                        : srv.occupancyPercent > 80
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, srv.occupancyPercent)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Ocupados: <strong>{srv.occupiedPallets} plts</strong></span>
                  <span>Contratados: <strong>{srv.contractedPallets} plts</strong></span>
                  <span className="text-emerald-600 font-bold">Libres: {availableClientPallets}</span>
                </div>
              </div>

              {/* Agreed Rates & SLA */}
              <div className="border-t border-slate-100 pt-3 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Tarifa Almacenaje</span>
                  <span className="font-mono font-bold text-slate-900">${srv.dailyStorageRate.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-400"> / pallet / día</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Tarifa Manipuleo</span>
                  <span className="font-mono font-bold text-slate-900">${srv.handlingRatePerPallet.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-400"> / pallet mov.</span>
                </div>
              </div>

              {/* SLA Compliance Gauge */}
              <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium text-slate-700">Cumplimiento SLA:</span>
                </div>
                <div className="font-mono font-bold text-slate-900">
                  {srv.slaCurrentPercent}% <span className="text-slate-400 text-[10px] font-normal">(Meta: {srv.slaTargetPercent}%)</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
