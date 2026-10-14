import React, { useState } from 'react';
import {
  Boxes,
  TrendingUp,
  ShieldAlert,
  Warehouse,
  CheckCircle2,
  Clock,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  ScanLine,
  BarChart3,
  Layers,
  MapPin,
  Building,
  Calendar,
  Sparkles,
  Plus,
  Edit3,
  Trash2,
  RotateCcw,
  Search,
  Filter,
  Check,
  Calculator,
  Percent,
  Users,
  Lock,
  PackageSearch
} from 'lucide-react';
import { 
  MasterInventoryItem, 
  CycleCountOrder, 
  SosAlert, 
  LogisticsQuotation, 
  ContractedService, 
  LogisticsSettlement,
  SkuMasterItem,
  WarehouseLocationRecord,
  StockOnHandRecord,
  User,
  ClientAccount,
  MainNavModule,
  SubNavOption,
  DashboardIndicator,
  IndicatorCategory
} from '../types/inventory';
import { IndicatorModal, evaluateIndicatorValue } from './IndicatorModal';

interface DashboardOverviewProps {
  currentUser: User;
  masterInventory: MasterInventoryItem[];
  orders: CycleCountOrder[];
  sosAlerts: SosAlert[];
  quotations: LogisticsQuotation[];
  services: ContractedService[];
  settlements: LogisticsSettlement[];
  skuCatalog: SkuMasterItem[];
  warehouseLocations: WarehouseLocationRecord[];
  stockOnHand: StockOnHandRecord[];
  users: User[];
  clients: ClientAccount[];
  indicators: DashboardIndicator[];
  onSaveIndicator: (indicator: DashboardIndicator) => void;
  onDeleteIndicator: (id: string) => void;
  onResetIndicators: () => void;
  onNavigate: (module: MainNavModule, subOption: SubNavOption) => void;
  onOpenSosDrawer: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  currentUser,
  masterInventory,
  orders,
  sosAlerts,
  quotations,
  services,
  settlements,
  skuCatalog,
  warehouseLocations,
  stockOnHand,
  users,
  clients,
  indicators,
  onSaveIndicator,
  onDeleteIndicator,
  onResetIndicators,
  onNavigate,
  onOpenSosDrawer,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<IndicatorCategory | 'TODOS'>('TODOS');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingIndicator, setEditingIndicator] = useState<DashboardIndicator | null>(null);

  const dataset = {
    masterInventory,
    orders,
    sosAlerts,
    quotations,
    services,
    settlements,
    skuCatalog,
    warehouseLocations,
    stockOnHand,
    users,
    clients,
  };

  // Filter indicators
  const filteredIndicators = indicators.filter((ind) => {
    if (!ind.isVisible) return false;
    const matchesCategory = selectedCategory === 'TODOS' || ind.category === selectedCategory;
    const matchesSearch = 
      ind.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ind.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ind.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenAddModal = () => {
    setEditingIndicator(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (indicator: DashboardIndicator) => {
    setEditingIndicator(indicator);
    setIsModalOpen(true);
  };

  const formatValue = (val: number, format: DashboardIndicator['format']) => {
    if (format === 'CURRENCY') {
      return `$${Math.round(val).toLocaleString()}`;
    }
    if (format === 'PERCENT') {
      return `${val.toFixed(1)}%`;
    }
    if (format === 'DECIMAL') {
      return val.toFixed(2);
    }
    return Math.round(val).toLocaleString();
  };

  const checkCompliance = (val: number, goal?: number, op?: string): boolean | null => {
    if (goal === undefined || goal === null || !op) return null;
    switch (op) {
      case '>=': return val >= goal;
      case '<=': return val <= goal;
      case '>': return val > goal;
      case '==': return val === goal;
      default: return true;
    }
  };

  const getThemeClasses = (theme: DashboardIndicator['colorTheme']) => {
    switch (theme) {
      case 'emerald':
        return {
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          accent: 'text-emerald-600',
          hover: 'hover:border-emerald-300',
          iconBg: 'bg-emerald-50 text-emerald-600',
        };
      case 'sky':
        return {
          badge: 'bg-sky-50 text-sky-700 border-sky-200',
          accent: 'text-sky-600',
          hover: 'hover:border-sky-300',
          iconBg: 'bg-sky-50 text-sky-600',
        };
      case 'rose':
        return {
          badge: 'bg-rose-50 text-rose-700 border-rose-200',
          accent: 'text-rose-600',
          hover: 'hover:border-rose-300',
          iconBg: 'bg-rose-50 text-rose-600',
        };
      case 'purple':
        return {
          badge: 'bg-purple-50 text-purple-700 border-purple-200',
          accent: 'text-purple-600',
          hover: 'hover:border-purple-300',
          iconBg: 'bg-purple-50 text-purple-600',
        };
      case 'indigo':
        return {
          badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          accent: 'text-indigo-600',
          hover: 'hover:border-indigo-300',
          iconBg: 'bg-indigo-50 text-indigo-600',
        };
      case 'amber':
      default:
        return {
          badge: 'bg-amber-50 text-amber-700 border-amber-200',
          accent: 'text-amber-600',
          hover: 'hover:border-amber-300',
          iconBg: 'bg-amber-50 text-amber-600',
        };
    }
  };

  const renderIndicatorIcon = (iconName: string, className = 'w-4 h-4') => {
    switch (iconName) {
      case 'DollarSign': return <DollarSign className={className} />;
      case 'TrendingUp': return <TrendingUp className={className} />;
      case 'ShieldAlert': return <ShieldAlert className={className} />;
      case 'Warehouse': return <Warehouse className={className} />;
      case 'Users': return <Users className={className} />;
      case 'Layers': return <Layers className={className} />;
      case 'Percent': return <Percent className={className} />;
      case 'Clock': return <Clock className={className} />;
      case 'Lock': return <Lock className={className} />;
      case 'FileText': return <FileText className={className} />;
      case 'ScanLine': return <ScanLine className={className} />;
      case 'Boxes':
      default:
        return <Boxes className={className} />;
    }
  };

  const activeSosList = sosAlerts.filter(a => a.status === 'ACTIVE');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. Welcome & Status Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700/80 shadow-md text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block animate-ping" />
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
              Stadius WMS Core · Tenant Activo
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Panel de Control · Indicadores del Sistema
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Monitoreo en tiempo real de inventarios, operaciones, transacciones comerciales y alertas de piso. Permite agregar, modificar y crear indicadores propios calculados directamente con los datos del sistema.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Indicador Propio</span>
          </button>
          
          <button
            onClick={() => onNavigate('OPERACIONES', 'INVENTARIOS_CORE')}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-xs flex items-center gap-2 transition-all"
            title="Ir a Inventarios Cíclicos (Core WMS)"
          >
            <ScanLine className="w-4 h-4 text-amber-400" />
            <span>Inventarios Cíclicos</span>
          </button>

          <button
            onClick={() => onNavigate('OPERACIONES', 'MAPA_LAYOUT')}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-xs flex items-center gap-2 transition-all"
            title="Ver Mapa Layout de Racks"
          >
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Mapa Layout</span>
          </button>
        </div>
      </div>

      {/* 2. Control Bar: Category Filter, Search & Indicator Management */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
              Área:
            </span>
            {(['TODOS', 'INVENTARIOS', 'OPERACIONES', 'COMERCIAL', 'ALERTAS', 'SISTEMAS', 'PERSONALIZADO'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-amber-400 shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {cat === 'TODOS' && 'Todos los Indicadores'}
                {cat === 'INVENTARIOS' && 'Inventarios (Core)'}
                {cat === 'OPERACIONES' && 'Operaciones & Racks'}
                {cat === 'COMERCIAL' && 'Comercial & Cobros'}
                {cat === 'ALERTAS' && 'Alertas SOS'}
                {cat === 'SISTEMAS' && 'Sistemas'}
                {cat === 'PERSONALIZADO' && 'Personalizados'}
              </button>
            ))}
          </div>

          {/* Search & Reset Default KPIs */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar indicador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <button
              onClick={() => {
                if (window.confirm('¿Deseas restaurar la lista de indicadores a la configuración inicial del sistema?')) {
                  onResetIndicators();
                }
              }}
              title="Restaurar indicadores por defecto"
              className="p-2 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Count summary banner */}
        <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
          <span>
            Mostrando <strong>{filteredIndicators.length}</strong> de <strong>{indicators.length}</strong> indicadores del sistema en vivo.
          </span>
          <span className="text-slate-400 font-mono">
            Haz clic en <span className="font-bold text-slate-600">Editar (icono lápiz)</span> en cualquier tarjeta para cambiar fórmulas o metas.
          </span>
        </div>
      </div>

      {/* 3. Comprehensive Dynamic Indicators Grid (All System KPIs) */}
      {filteredIndicators.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
          <Calculator className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-sm">No se encontraron indicadores con los filtros seleccionados</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Puedes crear un nuevo indicador propio calculado con las variables de inventarios, comercial u operaciones.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs"
          >
            + Crear Nuevo Indicador
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredIndicators.map((indicator) => {
            const rawVal = evaluateIndicatorValue(indicator, dataset);
            const style = getThemeClasses(indicator.colorTheme);
            const isMet = checkCompliance(rawVal, indicator.targetGoal, indicator.targetComparison);

            return (
              <div
                key={indicator.id}
                className={`bg-white rounded-2xl p-5 border border-slate-200 shadow-xs ${style.hover} transition-all flex flex-col justify-between group relative`}
              >
                {/* Card Top: Category, Icon & Actions */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 truncate">
                      <div className={`w-8 h-8 rounded-xl ${style.iconBg} flex items-center justify-center shrink-0`}>
                        {renderIndicatorIcon(indicator.iconName)}
                      </div>
                      <div className="truncate">
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border inline-block ${style.badge}`}>
                          {indicator.category}
                        </span>
                        {indicator.isCustom && (
                          <span className="ml-1 text-[9px] font-mono font-bold px-1 py-0.5 rounded bg-purple-100 text-purple-700">
                            PROPIO
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Actions: Edit & Delete */}
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEditModal(indicator)}
                        title="Modificar este indicador"
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`¿Deseas eliminar el indicador "${indicator.title}"?`)) {
                            onDeleteIndicator(indicator.id);
                          }
                        }}
                        title="Eliminar / ocultar indicador"
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Indicator Title & Description */}
                  <h4 className="font-bold text-xs text-slate-900 tracking-tight line-clamp-1" title={indicator.title}>
                    {indicator.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 min-h-[32px]" title={indicator.description}>
                    {indicator.description}
                  </p>
                </div>

                {/* Card Middle: Calculated Metric Value */}
                <div className="my-3 pt-3 border-t border-slate-100">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
                      {formatValue(rawVal, indicator.format)}
                    </span>
                    {indicator.metricType === 'FORMULA' && (
                      <span className="text-[10px] text-slate-400 font-mono" title="Calculado por fórmula">
                        fx
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Bottom: Target Status / Compliance */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 truncate">
                    {isMet !== null && (
                      <span className={`w-2 h-2 rounded-full shrink-0 ${isMet ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    )}
                    <span className="text-slate-500 truncate" title={indicator.targetLabel || 'Meta'}>
                      {indicator.targetLabel || `Meta ${indicator.targetComparison} ${formatValue(indicator.targetGoal || 0, indicator.format)}`}
                    </span>
                  </div>

                  {isMet !== null && (
                    <span className={`text-[10px] font-bold shrink-0 ${isMet ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isMet ? 'Conforme' : 'Alerta'}
                    </span>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 4. Detailed Operational Tables & Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Active Cyclic Inventory Orders (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ScanLine className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-slate-900 text-sm tracking-tight">
                  Órdenes de Inventario Cíclico en Ejecución
                </h3>
              </div>
              <button
                onClick={() => onNavigate('OPERACIONES', 'INVENTARIOS_CORE')}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
              >
                <span>Ver módulo completo de inventarios</span>
                <span>&gt;</span>
              </button>
            </div>

            {orders.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No hay órdenes de conteo registradas.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {orders.slice(0, 4).map((order) => {
                  const totalLines = order.lines.length;
                  const countedLines = order.lines.filter(l => l.status === 'COUNTED').length;
                  const progressPct = totalLines > 0 ? Math.round((countedLines / totalLines) * 100) : 0;
                  
                  return (
                    <div key={order.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900">{order.id}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            order.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : order.status === 'IN_PROGRESS'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {order.status === 'COMPLETED' ? 'Terminado' : order.status === 'IN_PROGRESS' ? 'En Proceso' : 'Pendiente'}
                          </span>
                          <span className="text-[10px] text-slate-400">· {order.type === 'BLIND' ? 'Conteo Ciego' : 'Conteo Estándar'}</span>
                        </div>
                        <div className="text-xs text-slate-600 font-medium">
                          {order.title} · <span className="text-slate-400">{order.clientName} ({order.warehouse})</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Operador asignado: <strong className="text-slate-700">{order.assignedOperatorName}</strong>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full sm:w-44 space-y-1 shrink-0">
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>Avance</span>
                          <span className="font-bold text-slate-900">{progressPct}% ({countedLines}/{totalLines})</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              progressPct === 100 ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Shortcuts to Warehouse Operations */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="font-black text-slate-900 text-sm tracking-tight mb-3">
              Módulos Logísticos de Operaciones de Almacén
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              
              <div
                onClick={() => onNavigate('OPERACIONES', 'INVENTARIOS_CORE')}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-amber-400 bg-amber-50/30 hover:bg-white cursor-pointer transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <ScanLine className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs text-slate-900">Inventarios Cíclicos</div>
                <p className="text-[11px] text-slate-500 mt-0.5">Auditorías, conteo en piso y conciliación</p>
              </div>

              <div
                onClick={() => onNavigate('OPERACIONES', 'CATALOGO_SKUS')}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-400 bg-slate-50/50 hover:bg-white cursor-pointer transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs text-slate-900">Catálogo de SKUs</div>
                <p className="text-[11px] text-slate-500 mt-0.5">Dimensiones, pesos y clasificación ABC</p>
              </div>

              <div
                onClick={() => onNavigate('OPERACIONES', 'MAPA_LAYOUT')}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-400 bg-slate-50/50 hover:bg-white cursor-pointer transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs text-slate-900">Mapa de Ubicaciones</div>
                <p className="text-[11px] text-slate-500 mt-0.5">Layout de pasillos, racks y celdas 2D</p>
              </div>

              <div
                onClick={() => onNavigate('OPERACIONES', 'STOCK_ON_HAND')}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-400 bg-slate-50/50 hover:bg-white cursor-pointer transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <PackageSearch className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs text-slate-900">Consulta de Stock</div>
                <p className="text-[11px] text-slate-500 mt-0.5">Existencias on-hand por lote y vencimiento</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Floor SOS Live Widget & Accounts */}
        <div className="space-y-6">
          
          {/* Floor SOS Live Widget */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <h3 className="font-black text-slate-900 text-sm tracking-tight">Alertas de Piso en Vivo</h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                {activeSosList.length} ACTIVAS
              </span>
            </div>

            {sosAlerts.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Sin alertas registradas.</p>
            ) : (
              <div className="space-y-2.5">
                {sosAlerts.slice(0, 3).map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-xl border text-xs ${
                      alert.status === 'ACTIVE'
                        ? 'bg-rose-50/60 border-rose-200 text-rose-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span className="font-mono text-[11px]">{alert.locationCode}</span>
                      <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-black ${
                        alert.status === 'ACTIVE' ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {alert.status === 'ACTIVE' ? 'URGENTE' : 'RESUELTO'}
                      </span>
                    </div>
                    <div className="text-[11px] font-medium leading-snug line-clamp-2">
                      {alert.description}
                    </div>
                    <div className="mt-1.5 text-[10px] text-slate-500 flex items-center justify-between">
                      <span>Operador: {alert.operatorName}</span>
                      <span>{alert.createdAt.substring(11, 16)}</span>
                    </div>
                  </div>
                ))}

                <button
                  onClick={onOpenSosDrawer}
                  className="w-full mt-2 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-center"
                >
                  Abrir Panel de Triage SOS
                </button>
              </div>
            )}
          </div>

          {/* Depositor Clients Contracted Spaces */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-sky-500" />
                <h3 className="font-black text-slate-900 text-sm tracking-tight">Cuentas Depositantes</h3>
              </div>
              <button
                onClick={() => onNavigate('COMERCIAL', 'CONSULTAS_SERVICIOS')}
                className="text-xs font-bold text-sky-600 hover:underline"
              >
                Ver Servicios &gt;
              </button>
            </div>

            <div className="space-y-3">
              {services.map(srv => (
                <div key={srv.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span className="truncate">{srv.clientName}</span>
                    <span className="text-[10px] font-mono text-sky-700 bg-sky-100 px-1.5 py-0.5 rounded">
                      {srv.occupancyPercent}% ocupado
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Espacios: {srv.occupiedPallets} / {srv.contractedPallets} pallets</span>
                    <span>SLA: {srv.slaCurrentPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-500 rounded-full"
                      style={{ width: `${Math.min(100, srv.occupancyPercent)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* 5. Custom Indicator Creation / Edit Modal */}
      <IndicatorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        indicatorToEdit={editingIndicator}
        onSave={onSaveIndicator}
        masterInventory={masterInventory}
        orders={orders}
        sosAlerts={sosAlerts}
        quotations={quotations}
        services={services}
        settlements={settlements}
        skuCatalog={skuCatalog}
        warehouseLocations={warehouseLocations}
        stockOnHand={stockOnHand}
        users={users}
        clients={clients}
      />

    </div>
  );
};
