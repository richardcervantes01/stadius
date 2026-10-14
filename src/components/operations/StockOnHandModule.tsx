import React, { useState } from 'react';
import {
  PackageSearch,
  Search,
  Filter,
  Download,
  AlertTriangle,
  Boxes,
  Calendar,
  Building,
  DollarSign,
  ShieldAlert,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { StockOnHandRecord, StockCondition, ClientAccount, User } from '../../types/inventory';

interface StockOnHandModuleProps {
  stockRecords: StockOnHandRecord[];
  clients: ClientAccount[];
  currentUser: User;
}

export const StockOnHandModule: React.FC<StockOnHandModuleProps> = ({
  stockRecords,
  clients,
  currentUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('ALL');
  const [clientFilter, setClientFilter] = useState<string>('ALL');
  const [conditionFilter, setConditionFilter] = useState<string>('ALL');

  // Filter records
  const filteredRecords = stockRecords.filter(r => {
    const matchesSearch =
      r.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.batch.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.locationCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWarehouse = warehouseFilter === 'ALL' || r.warehouse === warehouseFilter;
    const matchesClient = clientFilter === 'ALL' || r.clientName === clientFilter;
    const matchesCondition = conditionFilter === 'ALL' || r.condition === conditionFilter;
    return matchesSearch && matchesWarehouse && matchesClient && matchesCondition;
  });

  // Summary Metrics
  const totalUnitsOnHand = filteredRecords.reduce((acc, r) => acc + r.totalQty, 0);
  const totalUnitsAvailable = filteredRecords.reduce((acc, r) => acc + r.qtyAvailable, 0);
  const totalUnitsReserved = filteredRecords.reduce((acc, r) => acc + r.qtyReserved, 0);
  const totalUnitsQuarantine = filteredRecords.reduce((acc, r) => acc + r.qtyQuarantine + r.qtyDamaged, 0);
  const totalStockValuation = filteredRecords.reduce((acc, r) => acc + (r.totalQty * r.unitCost), 0);

  const handleExportCsv = () => {
    const headers = ['SKU', 'Descripcion', 'Cliente', 'Bodega', 'Ubicacion', 'Lote', 'Vencimiento', 'Disponible', 'Reservado', 'Cuarentena', 'Total', 'CostoUnitario', 'ValorTotal'];
    const rows = filteredRecords.map(r => [
      r.sku,
      `"${r.description.replace(/"/g, '""')}"`,
      r.clientName,
      r.warehouse,
      r.locationCode,
      r.batch,
      r.expiryDate,
      r.qtyAvailable,
      r.qtyReserved,
      r.qtyQuarantine,
      r.totalQty,
      r.unitCost,
      r.totalQty * r.unitCost
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Stock_On_Hand_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <PackageSearch className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Operaciones de Almacén · Consulta de Stock (On-Hand)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Existencias físicas en tiempo real por ubicación, lote de fabricación, fecha de caducidad (FEFO) y estado de disponibilidad.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Exportar CSV</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Stock Total On-Hand</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {totalUnitsOnHand.toLocaleString()} <span className="text-xs text-slate-400 font-normal">unidades</span>
          </div>
          <span className="text-[11px] text-slate-500">En todas las bodegas</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Stock Disponible (Picking)</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {totalUnitsAvailable.toLocaleString()} <span className="text-xs text-emerald-700 font-normal">libres</span>
          </div>
          <span className="text-[11px] text-emerald-700">Listo para despacho</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">En Cuarentena / Dañado</span>
          <div className="text-2xl font-black text-rose-600 mt-1">
            {totalUnitsQuarantine.toLocaleString()} <span className="text-xs text-rose-700 font-normal">bloqueadas</span>
          </div>
          <span className="text-[11px] text-rose-700">Retención de calidad</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Valorización On-Hand</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            ${totalStockValuation.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-500">Costo total inventariado</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por SKU, descripción, ubicación o lote..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium focus:outline-none"
            >
              <option value="ALL">Todas las Bodegas</option>
              <option value="B01 - Bodega Central">B01 - Bodega Central</option>
              <option value="B02 - Cadena Frío">B02 - Cadena Frío</option>
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

            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium focus:outline-none"
            >
              <option value="ALL">Todas las Condiciones</option>
              <option value="DISPONIBLE">Disponible</option>
              <option value="CUARENTENA">Cuarentena</option>
              <option value="RESERVADO">Reservado</option>
            </select>
          </div>
        </div>

        <span className="text-xs text-slate-400 font-mono">
          {filteredRecords.length} registros on-hand
        </span>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3 px-4">Artículo SKU</th>
                <th className="py-3 px-4">Descripción</th>
                <th className="py-3 px-4">Cliente / Cuenta</th>
                <th className="py-3 px-4">Ubicación Física</th>
                <th className="py-3 px-4">Lote / Batch</th>
                <th className="py-3 px-4">Vencimiento (FEFO)</th>
                <th className="py-3 px-4 text-right">Disponible</th>
                <th className="py-3 px-4 text-right">Reservado</th>
                <th className="py-3 px-4 text-right">Total On-Hand</th>
                <th className="py-3 px-4 text-right">Valor Total ($)</th>
                <th className="py-3 px-4 text-center">Condición</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400">
                    No se encontraron registros de stock on-hand con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredRecords.map(record => {
                  const totalVal = record.totalQty * record.unitCost;

                  return (
                    <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {record.sku}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800 max-w-xs truncate">
                        {record.description}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {record.clientName}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {record.locationCode}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{record.warehouse}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {record.batch}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {record.expiryDate}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                        {record.qtyAvailable}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500">
                        {record.qtyReserved}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-slate-900 text-sm">
                        {record.totalQty}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        ${totalVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          record.condition === 'DISPONIBLE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : record.condition === 'CUARENTENA'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {record.condition}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
