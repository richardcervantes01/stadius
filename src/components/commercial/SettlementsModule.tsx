import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  DollarSign,
  Printer,
  Calendar,
  Building,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck,
  CreditCard,
  Download
} from 'lucide-react';
import { LogisticsSettlement, ClientAccount, User } from '../../types/inventory';

interface SettlementsModuleProps {
  settlements: LogisticsSettlement[];
  clients: ClientAccount[];
  currentUser: User;
  onSaveSettlement: (settlement: LogisticsSettlement) => void;
  onUpdateSettlementStatus: (settlementId: string, status: LogisticsSettlement['status']) => void;
}

export const SettlementsModule: React.FC<SettlementsModuleProps> = ({
  settlements,
  clients,
  currentUser,
  onSaveSettlement,
  onUpdateSettlementStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [clientFilter, setClientFilter] = useState<string>('ALL');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedSettlementForView, setSelectedSettlementForView] = useState<LogisticsSettlement | null>(null);

  // New Settlement Form State
  const [newClientName, setNewClientName] = useState(clients[0]?.name || 'Retail Pro S.A.');
  const [newPeriod, setNewPeriod] = useState('2026-10');
  const [newStartDate, setNewStartDate] = useState('2026-10-01');
  const [newEndDate, setNewEndDate] = useState('2026-10-31');
  const [newPalletDays, setNewPalletDays] = useState(11500);
  const [newStorageRate, setNewStorageRate] = useState(0.45);
  const [newInboundPallets, setNewInboundPallets] = useState(280);
  const [newInboundRate, setNewInboundRate] = useState(4.20);
  const [newOutboundPallets, setNewOutboundPallets] = useState(260);
  const [newOutboundRate, setNewOutboundRate] = useState(3.80);
  const [newExtraServicesAmount, setNewExtraServicesAmount] = useState(180.00);

  // Calculations
  const calculatedStorageAmount = Number((newPalletDays * newStorageRate).toFixed(2));
  const calculatedInboundAmount = Number((newInboundPallets * newInboundRate).toFixed(2));
  const calculatedOutboundAmount = Number((newOutboundPallets * newOutboundRate).toFixed(2));
  const calculatedSubtotal = Number(
    (calculatedStorageAmount + calculatedInboundAmount + calculatedOutboundAmount + newExtraServicesAmount).toFixed(2)
  );
  const calculatedTax = Number((calculatedSubtotal * 0.19).toFixed(2));
  const calculatedTotal = Number((calculatedSubtotal + calculatedTax).toFixed(2));

  const handleGenerateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newSettlement: LogisticsSettlement = {
      id: `LIQ-${newPeriod}-${String(settlements.length + 1).padStart(2, '0')}`,
      settlementNumber: `LIQ-${newPeriod}-${String(settlements.length + 1).padStart(2, '0')}`,
      tenantId: 'TNT-STADIUS-01',
      clientName: newClientName,
      period: newPeriod,
      startDate: newStartDate,
      endDate: newEndDate,
      palletDays: newPalletDays,
      storageAmount: calculatedStorageAmount,
      inboundPallets: newInboundPallets,
      inboundAmount: calculatedInboundAmount,
      outboundPallets: newOutboundPallets,
      outboundAmount: calculatedOutboundAmount,
      extraServicesAmount: newExtraServicesAmount,
      subtotal: calculatedSubtotal,
      tax: calculatedTax,
      total: calculatedTotal,
      status: 'GENERADA',
      createdAt: new Date().toISOString().substring(0, 10),
      reviewedBy: currentUser.name,
    };

    onSaveSettlement(newSettlement);
    setShowGenerateModal(false);
  };

  // Filtered list
  const filteredSettlements = settlements.filter(s => {
    const matchesSearch = 
      s.settlementNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    const matchesClient = clientFilter === 'ALL' || s.clientName === clientFilter;
    return matchesSearch && matchesStatus && matchesClient;
  });

  const totalSettledAmount = settlements.reduce((acc, s) => acc + s.total, 0);
  const totalBilledAmount = settlements.filter(s => s.status === 'FACTURADA' || s.status === 'PAGADA').reduce((acc, s) => acc + s.total, 0);

  const statusBadges: Record<LogisticsSettlement['status'], { label: string; color: string; icon: any }> = {
    GENERADA: { label: 'Generada', color: 'bg-slate-100 text-slate-700 border-slate-300', icon: Clock },
    REVISADA: { label: 'Revisada', color: 'bg-sky-50 text-sky-700 border-sky-300', icon: FileCheck },
    FACTURADA: { label: 'Facturada', color: 'bg-amber-50 text-amber-700 border-amber-300', icon: CreditCard },
    PAGADA: { label: 'Pagada', color: 'bg-emerald-50 text-emerald-700 border-emerald-300', icon: CheckCircle2 },
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Receipt className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Módulo Comercial · Liquidaciones Operativas & Cobros
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Cálculo y conciliación de cobros logísticos por días de estadía (pallet-días), manipuleo de entrada/salida y servicios extraordinarios.
          </p>
        </div>

        <button
          onClick={() => setShowGenerateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Generar Liquidación</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Liquidaciones</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{settlements.length}</div>
          <span className="text-[11px] text-slate-500">Periodos generados</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Monto Total Liquidado</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            ${totalSettledAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-500">Cobros acumulados</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Facturado / Cobrado</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            ${totalBilledAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-emerald-700">Facturación procesada</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Pendientes de Facturación</span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            ${(totalSettledAmount - totalBilledAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-amber-700">Por conciliar</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por liquidación o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium focus:outline-none"
            >
              <option value="ALL">Todos los Estados</option>
              <option value="GENERADA">Generada</option>
              <option value="REVISADA">Revisada</option>
              <option value="FACTURADA">Facturada</option>
              <option value="PAGADA">Pagada</option>
            </select>

            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
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
          {filteredSettlements.length} liquidaciones
        </span>
      </div>

      {/* Settlements Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3 px-4">N° Liquidación</th>
                <th className="py-3 px-4">Cliente / Cuenta</th>
                <th className="py-3 px-4">Periodo</th>
                <th className="py-3 px-4 text-right">Pallet-Días</th>
                <th className="py-3 px-4 text-right">Almacenaje ($)</th>
                <th className="py-3 px-4 text-right">Manipuleo In/Out</th>
                <th className="py-3 px-4 text-right">Subtotal</th>
                <th className="py-3 px-4 text-right">Total Facturable</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSettlements.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    No se encontraron liquidaciones para mostrar.
                  </td>
                </tr>
              ) : (
                filteredSettlements.map((liq) => {
                  const badge = statusBadges[liq.status];
                  const Icon = badge.icon;
                  const totalHandling = liq.inboundAmount + liq.outboundAmount;

                  return (
                    <tr key={liq.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {liq.settlementNumber}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {liq.clientName}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {liq.period} ({liq.startDate} a {liq.endDate})
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-700">
                        {liq.palletDays.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-700">
                        ${liq.storageAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-700">
                        ${totalHandling.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600">
                        ${liq.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-slate-900">
                        ${liq.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}>
                          <Icon className="w-3 h-3" />
                          <span>{badge.label}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedSettlementForView(liq)}
                            title="Ver desglose y factura"
                            className="p-1 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {liq.status === 'GENERADA' && (
                            <button
                              onClick={() => onUpdateSettlementStatus(liq.id, 'REVISADA')}
                              title="Marcar como Revisada"
                              className="p-1 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors"
                            >
                              <FileCheck className="w-4 h-4" />
                            </button>
                          )}

                          {liq.status === 'REVISADA' && (
                            <button
                              onClick={() => onUpdateSettlementStatus(liq.id, 'FACTURADA')}
                              title="Pasar a Facturada"
                              className="p-1 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                            >
                              <CreditCard className="w-4 h-4" />
                            </button>
                          )}

                          {liq.status === 'FACTURADA' && (
                            <button
                              onClick={() => onUpdateSettlementStatus(liq.id, 'PAGADA')}
                              title="Marcar como Pagada"
                              className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* GENERATE SETTLEMENT MODAL */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-sky-600" />
                <h3 className="font-black text-slate-900 text-lg">Calcular Liquidación Operativa Mensual</h3>
              </div>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Cliente Depositante
                  </label>
                  <select
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Periodo Contable
                  </label>
                  <input
                    type="text"
                    value={newPeriod}
                    onChange={(e) => setNewPeriod(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                    placeholder="YYYY-MM (ej: 2026-10)"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Fecha Desde
                  </label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Fecha Hasta
                  </label>
                  <input
                    type="date"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              {/* Service Calculation Matrix */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                <span className="font-bold text-slate-800 text-xs block mb-1">
                  1. Almacenaje por Estadía (Pallet-Días)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-bold">Total Pallet-Días</label>
                    <input
                      type="number"
                      value={newPalletDays}
                      onChange={(e) => setNewPalletDays(Number(e.target.value))}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-bold">Tarifa Diaria ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newStorageRate}
                      onChange={(e) => setNewStorageRate(parseFloat(e.target.value) || 0)}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded font-mono"
                    />
                  </div>
                  <div className="text-right">
                    <label className="text-[10px] text-slate-500 uppercase font-bold block">Subtotal Estadía</label>
                    <div className="font-mono font-bold text-slate-900 mt-1">${calculatedStorageAmount.toLocaleString()}</div>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-3">
                  <span className="font-bold text-slate-800 text-xs block mb-1">
                    2. Manipuleo Inbound (Recepción) & Outbound (Despacho)
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 uppercase font-bold">Inbound (Movs / Tarifa $4.20)</label>
                      <input
                        type="number"
                        value={newInboundPallets}
                        onChange={(e) => setNewInboundPallets(Number(e.target.value))}
                        className="w-full p-1.5 bg-white border border-slate-200 rounded font-mono"
                        placeholder="Pallets recibidos"
                      />
                      <span className="text-[11px] text-slate-500 font-mono block">Total In: ${calculatedInboundAmount.toLocaleString()}</span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 uppercase font-bold">Outbound (Movs / Tarifa $3.80)</label>
                      <input
                        type="number"
                        value={newOutboundPallets}
                        onChange={(e) => setNewOutboundPallets(Number(e.target.value))}
                        className="w-full p-1.5 bg-white border border-slate-200 rounded font-mono"
                        placeholder="Pallets despachados"
                      />
                      <span className="text-[11px] text-slate-500 font-mono block">Total Out: ${calculatedOutboundAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-3">
                  <span className="font-bold text-slate-800 text-xs block mb-1">
                    3. Servicios Extraordinarios / Maquila ($)
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={newExtraServicesAmount}
                    onChange={(e) => setNewExtraServicesAmount(parseFloat(e.target.value) || 0)}
                    className="w-full p-1.5 bg-white border border-slate-200 rounded font-mono"
                    placeholder="Monto por embalaje, termoencogido, etc."
                  />
                </div>
              </div>

              {/* Total Calculation Bar */}
              <div className="bg-sky-50 border border-sky-200 p-3.5 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-600 block">Subtotal: <strong>${calculatedSubtotal.toLocaleString()}</strong></span>
                  <span className="text-slate-600 block">IVA (19%): <strong>${calculatedTax.toLocaleString()}</strong></span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-sky-800 uppercase font-bold block">Total a Facturar</span>
                  <span className="text-xl font-black text-sky-900 font-mono">${calculatedTotal.toLocaleString()} USD</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white rounded-xl shadow-sm"
                >
                  Registrar Liquidación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW / PRINT SETTLEMENT MODAL */}
      {selectedSettlementForView && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl border border-slate-200 my-8 print:p-0 print:border-none">
            <div className="flex items-center justify-between pb-6 border-b border-slate-200">
              <div>
                <div className="font-black text-xl text-slate-900 tracking-tight">STADIUS WMS · LIQUIDACIÓN DE SERVICIOS</div>
                <div className="text-xs text-slate-500">Documento de Cobro Operativo Logístico 3PL</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm font-black text-sky-600">{selectedSettlementForView.settlementNumber}</div>
                <div className="text-xs text-slate-400">Periodo: {selectedSettlementForView.period}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 my-6 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <div className="text-slate-400 uppercase font-bold text-[10px]">Cliente / Depositante:</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{selectedSettlementForView.clientName}</div>
                <div className="text-slate-500">Rango: {selectedSettlementForView.startDate} al {selectedSettlementForView.endDate}</div>
              </div>
              <div className="text-right">
                <div className="text-slate-400 uppercase font-bold text-[10px]">Estado de Liquidación:</div>
                <div className="font-bold text-slate-900 mt-0.5">{selectedSettlementForView.status}</div>
                <div className="text-slate-500">Revisado por: {selectedSettlementForView.reviewedBy}</div>
              </div>
            </div>

            {/* Detailed Cost Breakdown Table */}
            <table className="w-full text-xs text-left my-4 border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px]">
                  <th className="py-2">Concepto / Servicio Prestado</th>
                  <th className="py-2 text-center">Volumen Operativo</th>
                  <th className="py-2 text-right">Monto Facturado (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2 font-medium text-slate-800">Almacenaje por Estadía en Racks</td>
                  <td className="py-2 text-center text-slate-600 font-mono">{selectedSettlementForView.palletDays.toLocaleString()} pallet-días</td>
                  <td className="py-2 text-right font-mono font-bold text-slate-900">${selectedSettlementForView.storageAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium text-slate-800">Manipuleo Inbound (Recepción & Putaway)</td>
                  <td className="py-2 text-center text-slate-600 font-mono">{selectedSettlementForView.inboundPallets} pallets mov.</td>
                  <td className="py-2 text-right font-mono font-bold text-slate-900">${selectedSettlementForView.inboundAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium text-slate-800">Manipuleo Outbound (Picking & Despacho)</td>
                  <td className="py-2 text-center text-slate-600 font-mono">{selectedSettlementForView.outboundPallets} pallets mov.</td>
                  <td className="py-2 text-right font-mono font-bold text-slate-900">${selectedSettlementForView.outboundAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium text-slate-800">Servicios Extraordinarios & Maquila</td>
                  <td className="py-2 text-center text-slate-600 font-mono">1 servicio</td>
                  <td className="py-2 text-right font-mono font-bold text-slate-900">${selectedSettlementForView.extraServicesAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>

            {/* Totals */}
            <div className="border-t border-slate-200 pt-3 text-xs space-y-1 text-right">
              <div>
                <span className="text-slate-500 mr-4">Subtotal Neto:</span>
                <span className="font-mono font-bold text-slate-900">${selectedSettlementForView.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div>
                <span className="text-slate-500 mr-4">IVA (19%):</span>
                <span className="font-mono text-slate-700">${selectedSettlementForView.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="text-base font-black text-sky-900 border-t border-slate-200 pt-2">
                <span className="mr-4">Total a Pagar:</span>
                <span className="font-mono">${selectedSettlementForView.total.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200 mt-6 print:hidden">
              <button
                onClick={() => setSelectedSettlementForView(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cerrar
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex items-center gap-2"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Liquidación</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
