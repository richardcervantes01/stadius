import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Percent, 
  DollarSign, 
  Clock, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Printer, 
  Users, 
  Filter,
  Check,
  RotateCcw,
  ShieldCheck,
  PackageX,
  PackagePlus,
  Scale
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { 
  CycleCountOrder, 
  SosAlert, 
  CycleCountLine, 
  KpiSummary 
} from '../types/inventory';
import { calculateKpis } from '../utils/kpiCalculator';

interface ReportsKpiModuleProps {
  orders: CycleCountOrder[];
  sosAlerts: SosAlert[];
  currentUser: import('../types/inventory').User;
  onApproveLineAdjustment: (orderId: string, lineId: string) => void;
  onRequestRecount: (orderId: string, lineId: string) => void;
  onApproveAllValidLines: (orderId: string) => void;
  onReopenOrder?: (orderId: string) => void;
}

export const ReportsKpiModule: React.FC<ReportsKpiModuleProps> = ({
  orders,
  sosAlerts,
  currentUser,
  onApproveLineAdjustment,
  onRequestRecount,
  onApproveAllValidLines,
  onReopenOrder,
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string>('ALL');
  const [discrepancyFilter, setDiscrepancyFilter] = useState<'ALL' | 'DISCREPANT' | 'EXACT' | 'RECOUNT'>('DISCREPANT');

  const kpis: KpiSummary = calculateKpis(orders, sosAlerts, selectedOrderId);

  // Active lines
  const activeOrders = selectedOrderId === 'ALL'
    ? orders
    : orders.filter(o => o.id === selectedOrderId);

  const allLines: { line: CycleCountLine; orderTitle: string }[] = activeOrders.flatMap(o => 
    o.lines.map(line => ({ line, orderTitle: o.title }))
  );

  const filteredLines = allLines.filter(({ line }) => {
    if (discrepancyFilter === 'DISCREPANT') return line.status === 'DISCREPANT' || (line.countedQty !== undefined && line.discrepancyUnits !== 0);
    if (discrepancyFilter === 'EXACT') return line.countedQty !== undefined && line.discrepancyUnits === 0;
    if (discrepancyFilter === 'RECOUNT') return line.recountRequired;
    return true;
  });

  const handleExportToExcel = () => {
    const reportData = allLines.map(({ line, orderTitle }) => ({
      Orden: line.orderId,
      Titulo_Orden: orderTitle,
      Bodega: line.warehouse,
      Pasillo: line.aisle,
      Ubicacion: line.locationCode,
      Nivel_Altura: line.verticalLevel,
      SKU: line.sku,
      Descripcion: line.description,
      Lote: line.batch || 'N/A',
      Cantidad_Teorica: line.theoreticalQty,
      Cantidad_Contada: line.countedQty !== undefined ? line.countedQty : 'Pendiente',
      Diferencia_Unidades: line.countedQty !== undefined ? line.discrepancyUnits : 0,
      Costo_Unitario: line.unitCost,
      Impacto_Financiero_USD: line.countedQty !== undefined ? line.discrepancyCost : 0,
      Estado: line.status,
      Reconteo_Requerido: line.recountRequired ? 'SI' : 'NO',
      Operador_Conteo: line.countedBy || 'N/A',
      Fecha_Conteo: line.countedAt || 'N/A',
      Observaciones: line.notes || 'Sin notas',
    }));

    const kpiSummarySheet = [
      { Indicador: 'Total Ubicaciones Programadas', Valor: kpis.totalLocations },
      { Indicador: 'Ubicaciones Contadas', Valor: kpis.countedLocations },
      { Indicador: '% Avance Físico', Valor: `${kpis.progressPercent}%` },
      { Indicador: 'ERI (% Exactitud Registros Inventario)', Valor: `${kpis.eriPercent}%` },
      { Indicador: 'ERU (% Exactitud Registros Unidades)', Valor: `${kpis.eruPercent}%` },
      { Indicador: 'SKUs Faltantes', Valor: kpis.missingSkusCount },
      { Indicador: 'SKUs Sobrantes', Valor: kpis.excessSkusCount },
      { Indicador: 'SKUs Exactos', Valor: kpis.exactSkusCount },
      { Indicador: 'Total Unidades Faltantes', Valor: kpis.totalMissingUnits },
      { Indicador: 'Total Unidades Sobrantes', Valor: kpis.totalExcessUnits },
      { Indicador: 'Merma Financiera Faltante (USD)', Valor: `$${kpis.shrinkageFinancialCost.toFixed(2)}` },
      { Indicador: 'Balance Financiero Neto (USD)', Valor: `$${kpis.netFinancialDiscrepancy.toFixed(2)}` },
      { Indicador: 'Tasa de Re-conteo (%)', Valor: `${kpis.recountRatePercent}%` },
      { Indicador: 'Tiempo Promedio Respuesta SOS (segundos)', Valor: `${kpis.avgSosResponseTimeSeconds}s` },
    ];

    const wb = XLSX.utils.book_new();
    const wsLines = XLSX.utils.json_to_sheet(reportData);
    const wsKpis = XLSX.utils.json_to_sheet(kpiSummarySheet);

    XLSX.utils.book_append_sheet(wb, wsKpis, 'Resumen_KPIs_WMS');
    XLSX.utils.book_append_sheet(wb, wsLines, 'Detalle_Discrepancias');

    XLSX.writeFile(wb, `Reporte_Conciliacion_Ciclicos_${new Date().toISOString().substring(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Module Title & Export Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
            <BarChart3 className="w-5 h-5 text-amber-500" />
            <span>Módulo 4: Reportes, Conciliación e Indicadores WMS</span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Tablero de control analítico con ERI, ERU, valorización de mermas, productividad de operadores y conciliación de stock.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <select
            value={selectedOrderId}
            onChange={(e) => setSelectedOrderId(e.target.value)}
            className="bg-slate-100 border border-slate-300 text-xs text-slate-900 rounded-lg px-3 py-2 font-medium focus:outline-none"
          >
            <option value="ALL">Consolidado Global (Todas las Órdenes)</option>
            {orders.map(o => (
              <option key={o.id} value={o.id}>
                {o.id} - {o.title}
              </option>
            ))}
          </select>

          <button
            onClick={handleExportToExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Exportar Excel</span>
          </button>
        </div>
      </div>

      {/* CORE 4 EXECUTIVE KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: % Avance */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold uppercase tracking-wider">Avance del Inventario</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-slate-900">{kpis.progressPercent}%</span>
              <span className="text-xs text-slate-500">
                ({kpis.countedLocations} de {kpis.totalLocations} ubicaciones)
              </span>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${kpis.progressPercent}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Progreso físico acumulado</span>
          </div>
        </div>

        {/* KPI 2: ERI (Inventory Record Accuracy) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold uppercase tracking-wider">ERI (Exactitud Registros)</span>
              <Scale className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={`text-3xl font-black font-mono ${
                kpis.eriPercent >= 95 ? 'text-emerald-600' : kpis.eriPercent >= 90 ? 'text-amber-600' : 'text-rose-600'
              }`}>
                {kpis.eriPercent}%
              </span>
              <span className="text-xs text-slate-500">
                ({kpis.exactSkusCount} ubic. exactas)
              </span>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-100 text-[11px] flex items-center justify-between text-slate-600">
            <span>Meta APICS WMS: <strong>≥ 95%</strong></span>
            <span className={`font-bold ${kpis.eriPercent >= 95 ? 'text-emerald-700' : 'text-amber-700'}`}>
              {kpis.eriPercent >= 95 ? 'Cumple Estándar' : 'Bajo Meta'}
            </span>
          </div>
        </div>

        {/* KPI 3: ERU (Exactitud por Unidades) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold uppercase tracking-wider">ERU (Exactitud Unidades)</span>
              <Percent className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-indigo-700">{kpis.eruPercent}%</span>
              <span className="text-xs text-slate-500">
                ({kpis.totalCountedUnits} u contadas)
              </span>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-100 text-[11px] flex items-center justify-between text-slate-600">
            <span>Faltantes: <strong>{kpis.totalMissingUnits} u</strong></span>
            <span>Sobrantes: <strong>{kpis.totalExcessUnits} u</strong></span>
          </div>
        </div>

        {/* KPI 4: Merma Financiera ($) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold uppercase tracking-wider">Impacto Financiero Merma</span>
              <DollarSign className="w-4 h-4 text-rose-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-rose-600">
                ${kpis.shrinkageFinancialCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-100 text-[11px] flex items-center justify-between text-slate-600">
            <span>Balance Neto:</span>
            <span className={`font-mono font-bold ${kpis.netFinancialDiscrepancy < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {kpis.netFinancialDiscrepancy < 0 ? '-' : '+'}${Math.abs(kpis.netFinancialDiscrepancy).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* ADDITIONAL RECOMMENDED KPIS GRID: Re-conteo, Tiempo SOS, Productividad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Recount Rate */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Tasa de Re-conteo (Recount Rate)</div>
            <div className="text-2xl font-black font-mono text-purple-700 mt-0.5">{kpis.recountRatePercent}%</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Ubicaciones enviadas a segunda auditoría</p>
          </div>
        </div>

        {/* SOS Response Time */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Tiempo Respuesta a Alertas SOS</div>
            <div className="text-2xl font-black font-mono text-amber-700 mt-0.5">
              {Math.round(kpis.avgSosResponseTimeSeconds / 60)} min {kpis.avgSosResponseTimeSeconds % 60}s
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Promedio de atención de supervisión en piso</p>
          </div>
        </div>

        {/* Discrepancy Breakdown summary */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
            <PackageX className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Desglose Discrepancias</div>
            <div className="text-sm font-bold text-slate-800 mt-1 flex items-center gap-3">
              <span className="text-rose-600">{kpis.missingSkusCount} Faltantes</span>
              <span className="text-slate-300">·</span>
              <span className="text-blue-600">{kpis.excessSkusCount} Sobrantes</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Sobre un total de {kpis.countedLocations} ubicaciones</p>
          </div>
        </div>
      </div>

      {/* OPERATOR PRODUCTIVITY TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">
              Indicador de Productividad & Rendimiento por Operador
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Benchmark meta: ≥ 15 ubicaciones / hora
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Operador</th>
                <th className="py-2.5 px-4 text-center">Conteos Completados</th>
                <th className="py-2.5 px-4 text-center">Tiempo Invertido</th>
                <th className="py-2.5 px-4 text-center">Velocidad (Ubicaciones / Hora)</th>
                <th className="py-2.5 px-4 text-center">Exactitud ERI (%)</th>
                <th className="py-2.5 px-4 text-center">Rendimiento WMS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {kpis.operatorProductivity.length > 0 ? (
                kpis.operatorProductivity.map((op) => (
                  <tr key={op.operatorId} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{op.operatorName}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold">{op.countsCompleted}</td>
                    <td className="py-3 px-4 text-center font-mono">{op.totalTimeMinutes} min</td>
                    <td className="py-3 px-4 text-center font-mono font-black text-amber-700">
                      {op.locationsPerHour} ubic/h
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-emerald-700">
                      {op.accuracyRate}%
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        op.locationsPerHour >= 12
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {op.locationsPerHour >= 12 ? 'ALTO RENDIMIENTO' : 'ESTÁNDAR'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    Aún no hay conteos registrados por operadores en las órdenes seleccionadas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECONCILIATION & DISCREPANCIES TABLE WITH ACTION BUTTONS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Consola de Conciliación de Discrepancias & Ajustes WMS</span>
            </h3>
            <p className="text-xs text-slate-500">
              Revisión de deltas, observaciones de operador y aprobación de ajustes o solicitud de re-conteo.
            </p>
          </div>

          {/* Table Filters */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-lg text-xs">
              <button
                onClick={() => setDiscrepancyFilter('DISCREPANT')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  discrepancyFilter === 'DISCREPANT' ? 'bg-white text-rose-700 font-bold shadow-xs' : 'text-slate-600'
                }`}
              >
                Con Discrepancia
              </button>
              <button
                onClick={() => setDiscrepancyFilter('RECOUNT')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  discrepancyFilter === 'RECOUNT' ? 'bg-white text-purple-700 font-bold shadow-xs' : 'text-slate-600'
                }`}
              >
                Re-conteo Pendiente
              </button>
              <button
                onClick={() => setDiscrepancyFilter('EXACT')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  discrepancyFilter === 'EXACT' ? 'bg-white text-emerald-700 font-bold shadow-xs' : 'text-slate-600'
                }`}
              >
                Exactos
              </button>
              <button
                onClick={() => setDiscrepancyFilter('ALL')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  discrepancyFilter === 'ALL' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600'
                }`}
              >
                Todos
              </button>
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-[11px] sticky top-0 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Ubicación</th>
                <th className="py-2.5 px-3">SKU & Descripción</th>
                <th className="py-2.5 px-3">Lote</th>
                <th className="py-2.5 px-3 text-right">Teórico</th>
                <th className="py-2.5 px-3 text-right">Físico</th>
                <th className="py-2.5 px-3 text-right">Delta Unidades</th>
                <th className="py-2.5 px-3 text-right">Impacto ($)</th>
                <th className="py-2.5 px-3">Observaciones Operador</th>
                <th className="py-2.5 px-3 text-center">Acciones Conciliación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLines.length > 0 ? (
                filteredLines.map(({ line }) => {
                  const diff = line.discrepancyUnits;
                  const isDiff = line.countedQty !== undefined && diff !== 0;

                  return (
                    <tr key={line.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-mono">
                        <span className="font-bold text-slate-900">{line.locationCode}</span>
                        <span className="block text-[10px] text-slate-500">{line.aisle} · {line.verticalLevel}</span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-slate-900">{line.sku}</span>
                        <span className="block text-slate-600 truncate max-w-xs">{line.description}</span>
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                        {line.batch || '—'}
                      </td>

                      <td className="py-3 px-3 font-mono text-right font-bold text-slate-800">
                        {line.theoreticalQty}
                      </td>

                      <td className="py-3 px-3 font-mono text-right font-bold text-slate-900">
                        {line.countedQty !== undefined ? line.countedQty : (
                          <span className="text-slate-400 font-normal italic">Sin contar</span>
                        )}
                      </td>

                      <td className="py-3 px-3 font-mono text-right font-black">
                        {line.countedQty !== undefined ? (
                          <span className={diff === 0 ? 'text-emerald-600' : diff < 0 ? 'text-rose-600' : 'text-blue-600'}>
                            {diff > 0 ? `+${diff}` : diff} u
                          </span>
                        ) : '—'}
                      </td>

                      <td className="py-3 px-3 font-mono text-right font-black">
                        {line.countedQty !== undefined ? (
                          <span className={line.discrepancyCost === 0 ? 'text-slate-500' : line.discrepancyCost < 0 ? 'text-rose-600' : 'text-blue-600'}>
                            {line.discrepancyCost < 0 ? '-' : '+'}${Math.abs(line.discrepancyCost).toFixed(2)}
                          </span>
                        ) : '—'}
                      </td>

                      <td className="py-3 px-3 max-w-xs">
                        <p className="text-[11px] text-slate-700 italic truncate" title={line.notes}>
                          {line.notes || 'Sin observaciones'}
                        </p>
                        {line.tags && line.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {line.tags.map((t, idx) => (
                              <span key={idx} className="text-[9px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded border border-slate-200">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        {line.status === 'APPROVED' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                            <Check className="w-3.5 h-3.5" /> Ajustado OK
                          </span>
                        ) : line.status === 'RECOUNT_PENDING' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded border border-purple-200">
                            <RotateCcw className="w-3 h-3 animate-spin" /> En Re-conteo
                          </span>
                        ) : isDiff ? (
                          <div className="flex items-center justify-center gap-1.5">
                            {(() => {
                              const parentOrder = orders.find(o => o.id === line.orderId);
                              const isParentCompleted = parentOrder?.status === 'COMPLETED';
                              const canModify = !isParentCompleted || currentUser.role === 'ADMIN';

                              if (!canModify) {
                                return (
                                  <span className="text-[10px] text-slate-400 italic" title="Inventario culminado. Solo Administrador puede reabrirlo o modificar">
                                    Bloqueado (Culminado)
                                  </span>
                                );
                              }

                              return (
                                <>
                                  <button
                                    onClick={() => onApproveLineAdjustment(line.orderId, line.id)}
                                    title="Aprobar ajuste de inventario en Kardex WMS"
                                    className="px-2.5 py-1 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors"
                                  >
                                    Aprobar
                                  </button>

                                  <button
                                    onClick={() => onRequestRecount(line.orderId, line.id)}
                                    title="Solicitar segundo conteo físico de confirmación"
                                    className="px-2.5 py-1 text-[10px] font-bold bg-amber-600 hover:bg-amber-700 text-white rounded transition-colors"
                                  >
                                    Re-conteo
                                  </button>
                                </>
                              );
                            })()}
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400">Sin diferencias</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No hay registros que coincidan con el filtro de discrepancias seleccionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
