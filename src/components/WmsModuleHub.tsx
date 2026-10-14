import React, { useState } from 'react';
import { 
  Boxes, 
  Truck, 
  Layers, 
  PackageCheck, 
  Send, 
  Sliders, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Building, 
  Calendar, 
  Shield, 
  History, 
  ScanLine, 
  ClipboardList, 
  Upload, 
  BadgeDollarSign, 
  BarChart3, 
  AlertTriangle,
  ChevronRight,
  ArrowUpDown,
  FileSpreadsheet,
  Workflow
} from 'lucide-react';
import { User, WmsModule, OperationsSubmenu, CycleCountOrder } from '../types/inventory';

interface WmsModuleHubProps {
  currentUser: User;
  activeClient: string;
  activePeriod: string;
  orders: CycleCountOrder[];
  onSelectModule: (module: WmsModule) => void;
  onOpenInventoryInterface: (targetTab?: 'EXCEL' | 'VALORIZADO' | 'ORDERS' | 'COUNT' | 'KPIS') => void;
  onOpenClientHistoryModal: () => void;
}

export const WmsModuleHub: React.FC<WmsModuleHubProps> = ({
  currentUser,
  activeClient,
  activePeriod,
  orders,
  onSelectModule,
  onOpenInventoryInterface,
  onOpenClientHistoryModal,
}) => {
  const [selectedSubmoduleInfo, setSelectedSubmoduleInfo] = useState<string | null>(null);

  const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
  const inProgressOrders = orders.filter(o => o.status === 'IN_PROGRESS').length;
  const completedOrders = orders.filter(o => o.status === 'COMPLETED').length;

  const isOperator = currentUser.role === 'OPERATOR';
  const isAdmin = currentUser.role === 'ADMIN';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Big System Name & Welcome Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-950 via-slate-900 to-amber-950/40 border border-slate-800 p-8 sm:p-10 shadow-2xl text-white">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wide mb-3">
              <Boxes className="w-4 h-4" />
              <span>SISTEMA INTEGRAL DE GESTIÓN DE ALMACENES · WMS ENTERPRISE</span>
            </div>
            
            {/* NAME IN LARGE LETTERS AS REQUESTED */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white flex flex-wrap items-baseline gap-3">
              <span>STADIUS</span>
              <span className="text-amber-400 drop-shadow-sm">WMS</span>
              <span className="text-xs sm:text-sm font-mono uppercase px-2.5 py-1 rounded-lg bg-slate-800/90 text-slate-300 border border-slate-700 tracking-wider">
                v3.0 Core
              </span>
            </h1>

            <p className="mt-2 text-slate-300 text-sm sm:text-base max-w-2xl font-normal leading-relaxed">
              Plataforma centralizada de logística y administración de depósitos. Seleccione un módulo para gestionar operaciones, control de inventarios físicos y cíclicos, flujos de entrada, putaway, picking o despacho.
            </p>

            {/* Context Info Pills */}
            <div className="mt-5 flex flex-wrap items-center gap-3 text-xs">
              <div className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/80 flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-400">Cliente Activo:</span>
                <strong className="text-white font-semibold">{activeClient}</strong>
              </div>

              <div className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/80 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-400">Periodo:</span>
                <strong className="text-amber-300 font-mono">{activePeriod}</strong>
              </div>

              <div className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/80 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-400">Bodega:</span>
                <strong className="text-emerald-300">{currentUser.assignedWarehouse}</strong>
              </div>

              <div className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/80 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-400">Rol:</span>
                <strong className="text-amber-400 font-bold">{currentUser.role}</strong>
                <span className="text-slate-400">({currentUser.name})</span>
              </div>
            </div>
          </div>

          {/* Action on Header */}
          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
            <button
              onClick={onOpenClientHistoryModal}
              className="px-5 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider border border-slate-700 shadow-sm transition-all flex items-center justify-center gap-2 hover:border-amber-500/50"
            >
              <History className="w-4 h-4 text-amber-400" />
              <span>Histórico de Cliente</span>
            </button>

            <button
              onClick={() => onOpenInventoryInterface('ORDERS')}
              className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Workflow className="w-4 h-4" />
              <span>Ir a Operaciones &gt; Inventarios</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Section Title */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Módulos de Stadius WMS</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              Gestión Integral
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Haga clic en cualquiera de los módulos para acceder a sus funciones y herramientas operativas.
          </p>
        </div>

        <span className="text-xs text-slate-500 font-medium hidden sm:inline">
          Acceso rápido por roles RBAC
        </span>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* 1. MÓDULO RECEPCIÓN (INBOUND) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-inner group-hover:scale-105 transition-transform">
                <Truck className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                Inbound
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900">
              1. Recepción & Entrada
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Descarga de contenedores, validación de ASN (Aviso de Despacho), control de calidad e ingreso a muelles de recepción.
            </p>

            <div className="mt-4 space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Muelles asignados:</span>
                <span className="font-semibold text-slate-800">4 de 6 en operación</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">ASN pendientes hoy:</span>
                <span className="font-semibold text-blue-600">7 órdenes de compra</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Cross-docking directo:</span>
                <span className="font-semibold text-slate-800">Habilitado</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setSelectedSubmoduleInfo('Recepción & Entrada (Inbound): Módulo listo con control de ASN, pesaje en muelle y descarga rápida.')}
            className="mt-5 w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-xs border border-slate-200 hover:border-blue-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Ver Módulo Recepción</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 2. MÓDULO ALMACENAMIENTO (PUTAWAY) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-inner group-hover:scale-105 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                Putaway
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900">
              2. Almacenamiento & Ubicación
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Algoritmo de asignación óptima por rotación ABC, volumetría, capacidad de carga de estanterías y compatibilidad FIFO/FEFO.
            </p>

            <div className="mt-4 space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Ocupación Bodega Central:</span>
                <span className="font-semibold text-indigo-600">82.4% ocupado</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Pallets por ubicar:</span>
                <span className="font-semibold text-slate-800">18 posiciones</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Regla activa:</span>
                <span className="font-semibold text-slate-800">Rotación ABC + FEFO</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setSelectedSubmoduleInfo('Almacenamiento (Putaway): Algoritmo de distribución automática por altura, capacidad de rack y compatibilidad de productos.')}
            className="mt-5 w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-bold text-xs border border-slate-200 hover:border-indigo-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Ver Módulo Putaway</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3. MÓDULO OPERACIONES (HIGHLIGHTED HERO CARD WITH INVENTARIOS SELECTION) */}
        <div className="bg-linear-to-b from-amber-500/10 via-white to-amber-500/5 rounded-2xl border-2 border-amber-500/60 p-6 shadow-md hover:shadow-xl transition-all flex flex-col justify-between relative ring-4 ring-amber-500/10">
          <div className="absolute -top-3 right-4 bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm">
            MÓDULO CENTRAL
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center border border-amber-500/40 shadow-inner">
                <Boxes className="w-7 h-7 text-amber-600" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-amber-100 text-amber-800 border border-amber-300 font-mono">
                Operaciones WMS
              </span>
            </div>

            <h3 className="text-lg font-black text-slate-950 flex items-center gap-1.5">
              <span>3. Operaciones</span>
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Módulo integral de piso operativo. Contiene la gestión de inventarios cíclicos, conteo ciego, conciliación y movimientos internos.
            </p>

            {/* SELECTION FOR INVENTARIOS AS EXPLICITLY REQUESTED */}
            <div className="mt-4 p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-amber-950 flex items-center gap-1.5">
                  <ScanLine className="w-4 h-4 text-amber-700" />
                  <span>Selección: Inventarios</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {orders.length} Órdenes
                </span>
              </div>
              
              <p className="text-[11px] text-amber-900 leading-normal">
                Al seleccionar esta opción se despliega la interfaz completa de inventarios: Carga Excel, Catálogo Valorizado, Órdenes Cíclicas, Conteo en Piso y KPIs ERI/ERU.
              </p>

              {/* Status breakdown pills */}
              <div className="grid grid-cols-3 gap-1 pt-1 text-center font-mono text-[10px]">
                <div className="bg-white/80 p-1 rounded border border-amber-200">
                  <span className="block text-slate-500">Pendientes</span>
                  <span className="font-bold text-slate-800">{pendingOrders}</span>
                </div>
                <div className="bg-white/80 p-1 rounded border border-amber-200">
                  <span className="block text-blue-500">En proceso</span>
                  <span className="font-bold text-blue-700">{inProgressOrders}</span>
                </div>
                <div className="bg-white/80 p-1 rounded border border-amber-200">
                  <span className="block text-emerald-500">Terminados</span>
                  <span className="font-bold text-emerald-700">{completedOrders}</span>
                </div>
              </div>

              {/* THE BUTTON TO OPEN INVENTARIOS INTERFACE */}
              <button
                onClick={() => onOpenInventoryInterface('ORDERS')}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>INGRESAR A INVENTARIOS</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick submodule pills */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
              <button
                onClick={() => onOpenInventoryInterface('COUNT')}
                className="p-2 rounded-lg bg-white border border-slate-200 hover:border-amber-400 text-slate-700 hover:text-amber-800 text-left font-medium transition-colors flex items-center justify-between"
              >
                <span>Terminal Conteo</span>
                <ScanLine className="w-3.5 h-3.5 text-amber-600" />
              </button>

              <button
                onClick={() => onOpenInventoryInterface('VALORIZADO')}
                className="p-2 rounded-lg bg-white border border-slate-200 hover:border-amber-400 text-slate-700 hover:text-amber-800 text-left font-medium transition-colors flex items-center justify-between"
              >
                <span>Catálogo Valorizado</span>
                <BadgeDollarSign className="w-3.5 h-3.5 text-emerald-600" />
              </button>
            </div>
          </div>
        </div>

        {/* 4. MÓDULO PREPARACIÓN DE PEDIDOS (PICKING / PACKING) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 shadow-inner group-hover:scale-105 transition-transform">
                <PackageCheck className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-purple-50 text-purple-700 border border-purple-200 font-mono">
                Picking / Packing
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900">
              4. Preparación de Pedidos
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Generación de olas de picking (Wave picking), consolidación multicliente, estación de empaque y etiquetado con código de barras.
            </p>

            <div className="mt-4 space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Olas en ejecución:</span>
                <span className="font-semibold text-purple-600">3 activas</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Líneas por surtir:</span>
                <span className="font-semibold text-slate-800">142 líneas</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Eficiencia de picking:</span>
                <span className="font-semibold text-emerald-600">99.1% On-Time</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setSelectedSubmoduleInfo('Preparación de Pedidos: Sistema de Wave Picking por pasillos y verificación con scanner óptico en estación de packing.')}
            className="mt-5 w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 font-bold text-xs border border-slate-200 hover:border-purple-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Ver Módulo Picking</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 5. MÓDULO DESPACHO (OUTBOUND) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-inner group-hover:scale-105 transition-transform">
                <Send className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                Outbound
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900">
              5. Despacho & Salida
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Programación de muelles de carga, consolidación de guías de remisión, manifiestos de transporte y entrega a transportistas.
            </p>

            <div className="mt-4 space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Muelles de salida:</span>
                <span className="font-semibold text-emerald-600">3 camiones en carga</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Guías generadas:</span>
                <span className="font-semibold text-slate-800">28 guías hoy</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Trazabilidad de ruta:</span>
                <span className="font-semibold text-slate-800">GPS & Manifiesto</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setSelectedSubmoduleInfo('Despacho & Salida: Control de embarques, validación de sellos de seguridad y generación de guías electrónicas de remisión.')}
            className="mt-5 w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold text-xs border border-slate-200 hover:border-emerald-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Ver Módulo Despacho</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 6. MÓDULO MAESTROS & CONFIGURACIÓN */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200 shadow-inner group-hover:scale-105 transition-transform">
                <Sliders className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                Maestros & Core
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900">
              6. Maestros & Configuración
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Catálogo maestro de artículos SKU, definición de bodegas, pasillos y racks, cuentas de clientes multi-tenant y seguridad RBAC.
            </p>

            <div className="mt-4 space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Clientes activos:</span>
                <span className="font-semibold text-slate-800">Multi-tenant habilitado</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Estructura física:</span>
                <span className="font-semibold text-slate-800">Bodega &gt; Pasillo &gt; Ubic &gt; Nivel</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Seguridad:</span>
                <span className="font-semibold text-amber-700">Admin, Supervisor, Operador</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onOpenInventoryInterface('EXCEL')}
            className="mt-5 w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Carga de Base de Datos</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Interactive notification dialog for auxiliary modules */}
      {selectedSubmoduleInfo && (
        <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/40 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                Stadius WMS · Vista de Módulo
              </span>
              <p className="text-xs text-slate-300">
                {selectedSubmoduleInfo}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onOpenInventoryInterface('ORDERS')}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase"
            >
              Ir a Operaciones
            </button>
            <button
              onClick={() => setSelectedSubmoduleInfo(null)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Operator Warning Banner if Operator logs into Hub */}
      {isOperator && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-amber-700 shrink-0" />
            <div className="text-xs">
              <strong className="font-bold">Perfil de Operador Detectado:</strong> Su rol está optimizado para la ejecución de conteos físicos en piso sin distracciones.
            </div>
          </div>
          <button
            onClick={() => onOpenInventoryInterface('COUNT')}
            className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase shrink-0"
          >
            Ir a Conteo en Piso
          </button>
        </div>
      )}
    </div>
  );
};
