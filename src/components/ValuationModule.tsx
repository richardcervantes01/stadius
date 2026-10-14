import React, { useState, useRef } from 'react';
import { 
  BadgeDollarSign, 
  Upload, 
  Download, 
  Search, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRightLeft, 
  Layers, 
  DollarSign, 
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';
import { MasterInventoryItem, SkuPriceRecord, CycleCountOrder } from '../types/inventory';
import { downloadPriceTemplateFile, parsePricesFile } from '../utils/excelParser';
import { audioAlert } from '../utils/audioAlert';

interface ValuationModuleProps {
  masterInventory: MasterInventoryItem[];
  prices: SkuPriceRecord[];
  orders: CycleCountOrder[];
  onSavePrices: (updatedPrices: SkuPriceRecord[]) => void;
  onCrossReferencePrices: (updatedPrices: SkuPriceRecord[]) => void;
}

export const ValuationModule: React.FC<ValuationModuleProps> = ({
  masterInventory,
  prices,
  orders,
  onSavePrices,
  onCrossReferencePrices,
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VALUED' | 'PENDING'>('ALL');
  const [editablePrices, setEditablePrices] = useState<Record<string, number>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Group inventory items by distinct SKU
  const distinctSkusMap = new Map<string, {
    sku: string;
    description: string;
    totalTheoreticalQty: number;
    category: string;
  }>();

  masterInventory.forEach(item => {
    const existing = distinctSkusMap.get(item.sku);
    if (existing) {
      existing.totalTheoreticalQty += item.theoreticalQty;
    } else {
      distinctSkusMap.set(item.sku, {
        sku: item.sku,
        description: item.description,
        totalTheoreticalQty: item.theoreticalQty,
        category: item.category,
      });
    }
  });

  // Ensure every distinct SKU exists in prices list
  const distinctSkus = Array.from(distinctSkusMap.values());
  
  // Merge with prices
  const mergedSkus = distinctSkus.map(item => {
    const priceRecord = prices.find(p => p.sku.toLowerCase() === item.sku.toLowerCase());
    const unitCost = editablePrices[item.sku] !== undefined 
      ? editablePrices[item.sku] 
      : (priceRecord?.unitCost || 0);

    return {
      ...item,
      unitCost,
      isValued: unitCost > 0,
      totalValue: item.totalTheoreticalQty * unitCost,
    };
  });

  // Stats
  const totalSkusCount = mergedSkus.length;
  const valuedSkusCount = mergedSkus.filter(s => s.isValued).length;
  const pendingSkusCount = totalSkusCount - valuedSkusCount;
  const totalValuation = mergedSkus.reduce((sum, s) => sum + s.totalValue, 0);

  const handlePriceChange = (sku: string, value: string) => {
    const parsed = parseFloat(value);
    setEditablePrices(prev => ({
      ...prev,
      [sku]: isNaN(parsed) || parsed < 0 ? 0 : parsed,
    }));
  };

  const handleSaveSinglePrice = (sku: string) => {
    const cost = editablePrices[sku] || 0;
    const targetItem = distinctSkusMap.get(sku);

    const updated = prices.filter(p => p.sku.toLowerCase() !== sku.toLowerCase());
    updated.push({
      sku,
      description: targetItem?.description || sku,
      unitCost: cost,
      currency: 'USD',
      updatedAt: new Date().toISOString().substring(0, 10),
    });

    onSavePrices(updated);
    setToastMessage(`Precio para SKU ${sku} actualizado a $${cost.toFixed(2)}.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCrossReference = () => {
    // Commit all editable prices first
    const updatedPrices = [...prices];

    Object.entries(editablePrices).forEach(([sku, cost]) => {
      const idx = updatedPrices.findIndex(p => p.sku.toLowerCase() === sku.toLowerCase());
      const target = distinctSkusMap.get(sku);
      if (idx !== -1) {
        updatedPrices[idx] = {
          ...updatedPrices[idx],
          unitCost: cost,
          updatedAt: new Date().toISOString().substring(0, 10),
        };
      } else {
        updatedPrices.push({
          sku,
          description: target?.description || sku,
          unitCost: cost,
          currency: 'USD',
          updatedAt: new Date().toISOString().substring(0, 10),
        });
      }
    });

    onCrossReferencePrices(updatedPrices);
    audioAlert.playSuccessChime();
    setToastMessage('¡Cruce completado! Precios vinculados al Inventario Maestro y Órdenes de Conteo para cálculo de mermas.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleUploadPricesFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const buffer = evt.target?.result as ArrayBuffer;
      if (buffer) {
        const { prices: importedPrices, errors } = parsePricesFile(buffer);
        if (importedPrices.length > 0) {
          const map = new Map<string, SkuPriceRecord>();
          prices.forEach(p => map.set(p.sku.toLowerCase(), p));
          importedPrices.forEach(p => map.set(p.sku.toLowerCase(), {
            ...p,
            updatedAt: new Date().toISOString().substring(0, 10),
          }));

          const updated = Array.from(map.values());
          onSavePrices(updated);
          setToastMessage(`Se importaron exitosamente precios para ${importedPrices.length} SKUs.`);
          setTimeout(() => setToastMessage(null), 3500);
        }
        if (errors.length > 0) {
          alert(`Inconsistencias al leer precios:\n${errors.slice(0, 5).join('\n')}`);
        }
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const filteredSkus = mergedSkus.filter(item => {
    if (statusFilter === 'VALUED' && !item.isValued) return false;
    if (statusFilter === 'PENDING' && item.isValued) return false;
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return item.sku.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Module Title & Cross-Reference Action Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
              <BadgeDollarSign className="w-5 h-5 text-emerald-600" />
              <span>Módulo: Catálogo Valorizado & Cruce de Precios</span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Los precios se gestionan de forma segregada para proteger la confidencialidad en piso. Asigne precios aquí y presione <strong>Cruzar Registros</strong> para alimentar los KPIs de merma financiera ($).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={downloadPriceTemplateFile}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Plantilla Precios (.xlsx)</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
            >
              <Upload className="w-4 h-4 text-slate-600" />
              <span>Importar Excel Precios</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleUploadPricesFile}
              className="hidden"
            />

            <button
              onClick={handleCrossReference}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
            >
              <ArrowRightLeft className="w-4 h-4 text-emerald-200" />
              <span>Cruzar Registros & Valorizar WMS</span>
            </button>
          </div>
        </div>

        {/* Diagnostic Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="text-xs text-slate-500 font-medium">Total SKUs en Catálogo</div>
            <div className="text-xl font-bold text-slate-800 font-mono mt-0.5">{totalSkusCount}</div>
          </div>

          <div className="bg-emerald-50/70 p-3 rounded-lg border border-emerald-200">
            <div className="text-xs text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>SKUs Valorizados</span>
            </div>
            <div className="text-xl font-bold text-emerald-800 font-mono mt-0.5">{valuedSkusCount}</div>
          </div>

          <div className="bg-amber-50/70 p-3 rounded-lg border border-amber-200">
            <div className="text-xs text-amber-700 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Pendientes de Precio ($0.00)</span>
            </div>
            <div className="text-xl font-bold text-amber-800 font-mono mt-0.5">{pendingSkusCount}</div>
          </div>

          <div className="bg-indigo-50/70 p-3 rounded-lg border border-indigo-200">
            <div className="text-xs text-indigo-700 font-medium flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Valor Teórico Total Almacén</span>
            </div>
            <div className="text-xl font-bold text-indigo-900 font-mono mt-0.5">
              ${totalValuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-md flex items-center gap-2 text-xs font-medium animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filter and SKU Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Filtrar Estado:</span>
            <div className="flex items-center gap-1 bg-slate-200/60 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded font-medium ${
                  statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Todos ({mergedSkus.length})
              </button>
              <button
                onClick={() => setStatusFilter('VALUED')}
                className={`px-2.5 py-1 rounded font-medium ${
                  statusFilter === 'VALUED' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-slate-600'
                }`}
              >
                Valorizados ({valuedSkusCount})
              </button>
              <button
                onClick={() => setStatusFilter('PENDING')}
                className={`px-2.5 py-1 rounded font-medium ${
                  statusFilter === 'PENDING' ? 'bg-white text-amber-800 shadow-xs font-bold' : 'text-slate-600'
                }`}
              >
                Sin Precio ({pendingSkusCount})
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por SKU o descripción..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 w-64"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-600 font-semibold uppercase text-[11px] sticky top-0 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">SKU</th>
                <th className="py-2.5 px-3">Descripción</th>
                <th className="py-2.5 px-3 text-right">Existencia Física Teórica</th>
                <th className="py-2.5 px-3 text-center w-36">Costo / Precio Unitario ($)</th>
                <th className="py-2.5 px-3 text-right">Valor Total Stock ($)</th>
                <th className="py-2.5 px-3 text-center">Estado</th>
                <th className="py-2.5 px-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredSkus.length > 0 ? (
                filteredSkus.map((item) => (
                  <tr key={item.sku} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{item.sku}</td>
                    <td className="py-2.5 px-3 max-w-sm truncate font-medium text-slate-800" title={item.description}>
                      {item.description}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-right text-slate-900">
                      {item.totalTheoreticalQty} u
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-slate-400 font-mono">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editablePrices[item.sku] !== undefined ? editablePrices[item.sku] : item.unitCost}
                          onChange={(e) => handlePriceChange(item.sku, e.target.value)}
                          className="w-24 px-2 py-1 text-xs text-right font-mono font-bold bg-white border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-right font-black text-slate-900">
                      ${item.totalValue.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {item.isValued ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Valorizado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Sin Precio
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleSaveSinglePrice(item.sku)}
                        title="Guardar precio de este SKU"
                        className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No hay SKUs que coincidan con la búsqueda.
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
