import React, { useState, useMemo } from 'react';
import { 
  ClipboardList, 
  Plus, 
  Eye, 
  EyeOff, 
  Printer, 
  Play, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Building2, 
  Trash2, 
  ListFilter,
  Layers,
  MapPin,
  CheckSquare,
  Square,
  Building,
  Calendar,
  RotateCcw,
  Lock,
  History
} from 'lucide-react';
import { 
  CycleCountOrder, 
  MasterInventoryItem, 
  User, 
  InventoryCountType, 
  CycleCountLine,
  ClientAccount,
  OrderStatus
} from '../types/inventory';
import { PrintWorksheet } from './PrintWorksheet';

interface OrderManagementModuleProps {
  orders: CycleCountOrder[];
  masterInventory: MasterInventoryItem[];
  users: User[];
  currentUser: User;
  clients: ClientAccount[];
  activeClient: string;
  activePeriod: string;
  onCreateOrder: (newOrder: CycleCountOrder) => void;
  onSelectOrderForCount: (orderId: string) => void;
  onDeleteOrder: (orderId: string) => void;
  onReopenOrder: (orderId: string) => void;
}

export const OrderManagementModule: React.FC<OrderManagementModuleProps> = ({
  orders,
  masterInventory,
  users,
  currentUser,
  clients,
  activeClient,
  activePeriod,
  onCreateOrder,
  onSelectOrderForCount,
  onDeleteOrder,
  onReopenOrder,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [printingOrder, setPrintingOrder] = useState<CycleCountOrder | null>(null);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  // Form State for creating order
  const [title, setTitle] = useState('');
  const [orderClient, setOrderClient] = useState(activeClient !== 'ALL' ? activeClient : (clients[0]?.name || 'Retail Pro S.A.'));
  const [orderPeriod, setOrderPeriod] = useState(activePeriod !== 'ALL' ? activePeriod : '2026-10');
  const [warehouse, setWarehouse] = useState(masterInventory[0]?.warehouse || 'B01 - Bodega Central');
  const [selectedAisles, setSelectedAisles] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>(['ALL']);
  const [locationMode, setLocationMode] = useState<'ALL' | 'RANGE' | 'CUSTOM'>('ALL');
  const [locationRangeStart, setLocationRangeStart] = useState<string>('');
  const [locationRangeEnd, setLocationRangeEnd] = useState<string>('');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [countType, setCountType] = useState<InventoryCountType>('BLIND');
  const [tolerance, setTolerance] = useState<number>(0);
  const [assignedOperatorId, setAssignedOperatorId] = useState('');
  const [assignedSupervisorId, setAssignedSupervisorId] = useState('');

  const isAdmin = currentUser.role === 'ADMIN';

  // Extract unique options from master inventory filtered by client if applicable
  const availableWarehouses = useMemo(() => 
    Array.from(new Set(masterInventory.map(i => i.warehouse))),
    [masterInventory]
  );

  const availableAisles = useMemo(() => 
    Array.from(new Set(masterInventory.filter(i => i.warehouse === warehouse).map(i => i.aisle))),
    [masterInventory, warehouse]
  );

  // Available levels in the selected warehouse and aisles
  const availableLevels = useMemo(() => {
    const itemsInScope = masterInventory.filter(i => 
      i.warehouse === warehouse && 
      (selectedAisles.length === 0 || selectedAisles.includes(i.aisle))
    );
    return Array.from(new Set(itemsInScope.map(i => i.verticalLevel)));
  }, [masterInventory, warehouse, selectedAisles]);

  // Available location codes in scope
  const availableLocationCodes = useMemo(() => {
    const itemsInScope = masterInventory.filter(i => 
      i.warehouse === warehouse && 
      (selectedAisles.length === 0 || selectedAisles.includes(i.aisle)) &&
      (selectedLevels.includes('ALL') || selectedLevels.length === 0 || selectedLevels.includes(i.verticalLevel))
    );
    return Array.from(new Set(itemsInScope.map(i => i.locationCode))).sort();
  }, [masterInventory, warehouse, selectedAisles, selectedLevels]);

  // Available users by role
  const operators = users.filter(u => u.role === 'OPERATOR');
  const supervisors = users.filter(u => u.role === 'SUPERVISOR' || u.role === 'ADMIN');

  // Calculate matching items based on selected filters (Bodega, Pasillo, Ubicación, Nivel/Altura)
  const matchingInventory = useMemo(() => {
    return masterInventory.filter(item => {
      // Bodega
      if (item.warehouse !== warehouse) return false;

      // Pasillo
      if (selectedAisles.length > 0 && !selectedAisles.includes(item.aisle)) return false;

      // Nivel / Altura
      if (!selectedLevels.includes('ALL') && selectedLevels.length > 0 && !selectedLevels.includes(item.verticalLevel)) {
        return false;
      }

      // Ubicación
      if (locationMode === 'CUSTOM') {
        if (selectedLocations.length > 0 && !selectedLocations.includes(item.locationCode)) {
          return false;
        }
      } else if (locationMode === 'RANGE') {
        if (locationRangeStart && item.locationCode < locationRangeStart) return false;
        if (locationRangeEnd && item.locationCode > locationRangeEnd) return false;
      }

      return true;
    });
  }, [
    masterInventory, 
    warehouse, 
    selectedAisles, 
    selectedLevels, 
    locationMode, 
    selectedLocations, 
    locationRangeStart, 
    locationRangeEnd
  ]);

  const handleOpenCreateModal = () => {
    const initialAisle = availableAisles.slice(0, 1);
    setTitle(`Cíclico ${new Date().toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })} - ${warehouse}`);
    setOrderClient(activeClient !== 'ALL' ? activeClient : (clients[0]?.name || 'Retail Pro S.A.'));
    setOrderPeriod(activePeriod !== 'ALL' ? activePeriod : '2026-10');
    setSelectedAisles(initialAisle);
    setSelectedLevels(['ALL']);
    setLocationMode('ALL');
    setLocationRangeStart('');
    setLocationRangeEnd('');
    setSelectedLocations([]);
    setCountType('BLIND');
    setTolerance(0);
    setAssignedOperatorId(operators[0]?.id || users[0]?.id || '');
    setAssignedSupervisorId(supervisors[0]?.id || users[0]?.id || '');
    setShowCreateModal(true);
  };

  const handleToggleAisle = (aisle: string) => {
    setSelectedAisles(prev => 
      prev.includes(aisle) ? prev.filter(a => a !== aisle) : [...prev, aisle]
    );
  };

  const handleToggleLevel = (level: string) => {
    if (level === 'ALL') {
      setSelectedLevels(['ALL']);
      return;
    }
    const filteredWithoutAll = selectedLevels.filter(l => l !== 'ALL');
    if (filteredWithoutAll.includes(level)) {
      const next = filteredWithoutAll.filter(l => l !== level);
      setSelectedLevels(next.length === 0 ? ['ALL'] : next);
    } else {
      setSelectedLevels([...filteredWithoutAll, level]);
    }
  };

  const handleToggleLocationCode = (locCode: string) => {
    setSelectedLocations(prev => 
      prev.includes(locCode) ? prev.filter(l => l !== locCode) : [...prev, locCode]
    );
  };

  const handleCreateOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (matchingInventory.length === 0) {
      alert('No hay ubicaciones que coincidan con la combinación de Bodega, Pasillo, Ubicación y Nivel/Altura seleccionados.');
      return;
    }

    const assignedOp = users.find(u => u.id === assignedOperatorId) || users[0];
    const assignedSup = users.find(u => u.id === assignedSupervisorId) || users[1];

    const orderId = `ORD-2026-${String(orders.length + 1).padStart(3, '0')}`;

    const lines: CycleCountLine[] = matchingInventory.map((item, idx) => ({
      id: `LINE-${Date.now()}-${idx}`,
      orderId,
      warehouse: item.warehouse,
      aisle: item.aisle,
      locationCode: item.locationCode,
      verticalLevel: item.verticalLevel,
      sku: item.sku,
      description: item.description,
      batch: item.batch,
      theoreticalQty: item.theoreticalQty,
      unitCost: item.unitCost,
      status: 'PENDING',
      recountRequired: false,
      discrepancyUnits: 0,
      discrepancyCost: 0,
    }));

    const newOrder: CycleCountOrder = {
      id: orderId,
      title: title || `Orden de Cíclico ${orderId}`,
      clientName: orderClient,
      period: orderPeriod,
      type: countType,
      status: 'PENDING', // 1. Pendiente (Pre cargado)
      storageType: matchingInventory[0]?.storageType || 'RACK_HEIGHT',
      warehouse,
      aisles: selectedAisles.length > 0 ? selectedAisles : ['Todos los pasillos'],
      selectedLevels: selectedLevels.includes('ALL') ? ['Todos los Niveles'] : selectedLevels,
      selectedLocations: locationMode === 'CUSTOM' && selectedLocations.length > 0 
        ? selectedLocations 
        : undefined,
      locationRangeStart: locationMode === 'RANGE' ? locationRangeStart : undefined,
      locationRangeEnd: locationMode === 'RANGE' ? locationRangeEnd : undefined,
      tolerancePercentage: tolerance,
      assignedOperatorId: assignedOp.id,
      assignedOperatorName: assignedOp.name,
      supervisorId: assignedSup.id,
      supervisorName: assignedSup.name,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      totalLocations: lines.length,
      countedLocations: 0,
      lines,
    };

    onCreateOrder(newOrder);
    setShowCreateModal(false);
  };

  // Filter orders by Client, Period and Status
  const filteredOrders = orders.filter(o => {
    // Client filter
    if (activeClient !== 'ALL' && o.clientName && o.clientName !== activeClient) {
      return false;
    }
    // Period filter
    if (activePeriod !== 'ALL' && o.period && o.period !== activePeriod) {
      return false;
    }
    // Status filter
    if (selectedStatusFilter !== 'ALL' && o.status !== selectedStatusFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Module Header Banner with Client Context */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
            <ClipboardList className="w-5 h-5 text-amber-500" />
            <span>Módulo 2: Gestión de Órdenes & Histórico de Inventarios</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Cliente activo: <strong className="text-slate-900">{activeClient === 'ALL' ? 'Todos los Clientes' : activeClient}</strong></span>
            <span>·</span>
            <span>Periodo: <strong className="text-indigo-700 font-mono">{activePeriod === 'ALL' ? 'Todos los Periodos' : activePeriod}</strong></span>
            <span>·</span>
            <span className="text-amber-800 font-medium">3 Estados: Pendiente, En proceso y Terminado</span>
          </div>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg shadow-xs transition-colors self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Orden de Inventario Cíclico</span>
        </button>
      </div>

      {/* Orders Filter & Stats Bar (3 Official States) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <ListFilter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-600 shrink-0">Filtrar Estado:</span>
          
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setSelectedStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                selectedStatusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Todas ({filteredOrders.length})
            </button>
            <button
              onClick={() => setSelectedStatusFilter('PENDING')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                selectedStatusFilter === 'PENDING' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              1. Pendiente (Pre cargado)
            </button>
            <button
              onClick={() => setSelectedStatusFilter('IN_PROGRESS')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                selectedStatusFilter === 'IN_PROGRESS' ? 'bg-white text-amber-700 font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              2. En Proceso (En trabajo)
            </button>
            <button
              onClick={() => setSelectedStatusFilter('COMPLETED')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                selectedStatusFilter === 'COMPLETED' ? 'bg-white text-emerald-700 font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              3. Terminado (Culminado)
            </button>
          </div>
        </div>

        <span className="text-xs text-slate-500 font-mono">
          Mostrando {filteredOrders.length} inventarios en histórico
        </span>
      </div>

      {/* Orders Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const isBlind = order.type === 'BLIND';
            const progress = order.totalLocations > 0 
              ? Math.round((order.countedLocations / order.totalLocations) * 100) 
              : 0;

            const isCompleted = order.status === 'COMPLETED';

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between p-5"
              >
                <div>
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {order.id}
                        </span>
                        <span className="text-[10px] font-mono text-indigo-700 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">
                          {order.period || '2026-10'}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-2 leading-tight">
                        {order.title}
                      </h3>
                      <div className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                        <Building className="w-3 h-3 text-slate-400" />
                        <span>{order.clientName || 'Cliente Principal'}</span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isBlind ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}
                      title={isBlind ? 'El operador no ve la cantidad teórica esperada' : 'El operador ve la cantidad teórica'}
                    >
                      {isBlind ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{isBlind ? 'Ciego' : 'Auditado'}</span>
                    </span>
                  </div>

                  {/* Assignment 4 Criteria Badges */}
                  <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-2.5 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-semibold text-slate-500">Bodega:</span>
                      <span className="font-bold text-slate-900">{order.warehouse}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-semibold text-slate-500">Pasillo(s):</span>
                      <span className="font-mono text-slate-800">{order.aisles.join(', ')}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-semibold text-slate-500">Nivel / Altura:</span>
                      <span className="font-medium text-indigo-700 truncate max-w-[170px]" title={order.selectedLevels?.join(', ')}>
                        {order.selectedLevels?.join(', ') || 'Todos los Niveles'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-semibold text-slate-500">Ubicaciones:</span>
                      <span className="font-mono font-bold text-amber-800 truncate max-w-[170px]">
                        {order.selectedLocations && order.selectedLocations.length > 0
                          ? `${order.selectedLocations.length} seleccionadas`
                          : order.locationRangeStart 
                          ? `${order.locationRangeStart} → ${order.locationRangeEnd}` 
                          : 'Todas las del pasillo'}
                      </span>
                    </div>
                  </div>

                  {/* Operator and supervisor */}
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-600">
                    <span>Op: <strong className="text-slate-800">{order.assignedOperatorName}</strong></span>
                    <span>Sup: <strong className="text-slate-800">{order.supervisorName}</strong></span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500">Progreso de conteo:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {order.countedLocations}/{order.totalLocations} ({progress}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          progress === 100 ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* 3 OFFICIAL STATES BADGE */}
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <div>
                      {order.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>Pendiente (Pre cargado)</span>
                        </span>
                      )}
                      {order.status === 'IN_PROGRESS' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-300 animate-pulse">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>En Proceso (En trabajo)</span>
                        </span>
                      )}
                      {order.status === 'COMPLETED' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Terminado (Culminado)</span>
                        </span>
                      )}
                    </div>

                    {order.reopenedBy && (
                      <span className="text-[10px] text-indigo-700 font-mono">
                        Reaperturado por Admin
                      </span>
                    )}
                  </div>
                </div>

                {/* Action buttons footer */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setPrintingOrder(order)}
                    title="Imprimir hoja de conteo"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-600" />
                    <span>Imprimir</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {/* If completed, only Admin can reopen */}
                    {isCompleted ? (
                      isAdmin && (
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Reaperturar el inventario ${order.id} y volver a estado 'En Proceso'?`)) {
                              onReopenOrder(order.id);
                            }
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
                          title="Solo el Administrador puede volver a aperturar un inventario culminado"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reaperturar</span>
                        </button>
                      )
                    ) : (
                      <button
                        onClick={() => onSelectOrderForCount(order.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-amber-600 rounded-lg transition-colors shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Contar en Piso</span>
                      </button>
                    )}

                    {/* ONLY ADMIN CAN DELETE DATA */}
                    {isAdmin && (
                      <button
                        onClick={() => {
                          if (window.confirm(`[ADMINISTRADOR] ¿Estás seguro de eliminar permanentemente la orden ${order.id}?`)) {
                            onDeleteOrder(order.id);
                          }
                        }}
                        title="Eliminar orden (Solo Administrador)"
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-3 bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
            <History className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No se encontraron inventarios en el histórico</p>
            <p className="text-xs text-slate-500 mt-1">
              No hay órdenes para el cliente <strong>"{activeClient}"</strong> en el periodo <strong>"{activePeriod}"</strong>.
            </p>
          </div>
        )}
      </div>

      {/* Modal: Crear Nueva Orden con Cliente y Periodo */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-sm">Nueva Orden de Conteo Cíclico</h3>
                  <p className="text-[11px] text-slate-400">Asignación por Cliente, Periodo, Bodega, Pasillo, Ubicación y Nivel</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrderSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Title, Cliente y Periodo */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Cliente / Cuenta
                  </label>
                  <select
                    value={orderClient}
                    onChange={(e) => setOrderClient(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-amber-500 focus:outline-none font-bold"
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Periodo Contable
                  </label>
                  <input
                    type="text"
                    required
                    value={orderPeriod}
                    onChange={(e) => setOrderPeriod(e.target.value)}
                    placeholder="2026-10"
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Título de la Orden
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    placeholder="Ej: Cíclico Pasillo 01"
                  />
                </div>
              </div>

              {/* CRITERIO 1: BODEGA */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wide">
                  <Building2 className="w-4 h-4 text-amber-600" />
                  <span>1. Criterio Bodega / Almacén</span>
                </div>
                <select
                  value={warehouse}
                  onChange={(e) => {
                    setWarehouse(e.target.value);
                    setSelectedAisles([]);
                    setSelectedLevels(['ALL']);
                    setSelectedLocations([]);
                  }}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-amber-500 focus:outline-none font-bold text-slate-900"
                >
                  {availableWarehouses.map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>

              {/* CRITERIO 2: PASILLO */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wide">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    <span>2. Criterio Pasillo / Rack</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {selectedAisles.length > 0 ? `${selectedAisles.length} pasillo(s) seleccionado(s)` : 'Todos los pasillos'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableAisles.map(aisle => {
                    const isSelected = selectedAisles.includes(aisle);
                    return (
                      <button
                        type="button"
                        key={aisle}
                        onClick={() => handleToggleAisle(aisle)}
                        className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-amber-500 border-amber-600 text-slate-950 font-bold shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {aisle} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CRITERIO 3: NIVEL / ALTURA */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wide">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>3. Criterio Nivel / Altura</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Filtra vigas superiores o nivel piso
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleLevel('ALL')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      selectedLevels.includes('ALL')
                        ? 'bg-blue-600 border-blue-700 text-white font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Todos los Niveles / Alturas
                  </button>

                  {availableLevels.map(lvl => {
                    const isSelected = selectedLevels.includes(lvl);
                    return (
                      <button
                        type="button"
                        key={lvl}
                        onClick={() => handleToggleLevel(lvl)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-blue-600 border-blue-700 text-white font-bold shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {lvl} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CRITERIO 4: UBICACIÓN */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wide">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>4. Criterio Ubicación Física</span>
                  </div>
                  
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setLocationMode('ALL')}
                      className={`px-2.5 py-1 rounded font-medium ${
                        locationMode === 'ALL' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'
                      }`}
                    >
                      Todas
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocationMode('RANGE')}
                      className={`px-2.5 py-1 rounded font-medium ${
                        locationMode === 'RANGE' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'
                      }`}
                    >
                      Rango Desde-Hasta
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocationMode('CUSTOM')}
                      className={`px-2.5 py-1 rounded font-medium ${
                        locationMode === 'CUSTOM' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'
                      }`}
                    >
                      Selección Manual
                    </button>
                  </div>
                </div>

                {locationMode === 'RANGE' && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Desde:
                      </label>
                      <select
                        value={locationRangeStart}
                        onChange={(e) => setLocationRangeStart(e.target.value)}
                        className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold"
                      >
                        <option value="">Primera ubicación</option>
                        {availableLocationCodes.map(loc => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Hasta:
                      </label>
                      <select
                        value={locationRangeEnd}
                        onChange={(e) => setLocationRangeEnd(e.target.value)}
                        className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold"
                      >
                        <option value="">Última ubicación</option>
                        {availableLocationCodes.map(loc => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {locationMode === 'CUSTOM' && (
                  <div className="max-h-36 overflow-y-auto bg-white border border-slate-200 rounded-lg p-2 grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {availableLocationCodes.map(loc => {
                      const isChecked = selectedLocations.includes(loc);
                      return (
                        <div
                          key={loc}
                          onClick={() => handleToggleLocationCode(loc)}
                          className={`flex items-center gap-2 p-1.5 rounded cursor-pointer text-xs font-mono transition-colors ${
                            isChecked ? 'bg-amber-50 text-slate-900 font-bold' : 'hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          {isChecked ? (
                            <CheckSquare className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                          )}
                          <span className="truncate">{loc}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Modalidad de Conteo */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Modalidad de Conteo:
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setCountType('BLIND')}
                    className={`cursor-pointer p-2.5 rounded-lg border transition-all ${
                      countType === 'BLIND' ? 'bg-amber-50 border-amber-500 shadow-xs' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                      <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                      <span>Inventario Ciego</span>
                    </div>
                  </div>

                  <div
                    onClick={() => setCountType('NON_BLIND')}
                    className={`cursor-pointer p-2.5 rounded-lg border transition-all ${
                      countType === 'NON_BLIND' ? 'bg-blue-50 border-blue-500 shadow-xs' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      <span>Inventario No Ciego (Auditado)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Operador y Supervisor */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Operador
                  </label>
                  <select
                    value={assignedOperatorId}
                    onChange={(e) => setAssignedOperatorId(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  >
                    {operators.map(op => (
                      <option key={op.id} value={op.id}>{op.name} ({op.badgeCode})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Supervisor
                  </label>
                  <select
                    value={assignedSupervisorId}
                    onChange={(e) => setAssignedSupervisorId(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  >
                    {supervisors.map(sup => (
                      <option key={sup.id} value={sup.id}>{sup.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Tolerancia (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={tolerance}
                    onChange={(e) => setTolerance(Number(e.target.value))}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 font-mono"
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="border border-amber-200 bg-amber-50/70 rounded-xl p-3 flex items-center justify-between text-xs">
                <span className="text-amber-900 font-bold">
                  Ubicaciones que se generarán en estado "Pendiente (Pre cargado)":
                </span>
                <span className="font-mono font-black text-lg text-amber-900">
                  {matchingInventory.length} Ubicaciones
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={matchingInventory.length === 0}
                  className="px-5 py-2.5 text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors"
                >
                  Crear Orden Pre-cargada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Sheet Modal */}
      {printingOrder && (
        <PrintWorksheet
          order={printingOrder}
          onClose={() => setPrintingOrder(null)}
        />
      )}
    </div>
  );
};
