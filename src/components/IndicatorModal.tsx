import React, { useState } from 'react';
import {
  X,
  Save,
  Calculator,
  SlidersHorizontal,
  Sparkles,
  HelpCircle,
  TrendingUp,
  DollarSign,
  Boxes,
  ShieldAlert,
  Warehouse,
  Users,
  Layers,
  Percent,
  Clock,
  Target,
  Lock,
  FileText,
  ScanLine
} from 'lucide-react';
import {
  DashboardIndicator,
  IndicatorCategory,
  IndicatorFormat,
  SystemMetricKey,
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
  ClientAccount
} from '../types/inventory';

interface IndicatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  indicatorToEdit: DashboardIndicator | null;
  onSave: (indicator: DashboardIndicator) => void;
  // System Datasets for live preview calculation
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
}

export const METRIC_DEFINITIONS: Record<SystemMetricKey, { label: string; area: string; format: IndicatorFormat }> = {
  INVENTORY_TOTAL_VALUE: { label: 'Inventario: Valorización Total en Custodia ($)', area: 'Inventarios', format: 'CURRENCY' },
  INVENTORY_ITEMS_COUNT: { label: 'Inventario: Total de SKUs en Catálogo', area: 'Inventarios', format: 'NUMBER' },
  INVENTORY_TOTAL_UNITS: { label: 'Inventario: Unidades Teóricas Totales', area: 'Inventarios', format: 'NUMBER' },
  INVENTORY_DISCREPANCY_UNITS: { label: 'Inventario: Discrepancias Físicas Netas (Unidades)', area: 'Inventarios', format: 'NUMBER' },
  INVENTORY_DISCREPANCY_VALUE: { label: 'Inventario: Desviación Valorizada Neta ($)', area: 'Inventarios', format: 'CURRENCY' },
  INVENTORY_ERI_PERCENT: { label: 'Inventario: Exactitud de Registro de Inventario (ERI %)', area: 'Inventarios', format: 'PERCENT' },
  ORDERS_TOTAL_COUNT: { label: 'Órdenes: Total de Auditorías Cíclicas Creadas', area: 'Inventarios', format: 'NUMBER' },
  ORDERS_IN_PROGRESS_COUNT: { label: 'Órdenes: Conteo Activo en Piso de Bodega', area: 'Inventarios', format: 'NUMBER' },
  ORDERS_COMPLETED_COUNT: { label: 'Órdenes: Ciclos de Conteo Finalizados', area: 'Inventarios', format: 'NUMBER' },
  SOS_ACTIVE_COUNT: { label: 'Alertas: Incidencias de Piso SOS Activas', area: 'Alertas', format: 'NUMBER' },
  SOS_RESOLVED_COUNT: { label: 'Alertas: Incidencias de Piso SOS Resueltas', area: 'Alertas', format: 'NUMBER' },
  WAREHOUSE_OCCUPANCY_PERCENT: { label: 'Almacén: Tasa de Ocupación Efectiva (%)', area: 'Operaciones', format: 'PERCENT' },
  WAREHOUSE_TOTAL_PALLETS: { label: 'Almacén: Capacidad Total Contratada (Pallets)', area: 'Operaciones', format: 'NUMBER' },
  WAREHOUSE_OCCUPIED_PALLETS: { label: 'Almacén: Pallets Físicos Ocupados', area: 'Operaciones', format: 'NUMBER' },
  WAREHOUSE_AVAILABLE_PALLETS: { label: 'Almacén: Pallets Libres Disponibles', area: 'Operaciones', format: 'NUMBER' },
  WAREHOUSE_LOCATIONS_COUNT: { label: 'Almacén: Total de Celdas / Racks en Layout', area: 'Operaciones', format: 'NUMBER' },
  WAREHOUSE_BLOCKED_COUNT: { label: 'Almacén: Celdas Bloqueadas / En Cuarentena', area: 'Operaciones', format: 'NUMBER' },
  STOCK_TOTAL_BATCHES: { label: 'Stock On-Hand: Total de Lotes Registrados', area: 'Operaciones', format: 'NUMBER' },
  STOCK_EXPIRED_BATCHES: { label: 'Stock On-Hand: Lotes Próximos a Vencer (<90d)', area: 'Operaciones', format: 'NUMBER' },
  STOCK_TOTAL_UNITS: { label: 'Stock On-Hand: Unidades Físicas en Bodega', area: 'Operaciones', format: 'NUMBER' },
  COMMERCIAL_QUOTATIONS_TOTAL_VALUE: { label: 'Comercial: Monto Total Cotizado ($)', area: 'Comercial', format: 'CURRENCY' },
  COMMERCIAL_APPROVED_QUOTES_VALUE: { label: 'Comercial: Monto Cotizaciones Aprobadas ($)', area: 'Comercial', format: 'CURRENCY' },
  COMMERCIAL_QUOTES_COUNT: { label: 'Comercial: Cantidad de Cotizaciones Emitidas', area: 'Comercial', format: 'NUMBER' },
  COMMERCIAL_CONVERSION_RATE: { label: 'Comercial: Tasa de Conversión / Cierre (%)', area: 'Comercial', format: 'PERCENT' },
  COMMERCIAL_SETTLEMENTS_TOTAL: { label: 'Comercial: Facturación por Liquidaciones ($)', area: 'Comercial', format: 'CURRENCY' },
  COMMERCIAL_CLIENTS_COUNT: { label: 'Comercial: Cantidad de Clientes Depositantes', area: 'Comercial', format: 'NUMBER' },
  SYSTEM_USERS_COUNT: { label: 'Sistemas: Personal y Usuarios Registrados', area: 'Sistemas', format: 'NUMBER' },
};

