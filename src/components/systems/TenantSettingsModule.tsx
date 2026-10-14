import React, { useState, useEffect } from 'react';
import {
  Building2,
  Save,
  CheckCircle2,
  Shield,
  Key,
  Database,
  Globe,
  DollarSign,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Plus,
  Building,
  Lock,
  ArrowRight,
  Sparkles,
  Layers,
  X
} from 'lucide-react';
import { TenantConfig, User, CompanyTenant } from '../../types/inventory';
import { INITIAL_COMPANIES } from '../../data/initialData';

interface TenantSettingsModuleProps {
  tenantConfig: TenantConfig;
  currentUser: User;
  companies?: CompanyTenant[];
  onSaveTenantConfig: (config: TenantConfig) => void;
  onAddCompany?: (newCompany: CompanyTenant, initialConfig?: TenantConfig) => void;
  onSwitchCompany?: (companyId: string) => void;
}

export const TenantSettingsModule: React.FC<TenantSettingsModuleProps> = ({
  tenantConfig,
  currentUser,
  companies = INITIAL_COMPANIES,
  onSaveTenantConfig,
  onAddCompany,
  onSwitchCompany,
}) => {
  const [formData, setFormData] = useState<TenantConfig>({ ...tenantConfig });
  const [isSaved, setIsSaved] = useState(false);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);

  // New Company form state (Solo para Administrador)
  const [newCompId, setNewCompId] = useState('');
  const [newCompCode, setNewCompCode] = useState('');
  const [newCompName, setNewCompName] = useState('');
  const [newCompTaxId, setNewCompTaxId] = useState('');
  const [newCompCountry, setNewCompCountry] = useState('Chile');
  const [newCompCity, setNewCompCity] = useState('Santiago');
  const [newCompWarehouses, setNewCompWarehouses] = useState(1);
  const [newCompCurrency, setNewCompCurrency] = useState('USD');
  const [newCompDefaultWarehouse, setNewCompDefaultWarehouse] = useState('Bodega Central');

  // Keep formData in sync when tenantConfig changes (e.g. after switching company)
  useEffect(() => {
    setFormData({ ...tenantConfig });
  }, [tenantConfig]);

  const isAdmin = currentUser.role === 'ADMIN';

  const handleChange = (field: keyof TenantConfig, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setIsSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Acceso Denegado: Solo el Administrador General puede modificar parámetros del almacén y variables del tenant.');
      return;
    }
    onSaveTenantConfig(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleCreateCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Solo el Administrador General puede crear nuevas empresas.');
      return;
    }

    if (!newCompId.trim() || !newCompName.trim()) {
      alert('Por favor ingrese el ID y Razón Social de la empresa.');
      return;
    }

    const newCompany: CompanyTenant = {
      id: newCompId.trim().toUpperCase(),
      code: newCompCode.trim().toUpperCase() || newCompId.trim().toUpperCase(),
      name: newCompName.trim(),
      taxId: newCompTaxId.trim() || 'CL-80.000.000-1',
      country: newCompCountry.trim(),
      city: newCompCity.trim(),
      warehouseCount: newCompWarehouses || 1,
      active: true,
    };

    const initialCompanyConfig: TenantConfig = {
      tenantId: newCompany.id,
      companyName: newCompany.name,
      taxId: newCompany.taxId,
      country: newCompany.country,
      city: newCompany.city,
      address: `Parque Logístico Industrial, ${newCompany.city}`,
      phone: '+56 2 2000 0000',
      billingEmail: `finanzas@${newCompany.id.toLowerCase()}.com`,
      currency: newCompCurrency,
      dateFormat: 'YYYY-MM-DD',
      defaultWarehouse: `${newCompDefaultWarehouse} (${newCompany.id})`,
      skuPrefix: `${newCompany.id.replace('EMP-', '')}-`,
      mermaTolerancePercent: 0.5,
      sosAutoEscalateMinutes: 15,
      allowBlindCountOnly: true,
      activePlan: 'ENTERPRISE_MULTI_TENANT',
    };

    if (onAddCompany) {
      onAddCompany(newCompany, initialCompanyConfig);
    }

    setShowAddCompanyModal(false);
    setNewCompId('');
    setNewCompCode('');
    setNewCompName('');
    setNewCompTaxId('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Sistemas y Seguridad · Parámetros del Tenant / Empresa
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configuración general de la instancia multi-tenant, moneda contable, reglas de almacén y aislamiento estricto de variables.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-900 font-bold border border-amber-500/30">
            Empresa Activa: {currentUser.companyId || 'EMP-A'}
          </span>
        </div>
      </div>

      {/* SECTION 1: GESTIÓN DE EMPRESAS / TENANTS (SOLO EL ADMINISTRADOR DEBE CREAR EMPRESAS) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-purple-600" />
              <h3 className="font-black text-slate-900 text-sm tracking-tight">
                Empresas y Tenants del Sistema ({companies.length})
              </h3>
              {isAdmin ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  Control Administrador
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Solo Lectura
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isAdmin 
                ? 'Solo el Administrador General puede crear empresas y tiene autorización para ingresar a todas las empresas.'
                : `Tu usuario está asignado a ${currentUser.companyName || currentUser.companyId}. La creación y conmutación de empresas está restringida.`}
            </p>
          </div>

          {isAdmin ? (
            <button
              onClick={() => {
                const nextLetter = String.fromCharCode(65 + companies.length);
                setNewCompId(`EMP-${nextLetter}`);
                setNewCompCode(`CORP-${nextLetter}`);
                setNewCompName(`Empresa ${nextLetter} - Logística Integral SpA`);
                setShowAddCompanyModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Crear Nueva Empresa</span>
            </button>
          ) : (
            <div className="text-[11px] text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Creación reservada a Admin</span>
            </div>
          )}
        </div>

        {/* Company Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {companies.map(comp => {
            const isCompActive = (currentUser.companyId || 'EMP-A') === comp.id;
            return (
              <div
                key={comp.id}
                className={`p-4 rounded-xl border transition-all ${
                  isCompActive
                    ? 'bg-purple-50/60 border-purple-300 ring-2 ring-purple-500/20 shadow-xs'
                    : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-black px-1.5 py-0.5 rounded bg-slate-900 text-white">
                        {comp.id}
                      </span>
                      <span className="font-bold text-xs text-slate-900">
                        {comp.name}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 space-y-0.5 font-mono">
                      <div>RUT: {comp.taxId} · {comp.city}, {comp.country}</div>
                      <div>Bodegas registradas: <strong className="text-slate-700">{comp.warehouseCount}</strong></div>
                    </div>
                  </div>

                  {isCompActive ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-600 text-white shrink-0">
                      Activa Ahora
                    </span>
                  ) : isAdmin && onSwitchCompany ? (
                    <button
                      onClick={() => onSwitchCompany(comp.id)}
                      className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 rounded-lg flex items-center gap-1 transition-colors shrink-0 shadow-2xs"
                      title="Solo el Administrador puede ingresar a todas las empresas"
                    >
                      <span>Ingresar</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">
                      Restringido
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: CONFIGURACIÓN DE ALMACÉN Y VARIABLES DEL TENANT ACTIVO */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-black text-slate-900 text-sm tracking-tight flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-600" />
                <span>Identificación Legal de la Empresa ({formData.tenantId})</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Variables aisladas: los cambios aquí solo afectarán a <strong>{formData.companyName}</strong>.
              </p>
            </div>
            {!isAdmin && (
              <span className="text-xs text-amber-600 font-bold flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                <span>Solo Administrador puede editar</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Razón Social</label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">RUT / NIT / Tax ID</label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.taxId}
                onChange={(e) => handleChange('taxId', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Correo de Facturación</label>
              <input
                type="email"
                disabled={!isAdmin}
                value={formData.billingEmail}
                onChange={(e) => handleChange('billingEmail', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">País</label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Ciudad</label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Teléfono Central</label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg disabled:opacity-60"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Dirección de Centro de Distribución Principal</label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg disabled:opacity-60"
              />
            </div>
          </div>
        </div>

        {/* Section 3: WMS Operational & Warehouse Variables (Isolated per company) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-black text-slate-900 text-sm tracking-tight flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-600" />
                <span>Configuración sobre el Almacén y Variables Operativas</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                "si tengo la empresa B no podrá visualizar nada del A ni cambiar su configuración sobre el almacén y otras variables"
              </p>
            </div>
            <span className="text-[11px] font-mono text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              {formData.tenantId}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Moneda Contable Base</label>
              <select
                disabled={!isAdmin}
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold disabled:opacity-60"
              >
                <option value="USD">USD - Dólar Estadounidense</option>
                <option value="CLP">CLP - Peso Chileno</option>
                <option value="EUR">EUR - Euro</option>
                <option value="COP">COP - Peso Colombiano</option>
                <option value="PEN">PEN - Sol Peruano</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Bodega Predeterminada</label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.defaultWarehouse}
                onChange={(e) => handleChange('defaultWarehouse', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Prefijo de Código SKU</label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.skuPrefix}
                onChange={(e) => handleChange('skuPrefix', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Tolerancia de Merma Máxima (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                disabled={!isAdmin}
                value={formData.mermaTolerancePercent}
                onChange={(e) => handleChange('mermaTolerancePercent', parseFloat(e.target.value) || 0)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono disabled:opacity-60"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Discrepancias sobre este valor exigen re-conteo.</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Auto-Escalamiento Alertas SOS (min)
              </label>
              <input
                type="number"
                min="5"
                max="60"
                disabled={!isAdmin}
                value={formData.sosAutoEscalateMinutes}
                onChange={(e) => handleChange('sosAutoEscalateMinutes', parseInt(e.target.value) || 15)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono disabled:opacity-60"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Tiempo sin atención antes de alarma roja.</span>
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="blindOnly"
                disabled={!isAdmin}
                checked={formData.allowBlindCountOnly}
                onChange={(e) => handleChange('allowBlindCountOnly', e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <label htmlFor="blindOnly" className="text-xs font-bold text-slate-800 cursor-pointer">
                Exigir Conteo Ciego a Operadores
              </label>
            </div>
          </div>
        </div>

        {/* Multi-Tenant Architecture & Data Isolation */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" />
            <h3 className="font-black text-sm tracking-tight text-white">
              Aislamiento Estricto de Datos & Configuración Multi-Empresa
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            Cada empresa (<code className="text-amber-400 font-mono">EMP-A</code>, <code className="text-amber-400 font-mono">EMP-B</code>, etc.) almacena su propio catálogo de SKUs, clientes depositantes, ciclos de inventario y configuración de almacén. Los usuarios asignados a una empresa no pueden ver la información ni modificar la configuración de otra.
          </p>
        </div>

        {/* Action Buttons */}
        {isAdmin && (
          <div className="flex items-center justify-end gap-3 pt-2">
            {isSaved && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Parámetros de {formData.companyName} guardados con éxito</span>
              </span>
            )}

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Parámetros de la Empresa Activa</span>
            </button>
          </div>
        )}
      </form>

      {/* MODAL: CREAR NUEVA EMPRESA (SOLO EL ADMINISTRADOR DEBE CREAR EMPRESAS) */}
      {showAddCompanyModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-purple-600" />
                <div>
                  <h4 className="font-black text-base text-slate-900">Crear Nueva Empresa / Tenant</h4>
                  <p className="text-[11px] text-slate-500">
                    Solo el Administrador General puede crear empresas en el sistema.
                  </p>
                </div>
              </div>
              <button onClick={() => setShowAddCompanyModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCompanySubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    ID Empresa (Tenant Key) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="EMP-C"
                    value={newCompId}
                    onChange={(e) => setNewCompId(e.target.value.toUpperCase())}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Código Interno
                  </label>
                  <input
                    type="text"
                    placeholder="ANDINA-LOG"
                    value={newCompCode}
                    onChange={(e) => setNewCompCode(e.target.value.toUpperCase())}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Razón Social / Nombre Comercial *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Empresa C - Logística Andina S.A."
                    value={newCompName}
                    onChange={(e) => setNewCompName(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    RUT / Tax ID
                  </label>
                  <input
                    type="text"
                    placeholder="CL-78.500.220-4"
                    value={newCompTaxId}
                    onChange={(e) => setNewCompTaxId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Moneda Contable Base
                  </label>
                  <select
                    value={newCompCurrency}
                    onChange={(e) => setNewCompCurrency(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  >
                    <option value="USD">USD - Dólar</option>
                    <option value="CLP">CLP - Peso Chileno</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    País
                  </label>
                  <input
                    type="text"
                    value={newCompCountry}
                    onChange={(e) => setNewCompCountry(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={newCompCity}
                    onChange={(e) => setNewCompCity(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Bodega Principal
                  </label>
                  <input
                    type="text"
                    value={newCompDefaultWarehouse}
                    onChange={(e) => setNewCompDefaultWarehouse(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Cantidad de Bodegas
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newCompWarehouses}
                    onChange={(e) => setNewCompWarehouses(parseInt(e.target.value) || 1)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCompanyModal(false)}
                  className="px-3.5 py-2 text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-xs"
                >
                  Crear Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
