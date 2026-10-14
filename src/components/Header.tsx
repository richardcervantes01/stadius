import React, { useState, useRef, useEffect } from 'react';
import { 
  Boxes, 
  Upload, 
  ClipboardList, 
  ScanLine, 
  BarChart3, 
  Users, 
  Bell, 
  Volume2, 
  VolumeX, 
  Database,
  RotateCcw,
  BadgeDollarSign,
  Lock,
  LogOut,
  Building,
  Calendar,
  Filter,
  ChevronDown,
  TrendingUp,
  Briefcase,
  Settings,
  KeyRound,
  CheckCircle2,
  Truck,
  Layers,
  PackageCheck,
  FileText,
  DollarSign,
  Check
} from 'lucide-react';
import { User, SosAlert, AppTab, ClientAccount } from '../types/inventory';
import { audioAlert } from '../utils/audioAlert';
import { resetAllToDefaultDemo } from '../utils/storage';

export type MainMenuKey = 'VENTAS' | 'OPERACIONES' | 'COMERCIAL' | 'CONFIGURACION';

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  currentUser: User;
  users: User[];
  onSelectUser: (user: User) => void;
  sosAlerts: SosAlert[];
  onOpenSosDrawer: () => void;
  onOpenUserModal: () => void;
  onOpenSchemaModal: () => void;
  onOpenChangePasswordModal: () => void;
  onLogout: () => void;
  // Client & Period global filters
  clients: ClientAccount[];
  activeClient: string;
  onChangeClient: (client: string) => void;
  availablePeriods: string[];
  activePeriod: string;
  onChangePeriod: (period: string) => void;
  onOpenClientHistoryModal: () => void;
  // Current active operational section
  activeSection: MainMenuKey;
  activeSubOption: string;
  onSelectSubOption: (section: MainMenuKey, subOption: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  users,
  onSelectUser,
  sosAlerts,
  onOpenSosDrawer,
  onOpenUserModal,
  onOpenSchemaModal,
  onOpenChangePasswordModal,
  onLogout,
  clients,
  activeClient,
  onChangeClient,
  availablePeriods,
  activePeriod,
  onChangePeriod,
  onOpenClientHistoryModal,
  activeSection,
  activeSubOption,
  onSelectSubOption,
}) => {
  const [openDropdown, setOpenDropdown] = useState<MainMenuKey | null>(null);
  const [isMuted, setIsMuted] = useState(audioAlert.getMuted());
  const navRef = useRef<HTMLDivElement>(null);

  const activeSosCount = sosAlerts.filter(a => a.status === 'ACTIVE').length;
  const isOperator = currentUser.role === 'OPERATOR';
  const isAdmin = currentUser.role === 'ADMIN';

  const toggleMute = () => {
    const next = !isMuted;
    audioAlert.setMuted(next);
    setIsMuted(next);
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (key: MainMenuKey) => {
    setOpenDropdown(prev => prev === key ? null : key);
  };

  const handleChooseOption = (section: MainMenuKey, subOption: string) => {
    setOpenDropdown(null);
    onSelectSubOption(section, subOption);
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 select-none shadow-md">
      {/* Upper Tier: Logo, Global Filters, System Status & User Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Platform Info with STADIUS WMS branding */}
          <div 
            onClick={() => handleChooseOption('OPERACIONES', 'INVENTARIOS')}
            className="flex items-center gap-3 shrink-0 cursor-pointer group"
            title="Stadius WMS · Operaciones & Inventarios"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner group-hover:scale-105 transition-transform">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black tracking-tight text-xl sm:text-2xl text-white group-hover:text-amber-400 transition-colors">
                  STADIUS <span className="text-amber-400">WMS</span>
                </span>
                <span className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                  v3.0
                </span>
                {isOperator && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Solo Conteo
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Warehouse Management System · Cadena de Suministro
              </p>
            </div>
          </div>

          {/* Center: Global Client and Period Selectors ONLY for Inventarios Cíclicos
              "el filtro del cliente solo debe ser para los inventarios ciclicos, las demás funciones del sistema no debe estar filtrado por los clientes" */}
          {!isOperator && (activeSection === 'OPERACIONES' && activeSubOption === 'INVENTARIOS') && (
            <div className="hidden md:flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
              {/* Cliente selector */}
              <div className="flex items-center gap-1.5 px-2">
                <Building className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-[11px] font-bold text-amber-400 uppercase font-mono">Cliente Inv:</span>
                <select
                  value={activeClient}
                  onChange={(e) => onChangeClient(e.target.value)}
                  className="bg-slate-900 text-xs font-bold text-white rounded-lg px-2 py-1 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="ALL">Todos los Clientes</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>

                <button
                  onClick={onOpenClientHistoryModal}
                  title="Colocar cliente y consultar histórico de inventarios realizados"
                  className="flex items-center gap-1 px-2 py-1 text-[11px] font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg transition-colors ml-1"
                >
                  <Filter className="w-3 h-3" />
                  <span>Histórico</span>
                </button>
              </div>

              <span className="text-slate-700">|</span>

              {/* Periodo selector */}
              <div className="flex items-center gap-1.5 px-2">
                <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="text-[11px] font-bold text-slate-400 uppercase">Periodo:</span>
                <select
                  value={activePeriod}
                  onChange={(e) => onChangePeriod(e.target.value)}
                  className="bg-slate-900 text-xs font-mono font-bold text-indigo-300 rounded-lg px-2 py-1 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="ALL">Todos los Periodos</option>
                  {availablePeriods.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Audio Toggle */}
            <button
              onClick={toggleMute}
              title={isMuted ? 'Activar sonido de alertas' : 'Silenciar alertas'}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Live SOS Alert Bell: ONLY SHOWN IN INVENTARIO */}
            {(activeSection === 'OPERACIONES' && (activeSubOption === 'INVENTARIOS_CORE' || activeSubOption === 'INVENTARIOS_CICLICOS')) && (
              <button
                onClick={onOpenSosDrawer}
                className={`relative flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all backdrop-blur-sm ${
                  activeSosCount > 0
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-700/80 hover:border-slate-600'
                }`}
              >
                <Bell className={`w-3.5 h-3.5 ${activeSosCount > 0 ? 'text-rose-400' : 'text-slate-400'}`} />
                <span className="hidden lg:inline">SOS</span>
                {activeSosCount > 0 && (
                  <span className="w-4 h-4 flex items-center justify-center bg-rose-600 text-white font-bold rounded-full text-[9px]">
                    {activeSosCount}
                  </span>
                )}
              </button>
            )}

            {/* Architecture DDL Modal (Only for Admin) */}
            {isAdmin && (
              <button
                onClick={onOpenSchemaModal}
                title="Ver Modelo de Datos & Esquema SQL Multi-Tenant"
                className="hidden lg:flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
              >
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[11px]">SQL</span>
              </button>
            )}

            {/* Role / User Switcher */}
            <div className="flex items-center gap-2 border-l border-slate-800 pl-2">
              <div className="text-right hidden xl:block">
                <div className="text-xs font-medium text-white leading-tight">{currentUser.name}</div>
                <div className="text-[10px] text-amber-400 font-mono">
                  {currentUser.role === 'ADMIN' ? 'Administrador' : currentUser.role === 'SUPERVISOR' ? 'Supervisor' : 'Operador'}
                </div>
              </div>

              {/* Fast role switcher for simulation */}
              <select
                value={currentUser.id}
                onChange={(e) => {
                  const found = users.find(u => u.id === e.target.value);
                  if (found) onSelectUser(found);
                }}
                className="bg-slate-800 border border-slate-700 text-[11px] text-white rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono max-w-[130px] truncate"
                title="Cambiar usuario o rol de simulación"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    [{u.role}] {u.name}
                  </option>
                ))}
              </select>

              {/* Reset Demo button for Admin */}
              {isAdmin && (
                <button
                  onClick={() => {
                    if (window.confirm('¿Deseas restaurar la base de datos a los valores de prueba originales?')) {
                      resetAllToDefaultDemo();
                    }
                  }}
                  title="Reiniciar a datos demo"
                  className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Logout Button */}
              <button
                onClick={onLogout}
                title="Cerrar Sesión"
                className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors ml-1"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* PRIMARY DROPDOWN MENUS (VENTAS, OPERACIONES, COMERCIAL, CONFIGURACIÓN)
            "las listas desplegables deben permanecer siempre" */}
        <div ref={navRef} className="border-t border-slate-800/80 py-2.5 flex flex-wrap items-center justify-between gap-3">
          
          {/* Left: 4 Persistent Dropdowns */}
          <div className="flex items-center gap-1 sm:gap-2">

            {/* 1. VENTAS DROPDOWN */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown('VENTAS')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                  activeSection === 'VENTAS'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                    : openDropdown === 'VENTAS'
                    ? 'bg-slate-800 text-white border-slate-600'
                    : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-slate-700/80 hover:text-white'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                <span>Ventas</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${openDropdown === 'VENTAS' ? 'rotate-180' : ''}`} />
              </button>

              {openDropdown === 'VENTAS' && (
                <div className="absolute left-0 mt-1.5 w-60 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl py-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-1">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    Módulo de Ventas
                  </div>
                  <button
                    onClick={() => handleChooseOption('VENTAS', 'PEDIDOS')}
                    className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-white flex items-center justify-between transition-colors"
                  >
                    <span>Pedidos de Clientes</span>
                    <PackageCheck className="w-3.5 h-3.5 text-blue-400" />
                  </button>
                  <button
                    onClick={() => handleChooseOption('VENTAS', 'COTIZACIONES')}
                    className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-white flex items-center justify-between transition-colors"
                  >
                    <span>Cotizaciones Logísticas</span>
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <button
                    onClick={() => handleChooseOption('VENTAS', 'DESPACHO')}
                    className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-white flex items-center justify-between transition-colors"
                  >
                    <span>Despacho y Remisiones</span>
                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <button
                    onClick={() => handleChooseOption('VENTAS', 'FACTURACION')}
                    className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-white flex items-center justify-between transition-colors"
                  >
                    <span>Facturación de Almacenaje</span>
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              )}
            </div>

            {/* 2. OPERACIONES DROPDOWN (CON INVENTARIOS CÍCLICOS QUE ABRE ESTE SISTEMA) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown('OPERACIONES')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                  activeSection === 'OPERACIONES'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                    : openDropdown === 'OPERACIONES'
                    ? 'bg-slate-800 text-white border-slate-600'
                    : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-slate-700/80 hover:text-white'
                }`}
              >
                <Boxes className={`w-3.5 h-3.5 ${activeSection === 'OPERACIONES' ? 'text-slate-950' : 'text-amber-400'}`} />
                <span>Operaciones</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${openDropdown === 'OPERACIONES' ? 'rotate-180' : ''}`} />
              </button>

              {openDropdown === 'OPERACIONES' && (
                <div className="absolute left-0 mt-1.5 w-68 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl py-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-1">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    Módulo Operativo de Piso
                  </div>

                  {/* OPCTION INVENTARIOS CICLICOS - PROMINENT AS REQUESTED */}
                  <button
                    onClick={() => handleChooseOption('OPERACIONES', 'INVENTARIOS')}
                    className="w-full text-left px-3 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold flex items-center justify-between transition-colors border-l-2 border-amber-400"
                  >
                    <div className="flex items-center gap-2">
                      <ScanLine className="w-4 h-4 text-amber-400" />
                      <div>
                        <div className="text-white text-xs">Inventarios Cíclicos</div>
                        <div className="text-[10px] text-amber-400/80 font-normal">Carga, Conteo, Órdenes & KPIs</div>
                      </div>
                    </div>
                    <span className="text-[10px] bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded font-black">
                      ACTIVO
                    </span>
                  </button>

                  <div className="h-px bg-slate-800 my-1" />

                  <button
                    onClick={() => handleChooseOption('OPERACIONES', 'MOVIMIENTOS')}
                    className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-white flex items-center justify-between transition-colors"
                  >
                    <span>Movimientos Internos & Reubicaciones</span>
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <button
                    onClick={() => handleChooseOption('OPERACIONES', 'RECEPCION')}
                    className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-white flex items-center justify-between transition-colors"
                  >
                    <span>Recepción de Mercancía (Inbound)</span>
                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <button
                    onClick={() => handleChooseOption('OPERACIONES', 'PUTAWAY')}
                    className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-white flex items-center justify-between transition-colors"
                  >
                    <span>Almacenamiento & Putaway</span>
                    <Boxes className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <button
                    onClick={() => handleChooseOption('OPERACIONES', 'PICKING')}
                    className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-white flex items-center justify-between transition-colors"
                  >
                    <span>Preparación de Pedidos (Picking)</span>
                    <PackageCheck className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              )}
            </div>

            {/* 3. COMERCIAL DROPDOWN */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown('COMERCIAL')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                  activeSection === 'COMERCIAL'
                    ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                    : openDropdown === 'COMERCIAL'
                    ? 'bg-slate-800 text-white border-slate-600'
                    : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-slate-700/80 hover:text-white'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                <span>Comercial</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${openDropdown === 'COMERCIAL' ? 'rotate-180' : ''}`} />
              </button>

              {openDropdown === 'COMERCIAL' && (
                <div className="absolute left-0 mt-1.5 w-64 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl py-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-1">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    Gestión Comercial & Clientes
                  </div>
                  <button
                    onClick={() => {
                      setOpenDropdown(null);
                      onOpenClientHistoryModal();
                    }}
                    className="w-full text-left px-3 py-2 text-amber-300 hover:bg-slate-800 font-semibold flex items-center justify-between transition-colors"
                  >
                    <span>Histórico de Inventarios por Cliente</span>
                    <Filter className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                  <button
                    onClick={() => handleChooseOption('COMERCIAL', 'CLIENTES')}
                    className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-white flex items-center justify-between transition-colors"
                  >
                    <span>Clientes Depositantes (Cuentas)</span>
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <button
                    onClick={() => handleChooseOption('COMERCIAL', 'TARIFARIO')}
                    className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-white flex items-center justify-between transition-colors"
                  >
                    <span>Tarifario de Servicios Logísticos</span>
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <button
                    onClick={() => handleChooseOption('COMERCIAL', 'SLA')}
                    className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-white flex items-center justify-between transition-colors"
                  >
                    <span>Acuerdos de Nivel de Servicio (SLA)</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              )}
            </div>

            {/* 4. CONFIGURACIÓN DROPDOWN (CON CAMBIO DE CLAVE) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown('CONFIGURACION')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                  activeSection === 'CONFIGURACION'
                    ? 'bg-slate-700 text-white border-slate-600 shadow-sm'
                    : openDropdown === 'CONFIGURACION'
                    ? 'bg-slate-800 text-white border-slate-600'
                    : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-slate-700/80 hover:text-white'
                }`}
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>Configuración</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${openDropdown === 'CONFIGURACION' ? 'rotate-180' : ''}`} />
              </button>

              {openDropdown === 'CONFIGURACION' && (
                <div className="absolute left-0 mt-1.5 w-64 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl py-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-1">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    Configuración del Sistema
                  </div>

                  {/* CAMBIO DE CLAVE AS EXPLICITLY REQUESTED */}
                  <button
                    onClick={() => {
                      setOpenDropdown(null);
                      onOpenChangePasswordModal();
                    }}
                    className="w-full text-left px-3 py-2.5 text-amber-300 hover:bg-slate-800 font-bold flex items-center justify-between transition-colors bg-amber-500/10 border-l-2 border-amber-400"
                  >
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-amber-400" />
                      <span>Cambio de Clave</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-normal">Seguridad</span>
                  </button>

                  <div className="h-px bg-slate-800 my-1" />

                  {isAdmin && (
                    <button
                      onClick={() => {
                        setOpenDropdown(null);
                        onOpenUserModal();
                      }}
                      className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-white flex items-center justify-between transition-colors"
                    >
                      <span>Gestión de Usuarios & Roles</span>
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  )}

                  {isAdmin && (
                    <button
                      onClick={() => {
                        setOpenDropdown(null);
                        onOpenSchemaModal();
                      }}
                      className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-white flex items-center justify-between transition-colors"
                    >
                      <span>Esquema SQL DDL Multi-Tenant</span>
                      <Database className="w-3.5 h-3.5 text-indigo-400" />
                    </button>
                  )}

                  {isAdmin && (
                    <button
                      onClick={() => {
                        setOpenDropdown(null);
                        if (window.confirm('¿Deseas restaurar la base de datos a los valores de prueba originales?')) {
                          resetAllToDefaultDemo();
                        }
                      }}
                      className="w-full text-left px-3 py-2 text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 flex items-center justify-between transition-colors"
                    >
                      <span>Reiniciar a Datos Demo</span>
                      <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                    </button>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Right: Context indication */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="hidden sm:inline">Módulo actual:</span>
            <span className="font-bold text-white bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{activeSection === 'OPERACIONES' && activeSubOption === 'INVENTARIOS' ? 'Operaciones > Inventarios Cíclicos' : `${activeSection} > ${activeSubOption}`}</span>
            </span>
          </div>
        </div>

        {/* Secondary Sub-tabs when "Operaciones > Inventarios Cíclicos" is selected */}
        {activeSection === 'OPERACIONES' && activeSubOption === 'INVENTARIOS' && (
          <nav className="flex items-center space-x-1 sm:space-x-2 border-t border-slate-800/80 py-2 overflow-x-auto scrollbar-none animate-in fade-in duration-150">
            {isOperator ? (
              <div className="flex items-center justify-between w-full">
                <button
                  onClick={() => setActiveTab('COUNT')}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-amber-500 text-slate-950 shadow-sm"
                >
                  <ScanLine className="w-4 h-4" />
                  <span>3. Conteo en Piso (Terminal Operador)</span>
                </button>
                <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                  Gafete: <strong>{currentUser.badgeCode}</strong> · Turno: <strong>{currentUser.shift}</strong>
                </span>
              </div>
            ) : (
              <>
                {/* Admin only: Module 1 Excel Import */}
                {isAdmin && (
                  <button
                    onClick={() => setActiveTab('EXCEL')}
                    className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                      activeTab === 'EXCEL'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>1. Carga Excel (Físico)</span>
                  </button>
                )}

                {/* Admin & Supervisor: Valuation / Pricing Tab */}
                <button
                  onClick={() => setActiveTab('VALORIZADO')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                    activeTab === 'VALORIZADO'
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  <BadgeDollarSign className="w-3.5 h-3.5" />
                  <span>Catálogo Valorizado</span>
                </button>

                {/* Admin & Supervisor: Orders */}
                <button
                  onClick={() => setActiveTab('ORDERS')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                    activeTab === 'ORDERS'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>2. Gestión de Órdenes</span>
                </button>

                {/* Admin & Supervisor can also audit or test Count */}
                <button
                  onClick={() => setActiveTab('COUNT')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                    activeTab === 'COUNT'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  <ScanLine className="w-3.5 h-3.5" />
                  <span>3. Conteo en Piso</span>
                </button>

                {/* Admin & Supervisor: KPIs */}
                <button
                  onClick={() => setActiveTab('KPIS')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                    activeTab === 'KPIS'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>4. KPIs & Conciliación</span>
                </button>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};
