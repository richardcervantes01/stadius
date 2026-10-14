import React from 'react';
import { CycleCountOrder } from '../types/inventory';
import { Printer, X, Eye, EyeOff } from 'lucide-react';

interface PrintWorksheetProps {
  order: CycleCountOrder;
  onClose: () => void;
}

export const PrintWorksheet: React.FC<PrintWorksheetProps> = ({ order, onClose }) => {
  const isBlind = order.type === 'BLIND';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Container */}
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Controls (Hidden in print) */}
        <div className="print:hidden p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm">Vista Previa de Impresión - Hoja de Conteo Físico</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 text-xs font-bold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Hoja de Conteo</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 overflow-y-auto print:p-0 print:overflow-visible print:max-h-none text-slate-900 bg-white">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-2xl font-black tracking-tight text-slate-900">
                  KARDEXFLOW WMS · HOJA DE CONTEO FÍSICO
                </div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  SISTEMA DE GESTIÓN DE ALMACENES · CONTROL CÍCLICO DE INVENTARIO
                </div>
              </div>

              {/* Barcode representation */}
              <div className="text-right">
                <div className="font-mono text-sm font-bold tracking-widest bg-slate-100 px-3 py-1 border border-slate-300 rounded inline-block">
                  *{order.id}*
                </div>
                <div className="text-[10px] text-slate-400 mt-1">CÓDIGO DE ORDEN</div>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-xs bg-slate-50 p-3 rounded border border-slate-200">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Orden:</span>
                <span className="font-mono font-bold text-slate-900">{order.id}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Modalidad:</span>
                <span className={`inline-flex items-center gap-1 font-bold ${isBlind ? 'text-rose-700' : 'text-blue-700'}`}>
                  {isBlind ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {isBlind ? 'INVENTARIO CIEGO' : 'INVENTARIO AUDITADO'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Bodega / Pasillos:</span>
                <span className="font-medium text-slate-800">{order.warehouse} ({order.aisles.join(', ')})</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Nivel / Altura:</span>
                <span className="font-medium text-indigo-700">{order.selectedLevels?.join(', ') || 'Todos los Niveles'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Ubicaciones Asignadas:</span>
                <span className="font-mono text-slate-900 font-bold">
                  {order.selectedLocations && order.selectedLocations.length > 0 
                    ? `${order.selectedLocations.length} Ubicaciones (${order.selectedLocations.slice(0, 3).join(', ')}${order.selectedLocations.length > 3 ? '...' : ''})`
                    : order.locationRangeStart 
                    ? `${order.locationRangeStart} → ${order.locationRangeEnd}` 
                    : 'Todas las del pasillo'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Fecha Emisión:</span>
                <span className="font-mono text-slate-800">{order.createdAt}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Operador Asignado:</span>
                <span className="font-medium text-slate-900">{order.assignedOperatorName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Supervisor a Cargo:</span>
                <span className="font-medium text-slate-900">{order.supervisorName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Tolerancia Máx:</span>
                <span className="font-mono text-slate-800">{order.tolerancePercentage}% Discrepancia</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Ubicaciones:</span>
                <span className="font-mono font-bold text-slate-900">{order.lines.length} Puntos de Control</span>
              </div>
            </div>

            {isBlind && (
              <div className="mt-2 text-xs bg-amber-50 border border-amber-200 text-amber-800 p-2 rounded">
                <strong>INSTRUCCIÓN AL OPERADOR:</strong> Esta orden es en modalidad <strong>CIEGA</strong>. Cuente con exactitud todas las piezas físicas existentes en la ubicación y anote la cifra en la casilla correspondiente sin redondear.
              </div>
            )}
          </div>

          {/* Table */}
          <table className="w-full text-left text-xs border border-slate-300 border-collapse mb-8">
            <thead className="bg-slate-200 text-slate-800 font-bold uppercase text-[11px]">
              <tr>
                <th className="border border-slate-300 p-2 text-center w-8">#</th>
                <th className="border border-slate-300 p-2">Ubicación / Nivel</th>
                <th className="border border-slate-300 p-2">SKU & Artículo</th>
                <th className="border border-slate-300 p-2">Lote</th>
                {!isBlind && (
                  <th className="border border-slate-300 p-2 text-center w-24">Teórico</th>
                )}
                <th className="border border-slate-300 p-2 text-center w-28 bg-amber-50">
                  {isBlind ? 'Conteo Físico' : 'Físico Real'}
                </th>
                <th className="border border-slate-300 p-2">Observaciones / Daños</th>
              </tr>
            </thead>
            <tbody>
              {order.lines.map((line, idx) => (
                <tr key={line.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="border border-slate-300 p-2 text-center font-mono font-bold text-slate-500">
                    {idx + 1}
                  </td>
                  <td className="border border-slate-300 p-2 font-mono">
                    <span className="font-bold text-slate-900">{line.locationCode}</span>
                    <span className="block text-[10px] text-slate-500">{line.verticalLevel}</span>
                  </td>
                  <td className="border border-slate-300 p-2">
                    <span className="font-mono font-bold text-slate-900">{line.sku}</span>
                    <span className="block text-[11px] text-slate-600 truncate max-w-xs">{line.description}</span>
                  </td>
                  <td className="border border-slate-300 p-2 font-mono text-[11px] text-slate-600">
                    {line.batch || 'S/L'}
                  </td>
                  {!isBlind && (
                    <td className="border border-slate-300 p-2 text-center font-mono font-bold text-slate-800">
                      {line.theoreticalQty}
                    </td>
                  )}
                  {/* Physical Count Box for Operator Writing */}
                  <td className="border-2 border-slate-900 p-2 text-center bg-white">
                    <div className="h-7 w-full border border-dashed border-slate-400 rounded flex items-center justify-center font-mono font-bold text-sm text-slate-900">
                      {line.countedQty !== undefined ? line.countedQty : ''}
                    </div>
                  </td>
                  <td className="border border-slate-300 p-2 text-slate-500 text-[10px]">
                    {line.notes || '________________________________________'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Signatures & Approvals Footer */}
          <div className="mt-12 pt-6 border-t border-slate-300 grid grid-cols-2 gap-12 text-xs">
            <div className="text-center">
              <div className="border-b border-slate-400 pb-1 h-12 flex items-end justify-center">
                <span className="font-mono text-slate-400">[ Firma Operador de Piso ]</span>
              </div>
              <p className="font-bold text-slate-800 mt-2">{order.assignedOperatorName}</p>
              <p className="text-[11px] text-slate-500">Operador Responsable de Conteo</p>
            </div>

            <div className="text-center">
              <div className="border-b border-slate-400 pb-1 h-12 flex items-end justify-center">
                <span className="font-mono text-slate-400">[ Firma Supervisor de Almacén ]</span>
              </div>
              <p className="font-bold text-slate-800 mt-2">{order.supervisorName}</p>
              <p className="text-[11px] text-slate-500">Supervisor Auditor / Aprobación</p>
            </div>
          </div>

          <div className="mt-6 text-center text-[10px] text-slate-400">
            Documento emitido por KardexFlow WMS el {new Date().toLocaleDateString()} a las {new Date().toLocaleTimeString()} · Hoja Oficial de Inventario Físico
          </div>
        </div>
      </div>
    </div>
  );
};
