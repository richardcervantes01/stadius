import React, { useState, useMemo } from 'react';
import { 
  Building, 
  History, 
  X, 
  Search, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  Trash2, 
  ExternalLink,
  Layers,
  ArrowRight,
  ShieldAlert,
  BarChart2
} from 'lucide-react';
import { CycleCountOrder, ClientAccount, User } from '../types/inventory';

interface ClientHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: ClientAccount[];
  activeClient: string;
  onSelectClient: (clientName: string) => void;
  orders: CycleCountOrder[];
  currentUser: User;
  onReopenOrder: (orderId: string) => void;
  onDeleteOrder: (orderId: string) => void;
  onViewOrderInCount: (orderId: string) => void;
  onAddClient?: (clientName: string) => void;
}

export const ClientHistoryModal: React.FC<ClientHistoryModalProps> = ({
  isOpen,
  onClose,
  clients,
  activeClient,
  onSelectClient,
  orders,
  currentUser,
  onReopenOrder,
  onDeleteOrder,
  onViewOrderInCount,
  onAddClient,
}) => {
  const [selectedClientName, setSelectedClientName] = useState<string>(
    activeClient !== 'ALL' ? activeClient : (clients[0]?.name || 'Retail Pro S.A.')
  );
  const [newClientInput, setNewClientInput] = useState<string>('');
  const [showNewClientForm, setShowNewClientForm] = useState<boolean>(false);

  const isAdmin = currentUser.role === 'ADMIN';

  // Orders for the currently chosen client
  const clientOrders = useMemo(() => {
    return orders.filter(o => o.clientName === selectedClientName);
  }, [orders, selectedClientName]);

  // Client stats
  const totalOrders = clientOrders.length;
  const completedOrders = clientOrders.filter(o => o.status === 'COMPLETED').length;
  const inProgressOrders = clientOrders.filter(o => o.status === 'IN_PROGRESS').length;
  const pendingOrders = clientOrders.filter(o => o.status === 'PENDING').length;

  const totalLocationsCounted = clientOrders.reduce((sum, o) => sum + o.countedLocations, 0);
  const totalScheduledLocations = clientOrders.reduce((sum, o) => sum + o.totalLocations, 0);

  const handleAddNewClient = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newClientInput.trim();
    if (!trimmed) return;

    if (onAddClient) {
      onAddClient(trimmed);
    }
    setSelectedClientName(trimmed);
    setNewClientInput('');
    setShowNewClientForm(false);
  };

  const handleConfirmAndProceed = () => {
    onSelectClient(selectedClientName);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 p-5 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Selección de Cliente & Histórico de Inventarios</span>
              </h2>
              <p className="text-xs text-slate-400">
                Consulte las auditorías cíclicas realizadas para cada cuenta o ingrese un nuevo cliente
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Client Selector & Input Bar */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 shrink-0 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex-1">
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-amber-500" />
                <span>Colocar o Seleccionar Cliente:</span>
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={selectedClientName}
                  onChange={(e) => setSelectedClientName(e.target.value)}
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.name}>
                      {c.name} {c.code ? `(${c.code})` : ''}
                    </option>
                  ))}
                  {/* If user typed a custom client not in list */}
                  {!clients.some(c => c.name === selectedClientName) && (
                    <option value={selectedClientName}>{selectedClientName} (Personalizado)</option>
                  )}
                </select>

                <button
                  type="button"
                  onClick={() => setShowNewClientForm(!showNewClientForm)}
                  className="px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl shadow-xs transition-colors flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-600" />
                  <span>Nuevo Cliente</span>
                </button>
              </div>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleConfirmAndProceed}
                className="w-full sm:w-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <span>Usar este Cliente en WMS</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Collapsible form to add custom client */}
          {showNewClientForm && (
            <form onSubmit={handleAddNewClient} className="p-3 bg-white rounded-xl border border-amber-300 flex items-center gap-2">
              <Building className="w-4 h-4 text-amber-500 shrink-0" />
              <input
                type="text"
                required
                placeholder="Nombre de la nueva empresa o cliente (ej: Farmacéutica del Sur)..."
                value={newClientInput}
                onChange={(e) => setNewClientInput(e.target.value)}
                className="flex-1 text-xs px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors"
              >
                Registrar
              </button>
            </form>
          )}

          {/* Quick Metrics for the selected client */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Inventarios</span>
              <span className="text-lg font-black text-slate-900 font-mono">{totalOrders}</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">Terminados</span>
              <span className="text-lg font-black text-emerald-700 font-mono">{completedOrders}</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-amber-700 block">En Proceso</span>
              <span className="text-lg font-black text-amber-700 font-mono">{inProgressOrders}</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-600 block">Pendientes</span>
              <span className="text-lg font-black text-slate-700 font-mono">{pendingOrders}</span>
            </div>
          </div>
        </div>

        {/* Historical List of Inventories for this Client */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <History className="w-4 h-4 text-amber-500" />
              <span>Historial de Inventarios Cíclicos: {selectedClientName}</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              {clientOrders.length} registros encontrados
            </span>
          </div>

          {clientOrders.length > 0 ? (
            <div className="space-y-3">
              {clientOrders.map((order) => {
                const isCompleted = order.status === 'COMPLETED';
                const isPending = order.status === 'PENDING';
                const isInProgress = order.status === 'IN_PROGRESS';

                const progress = order.totalLocations > 0
                  ? Math.round((order.countedLocations / order.totalLocations) * 100)
                  : 0;

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {order.id}
                        </span>

                        {/* Status 3 Official States */}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>Pendiente (Pre cargado)</span>
                          </span>
                        )}
                        {isInProgress && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                            <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                            <span>En Proceso (En trabajo)</span>
                          </span>
                        )}
                        {isCompleted && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Terminado (Culminado)</span>
                          </span>
                        )}

                        <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded font-bold">
                          Periodo: {order.period || '2026-10'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Creado: {order.createdAt}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900">
                        {order.title}
                      </h4>

                      <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span>Bodega: <strong className="text-slate-800">{order.warehouse}</strong></span>
                        <span>·</span>
                        <span>Pasillo(s): <strong className="font-mono text-slate-800">{order.aisles.join(', ')}</strong></span>
                        <span>·</span>
                        <span>Operador: <strong className="text-slate-800">{order.assignedOperatorName}</strong></span>
                        <span>·</span>
                        <span>Avance: <strong className="font-mono text-slate-900">{order.countedLocations}/{order.totalLocations} ({progress}%)</strong></span>
                      </div>

                      {order.completedAt && (
                        <p className="text-[11px] text-emerald-700 font-medium">
                          Culminado el: {order.completedAt}
                        </p>
                      )}
                    </div>

                    {/* Actions column */}
                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      <button
                        onClick={() => {
                          onViewOrderInCount(order.id);
                          onClose();
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
                        title="Ver en módulo de conteo"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Ver</span>
                      </button>

                      {/* Admin-Only Reopen Button */}
                      {isCompleted && isAdmin && (
                        <button
                          onClick={() => {
                            if (window.confirm(`[ADMINISTRADOR] ¿Desea reaperturar el inventario ${order.id} del cliente ${selectedClientName}?`)) {
                              onReopenOrder(order.id);
                            }
                          }}
                          className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center gap-1"
                          title="Volver a aperturar inventario (Exclusivo Administrador)"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reaperturar</span>
                        </button>
                      )}

                      {/* Admin-Only Delete Button */}
                      {isAdmin && (
                        <button
                          onClick={() => {
                            if (window.confirm(`[ADMINISTRADOR] ¿Eliminar permanentemente el inventario ${order.id}?`)) {
                              onDeleteOrder(order.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Eliminar registro (Solo Administrador)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
              <History className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">Sin inventarios registrados para este cliente</p>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                No se han ejecutado inventarios cíclicos con "{selectedClientName}". Puede programar una nueva orden desde el Módulo 2 o cargar base en el Módulo 1.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Cliente activo en WMS: <strong className="text-slate-900">{activeClient}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl shadow-2xs transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={handleConfirmAndProceed}
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-xs transition-colors"
            >
              Confirmar Selección
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
