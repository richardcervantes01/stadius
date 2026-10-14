import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Search,
  Filter,
  Barcode,
  Package,
  Boxes,
  Trash2,
  Edit,
  Tag,
  Scale,
  Maximize2,
  CheckCircle2,
  Building
} from 'lucide-react';
import { SkuMasterItem, ControlType, UnitOfMeasure, StorageEnvironment, ClientAccount, User } from '../../types/inventory';

interface SkuCatalogModuleProps {
  skuCatalog: SkuMasterItem[];
  clients: ClientAccount[];
  currentUser: User;
  onSaveSku: (skuItem: SkuMasterItem) => void;
  onDeleteSku?: (skuId: string) => void;
}

export const SkuCatalogModule: React.FC<SkuCatalogModuleProps> = ({
  skuCatalog = [],
  clients = [],
  currentUser,
  onSaveSku,
  onDeleteSku,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [abcFilter, setAbcFilter] = useState<string>('ALL');
  const [clientFilter, setClientFilter] = useState<string>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingSku, setEditingSku] = useState<SkuMasterItem | null>(null);

  // Form State
  const [formSku, setFormSku] = useState('');
  const [formBarcode, setFormBarcode] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formClientName, setFormClientName] = useState(clients[0]?.name || 'Retail Pro S.A.');
  const [formCategory, setFormCategory] = useState('General');
  const [formFamily, setFormFamily] = useState('Estándar');
  const [formLengthM, setFormLengthM] = useState(0.30);
  const [formWidthM, setFormWidthM] = useState(0.20);
  const [formHeightM, setFormHeightM] = useState(0.15);
  const [formWeightKg, setFormWeightKg] = useState(5.0);
  const [formControlType, setFormControlType] = useState<ControlType>('GENERAL');
  const [formUnitOfMeasure, setFormUnitOfMeasure] = useState<UnitOfMeasure>('CAJA');
  const [formStorageEnv, setFormStorageEnv] = useState<StorageEnvironment>('AMBIENTE');
  const [formUnitCost, setFormUnitCost] = useState(50.0);
  const [formCurrency, setFormCurrency] = useState<'PEN' | 'USD'>('USD');
  const [formActive, setFormActive] = useState(true);

  const openCreateModal = () => {
    setEditingSku(null);
    setFormSku(`SKU-${Date.now().toString().slice(-4)}`);
    setFormBarcode(`780${Date.now().toString().slice(-10)}`);
    setFormDescription('');
    setFormClientName(clients[0]?.name || 'Retail Pro S.A.');
    setFormCategory('General');
    setFormFamily('Estándar');
    setFormLengthM(0.30);
    setFormWidthM(0.20);
    setFormHeightM(0.15);
    setFormWeightKg(5.0);
    setFormControlType('GENERAL');
    setFormUnitOfMeasure('CAJA');
    setFormStorageEnv('AMBIENTE');
    setFormUnitCost(50.0);
    setFormCurrency('USD');
    setFormActive(true);
    setShowModal(true);
  };

  const openEditModal = (item: SkuMasterItem) => {
    setEditingSku(item);
    setFormSku(item.sku);
    setFormBarcode(item.barcode);
    setFormDescription(item.description);
    setFormClientName(item.clientName);
    setFormCategory(item.category);
    setFormFamily(item.family);
    setFormLengthM(item.dimensionsMeters?.length ?? 0);
    setFormWidthM(item.dimensionsMeters?.width ?? 0);
    setFormHeightM(item.dimensionsMeters?.height ?? 0);
    setFormWeightKg(item.weightKg);
    setFormUnitOfMeasure(item.unitOfMeasure);
    setFormStorageEnv(item.storageEnvironment);
    setFormUnitCost(item.unitCost);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSku.trim() || !formDescription.trim()) {
      alert('Código SKU y Descripción son obligatorios.');
      return;
    }

    const volumeM3 = Number((formLengthM * formWidthM * formHeightM).toFixed(4));

    const itemToSave: SkuMasterItem = {
      id: editingSku ? editingSku.id : `SKU-${Date.now()}`,
      tenantId: 'TNT-STADIUS-01',
      sku: formSku.trim(),
      additionalCodes: [],
      barcode: formBarcode.trim() || 'SIN-CODIGO',
      description: formDescription.trim(),
      clientName: formClientName,
      family: formFamily,
      dimensionsMeters: {
        length: formLengthM,
        width: formWidthM,
        height: formHeightM,
      },
      weightKg: formWeightKg,
      volumeM3,
      unitOfMeasure: formUnitOfMeasure,
      unitCost: formUnitCost,
      currency: formCurrency,
      controlType: formControlType,
      storageEnvironment: formStorageEnv,
      active: formActive,
      createdBy: currentUser.name,
      createdAt: editingSku ? editingSku.createdAt : new Date().toISOString(),
      updatedBy: currentUser.name,
      updatedAt: new Date().toISOString(),
    };

    onSaveSku(itemToSave);
    setShowModal(false);
  };

  // Filter SKUs
  const filteredSkus = (skuCatalog || []).filter(item => {
    const matchesSearch = 
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.barcode.includes(searchTerm);
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
    const matchesAbc = abcFilter === 'ALL' || item.abcClass === abcFilter;
    const matchesClient = clientFilter === 'ALL' || item.clientName === clientFilter;
    return matchesSearch && matchesCategory && matchesAbc && matchesClient;
  });

  const categories = Array.from(new Set((skuCatalog || []).map(s => s.category)));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Operaciones de Almacén · Catálogo de SKUs & Maestro de Artículos
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestión integral de códigos de artículo, dimensiones físicas, peso volumétrico, familias de producto y estratificación ABC.
          </p>
        </div>

        {currentUser.role !== 'OPERATOR' && (
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Artículo SKU</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por SKU, descripción o código de barras..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium focus:outline-none"
            >
              <option value="ALL">Todas las Categorías</option>
              {(categories || []).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={abcFilter}
              onChange={(e) => setAbcFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium focus:outline-none"
            >
              <option value="ALL">Todas las Clases ABC</option>
              <option value="A">Clase A (Alta Rotación / Costo)</option>
              <option value="B">Clase B (Rotación Media)</option>
              <option value="C">Clase C (Baja Rotación)</option>
            </select>

            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium focus:outline-none"
            >
              <option value="ALL">Todos los Clientes</option>
              {(clients || []).map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <span className="text-xs text-slate-400 font-mono">
          {filteredSkus.length} artículos en maestro
        </span>
      </div>

      {/* SKUs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3 px-4">Código SKU</th>
                <th className="py-3 px-4">Descripción del Artículo</th>
                <th className="py-3 px-4">Cliente / Cuenta</th>
                <th className="py-3 px-4">Familia</th>
                <th className="py-3 px-4 text-center">Tipo Control</th>
                <th className="py-3 px-4 text-center">Dimensiones (L x A x H) m</th>
                <th className="py-3 px-4 text-right">Peso (kg)</th>
                <th className="py-3 px-4 text-right">Costo Unitario</th>
                <th className="py-3 px-4 text-center">Ambiente</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSkus.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    No se encontraron artículos en el maestro con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredSkus.map(item => {
                  const abcColors = {
                    A: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    B: 'bg-amber-50 text-amber-700 border-amber-200',
                    C: 'bg-slate-100 text-slate-700 border-slate-200',
                  };

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900">{item.sku}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                          <Barcode className="w-3 h-3 text-slate-400" />
                          <span>{item.barcode}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800 max-w-xs truncate">
                        {item.description}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {item.clientName}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {item.family}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black border bg-slate-100 text-slate-700 border-slate-200`}>
                          {item.controlType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-600">
                        {item.dimensionsMeters?.length} × {item.dimensionsMeters?.width} × {item.dimensionsMeters?.height} m
                        <div className="text-[10px] text-slate-400 font-normal">({item.volumeM3} m³)</div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-700">
                        {item.weightKg} kg
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        {item.currency} {item.unitCost.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium ${
                          item.storageEnvironment === 'REFRIGERADO'
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {item.storageEnvironment}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEditModal(item)}
                            title="Editar SKU"
                            className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {onDeleteSku && currentUser.role === 'ADMIN' && (
                            <button
                              onClick={() => {
                                if (window.confirm(`¿Eliminar artículo ${item.sku}?`)) {
                                  onDeleteSku(item.id);
                                }
                              }}
                              title="Eliminar artículo"
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT SKU MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-slate-900 text-lg">
                  {editingSku ? `Editar SKU: ${editingSku.sku}` : 'Nuevo Artículo en Catálogo Maestro'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Código SKU</label>
                  <input
                    type="text"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                    placeholder="ej: SKU-ELEC-401"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Código de Barras (EAN/UPC)</label>
                  <input
                    type="text"
                    value={formBarcode}
                    onChange={(e) => setFormBarcode(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                    placeholder="7801234567890"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Cliente / Propietario</label>
                  <select
                    value={formClientName}
                    onChange={(e) => setFormClientName(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                  >
                    {(clients || []).map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Descripción del Producto</label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                  placeholder="ej: Batería Industrial Litio 48V 100Ah"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Familia</label>
                  <input
                    type="text"
                    value={formFamily}
                    onChange={(e) => setFormFamily(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    placeholder="Electroportátiles"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Tipo Control</label>
                  <select
                    value={formControlType}
                    onChange={(e) => setFormControlType(e.target.value as ControlType)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                  >
                    <option value="GENERAL">General</option>
                    <option value="LOTE">Lote / Vencimiento</option>
                    <option value="SERIE">Serie Única</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Unidad de Medida</label>
                  <select
                    value={formUnitOfMeasure}
                    onChange={(e) => setFormUnitOfMeasure(e.target.value as UnitOfMeasure)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="PALLET">Pallet</option>
                    <option value="CAJA">Caja</option>
                    <option value="UNIDAD">Unidad</option>
                    <option value="BIDON">Bidón</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Activo</label>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      checked={formActive}
                      onChange={(e) => setFormActive(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-xs text-slate-600 font-bold">{formActive ? 'SÍ' : 'NO'}</span>
                  </div>
                </div>
              </div>

              {/* Dimensions and Weight */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-800 uppercase block">Dimensiones (metros) & Peso</span>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Largo (m)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formLengthM}
                      onChange={(e) => setFormLengthM(parseFloat(e.target.value) || 0)}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Ancho (m)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formWidthM}
                      onChange={(e) => setFormWidthM(parseFloat(e.target.value) || 0)}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Alto (m)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formHeightM}
                      onChange={(e) => setFormHeightM(parseFloat(e.target.value) || 0)}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Peso (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formWeightKg}
                      onChange={(e) => setFormWeightKg(parseFloat(e.target.value) || 0)}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Costo Unitario</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formUnitCost}
                    onChange={(e) => setFormUnitCost(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Moneda</label>
                  <select
                    value={formCurrency}
                    onChange={(e) => setFormCurrency(e.target.value as 'PEN' | 'USD')}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                  >
                    <option value="USD">USD</option>
                    <option value="PEN">PEN</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Condición Térmica</label>
                  <select
                    value={formStorageEnv}
                    onChange={(e) => setFormStorageEnv(e.target.value as StorageEnvironment)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="AMBIENTE">Ambiente Seco</option>
                    <option value="REFRIGERADO">Cadena de Frío</option>
                    <option value="CONGELADO">Congelado</option>
                    <option value="PELIGROSO">Material Peligroso</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-sm"
                >
                  Guardar Artículo SKU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
