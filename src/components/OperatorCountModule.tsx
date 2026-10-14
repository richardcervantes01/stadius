import React, { useState, useEffect } from 'react';
import { 
  ScanLine, 
  MapPin, 
  AlertOctagon, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Plus, 
  Minus, 
  Tag, 
  Search, 
  ArrowRight, 
  ArrowLeft,
  Barcode,
  Sparkles,
  ClipboardCheck,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  CycleCountOrder, 
  CycleCountLine, 
  User, 
  SosAlert 
} from '../types/inventory';
import { audioAlert } from '../utils/audioAlert';
import { SosAlertModal } from './SosAlertModal';

interface OperatorCountModuleProps {
  orders: CycleCountOrder[];
  selectedOrderId: string | null;
  onSelectOrderId: (orderId: string) => void;
  currentUser: User;
  onUpdateLineCount: (
    orderId: string, 
    lineId: string, 
    countedQty: number, 
    notes: string, 
    tags: string[],
    durationSeconds: number
  ) => void;
  onTriggerSosAlert: (alert: SosAlert) => void;
  onReopenOrder?: (orderId: string) => void;
}

export const OperatorCountModule: React.FC<OperatorCountModuleProps> = ({
  orders,
  selectedOrderId,
  onSelectOrderId,
  currentUser,
  onUpdateLineCount,
  onTriggerSosAlert,
  onReopenOrder,
}) => {
  // If no order selected, pick the first in progress or pending order
  const activeOrder = orders.find(o => o.id === selectedOrderId) || orders[0];

  // Active line being counted
  const [activeLineIndex, setActiveLineIndex] = useState<number>(0);
  const [countedQtyInput, setCountedQtyInput] = useState<string>('');
  const [notesInput, setNotesInput] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showSosModal, setShowSosModal] = useState<boolean>(false);
  const [searchBarcode, setSearchBarcode] = useState<string>('');
  const [lineFilter, setLineFilter] = useState<'ALL' | 'PENDING' | 'COUNTED' | 'DISCREPANT'>('ALL');
  const [timerSeconds, setTimerSeconds] = useState<number>(0);

  // Time tracker for operator productivity calculation
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeLineIndex, activeOrder?.id]);

  // Sync inputs when changing active line
  const lines = activeOrder?.lines || [];
  const currentLine = lines[activeLineIndex] || lines[0];

  useEffect(() => {
    if (currentLine) {
      setCountedQtyInput(
        currentLine.countedQty !== undefined ? String(currentLine.countedQty) : ''
      );
      setNotesInput(currentLine.notes || '');
      setSelectedTags(currentLine.tags || []);
      setTimerSeconds(0);
    }
  }, [activeLineIndex, activeOrder?.id]);

  if (!activeOrder) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
        No hay órdenes de inventario cíclico disponibles. Ve al Módulo 2 para crear una orden.
      </div>
    );
  }

  const isBlind = activeOrder.type === 'BLIND';

  const quickTagList = [
    'Producto dañado',
    'Bulto abierto',
    'Ubicación errónea',
    'Etiqueta rota',
    'Lote no coincide',
    'Derrame visible',
    'Conteo Verificado OK',
  ];

  const handleToggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleAdjustQty = (delta: number) => {
    const current = parseInt(countedQtyInput, 10) || 0;
    const next = Math.max(0, current + delta);
    setCountedQtyInput(String(next));
  };

  const handleSaveCount = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentLine) return;

    if (activeOrder.status === 'COMPLETED' && currentUser.role !== 'ADMIN') {
      alert('Este inventario se encuentra Terminado (Culminado). Solo un Administrador puede volver a aperturarlo para realizar modificaciones.');
      return;
    }

    const parsedQty = parseInt(countedQtyInput, 10);
    if (isNaN(parsedQty) || parsedQty < 0) {
      alert('Por favor ingrese una cantidad contada válida mayor o igual a 0.');
      return;
    }

    // Call update handler
    onUpdateLineCount(
      activeOrder.id,
      currentLine.id,
      parsedQty,
      notesInput,
      selectedTags,
      Math.max(30, timerSeconds)
    );

    // Play chime sound
    audioAlert.playSuccessChime();

    // Check if finished order
    const remainingPending = lines.filter((l, i) => i !== activeLineIndex && l.status === 'PENDING').length;
    if (remainingPending === 0) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}
    }

    // Auto-advance to next pending line if available
    const nextPendingIdx = lines.findIndex((l, i) => i > activeLineIndex && l.status === 'PENDING');
    if (nextPendingIdx !== -1) {
      setActiveLineIndex(nextPendingIdx);
    } else {
      const anyPendingIdx = lines.findIndex(l => l.status === 'PENDING');
      if (anyPendingIdx !== -1) {
        setActiveLineIndex(anyPendingIdx);
      }
    }
  };

  // Barcode / Location fast scanner match
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchBarcode.trim()) return;

    const term = searchBarcode.trim().toLowerCase();
    const foundIdx = lines.findIndex(
      l => l.locationCode.toLowerCase() === term || l.sku.toLowerCase() === term
    );

    if (foundIdx !== -1) {
      setActiveLineIndex(foundIdx);
      setSearchBarcode('');
    } else {
      alert(`No se encontró ubicación o SKU "${searchBarcode}" en esta orden.`);
    }
  };

  const filteredLines = lines.filter(l => {
    if (lineFilter === 'PENDING') return l.status === 'PENDING';
    if (lineFilter === 'COUNTED') return l.status === 'COUNTED';
    if (lineFilter === 'DISCREPANT') return l.status === 'DISCREPANT';
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Banner: Order Switcher & Emergency SOS Bar */}
      <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Order Selector */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <ScanLine className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-amber-400 font-bold uppercase">
                {activeOrder.id}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isBlind ? 'bg-purple-900/60 text-purple-300 border border-purple-500/40' : 'bg-blue-900/60 text-blue-300 border border-blue-500/40'
              }`}>
                {isBlind ? 'Modo Ciego Activo' : 'Modo Auditado'}
              </span>
            </div>
            <select
              value={activeOrder.id}
              onChange={(e) => onSelectOrderId(e.target.value)}
              className="bg-transparent text-white font-bold text-sm focus:outline-none cursor-pointer mt-0.5 hover:text-amber-300 transition-colors"
            >
              {orders.map(o => (
                <option key={o.id} value={o.id} className="bg-slate-900 text-white">
                  {o.title} ({o.warehouse})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* PROMINENT OPERATOR SOS BUTTON */}
        <button
          onClick={() => setShowSosModal(true)}
          className="bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-black text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 border border-rose-400 transition-transform active:scale-95 animate-pulse"
        >
          <AlertOctagon className="w-5 h-5" />
          <span>BOTÓN SOS / LLAMAR SUPERVISOR</span>
        </button>
      </div>

      {/* Main Counting Workspace: Split into Left Location Tray and Right Counting Tablet Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Locations List & Barcode Scanner Simulator */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-[650px] overflow-hidden">
          {/* Quick Scanner Bar */}
          <div className="p-3 bg-slate-50 border-b border-slate-200">
            <form onSubmit={handleBarcodeSubmit} className="relative">
              <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Escanear ubicación o SKU (ej: P01-R01-01)..."
                value={searchBarcode}
                onChange={(e) => setSearchBarcode(e.target.value)}
                className="w-full text-xs pl-9 pr-14 py-2 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none font-mono"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2 py-1 text-[10px] font-bold bg-slate-900 text-white rounded hover:bg-slate-800"
              >
                IR
              </button>
            </form>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 mt-2 text-[11px]">
              <button
                onClick={() => setLineFilter('ALL')}
                className={`px-2 py-1 rounded font-medium ${
                  lineFilter === 'ALL' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todas ({lines.length})
              </button>
              <button
                onClick={() => setLineFilter('PENDING')}
                className={`px-2 py-1 rounded font-medium ${
                  lineFilter === 'PENDING' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                Pendientes ({lines.filter(l => l.status === 'PENDING').length})
              </button>
              <button
                onClick={() => setLineFilter('COUNTED')}
                className={`px-2 py-1 rounded font-medium ${
                  lineFilter === 'COUNTED' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                Listas ({lines.filter(l => l.status === 'COUNTED').length})
              </button>
              <button
                onClick={() => setLineFilter('DISCREPANT')}
                className={`px-2 py-1 rounded font-medium ${
                  lineFilter === 'DISCREPANT' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                Discrepancias ({lines.filter(l => l.status === 'DISCREPANT').length})
              </button>
            </div>
          </div>

          {/* Locations Scroll List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredLines.map((line) => {
              const originalIndex = lines.findIndex(l => l.id === line.id);
              const isCurrent = originalIndex === activeLineIndex;

              return (
                <div
                  key={line.id}
                  onClick={() => setActiveLineIndex(originalIndex)}
                  className={`p-3.5 cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                    isCurrent
                      ? 'bg-amber-50/80 border-l-4 border-amber-500'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900">
                        {line.locationCode}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {line.verticalLevel}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 truncate font-medium mt-0.5">
                      {line.sku} · {line.description}
                    </div>

                    {line.batch && (
                      <div className="text-[10px] font-mono text-slate-400">
                        Lote: {line.batch}
                      </div>
                    )}
                  </div>

                  {/* Status badge */}
                  <div className="shrink-0 text-right">
                    {line.status === 'COUNTED' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{line.countedQty} u</span>
                      </span>
                    )}

                    {line.status === 'DISCREPANT' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        <span>{line.countedQty} u (Dif)</span>
                      </span>
                    )}

                    {line.status === 'PENDING' && (
                      <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        Pendiente
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: High-Visibility Tablet Counting Interface */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between overflow-hidden">
          {currentLine ? (
            <div className="p-6 space-y-6">
              {/* Completed Status Warning / Admin Reopen Banner */}
              {activeOrder.status === 'COMPLETED' && (
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 text-xs animate-in fade-in">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <strong className="block font-bold text-slate-900">Inventario Terminado (Culminado)</strong>
                      <span className="text-slate-600">
                        {currentUser.role === 'ADMIN'
                          ? 'Solo un Administrador puede volver a aperturar este inventario o autorizar ajustes.'
                          : 'Este inventario está cerrado. Únicamente el usuario Administrador puede volver a aperturarlo.'}
                      </span>
                    </div>
                  </div>

                  {currentUser.role === 'ADMIN' && onReopenOrder && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`[ADMINISTRADOR] ¿Desea reaperturar el inventario ${activeOrder.id} y volver a estado 'En Proceso'?`)) {
                          onReopenOrder(activeOrder.id);
                        }
                      }}
                      className="px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-lg transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
                      title="Volver a aperturar inventario culminado"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reaperturar Inventario</span>
                    </button>
                  )}
                </div>
              )}

              {/* Location Badge Header */}
              <div className="bg-slate-900 text-white rounded-xl p-5 shadow-inner">
                <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-mono tracking-wider">
                  <span>Punto de Control Físico ({activeLineIndex + 1} de {lines.length})</span>
                  <span>{currentLine.warehouse}</span>
                </div>

                <div className="mt-2 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <div>
                    <h2 className="text-3xl font-black font-mono tracking-tight text-amber-400">
                      {currentLine.locationCode}
                    </h2>
                    <p className="text-sm font-medium text-slate-300 mt-0.5">
                      {currentLine.aisle} · {currentLine.verticalLevel}
                    </p>
                  </div>

                  {/* Blind count alert or theoretical indicator */}
                  <div>
                    {isBlind ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
                        <EyeOff className="w-4 h-4" />
                        <span>Inventario Ciego (Saldo oculto)</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-bold font-mono">
                        <Eye className="w-4 h-4" />
                        <span>Teórico Esperado: {currentLine.theoreticalQty} u</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* SKU & Description details */}
                <div className="mt-4 pt-3 border-t border-slate-800 text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-mono">{currentLine.sku}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-300 truncate">{currentLine.description}</span>
                  </div>
                  {currentLine.batch && (
                    <div className="text-[11px] font-mono text-slate-400">
                      Lote registrado: <strong>{currentLine.batch}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* TACTILE NUMERIC COUNT INPUT WITH BIG TOUCH BUTTONS */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Cantidad Física Contada en la Ubicación:
                  </label>
                  <span className="text-xs text-slate-400 font-mono">
                    Tiempo en ubicación: {Math.floor(timerSeconds / 60)}m {timerSeconds % 60}s
                  </span>
                </div>

                {/* Large Input with +/- Quick Adjustment Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={activeOrder.status === 'COMPLETED' && currentUser.role !== 'ADMIN'}
                    onClick={() => handleAdjustQty(-1)}
                    className="w-14 h-14 bg-white border border-slate-300 rounded-xl text-slate-800 font-bold text-xl hover:bg-slate-100 disabled:opacity-40 active:scale-95 flex items-center justify-center shadow-xs"
                  >
                    <Minus className="w-6 h-6" />
                  </button>

                  <input
                    type="number"
                    min="0"
                    autoFocus
                    disabled={activeOrder.status === 'COMPLETED' && currentUser.role !== 'ADMIN'}
                    placeholder="0"
                    value={countedQtyInput}
                    onChange={(e) => setCountedQtyInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveCount();
                    }}
                    className="flex-1 h-14 text-center font-mono font-black text-3xl bg-white border-2 border-amber-500 disabled:border-slate-300 disabled:bg-slate-100 rounded-xl shadow-inner text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />

                  <button
                    type="button"
                    disabled={activeOrder.status === 'COMPLETED' && currentUser.role !== 'ADMIN'}
                    onClick={() => handleAdjustQty(1)}
                    className="w-14 h-14 bg-white border border-slate-300 rounded-xl text-slate-800 font-bold text-xl hover:bg-slate-100 active:scale-95 flex items-center justify-center shadow-xs"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                </div>

                {/* Fast Numpad increment pills (+5, +10, +25, +50, +100) */}
                <div className="flex items-center justify-center gap-2 pt-1">
                  {[5, 10, 20, 50].map((step) => (
                    <button
                      key={step}
                      type="button"
                      onClick={() => handleAdjustQty(step)}
                      className="px-3 py-1.5 text-xs font-mono font-bold bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 active:bg-amber-100"
                    >
                      +{step}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCountedQtyInput('0')}
                    className="px-3 py-1.5 text-xs font-mono font-bold bg-rose-50 border border-rose-300 text-rose-700 rounded-lg hover:bg-rose-100"
                  >
                    Vacío (0)
                  </button>
                </div>
              </div>

              {/* Quick Tags for Observations */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-2">
                  Etiquetas de Estado & Incidencia:
                </label>
                <div className="flex flex-wrap gap-2">
                  {quickTagList.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleTag(tag)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          isSelected
                            ? 'bg-amber-500 border-amber-600 text-slate-950 font-bold shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {tag} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Free text observation field */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Observaciones de Conteo (Libre):
                </label>
                <textarea
                  rows={2}
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Ej: Tarima abierta en la esquina inferior, 2 unidades con empaque deteriorado..."
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Save & Navigation Action Bar */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    disabled={activeLineIndex === 0}
                    onClick={() => setActiveLineIndex(i => Math.max(0, i - 1))}
                    className="flex-1 sm:flex-none px-3.5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-lg flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Anterior</span>
                  </button>

                  <button
                    type="button"
                    disabled={activeLineIndex === lines.length - 1}
                    onClick={() => setActiveLineIndex(i => Math.min(lines.length - 1, i + 1))}
                    className="flex-1 sm:flex-none px-3.5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-lg flex items-center justify-center gap-1"
                  >
                    <span>Siguiente</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  disabled={activeOrder.status === 'COMPLETED' && currentUser.role !== 'ADMIN'}
                  onClick={() => handleSaveCount()}
                  className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm uppercase tracking-wide rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  <ClipboardCheck className="w-5 h-5" />
                  <span>{activeOrder.status === 'COMPLETED' ? 'Inventario Terminado' : 'Guardar Conteo & Continuar'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">
              Seleccione una ubicación para iniciar el conteo.
            </div>
          )}
        </div>
      </div>

      {/* SOS Modal for Floor Operator */}
      <SosAlertModal
        isOpen={showSosModal}
        onClose={() => setShowSosModal(false)}
        currentUser={currentUser}
        currentWarehouse={currentLine?.warehouse || activeOrder.warehouse}
        currentAisle={currentLine?.aisle || activeOrder.aisles[0] || 'Pasillo Activo'}
        currentLocationCode={currentLine?.locationCode || 'Piso'}
        orderId={activeOrder.id}
        orderTitle={activeOrder.title}
        onTriggerSos={onTriggerSosAlert}
      />
    </div>
  );
};
