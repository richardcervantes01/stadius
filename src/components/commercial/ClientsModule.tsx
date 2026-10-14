import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  FileText,
  Boxes,
  Edit2,
  Trash2,
  X,
  Building,
  ShieldCheck,
  TrendingUp,
  Tag
} from 'lucide-react';
import { ClientAccount, User, CompanyTenant } from '../../types/inventory';

interface ClientsModuleProps {
  clients: ClientAccount[];
  currentUser: User;
  activeCompany?: CompanyTenant;
  onAddClient: (newClient: ClientAccount) => void;
  onUpdateClient: (updatedClient: ClientAccount) => void;
  onDeleteClient?: (clientId: string) => void;
}

export const ClientsModule: React.FC<ClientsModuleProps> = ({
  clients,
  currentUser,
  activeCompany,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
}) => {
  const currentCompanyId = currentUser.companyId || 'EMP-A';
  const companyDisplayName = activeCompany?.name || currentUser.companyName || (currentCompanyId === 'EMP-B' ? 'Empresa B (Nexus SpA)' : 'Empresa A (Stadius S.A.)');

  // Filter clients to ONLY those belonging to the active company
  // "si yo ingreso como empresa puedo tener muchos clientes que solo lo visualizare como empresa A, si tengo la empresa B no podrá visualizar nada del A"
  const companyClients = clients.filter(c => (c.companyId || 'EMP-A') === currentCompanyId);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVO' | 'INACTIVO'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientAccount | null>(null);

  // Form State for new or editing client
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    taxId: '',
    contactEmail: '',
    phone: '',
    address: '',
    industry: 'Retail & Departamentos',
    activeContracts: 1,
    assignedSpaces: 100,
    status: 'ACTIVO' as 'ACTIVO' | 'INACTIVO',
  });

  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Open modal for new client
  const handleOpenAddModal = () => {
    const nextNum = companyClients.length + 1;
    const prefix = currentCompanyId === 'EMP-B' ? 'CLI-B' : 'CLI-';
    const autoCode = `${prefix}${String(nextNum).padStart(2, '0')}`;

    setFormData({
      name: '',
      code: autoCode,
      taxId: '',
      contactEmail: '',
      phone: '',
      address: '',
      industry: 'Comercio General & Distribución',
      activeContracts: 1,
      assignedSpaces: 150,
      status: 'ACTIVO',
    });
    setEditingClient(null);
    setShowAddModal(true);
  };

  // Open modal for editing existing client
  const handleOpenEditModal = (client: ClientAccount) => {
    setFormData({
      name: client.name,
      code: client.code,
      taxId: client.taxId || '',
      contactEmail: client.contactEmail || '',
      phone: client.phone || '',
      address: client.address || '',
      industry: client.industry || 'Comercio General & Distribución',
      activeContracts: client.activeContracts || 1,
      assignedSpaces: client.assignedSpaces || 100,
      status: client.status || 'ACTIVO',
    });
    setEditingClient(client);
    setShowAddModal(true);
  };

  // Submit client form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      alert('Por favor ingrese el Nombre y Código del Cliente.');
      return;
    }

    if (editingClient) {
      const updated: ClientAccount = {
        ...editingClient,
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        taxId: formData.taxId.trim(),
        contactEmail: formData.contactEmail.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        industry: formData.industry,
        activeContracts: Number(formData.activeContracts) || 0,
        assignedSpaces: Number(formData.assignedSpaces) || 0,
        status: formData.status,
      };
      onUpdateClient(updated);
      setNotificationMsg(`Cliente "${updated.name}" actualizado correctamente.`);
    } else {
      const newClient: ClientAccount = {
        id: `CLI-${Date.now().toString().slice(-6)}`,
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        companyId: currentCompanyId,
        taxId: formData.taxId.trim() || 'CL-76.000.000-0',
        contactEmail: formData.contactEmail.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        industry: formData.industry,
        activeContracts: Number(formData.activeContracts) || 1,
        assignedSpaces: Number(formData.assignedSpaces) || 100,
        status: formData.status,
      };
      onAddClient(newClient);
      setNotificationMsg(`Cliente "${newClient.name}" creado con éxito para ${companyDisplayName}.`);
    }

    setShowAddModal(false);
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  // Filtered list
  const filteredClients = companyClients.filter(c => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      c.name.toLowerCase().includes(term) ||
      c.code.toLowerCase().includes(term) ||
      (c.taxId && c.taxId.toLowerCase().includes(term)) ||
      (c.contactEmail && c.contactEmail.toLowerCase().includes(term)) ||
      (c.industry && c.industry.toLowerCase().includes(term));

    const matchesStatus = statusFilter === 'ALL' || (c.status || 'ACTIVO') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate Metrics for this company
  const totalClientsCount = companyClients.length;
  const activeClientsCount = companyClients.filter(c => (c.status || 'ACTIVO') === 'ACTIVO').length;
  const totalContracts = companyClients.reduce((acc, c) => acc + (c.activeContracts || 0), 0);
  const totalPalletSpaces = companyClients.reduce((acc, c) => acc + (c.assignedSpaces || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Módulo Comercial · Clientes de la Empresa
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-sky-100 text-sky-800 border border-sky-200">
                  {currentCompanyId}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Directorio y alta de clientes depositantes asociados a <strong className="text-slate-800">{companyDisplayName}</strong>.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            onClick={handleOpenAddModal}
            className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Registrar Nuevo Cliente</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notificationMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notificationMsg}</span>
          </div>
          <button onClick={() => setNotificationMsg(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tenant Isolation Info Card */}
      <div className="p-3.5 bg-sky-50/70 border border-sky-200/80 rounded-xl text-sky-900 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
          <span>
            <strong>Aislamiento Multi-Tenant:</strong> Los clientes creados aquí pertenecen únicamente a <strong>{currentCompanyId}</strong>. No son visibles por otras empresas ni interfieren en sus inventarios o cotizaciones.
          </span>
        </div>
        <span className="text-[11px] font-mono text-sky-700 font-bold bg-white px-2 py-0.5 rounded border border-sky-200">
          Tenant: {currentCompanyId}
        </span>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Clientes Registrados</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900 font-mono">{totalClientsCount}</span>
            <span className="text-[10px] text-slate-400">cuentas</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Clientes Activos</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-600 font-mono">{activeClientsCount}</span>
            <span className="text-[10px] text-emerald-600 font-bold">operando</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Contratos Vigentes</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-indigo-600 font-mono">{totalContracts}</span>
            <span className="text-[10px] text-indigo-500 font-medium">acuerdos SLA</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Posiciones Pallet Totales</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-amber-600 font-mono">{totalPalletSpaces.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400">asignadas</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, código, RUT, rubro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Estado:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="ACTIVO">Solo Activos</option>
            <option value="INACTIVO">Solo Inactivos</option>
          </select>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-sky-600" />
            <h3 className="font-black text-sm text-slate-900">
              Listado de Clientes Registrados ({filteredClients.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Empresa: <strong className="text-slate-700">{currentCompanyId}</strong>
          </span>
        </div>

        {filteredClients.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Building className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No se encontraron clientes para esta empresa</p>
            <p className="text-xs max-w-md mx-auto text-slate-500">
              {companyClients.length === 0
                ? `Esta empresa (${currentCompanyId}) aún no tiene clientes registrados. Haz clic en "+ Registrar Nuevo Cliente" para dar de alta clientes que existan en el sistema.`
                : 'Ningún cliente coincide con los criterios de búsqueda actuales.'}
            </p>
            {companyClients.length === 0 && (
              <button
                onClick={handleOpenAddModal}
                className="mt-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Crear Primer Cliente</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Razón Social / Cliente</th>
                  <th className="py-3 px-4">RUT / Tax ID</th>
                  <th className="py-3 px-4">Contacto Directo</th>
                  <th className="py-3 px-4">Rubro / Industria</th>
                  <th className="py-3 px-4 text-center">Contratos</th>
                  <th className="py-3 px-4 text-center">Espacio Pallets</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredClients.map(client => (
                  <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px]">
                        {client.code}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-xs">{client.name}</div>
                      {client.address && (
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-2.5 h-2.5" />
                          <span className="truncate max-w-[220px]">{client.address}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      {client.taxId || 'N/A'}
                    </td>
                    <td className="py-3 px-4 space-y-0.5">
                      {client.contactEmail && (
                        <div className="text-[11px] text-slate-600 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{client.contactEmail}</span>
                        </div>
                      )}
                      {client.phone && (
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {client.industry || 'General'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-indigo-700">
                      {client.activeContracts || 0}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-amber-700">
                      {(client.assignedSpaces || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        (client.status || 'ACTIVO') === 'ACTIVO'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}>
                        {client.status || 'ACTIVO'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(client)}
                          title="Editar información del cliente"
                          className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {onDeleteClient && (
                          <button
                            onClick={() => {
                              if (window.confirm(`¿Seguro que deseas eliminar el cliente "${client.name}"?`)) {
                                onDeleteClient(client.id);
                              }
                            }}
                            title="Eliminar cliente"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-sky-600" />
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    {editingClient ? 'Editar Cliente' : 'Registrar Nuevo Cliente en la Empresa'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Empresa asignada: <strong className="text-slate-800">{companyDisplayName} ({currentCompanyId})</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Razón Social / Nombre Comercial *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Distribuidora Alimentaria del Pacífico SpA"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Código Identificador *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="CLI-05"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900 uppercase focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    RUT / NIT / Tax ID
                  </label>
                  <input
                    type="text"
                    placeholder="CL-76.123.456-7"
                    value={formData.taxId}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Correo Electrónico de Contacto
                  </label>
                  <input
                    type="email"
                    placeholder="contacto@empresa.com"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Teléfono Central / Móvil
                  </label>
                  <input
                    type="text"
                    placeholder="+56 9 1234 5678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Rubro / Industria
                  </label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="Retail & Departamentos">Retail & Departamentos</option>
                    <option value="Alimentos Congelados & Frío">Alimentos Congelados & Frío</option>
                    <option value="Salud & Farma">Salud & Farma</option>
                    <option value="Construcción & Ferretería">Construcción & Ferretería</option>
                    <option value="Hardware & Equipos TI">Hardware & Equipos TI</option>
                    <option value="Bebidas & Exportación">Bebidas & Exportación</option>
                    <option value="Químicos & Materias Primas">Químicos & Materias Primas</option>
                    <option value="Automotriz & Repuestos">Automotriz & Repuestos</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Estado Operativo
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="ACTIVO">Activo (Habilitado para Inventarios & Facturación)</option>
                    <option value="INACTIVO">Inactivo (Suspendido temporalmente)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Contratos SLA Activos
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.activeContracts}
                    onChange={(e) => setFormData({ ...formData, activeContracts: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Posiciones Pallet Asignadas
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.assignedSpaces}
                    onChange={(e) => setFormData({ ...formData, assignedSpaces: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Dirección Comercial / Centro de Despacho
                  </label>
                  <input
                    type="text"
                    placeholder="Av. Principal 1234, Ciudad"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Multi-Tenant notice */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Este cliente existirá exclusivamente en <strong>{companyDisplayName}</strong> y estará disponible de inmediato para Inventarios Cíclicos y Cotizaciones.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-xs transition-all"
                >
                  {editingClient ? 'Guardar Cambios' : 'Registrar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
