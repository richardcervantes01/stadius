import React, { useState } from 'react';
import { 
  Boxes, 
  Lock, 
  User as UserIcon, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle,
  KeyRound
} from 'lucide-react';
import { User, CompanyTenant } from '../types/inventory';
import { INITIAL_COMPANIES } from '../data/initialData';

interface LoginScreenProps {
  users: User[];
  companies?: CompanyTenant[];
  onLoginSuccess: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  users,
  companies = INITIAL_COMPANIES,
  onLoginSuccess,
}) => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('EMP-A');
  const [emailInput, setEmailInput] = useState('cmendoza@stadiuswms.com');
  const [passwordInput, setPasswordInput] = useState('admin123');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // When company changes, pick a default user from that company
  const handleCompanyChange = (compId: string) => {
    setSelectedCompanyId(compId);
    const firstUserOfCompany = users.find(u => (u.companyId || 'EMP-A') === compId);
    if (firstUserOfCompany) {
      setEmailInput(firstUserOfCompany.email);
      setPasswordInput(firstUserOfCompany.password || 'admin123');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const term = emailInput.trim().toLowerCase();
    const matchedUser = users.find(
      u => u.email.toLowerCase() === term || 
           u.email.toLowerCase().replace('@stadiuswms.com', '') === term ||
           u.email.toLowerCase().replace('@nexuslog.com', '') === term
    );

    if (!matchedUser) {
      setErrorMessage('Credenciales no válidas. Ingrese un usuario registrado en el sistema.');
      return;
    }

    // Check password if set
    if (matchedUser.password && matchedUser.password !== passwordInput) {
      setErrorMessage('Contraseña incorrecta. Intente nuevamente.');
      return;
    }

    const targetCompany = companies.find(c => c.id === selectedCompanyId);
    const userCompanyId = matchedUser.companyId || 'EMP-A';
    const userCompanyName = companies.find(c => c.id === userCompanyId)?.name || matchedUser.companyName || userCompanyId;

    // Rule: "el administrador es el único que puede ingresar a todas las empresas, los usuarios tambien pueden solo ingresar a las empresas que se seleccionan"
    if (matchedUser.role !== 'ADMIN') {
      if (userCompanyId !== selectedCompanyId) {
        setErrorMessage(
          `Acceso Denegado: El usuario "${matchedUser.name}" solo puede ingresar a "${userCompanyName}". Solo el Administrador General tiene autorización para ingresar a todas las empresas.`
        );
        return;
      }
    }

    // Authorized! If Admin, can enter whichever company was selected. If non-admin, enters assigned company.
    const effectiveCompanyId = matchedUser.role === 'ADMIN' ? selectedCompanyId : userCompanyId;
    const effectiveCompanyName = companies.find(c => c.id === effectiveCompanyId)?.name || matchedUser.companyName;

    const enrichedUser: User = {
      ...matchedUser,
      companyId: effectiveCompanyId,
      companyName: effectiveCompanyName,
    };

    onLoginSuccess(enrichedUser);
  };

  const handleQuickLogin = (role: 'ADMIN' | 'SUPERVISOR' | 'OPERATOR' | 'COMERCIAL', compId = selectedCompanyId) => {
    // For non-admin, find user belonging to compId
    const targetUser = users.find(u => u.role === role && (u.companyId || 'EMP-A') === compId) || 
                       users.find(u => u.role === role);

    if (targetUser) {
      const effectiveComp = targetUser.role === 'ADMIN' ? compId : (targetUser.companyId || 'EMP-A');
      setSelectedCompanyId(effectiveComp);
      setEmailInput(targetUser.email);
      setPasswordInput(targetUser.password || 'admin123');

      onLoginSuccess({
        ...targetUser,
        companyId: effectiveComp,
        companyName: companies.find(c => c.id === effectiveComp)?.name || targetUser.companyName,
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background ambient pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/15 via-slate-900 to-slate-950 pointer-events-none" />

      {/* Floating System Name In Background / Large Hero Title */}
      <div className="text-center mb-6 z-10 animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2">
          <Boxes className="w-4 h-4 text-amber-400" />
          <span>SISTEMA INTEGRAL DE GESTIÓN DE ALMACENES</span>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white drop-shadow-md">
          STADIUS <span className="text-amber-400">WMS</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 mt-1 font-medium">
          Control de Operaciones, Inventarios Cíclicos, Recepción, Putaway, Picking y Despacho
        </p>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-800 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header Inside Card */}
        <div className="bg-slate-900 p-6 text-white text-center border-b border-slate-800">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-xl font-black tracking-tight text-white">STADIUS WMS</span>
            <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              v3.0 Enterprise
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Plataforma Multi-Empresa SaaS · Ingrese seleccionando su EMPRESA
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="p-7 space-y-4 bg-white">
          {/* CAMPO PRINCIPAL: EMPRESA */}
          <div className="space-y-1 bg-amber-500/10 p-3 rounded-xl border border-amber-500/30">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase text-amber-950 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>EMPRESA (TENANT SAAS)</span>
              </label>
              <span className="text-[10px] font-bold text-amber-700 font-mono">Requerido</span>
            </div>
            <select
              value={selectedCompanyId}
              onChange={(e) => handleCompanyChange(e.target.value)}
              className="w-full py-2.5 px-3 text-xs bg-white border border-amber-400 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
            >
              {companies.map(c => (
                <option key={c.id} value={c.id}>
                  [{c.id}] {c.name} ({c.city}, {c.country})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-amber-800 mt-1">
              {selectedCompanyId === 'EMP-A' ? (
                <span>Empresa A: Acceso a clientes Retail Pro, Logix y Andina. Aislamiento total de almacén.</span>
              ) : (
                <span>Empresa B: Operador logístico independiente. No visualiza ni modifica datos de Empresa A.</span>
              )}
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-slate-700 block">
              Correo Electrónico / Usuario WMS
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="cmendoza@stadiuswms.com"
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-slate-900"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-slate-700 block">
              Contraseña de Acceso
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-slate-900"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-2"
          >
            <span>INGRESAR A STADIUS WMS</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Quick Login Shortcut Pills for Demonstration */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400 font-medium block mb-2.5">
              Acceso rápido para evaluación de roles WMS:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('ADMIN')}
                className="p-2 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg border border-slate-200 transition-colors"
                title="Administrador: Control total de módulos WMS, eliminación, reaperturas y catálogo"
              >
                ADMIN
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('SUPERVISOR')}
                className="p-2 text-[10px] font-bold bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg border border-purple-200 transition-colors"
                title="Supervisor: Gestión de órdenes, KPIs, catálogo valorizado y alertas SOS"
              >
                SUPERVISOR
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('OPERATOR')}
                className="p-2 text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200 transition-colors"
                title="Operador: Acceso directo a Conteo en Piso"
              >
                OPERADOR
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('COMERCIAL')}
                className="p-2 text-[10px] font-bold bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-lg border border-sky-200 transition-colors"
                title="Comercial: Cotizaciones, consultas de servicios y liquidaciones logísticas"
              >
                COMERCIAL
              </button>
            </div>

            {/* Quick test for Empresa B */}
            <div className="mt-3 pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-1.5">
              <span className="text-[10px] text-slate-500 font-bold">Probar Empresa B (Tenant aislado):</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('ADMIN', 'EMP-B')}
                  className="px-2 py-1 text-[10px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg border border-indigo-200 transition-colors"
                  title="Admin Carlos ingresando a Empresa B (Nexus)"
                >
                  Admin en Emp B
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('SUPERVISOR', 'EMP-B')}
                  className="px-2 py-1 text-[10px] font-bold bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg border border-purple-200 transition-colors"
                  title="Supervisor Martín Barrientos (Empresa B)"
                >
                  Supervisor Emp B
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('OPERATOR', 'EMP-B')}
                  className="px-2 py-1 text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 transition-colors"
                  title="Operadora Camila Tapia (Empresa B)"
                >
                  Operadora Emp B
                </button>
              </div>
            </div>
          </div>
        </form>

        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Acceso Seguro con Control de Roles (RBAC) · Stadius WMS v3.0</span>
        </div>
      </div>
    </div>
  );
};