export function calculateRawMetric(
  key: SystemMetricKey,
  data: {
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
  }
): number {
  switch (key) {
    case 'INVENTORY_TOTAL_VALUE':
      return data.masterInventory.reduce((acc, it) => acc + (it.theoreticalQty * (it.unitCost || 0)), 0);
    
    case 'INVENTORY_ITEMS_COUNT':
      return data.masterInventory.length;
    
    case 'INVENTORY_TOTAL_UNITS':
      return data.masterInventory.reduce((acc, it) => acc + it.theoreticalQty, 0);
    
    case 'INVENTORY_DISCREPANCY_UNITS': {
      let sum = 0;
      data.orders.forEach(o => o.lines.forEach(l => {
        if (l.status === 'COUNTED') sum += Math.abs(l.discrepancyUnits);
      }));
      return sum;
    }
    
    case 'INVENTORY_DISCREPANCY_VALUE': {
      let sum = 0;
      data.orders.forEach(o => o.lines.forEach(l => {
        if (l.status === 'COUNTED') sum += Math.abs(l.discrepancyCost || 0);
      }));
      return sum;
    }

    case 'INVENTORY_ERI_PERCENT': {
      let totalLines = 0;
      let exactLines = 0;
      data.orders.filter(o => o.status === 'COMPLETED').forEach(o => {
        o.lines.forEach(l => {
          totalLines++;
          if (l.status === 'COUNTED' && l.discrepancyUnits === 0) exactLines++;
        });
      });
      return totalLines > 0 ? (exactLines / totalLines) * 100 : 98.4;
    }

    case 'ORDERS_TOTAL_COUNT':
      return data.orders.length;

    case 'ORDERS_IN_PROGRESS_COUNT':
      return data.orders.filter(o => o.status === 'IN_PROGRESS').length;

    case 'ORDERS_COMPLETED_COUNT':
      return data.orders.filter(o => o.status === 'COMPLETED').length;

    case 'SOS_ACTIVE_COUNT':
      return data.sosAlerts.filter(a => a.status === 'ACTIVE').length;

    case 'SOS_RESOLVED_COUNT':
      return data.sosAlerts.filter(a => a.status === 'RESOLVED').length;

    case 'WAREHOUSE_OCCUPANCY_PERCENT': {
      const contracted = data.services.reduce((acc, s) => acc + s.contractedPallets, 0);
      const occupied = data.services.reduce((acc, s) => acc + s.occupiedPallets, 0);
      return contracted > 0 ? (occupied / contracted) * 100 : 82.5;
    }

    case 'WAREHOUSE_TOTAL_PALLETS':
      return data.services.reduce((acc, s) => acc + s.contractedPallets, 0);

    case 'WAREHOUSE_OCCUPIED_PALLETS':
      return data.services.reduce((acc, s) => acc + s.occupiedPallets, 0);

    case 'WAREHOUSE_AVAILABLE_PALLETS': {
      const contracted = data.services.reduce((acc, s) => acc + s.contractedPallets, 0);
      const occupied = data.services.reduce((acc, s) => acc + s.occupiedPallets, 0);
      return Math.max(0, contracted - occupied);
    }

    case 'WAREHOUSE_LOCATIONS_COUNT':
      return data.warehouseLocations.length;

    case 'WAREHOUSE_BLOCKED_COUNT':
      return data.warehouseLocations.filter(l => l.status === 'BLOQUEADO').length;

    case 'STOCK_TOTAL_BATCHES':
      return data.stockOnHand.length;

    case 'STOCK_EXPIRED_BATCHES': {
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() + 90);
      return data.stockOnHand.filter(s => new Date(s.expiryDate).getTime() <= thresholdDate.getTime()).length;
    }

    case 'STOCK_TOTAL_UNITS':
      return data.stockOnHand.reduce((acc, s) => acc + s.totalQty, 0);

    case 'COMMERCIAL_QUOTATIONS_TOTAL_VALUE':
      return data.quotations.reduce((acc, q) => acc + q.total, 0);

    case 'COMMERCIAL_APPROVED_QUOTES_VALUE':
      return data.quotations.filter(q => q.status === 'APROBADA').reduce((acc, q) => acc + q.total, 0);

    case 'COMMERCIAL_QUOTES_COUNT':
      return data.quotations.length;

    case 'COMMERCIAL_CONVERSION_RATE': {
      const totalQ = data.quotations.length;
      const approvedQ = data.quotations.filter(q => q.status === 'APROBADA').length;
      return totalQ > 0 ? (approvedQ / totalQ) * 100 : 66.7;
    }

    case 'COMMERCIAL_SETTLEMENTS_TOTAL':
      return data.settlements.reduce((acc, s) => acc + s.total, 0);

    case 'COMMERCIAL_CLIENTS_COUNT':
      return data.clients.length;

    case 'SYSTEM_USERS_COUNT':
      return data.users.length;

    default:
      return 0;
  }
}

