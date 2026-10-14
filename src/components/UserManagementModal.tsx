import React, { useState } from 'react';
import { Users, X, UserPlus, Shield, CheckCircle2, Trash2, SlidersHorizontal, Building } from 'lucide-react';
import { User, UserRole, MainNavModule, SubNavOption, CompanyTenant } from '../types/inventory';
import { INITIAL_COMPANIES } from '../data/initialData';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  companies?: CompanyTenant[];
  onAddUser: (newUser: User) => void;
  onDeleteUser: (userId: string) => void;
  onUpdateUserPermissions?: (userId: string, modules: MainNavModule[], subOptions: SubNavOption[]) => void;
}

const ALL_MODULES_LIST: { id: MainNavModule; label: string }[] = [
  { id: 'DASHBOARD', label: 'Panel de Control' },
  { id: 'COMERCIAL', label: 'Módulo Comercial' },
  { id: 'OPERACIONES', label: 'Operaciones de Almacén' },
  { id: 'SISTEMAS', label: 'Sistemas y Seguridad' },
];

const ALL_SUBOPTIONS_LIST: { id: SubNavOption; module: MainNavModule; label: string }[] = [
  { id: 'OVERVIEW', module: 'DASHBOARD', label: 'Vista General (Overview KPIs)' },
  { id: 'COTIZACIONES', module: 'COMERCIAL', label: 'Cotizaciones Logísticas' },
  { id: 'CONSULTAS_SERVICIOS', module: 'COMERCIAL', label: 'Consultas de Servicios' },
  { id: 'LIQUIDACIONES', module: 'COMERCIAL', label: 'Liquidaciones de Cobro' },
  { id: 'INVENTARIOS_CORE', module: 'OPERACIONES', label: 'Inventarios Cíclicos (Core WMS)' },
  { id: 'CATALOGO_SKUS', module: 'OPERACIONES', label: 'Catálogo de SKUs / Maestro' },
  { id: 'MAPA_LAYOUT', module: 'OPERACIONES', label: 'Mapa de Ubicaciones (Layout)' },
  { id: 'STOCK_ON_HAND', module: 'OPERACIONES', label: 'Consulta de Stock On-Hand' },
  { id: 'GESTION_USUARIOS', module: 'SISTEMAS', label: 'Gestión de Usuarios y Roles' },
  { id: 'CAMBIO_CLAVE', module: 'SISTEMAS', label: 'Cambio de Claves' },
  { id: 'TENANT_PARAMS', module: 'SISTEMAS', label: 'Parámetros del Tenant / Empresa' },
  { id: 'SCHEMA_SQL', module: 'SISTEMAS', label: 'Base de Datos (SQL DDL Multi-Tenant)' },
];

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  users,
  companies = INITIAL_COMPANIES,
  onAddUser,
  onDeleteUser,
  onUpdateUserPermissions,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('OPERATOR');
  const [shift, setShift] = useState<'MANANA' | 'TARDE' | 'NOCHE'>('MANANA');
  const [badgeCode, setBadgeCode] = useState('');
  const [assignedWarehouse, setAssignedWarehouse] = useState('B01 - Bodega Central');
  const [companyId, setCompanyId] = useState('EMP-A');

  // Specific options allowed for the user
  const [selectedModules, setSelectedModules] = useState<MainNavModule[]>(['OPERACIONES', 'SISTEMAS']);
  const [selectedSubOptions, setSelectedSubOptions] = useState<SubNavOption[]>(['INVENTARIOS_CORE', 'CAMBIO_CLAVE']);

  // Editing permissions modal state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editModules, setEditModules] = useState<MainNavModule[]>([]);
  const [editSubOptions, setEditSubOptions] = useState<SubNavOption[]>([]);

  if (!isOpen) return null;

  const handleRolePreset = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'ADMIN') {
      setSelectedModules(['DASHBOARD', 'COMERCIAL', 'OPERACIONES', 'SISTEMAS']);
      setSelectedSubOptions([
        'OVERVIEW', 'COTIZACIONES', 'CONSULTAS_SERVICIOS', 'LIQUIDACIONES',
        'INVENTARIOS_CORE', 'CATALOGO_SKUS', 'MAPA_LAYOUT', 'STOCK_ON_HAND',
        'GESTION_USUARIOS', 'CAMBIO_CLAVE', 'TENANT_PARAMS', 'SCHEMA_SQL'
      ]);
    } else if (newRole === 'SUPERVISOR') {
      setSelectedModules(['DASHBOARD', 'COMERCIAL', 'OPERACIONES', 'SISTEMAS']);
      setSelectedSubOptions([
        'OVERVIEW', 'COTIZACIONES', 'CONSULTAS_SERVICIOS', 'LIQUIDACIONES',
        'INVENTARIOS_CORE', 'CATALOGO_SKUS', 'MAPA_LAYOUT', 'STOCK_ON_HAND',
        'CAMBIO_CLAVE', 'SCHEMA_SQL'
      ]);
    } else if (newRole === 'COMERCIAL') {
      setSelectedModules(['DASHBOARD', 'COMERCIAL', 'OPERACIONES', 'SISTEMAS']);
      setSelectedSubOptions([
        'OVERVIEW', 'COTIZACIONES', 'CONSULTAS_SERVICIOS', 'LIQUIDACIONES',
        'INVENTARIOS_CORE', 'CATALOGO_SKUS', 'STOCK_ON_HAND', 'CAMBIO_CLAVE'
      ]);
    } else {
      setSelectedModules(['OPERACIONES', 'SISTEMAS']);
      setSelectedSubOptions(['INVENTARIOS_CORE', 'CAMBIO_CLAVE']);
    }
  };

  const toggleModule = (mod: MainNavModule) => {
    setSelectedModules(prev => 
      prev.includes(mod) ? prev.filter(m => m !== mod) : [...prev, mod]
    );
  };

  const toggleSubOption = (sub: SubNavOption) => {
    setSelectedSubOptions(prev =>
      prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
    );
  };

  const handleOpenEditPermissions = (u: User) => {
    setEditingUserId(u.id);
    setEditModules(u.allowedModules || ['OPERACIONES', 'SISTEMAS']);
    setEditSubOptions(u.allowedSubOptions || ['INVENTARIOS_CORE', 'CAMBIO_CLAVE']);
  };

  const handleSaveEditedPermissions = (userId: string) => {
    if (onUpdateUserPermissions) {
      onUpdateUserPermissions(userId, editModules, editSubOptions);
    }
    setEditingUserId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const comp = companies.find(c => c.id === companyId);
    const newUser: User = {
      id: `USR-${Date.now().toString().slice(-4)}`,
      name,
      email,
      role,
      shift,
      badgeCode: badgeCode || `OP-${Math.floor(100 + Math.random() * 900)}`,
      active: true,
      assignedWarehouse,
      companyId,
      companyName: comp?.name,
      allowedModules: selectedModules,
      allowedSubOptions: selectedSubOptions,
    };

    onAddUser(newUser);
    setShowAddForm(false);
    setName('');
    setEmail('');
    setBadgeCode('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-sm">Gestión de Usuarios, Operadores & Supervisores</h3>
              <p className="text-[11px] text-slate-400">Control de acceso y asignación de turnos WMS</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-700 tracking-wider">
              Personal Registrado ({users.length} Colaboradores)
            </span>

            <button
              onClick={() => setShowAddForm(v => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>{showAddForm ? 'Cerrar Formulario' : 'Crear Nuevo Usuario'}</span>
            </button>
          </div>

          {/* Add User Form */}
          {showAddForm && (
            <form onSubmit={handleSubmit} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase">
                Registrar Nuevo Operador o Supervisor
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Daniel Morales"
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Correo Corporativo</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="dmorales@stadiuswms.com"
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Rol en el Sistema</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-amber-500 focus:outline-none font-medium"
                  >
                    <option value="OPERATOR">OPERADOR DE PISO</option>
                    <option value="SUPERVISOR">SUPERVISOR DE ALMACÉN</option>
                    <option value="COMERCIAL">EJECUTIVO COMERCIAL</option>
                    <option value="ADMIN">ADMINISTRADOR GENERAL</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Código de Gafete / Badge</label>
                  <input
                    type="text"
                    value={badgeCode}
                    onChange={(e) => setBadgeCode(e.target.value)}
                    placeholder="OP-302"
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-mono focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Turno de Trabajo</label>
                  <select
                    value={shift}
                    onChange={(e) => setShift(e.target.value as 'MANANA' | 'TARDE' | 'NOCHE')}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="MANANA">Turno Mañana (07:00 - 15:00)</option>
                    <option value="TARDE">Turno Tarde (15:00 - 23:00)</option>
                    <option value="NOCHE">Turno Noche (23:00 - 07:00)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Empresa / Tenant Asignado</label>
                  <select
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value)}
                    className="w-full text-xs bg-white border border-amber-300 rounded-lg p-2 font-bold text-slate-900 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  >
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>
                        [{c.id}] {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Granular Permissions Controls configured by Administrator */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-purple-600" />
                    <span className="text-xs font-bold text-slate-900 uppercase">
                      Permisos y Opciones Autorizadas para este Usuario
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">Configurado por Administrador</span>
                </div>

                {/* Modules Checklist */}
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">
                    Módulos Principales Autorizados:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {ALL_MODULES_LIST.map(mod => (
                      <label key={mod.id} className="flex items-center gap-1.5 text-xs text-slate-800 cursor-pointer bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                        <input
                          type="checkbox"
                          checked={selectedModules.includes(mod.id)}
                          onChange={() => toggleModule(mod.id)}
                          className="rounded text-amber-500 focus:ring-amber-400"
                        />
                        <span className="text-[11px] font-medium">{mod.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Specific Sub-Options Checklist */}
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">
                    Opciones y Vistas Específicas:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto p-1 bg-slate-50/50 rounded-lg border border-slate-100">
                    {ALL_SUBOPTIONS_LIST.map(sub => (
                      <label key={sub.id} className="flex items-center gap-1.5 text-[11px] text-slate-700 cursor-pointer p-1 rounded hover:bg-slate-100">
                        <input
                          type="checkbox"
                          checked={selectedSubOptions.includes(sub.id)}
                          onChange={() => toggleSubOption(sub.id)}
                          className="rounded text-purple-600 focus:ring-purple-400"
                        />
                        <span className="truncate">{sub.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow-xs"
                >
                  Guardar Usuario con Permisos
                </button>
              </div>
            </form>
          )}

          {/* User Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-semibold uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Gafete</th>
                  <th className="py-2.5 px-3">Nombre</th>
                  <th className="py-2.5 px-3">Rol</th>
                  <th className="py-2.5 px-3">Empresa</th>
                  <th className="py-2.5 px-3">Turno</th>
                  <th className="py-2.5 px-3">Permisos</th>
                  <th className="py-2.5 px-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{u.badgeCode}</td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-slate-900 block">{u.name}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{u.email}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'ADMIN'
                          ? 'bg-slate-900 text-white'
                          : u.role === 'SUPERVISOR'
                          ? 'bg-purple-100 text-purple-800'
                          : u.role === 'COMERCIAL'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {u.role === 'ADMIN' ? 'Administrador' : u.role === 'SUPERVISOR' ? 'Supervisor' : u.role === 'COMERCIAL' ? 'Comercial' : 'Operador'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 border text-slate-700 font-bold">
                        {u.companyId || 'EMP-A'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-600">{u.shift}</td>
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => handleOpenEditPermissions(u)}
                        className="px-2 py-1 text-[10px] font-bold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg flex items-center gap-1 transition-colors"
                        title="Configurar opciones autorizadas para este usuario"
                      >
                        <SlidersHorizontal className="w-3 h-3" />
                        <span>Opciones ({u.allowedSubOptions ? u.allowedSubOptions.length : 'Todo'})</span>
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {users.length > 1 && (
                        <button
                          onClick={() => onDeleteUser(u.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Edit Permissions Modal for Selected User */}
          {editingUserId && (
            <div className="fixed inset-0 z-60 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-5 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-purple-600" />
                    <div>
                      <h4 className="font-black text-sm text-slate-900">Configurar Opciones por Usuario</h4>
                      <p className="text-[11px] text-slate-500">
                        Usuario: <strong>{users.find(u => u.id === editingUserId)?.name}</strong>
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setEditingUserId(null)} className="p-1 text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                      Módulos Permitidos:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {ALL_MODULES_LIST.map(m => (
                        <label key={m.id} className="flex items-center gap-1.5 p-1.5 bg-slate-50 border rounded-lg cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editModules.includes(m.id)}
                            onChange={() => {
                              setEditModules(prev =>
                                prev.includes(m.id) ? prev.filter(x => x !== m.id) : [...prev, m.id]
                              );
                            }}
                            className="rounded text-amber-500"
                          />
                          <span className="text-[11px] font-medium">{m.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                      Opciones y Vistas Específicas:
                    </label>
                    <div className="grid grid-cols-1 gap-1.5 max-h-56 overflow-y-auto p-1.5 bg-slate-50 border rounded-lg">
                      {ALL_SUBOPTIONS_LIST.map(sub => (
                        <label key={sub.id} className="flex items-center gap-1.5 p-1 hover:bg-slate-100 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editSubOptions.includes(sub.id)}
                            onChange={() => {
                              setEditSubOptions(prev =>
                                prev.includes(sub.id) ? prev.filter(x => x !== sub.id) : [...prev, sub.id]
                              );
                            }}
                            className="rounded text-purple-600"
                          />
                          <span className="text-[11px] text-slate-800">{sub.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setEditingUserId(null)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleSaveEditedPermissions(editingUserId)}
                    className="px-4 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow-xs"
                  >
                    Guardar Opciones
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
