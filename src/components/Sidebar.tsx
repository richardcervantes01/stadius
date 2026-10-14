import React, { useState } from 'react';
import {
  LayoutDashboard,
  Briefcase,
  Boxes,
  Warehouse,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  FileText,
  Search,
  Receipt,
  ScanLine,
  Layers,
  MapPin,
  PackageSearch,
  Users,
  KeyRound,
  Building2,
  Database,
  LogOut,
  ChevronLeft,
  Menu,
  ShieldAlert,
  Sparkles,
  Building,
  Lock
} from 'lucide-react';
import { User, UserRole, MainNavModule, SubNavOption, CompanyTenant } from '../types/inventory';
import { INITIAL_COMPANIES } from '../data/initialData';

interface SidebarProps {
  currentUser: User;
  users: User[];
  companies?: CompanyTenant[];
  onSelectUser: (user: User) => void;
  onSelectCompany?: (companyId: string) => void;
  activeModule: MainNavModule;
  activeSubOption: SubNavOption;
  onNavigate: (module: MainNavModule, subOption: SubNavOption) => void;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeSosCount: number;
  onOpenSosAlerts: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  users,
  companies = INITIAL_COMPANIES,
  onSelectCompany,
  onSelectUser,
  activeModule,
  activeSubOption,
  onNavigate,
  onLogout,
  isCollapsed,
  onToggleCollapse,
  activeSosCount,
  onOpenSosAlerts,
}) => {
  // Collapsible accordion sections state
  const [openSections, setOpenSections] = useState<Record<MainNavModule, boolean>>({
    DASHBOARD: true,
    COMERCIAL: true,
    INVENTARIOS: true,
    OPERACIONES: true,
    SISTEMAS: true,
  });

  const toggleSection = (module: MainNavModule) => {
    setOpenSections(prev => ({
      ...prev,
      [module]: !prev[module],
    }));
  };

  const role = currentUser.role;

  // Custom user permissions configured by Administrator, or role-based defaults
  const canAccessDashboard = currentUser.allowedModules 
    ? currentUser.allowedModules.includes('DASHBOARD')
    : role !== 'OPERATOR';

  const canAccessComercial = currentUser.allowedModules
    ? currentUser.allowedModules.includes('COMERCIAL')
    : role === 'ADMIN' || role === 'SUPERVISOR' || role === 'COMERCIAL';

  const canAccessInventarios = true; // All roles, operators see only floor count

  const canAccessOperaciones = currentUser.allowedModules
    ? currentUser.allowedModules.includes('OPERACIONES')
    : true;

  const canAccessSistemas = currentUser.allowedModules
    ? currentUser.allowedModules.includes('SISTEMAS')
    : true; // All can change password, Admin can manage users and tenant

  // Sub-option checker helper
  const canAccessSub = (sub: SubNavOption): boolean => {
    if (!currentUser.allowedSubOptions) return true;
    return currentUser.allowedSubOptions.includes(sub);
  };

  const roleLabels: Record<UserRole, string> = {
    ADMIN: 'Administrador General',
    SUPERVISOR: 'Supervisor de Turno',
    OPERATOR: 'Operador de Piso',
    COMERCIAL: 'Ejecutivo Comercial',
  };

  const roleColors: Record<UserRole, string> = {
    ADMIN: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    SUPERVISOR: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    OPERATOR: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    COMERCIAL: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
  };

  const isUsingInventarios = 
    activeModule === 'INVENTARIOS' || 
    (activeModule === 'OPERACIONES' && (activeSubOption === 'INVENTARIOS_CORE' || activeSubOption === 'INVENTARIOS_CICLICOS'));

  // SOS button ONLY appears when in Inventario modules, for all roles.
  const showSosButton = isUsingInventarios;

  return (
    <aside
      className={`bg-slate-900 border-r border-slate-800 text-slate-200 flex flex-col shrink-0 transition-all duration-300 select-none z-30 ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 border-b border-slate-800 flex items-center justify-between">
        {!isCollapsed ? (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Boxes className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg text-white tracking-tight">STADIUS</span>
                <span className="font-black text-lg text-amber-400 tracking-tight">WMS</span>
                <span className="text-[9px] font-mono font-bold px-1 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  SaaS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">Logística & Almacenes 3PL</p>
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
            <Boxes className="w-5 h-5" />
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expandir menú lateral' : 'Colapsar menú lateral'}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-auto"
        >
          {isCollapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Active User Mini Profile, Empresa & Role Switcher */}
      <div className="p-3 border-b border-slate-800 bg-slate-950/40">
        {!isCollapsed ? (
          <div className="space-y-2">
            {/* EMPRESA ACTIVE INDICATOR & ADMIN SWITCHER */}
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 uppercase font-mono">
                  <Building className="w-3 h-3 text-amber-400" />
                  <span>Empresa / Tenant:</span>
                </div>
                {currentUser.role === 'ADMIN' ? (
                  <span className="text-[9px] font-bold text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/30">
                    Admin: Todas
                  </span>
                ) : (
                  <span className="text-[9px] font-bold text-slate-400 font-mono flex items-center gap-0.5">
                    <Lock className="w-2.5 h-2.5" /> Asignada
                  </span>
                )}
              </div>

              {currentUser.role === 'ADMIN' && onSelectCompany ? (
                <select
                  value={currentUser.companyId || 'EMP-A'}
                  onChange={(e) => onSelectCompany(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-xs font-bold text-white rounded-lg px-2 py-1 focus:ring-1 focus:ring-amber-500 focus:outline-none truncate"
                  title="El Administrador puede ingresar y conmutar a todas las empresas"
                >
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>
                      [{c.id}] {c.name.slice(0, 24)}...
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-xs font-bold text-white bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 flex items-center justify-between">
                  <span className="truncate">{currentUser.companyName || currentUser.companyId || 'Empresa A'}</span>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-300">
                    {currentUser.companyId || 'EMP-A'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <div className="truncate">
                <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
                <div className={`text-[10px] font-mono px-1.5 py-0.5 rounded border inline-block mt-0.5 ${roleColors[currentUser.role]}`}>
                  {roleLabels[currentUser.role]}
                </div>
              </div>

              {/* SOS ALERT BUTTON: ONLY SHOWN WHEN USING INVENTARIOS */}
              {showSosButton && activeSosCount > 0 && (
                <button
                  onClick={onOpenSosAlerts}
                  className="px-2 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold flex items-center gap-1 animate-pulse"
                  title="Ver alertas SOS activas en inventarios"
                >
                  <ShieldAlert className="w-3 h-3" />
                  <span>{activeSosCount} SOS</span>
                </button>
              )}
            </div>

            {/* Quick Simulation Role Switcher */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 uppercase font-mono">Rol sim:</span>
              <select
                value={currentUser.id}
                onChange={(e) => {
                  const target = users.find(u => u.id === e.target.value);
                  if (target) onSelectUser(target);
                }}
                className="w-full bg-slate-900 border border-slate-700 text-[11px] text-white rounded-md px-2 py-1 focus:ring-1 focus:ring-amber-500 focus:outline-none truncate"
                title="Conmutar rol para prueba multi-perfil"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    [{u.role}] {u.name} ({u.companyId || 'EMP-A'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border ${roleColors[currentUser.role]}`}
              title={`${currentUser.name} (${roleLabels[currentUser.role]}) - ${currentUser.companyId || 'EMP-A'}`}
            >
              {currentUser.name.charAt(0)}
            </div>
            {showSosButton && activeSosCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" title="Alertas SOS en Inventarios" />
            )}
          </div>
        )}
      </div>

      {/* Navigation Scrollable Body */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-none text-xs">

        {/* 1. PANEL DE CONTROL (DASHBOARD) */}
        {canAccessDashboard && (
          <div>
            <button
              onClick={() => {
                if (isCollapsed) {
                  onNavigate('DASHBOARD', 'OVERVIEW');
                } else {
                  toggleSection('DASHBOARD');
                  onNavigate('DASHBOARD', 'OVERVIEW');
                }
              }}
              className={`w-full flex items-center justify-between p-2 rounded-xl transition-all ${
                activeModule === 'DASHBOARD'
                  ? 'bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
              title="Panel de Control (Dashboard)"
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className={`w-4 h-4 shrink-0 ${activeModule === 'DASHBOARD' ? 'text-amber-400' : 'text-slate-400'}`} />
                {!isCollapsed && <span className="font-semibold text-xs tracking-tight">Panel de Control</span>}
              </div>
              {!isCollapsed && (
                <div className="flex items-center gap-1">
                  {openSections.DASHBOARD ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
              )}
            </button>

            {!isCollapsed && openSections.DASHBOARD && canAccessSub('OVERVIEW') && (
              <div className="pl-7 pr-1 py-1 space-y-0.5">
                <button
                  onClick={() => onNavigate('DASHBOARD', 'OVERVIEW')}
                  className={`w-full text-left py-1.5 px-2.5 rounded-lg text-[11px] transition-colors flex items-center justify-between ${
                    activeModule === 'DASHBOARD' && activeSubOption === 'OVERVIEW'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span>Vista General (Overview)</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* 2. MÓDULO COMERCIAL */}
        {canAccessComercial && (
          <div>
            <button
              onClick={() => {
                if (isCollapsed) {
                  onNavigate('COMERCIAL', 'COTIZACIONES');
                } else {
                  toggleSection('COMERCIAL');
                }
              }}
              className={`w-full flex items-center justify-between p-2 rounded-xl transition-all ${
                activeModule === 'COMERCIAL'
                  ? 'bg-sky-500/15 text-sky-400 font-bold border border-sky-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
              title="Módulo Comercial"
            >
              <div className="flex items-center gap-2.5">
                <Briefcase className={`w-4 h-4 shrink-0 ${activeModule === 'COMERCIAL' ? 'text-sky-400' : 'text-slate-400'}`} />
                {!isCollapsed && <span className="font-semibold text-xs tracking-tight">Módulo Comercial</span>}
              </div>
              {!isCollapsed && (
                <div>
                  {openSections.COMERCIAL ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
              )}
            </button>

            {!isCollapsed && openSections.COMERCIAL && (
              <div className="pl-7 pr-1 py-1 space-y-0.5">
                {canAccessSub('COTIZACIONES') && (
                  <button
                    onClick={() => onNavigate('COMERCIAL', 'COTIZACIONES')}
                    className={`w-full text-left py-1.5 px-2.5 rounded-lg text-[11px] transition-colors flex items-center gap-2 ${
                      activeModule === 'COMERCIAL' && activeSubOption === 'COTIZACIONES'
                        ? 'bg-sky-500 text-slate-950 font-bold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <FileText className="w-3 h-3 shrink-0" />
                    <span>Cotizaciones</span>
                  </button>
                )}

                {canAccessSub('GESTION_CLIENTES') && (
                  <button
                    onClick={() => onNavigate('COMERCIAL', 'GESTION_CLIENTES')}
                    className={`w-full text-left py-1.5 px-2.5 rounded-lg text-[11px] transition-colors flex items-center gap-2 ${
                      activeModule === 'COMERCIAL' && activeSubOption === 'GESTION_CLIENTES'
                        ? 'bg-sky-500 text-slate-950 font-bold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Building className="w-3 h-3 shrink-0" />
                    <span>Clientes (CRM)</span>
                  </button>
                )}

                {canAccessSub('CONSULTAS_SERVICIOS') && (
                  <button
                    onClick={() => onNavigate('COMERCIAL', 'CONSULTAS_SERVICIOS')}
                    className={`w-full text-left py-1.5 px-2.5 rounded-lg text-[11px] transition-colors flex items-center gap-2 ${
                      activeModule === 'COMERCIAL' && activeSubOption === 'CONSULTAS_SERVICIOS'
                        ? 'bg-sky-500 text-slate-950 font-bold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Search className="w-3 h-3 shrink-0" />
                    <span>Consultas de Servicios</span>
                  </button>
                )}

                {canAccessSub('LIQUIDACIONES') && (
                  <button
                    onClick={() => onNavigate('COMERCIAL', 'LIQUIDACIONES')}
                    className={`w-full text-left py-1.5 px-2.5 rounded-lg text-[11px] transition-colors flex items-center gap-2 ${
                      activeModule === 'COMERCIAL' && activeSubOption === 'LIQUIDACIONES'
                        ? 'bg-sky-500 text-slate-950 font-bold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Receipt className="w-3 h-3 shrink-0" />
                    <span>Liquidaciones</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* 3. OPERACIONES DE ALMACÉN (LOGÍSTICA & CORE WMS) */}
        {canAccessOperaciones && (
          <div>
            <button
              onClick={() => {
                if (isCollapsed) {
                  onNavigate('OPERACIONES', role === 'OPERATOR' ? 'INVENTARIOS_CORE' : 'INVENTARIOS_CORE');
                } else {
                  toggleSection('OPERACIONES');
                }
              }}
              className={`w-full flex items-center justify-between p-2 rounded-xl transition-all ${
                activeModule === 'OPERACIONES' || activeModule === 'INVENTARIOS'
                  ? 'bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
              title="Operaciones de Almacén (Logística & WMS)"
            >
              <div className="flex items-center gap-2.5">
                <Warehouse className={`w-4 h-4 shrink-0 ${activeModule === 'OPERACIONES' || activeModule === 'INVENTARIOS' ? 'text-amber-400' : 'text-slate-400'}`} />
                {!isCollapsed && <span className="font-semibold text-xs tracking-tight">Operaciones de Almacén</span>}
              </div>
              {!isCollapsed && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] px-1 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                    {role === 'OPERATOR' ? '1' : '4'}
                  </span>
                  {openSections.OPERACIONES ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
              )}
            </button>

            {!isCollapsed && openSections.OPERACIONES && (
              <div className="pl-7 pr-1 py-1 space-y-0.5">
                {/* Inventarios Cíclicos (Core WMS) - INSIDE Operaciones */}
                {canAccessSub('INVENTARIOS_CORE') && (
                  <button
                    onClick={() => onNavigate('OPERACIONES', 'INVENTARIOS_CORE')}
                    className={`w-full text-left py-1.5 px-2.5 rounded-lg text-[11px] transition-colors flex items-center justify-between ${
                      (activeModule === 'OPERACIONES' || activeModule === 'INVENTARIOS') && 
                      (activeSubOption === 'INVENTARIOS_CORE' || activeSubOption === 'INVENTARIOS_CICLICOS')
                        ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                        : 'text-amber-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <ScanLine className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Inventarios Cíclicos</span>
                    </div>
                    <span className={`text-[8px] font-mono px-1 py-0.2 rounded font-bold ${
                      (activeModule === 'OPERACIONES' || activeModule === 'INVENTARIOS') && 
                      (activeSubOption === 'INVENTARIOS_CORE' || activeSubOption === 'INVENTARIOS_CICLICOS')
                        ? 'bg-slate-950 text-amber-400'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      CORE
                    </span>
                  </button>
                )}

                {/* Sub-options for Admin, Supervisor, and Comercial */}
                {role !== 'OPERATOR' && (
                  <>
                    {/* Warehouse Operations */}
                    <div className="pt-2 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-2">Almacén (Inbound/Outbound)</div>
                    {[
                      { id: 'GESTION_RECEPCION', label: 'Gestión de Recepción' },
                      { id: 'GESTION_UBICACIONES', label: 'Ubicaciones y Almacén' },
                      { id: 'INVENTARIOS_FISICOS', label: 'Inventario Físico' },
                      { id: 'GESTION_PICKING', label: 'Órdenes y Picking' },
                      { id: 'GESTION_EMPAQUE', label: 'Empaque y Embalaje' },
                      { id: 'GESTION_EXPEDICION', label: 'Expedición y Despacho' },
                      { id: 'GESTION_PATIOS', label: 'Patios y Puertas' },
                      { id: 'CATALOGO_SKUS', label: 'Catálogo de SKUs' },
                      { id: 'MAPA_LAYOUT', label: 'Mapa de Ubicaciones' },
                      { id: 'STOCK_ON_HAND', label: 'Consulta de Stock' },
                    ].map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => onNavigate('OPERACIONES', sub.id as SubNavOption)}
                        className={`w-full text-left py-1 px-2.5 rounded-lg text-[11px] transition-colors flex items-center gap-2 ${
                          activeModule === 'OPERACIONES' && activeSubOption === sub.id
                            ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        <Layers className="w-3 h-3 shrink-0" />
                        <span className="truncate">{sub.label}</span>
                      </button>
                    ))}

                    {/* Transport Operations */}
                    <div className="pt-2 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-2">Transporte</div>
                    {[
                      { id: 'GESTION_ORDENES_ENVIO', label: 'Gestión de Envíos' },
                      { id: 'PLANIFICACION_RUTAS', label: 'Planificación de Rutas' },
                      { id: 'SELECCION_PROVEEDORES', label: 'Proveedores / Fletes' },
                      { id: 'GESTION_CARGAS', label: 'Cargas y Consolidación' },
                      { id: 'SEGUIMIENTO_TRAZABILIDAD', label: 'Seguimiento (Tracking)' },
                      { id: 'AUDITORIA_FLETES', label: 'Auditoría de Fletes' },
                      { id: 'GESTION_PATIOS_BASCULA', label: 'Patios y Báscula' },
                    ].map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => onNavigate('OPERACIONES', sub.id as SubNavOption)}
                        className={`w-full text-left py-1 px-2.5 rounded-lg text-[11px] transition-colors flex items-center gap-2 ${
                          activeModule === 'OPERACIONES' && activeSubOption === sub.id
                            ? 'bg-sky-500 text-slate-950 font-bold shadow-xs'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        <Warehouse className="w-3 h-3 shrink-0" />
                        <span className="truncate">{sub.label}</span>
                      </button>
                    ))}
                  </>
                )}

              </div>
            )}
          </div>
        )}

        {/* 5. MÓDULO DE SISTEMAS Y SEGURIDAD */}
        {canAccessSistemas && (
          <div>
            <button
              onClick={() => {
                if (isCollapsed) {
                  onNavigate('SISTEMAS', 'CAMBIO_CLAVE');
                } else {
                  toggleSection('SISTEMAS');
                }
              }}
              className={`w-full flex items-center justify-between p-2 rounded-xl transition-all ${
                activeModule === 'SISTEMAS'
                  ? 'bg-purple-500/15 text-purple-400 font-bold border border-purple-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
              title="Módulo de Sistemas y Seguridad"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className={`w-4 h-4 shrink-0 ${activeModule === 'SISTEMAS' ? 'text-purple-400' : 'text-slate-400'}`} />
                {!isCollapsed && <span className="font-semibold text-xs tracking-tight">Sistemas y Seguridad</span>}
              </div>
              {!isCollapsed && (
                <div>
                  {openSections.SISTEMAS ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
              )}
            </button>

            {!isCollapsed && openSections.SISTEMAS && (
              <div className="pl-7 pr-1 py-1 space-y-0.5">
                {role === 'ADMIN' && canAccessSub('GESTION_USUARIOS') && (
                  <button
                    onClick={() => onNavigate('SISTEMAS', 'GESTION_USUARIOS')}
                    className={`w-full text-left py-1.5 px-2.5 rounded-lg text-[11px] transition-colors flex items-center gap-2 ${
                      activeModule === 'SISTEMAS' && activeSubOption === 'GESTION_USUARIOS'
                        ? 'bg-purple-500 text-slate-950 font-bold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Users className="w-3 h-3 shrink-0" />
                    <span>Gestión de Usuarios</span>
                  </button>
                )}

                {canAccessSub('CAMBIO_CLAVE') && (
                  <button
                    onClick={() => onNavigate('SISTEMAS', 'CAMBIO_CLAVE')}
                    className={`w-full text-left py-1.5 px-2.5 rounded-lg text-[11px] transition-colors flex items-center gap-2 ${
                      activeModule === 'SISTEMAS' && activeSubOption === 'CAMBIO_CLAVE'
                        ? 'bg-purple-500 text-slate-950 font-bold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <KeyRound className="w-3 h-3 shrink-0" />
                    <span>Cambio de Claves</span>
                  </button>
                )}

                {role === 'ADMIN' && canAccessSub('TENANT_PARAMS') && (
                  <button
                    onClick={() => onNavigate('SISTEMAS', 'TENANT_PARAMS')}
                    className={`w-full text-left py-1.5 px-2.5 rounded-lg text-[11px] transition-colors flex items-center gap-2 ${
                      activeModule === 'SISTEMAS' && activeSubOption === 'TENANT_PARAMS'
                        ? 'bg-purple-500 text-slate-950 font-bold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Building2 className="w-3 h-3 shrink-0" />
                    <span>Parámetros del Tenant</span>
                  </button>
                )}

                {(role === 'ADMIN' || role === 'SUPERVISOR') && canAccessSub('SCHEMA_SQL') && (
                  <button
                    onClick={() => onNavigate('SISTEMAS', 'SCHEMA_SQL')}
                    className={`w-full text-left py-1.5 px-2.5 rounded-lg text-[11px] transition-colors flex items-center gap-2 ${
                      activeModule === 'SISTEMAS' && activeSubOption === 'SCHEMA_SQL'
                        ? 'bg-indigo-500 text-slate-950 font-bold shadow-xs'
                        : 'text-indigo-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Database className="w-3 h-3 shrink-0" />
                    <span>Base de Datos (SQL DDL)</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

      </nav>

      {/* Sidebar Footer with Logout & Tenant Info */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        {!isCollapsed ? (
          <div className="flex items-center justify-between gap-2">
            <div className="truncate">
              <div className="text-[10px] text-slate-400">Tenant Activo</div>
              <div className="text-[11px] font-bold text-slate-200 truncate">Logística Stadius S.A.</div>
            </div>
            <button
              onClick={onLogout}
              title="Cerrar sesión"
              className="p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 rounded-lg transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onLogout}
            title="Cerrar sesión"
            className="w-full flex items-center justify-center p-2 text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