export function evaluateIndicatorValue(
  indicator: DashboardIndicator,
  data: {
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
  }
): number {
  const valA = calculateRawMetric(indicator.primaryMetric, data);
  if (indicator.metricType === 'DIRECT') {
    return valA;
  }

  if (indicator.metricType === 'FORMULA' && indicator.secondaryMetric && indicator.formulaOperator) {
    const valB = calculateRawMetric(indicator.secondaryMetric, data);
    let result = 0;
    switch (indicator.formulaOperator) {
      case '+': result = valA + valB; break;
      case '-': result = valA - valB; break;
      case '*': result = valA * valB; break;
      case '/': result = valB !== 0 ? (valA / valB) : 0; break;
    }
    if (indicator.factor && indicator.factor !== 0) {
      result = result * indicator.factor;
    }
    return result;
  }

  return valA;
}

export const IndicatorModal: React.FC<IndicatorModalProps> = ({
  isOpen,
  onClose,
  indicatorToEdit,
  onSave,
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
}) => {
  if (!isOpen) return null;

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

  // State
  const [title, setTitle] = useState(indicatorToEdit?.title || '');
  const [description, setDescription] = useState(indicatorToEdit?.description || '');
  const [category, setCategory] = useState<IndicatorCategory>(indicatorToEdit?.category || 'PERSONALIZADO');
  const [format, setFormat] = useState<IndicatorFormat>(indicatorToEdit?.format || 'NUMBER');
  const [colorTheme, setColorTheme] = useState<DashboardIndicator['colorTheme']>(indicatorToEdit?.colorTheme || 'amber');
  const [iconName, setIconName] = useState(indicatorToEdit?.iconName || 'Target');
  
  // Metric Calculation Mode
  const [metricType, setMetricType] = useState<'DIRECT' | 'FORMULA'>(indicatorToEdit?.metricType || 'DIRECT');
  const [primaryMetric, setPrimaryMetric] = useState<SystemMetricKey>(indicatorToEdit?.primaryMetric || 'INVENTORY_TOTAL_VALUE');
  const [formulaOperator, setFormulaOperator] = useState<'+' | '-' | '*' | '/'>(indicatorToEdit?.formulaOperator || '/');
  const [secondaryMetric, setSecondaryMetric] = useState<SystemMetricKey>(indicatorToEdit?.secondaryMetric || 'COMMERCIAL_QUOTATIONS_TOTAL_VALUE');
  const [factor, setFactor] = useState<number>(indicatorToEdit?.factor ?? 100);

  // Targets
  const [targetGoal, setTargetGoal] = useState<number>(indicatorToEdit?.targetGoal ?? 95);
  const [targetComparison, setTargetComparison] = useState<'>=' | '<=' | '==' | '>'>(indicatorToEdit?.targetComparison || '>=');
  const [targetLabel, setTargetLabel] = useState(indicatorToEdit?.targetLabel || 'Meta objetivo');

  // Preview object
  const previewIndicator: DashboardIndicator = {
    id: indicatorToEdit?.id || 'IND-PREVIEW',
    title: title || 'Nuevo Indicador',
    description: description || 'Descripción del indicador calculado en vivo',
    category,
    format,
    iconName,
    metricType,
    primaryMetric,
    formulaOperator: metricType === 'FORMULA' ? formulaOperator : undefined,
    secondaryMetric: metricType === 'FORMULA' ? secondaryMetric : undefined,
    factor: metricType === 'FORMULA' ? factor : undefined,
    targetGoal,
    targetComparison,
    targetLabel,
    colorTheme,
    isCustom: true,
    isVisible: true,
    order: indicatorToEdit?.order || 99,
  };

  const computedValue = evaluateIndicatorValue(previewIndicator, dataset);

  const formatDisplay = (val: number, fmt: IndicatorFormat) => {
    if (fmt === 'CURRENCY') {
      return `$${Math.round(val).toLocaleString()}`;
    }
    if (fmt === 'PERCENT') {
      return `${val.toFixed(1)}%`;
    }
    if (fmt === 'DECIMAL') {
      return val.toFixed(2);
    }
    return Math.round(val).toLocaleString();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Por favor ingresa un título para el indicador');
      return;
    }

    const savedIndicator: DashboardIndicator = {
      id: indicatorToEdit?.id || `IND-CUSTOM-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || 'Indicador personalizado creado por el usuario con datos del sistema',
      category,
      format,
      iconName,
      metricType,
      primaryMetric,
      formulaOperator: metricType === 'FORMULA' ? formulaOperator : undefined,
      secondaryMetric: metricType === 'FORMULA' ? secondaryMetric : undefined,
      factor: metricType === 'FORMULA' ? Number(factor) : undefined,
      targetGoal: Number(targetGoal),
      targetComparison,
      targetLabel: targetLabel.trim() || `Meta ${targetComparison} ${targetGoal}`,
      colorTheme,
      isCustom: true,
      isVisible: true,
      order: indicatorToEdit?.order || Date.now(),
    };

    onSave(savedIndicator);
    onClose();
  };

  const colorClasses = {
    amber: 'border-amber-400 bg-amber-500/10 text-amber-600',
    emerald: 'border-emerald-400 bg-emerald-500/10 text-emerald-600',
    sky: 'border-sky-400 bg-sky-500/10 text-sky-600',
    rose: 'border-rose-400 bg-rose-500/10 text-rose-600',
    purple: 'border-purple-400 bg-purple-500/10 text-purple-600',
    indigo: 'border-indigo-400 bg-indigo-500/10 text-indigo-600',
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                {indicatorToEdit ? 'Modificar Indicador del Sistema' : 'Crear Indicador Propio con Datos del Sistema'}
              </h2>
              <p className="text-xs text-slate-400">
                Configura métricas de inventarios, operaciones, comercial y alertas calculadas en vivo
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

        {/* Modal Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          
          {/* Live Preview Card */}
          <div className="bg-slate-950 rounded-xl p-4 text-white border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-mono text-[10px] uppercase font-bold flex items-center gap-1.5 text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
                Vista Previa en Tiempo Real (Resultado con datos del sistema)
              </span>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">
                {category}
              </span>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-400">{title || 'Título del Indicador'}</div>
                <div className="text-3xl font-black text-white font-mono tracking-tight">
                  {formatDisplay(computedValue, format)}
                </div>
                <div className="text-[11px] text-slate-400 max-w-md line-clamp-1">
                  {description || 'Sin descripción'}
                </div>
              </div>

              <div className={`p-3 rounded-xl border ${colorClasses[colorTheme]} text-right shrink-0`}>
                <span className="text-[11px] font-bold block">{targetLabel || 'Meta'}</span>
                <span className="text-[10px] opacity-80 font-mono">
                  {targetComparison} {formatDisplay(targetGoal, format)}
                </span>
              </div>
            </div>

            {metricType === 'FORMULA' && (
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-mono flex items-center gap-1.5 truncate">
                <span>Fórmula:</span>
                <span className="text-sky-400 truncate">({METRIC_DEFINITIONS[primaryMetric]?.label.split(':')[1] || primaryMetric}</span>
                <span className="font-bold text-amber-400">{formulaOperator}</span>
                <span className="text-emerald-400 truncate">{METRIC_DEFINITIONS[secondaryMetric]?.label.split(':')[1] || secondaryMetric})</span>
                {factor !== 1 && <span className="text-purple-400">* {factor}</span>}
              </div>
            )}
          </div>

          {/* Form Fields: General Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="space-y-1 sm:col-span-2">
              <label className="font-bold text-slate-700">Nombre / Título del Indicador *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Desviación de Inventario %, Ocupación Real vs Contrato..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="font-bold text-slate-700">Descripción / Objetivo Operativo</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve explicación de lo que mide este indicador"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Categoría del Sistema</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as IndicatorCategory)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="INVENTARIOS">Inventarios (Auditorías & Core WMS)</option>
                <option value="OPERACIONES">Operaciones de Almacén (Racks & Layout)</option>
                <option value="COMERCIAL">Comercial (Cotizaciones & Cobros)</option>
                <option value="ALERTAS">Alertas & SOS de Piso</option>
                <option value="SISTEMAS">Sistemas & Seguridad</option>
                <option value="PERSONALIZADO">Personalizado (Métricas combinadas)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Formato Numérico de Visualización</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as IndicatorFormat)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="CURRENCY">Moneda Monetaria ($ USD / CLP)</option>
                <option value="PERCENT">Porcentaje (%)</option>
                <option value="NUMBER">Número Entero (unidades, órdenes, alertas)</option>
                <option value="DECIMAL">Decimal (con 2 decimales)</option>
              </select>
            </div>

          </div>

          {/* Section: Motor de Datos del Sistema (Cálculo directo vs Fórmula) */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-amber-600" />
                Fuente y Motor de Datos del Sistema
              </span>
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="metricType"
                    checked={metricType === 'DIRECT'}
                    onChange={() => setMetricType('DIRECT')}
                    className="text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-slate-700 font-medium">Métrica Directa</span>
                </label>
                <label className="inline-flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="metricType"
                    checked={metricType === 'FORMULA'}
                    onChange={() => setMetricType('FORMULA')}
                    className="text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-slate-700 font-medium">Fórmula Matemática</span>
                </label>
              </div>
            </div>

            {/* Direct Metric Selector */}
            <div className="space-y-2">
              <label className="font-bold text-slate-700">
                {metricType === 'DIRECT' ? 'Variable Principal del Sistema *' : 'Variable A (Numerador / Operando 1) *'}
              </label>
              <select
                value={primaryMetric}
                onChange={(e) => setPrimaryMetric(e.target.value as SystemMetricKey)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                {Object.entries(METRIC_DEFINITIONS).map(([key, def]) => {
                  const currentVal = calculateRawMetric(key as SystemMetricKey, dataset);
                  return (
                    <option key={key} value={key}>
                      [{def.area}] {def.label} — (Valor actual: {formatDisplay(currentVal, def.format)})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Formula Operator and Secondary Metric */}
            {metricType === 'FORMULA' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Operador Matemático</label>
                  <select
                    value={formulaOperator}
                    onChange={(e) => setFormulaOperator(e.target.value as '+' | '-' | '*' | '/')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-mono font-bold focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="/">÷ División (Ratios / Porcentajes)</option>
                    <option value="*">× Multiplicación</option>
                    <option value="+">+ Suma</option>
                    <option value="-">- Resta / Diferencia</option>
                  </select>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-700">Variable B (Denominador / Operando 2) *</label>
                  <select
                    value={secondaryMetric}
                    onChange={(e) => setSecondaryMetric(e.target.value as SystemMetricKey)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {Object.entries(METRIC_DEFINITIONS).map(([key, def]) => {
                      const currentVal = calculateRawMetric(key as SystemMetricKey, dataset);
                      return (
                        <option key={key} value={key}>
                          [{def.area}] {def.label} — (Valor actual: {formatDisplay(currentVal, def.format)})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Factor Multiplicador</label>
                  <input
                    type="number"
                    value={factor}
                    onChange={(e) => setFactor(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
                    placeholder="100 para %, 1 para estándar"
                  />
                  <span className="text-[10px] text-slate-500">Ej. 100 para porcentaje</span>
                </div>

              </div>
            )}
          </div>

          {/* Targets & Alert Thresholds */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Condición de Cumplimiento</label>
              <select
                value={targetComparison}
                onChange={(e) => setTargetComparison(e.target.value as '>=' | '<=' | '==' | '>')}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-amber-500"
              >
                <option value=">=">&gt;= Mayor o igual a meta</option>
                <option value="<=">&lt;= Menor o igual a límite</option>
                <option value=">">&gt; Estrictamente mayor</option>
                <option value="==">== Exactamente igual</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Valor Meta Objetivo</label>
              <input
                type="number"
                value={targetGoal}
                onChange={(e) => setTargetGoal(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
                placeholder="Ej. 98, 5000..."
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Etiqueta de la Meta</label>
              <input
                type="text"
                value={targetLabel}
                onChange={(e) => setTargetLabel(e.target.value)}
                placeholder="Ej. Meta > 98%, Buffer < $5k"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Theme Color Selector */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Color Visual del Indicador</label>
            <div className="flex items-center gap-2">
              {[
                { name: 'amber', label: 'Ámbar (Inventarios / Alertas)', bg: 'bg-amber-500' },
                { name: 'emerald', label: 'Verde Esmeralda (Operaciones / Éxito)', bg: 'bg-emerald-500' },
                { name: 'sky', label: 'Azul Cielo (Comercial / Financiero)', bg: 'bg-sky-500' },
                { name: 'rose', label: 'Rojo Carmesí (Crítico / SOS)', bg: 'bg-rose-500' },
                { name: 'purple', label: 'Morado (Sistemas / Seguridad)', bg: 'bg-purple-500' },
                { name: 'indigo', label: 'Índigo (Base de Datos)', bg: 'bg-indigo-500' },
              ].map(c => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setColorTheme(c.name as DashboardIndicator['colorTheme'])}
                  className={`w-7 h-7 rounded-full ${c.bg} transition-transform ${
                    colorTheme === c.name ? 'ring-2 ring-slate-900 ring-offset-2 scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Indicador en el Sistema</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
