import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Send,
  Printer,
  DollarSign,
  Trash2,
  Eye,
  Building,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { LogisticsQuotation, QuotationItem, QuoteStatus, ClientAccount, User } from '../../types/inventory';

interface QuotationsModuleProps {
  quotations: LogisticsQuotation[];
  clients: ClientAccount[];
  currentUser: User;
  onSaveQuotation: (quotation: LogisticsQuotation) => void;
  onUpdateQuoteStatus: (quoteId: string, status: QuoteStatus) => void;
  onDeleteQuotation?: (quoteId: string) => void;
}

export const QuotationsModule: React.FC<QuotationsModuleProps> = ({
  quotations,
  clients,
  currentUser,
  onSaveQuotation,
  onUpdateQuoteStatus,
  onDeleteQuotation,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [clientFilter, setClientFilter] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedQuoteForView, setSelectedQuoteForView] = useState<LogisticsQuotation | null>(null);

  // New Quote Form State
  const [newClientName, setNewClientName] = useState(clients[0]?.name || 'Retail Pro S.A.');
  const [newCurrency, setNewCurrency] = useState('USD');
  const [newValidDays, setNewValidDays] = useState(30);
  const [newNotes, setNewNotes] = useState('Tarifas sujetas a verificación de cubicaje y rotación mensual. Precios netos en USD.');
  const [quoteItems, setQuoteItems] = useState<QuotationItem[]>([
    {
      id: 'itm-1',
      serviceType: 'ALMACENAJE_PALLET_DIA',
      description: 'Almacenaje en Racks Estándar (Posición Pallet / Día)',
      unit: 'Pallet/Día',
      unitRate: 0.45,
      estimatedQty: 4500,
      total: 2025.00,
    },
    {
      id: 'itm-2',
      serviceType: 'MANIPULEO_IN_OUT',
      description: 'Recepción, inspección y putaway de carga palletizada (Inbound)',
      unit: 'Mov/Pallet',
      unitRate: 4.20,
      estimatedQty: 150,
      total: 630.00,
    },
  ]);

  const handleAddItem = () => {
    const newItem: QuotationItem = {
      id: `itm-${Date.now()}`,
      serviceType: 'MANIPULEO_IN_OUT',
      description: 'Servicio de Despacho & Picking Palletizado (Outbound)',
      unit: 'Mov/Pallet',
      unitRate: 3.80,
      estimatedQty: 150,
      total: 570.00,
    };
    setQuoteItems([...quoteItems, newItem]);
  };

  const handleUpdateItem = (id: string, field: keyof QuotationItem, value: any) => {
    const updated = quoteItems.map(item => {
      if (item.id !== id) return item;
      const modified = { ...item, [field]: value };
      if (field === 'unitRate' || field === 'estimatedQty') {
        modified.total = Number((modified.unitRate * modified.estimatedQty).toFixed(2));
      }
      return modified;
    });
    setQuoteItems(updated);
  };

  const handleRemoveItem = (id: string) => {
    setQuoteItems(quoteItems.filter(item => item.id !== id));
  };

  const subtotal = quoteItems.reduce((acc, itm) => acc + itm.total, 0);
  const tax = Number((subtotal * 0.19).toFixed(2)); // 19% IVA standard
  const total = Number((subtotal + tax).toFixed(2));

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quoteItems.length === 0) {
      alert('Debe agregar al menos un ítem o servicio a la cotización.');
      return;
    }

    const today = new Date();
    const validUntilDate = new Date();
    validUntilDate.setDate(today.getDate() + newValidDays);

    const clientObj = clients.find(c => c.name === newClientName);

    const newQuotation: LogisticsQuotation = {
      id: `COT-2026-${String(quotations.length + 1).padStart(3, '0')}`,
      quoteNumber: `COT-2026-${String(quotations.length + 1).padStart(3, '0')}`,
      tenantId: 'TNT-STADIUS-01',
      clientName: newClientName,
      clientTaxId: clientObj?.code ? `RUT-${clientObj.code}-9` : 'RUT-EMPRESA-01',
      createdAt: today.toISOString().substring(0, 10),
      validUntil: validUntilDate.toISOString().substring(0, 10),
      status: 'BORRADOR',
      currency: newCurrency,
      items: quoteItems,
      subtotal,
      tax,
      total,
      notes: newNotes,
      createdBy: currentUser.name,
    };

    onSaveQuotation(newQuotation);
    setShowCreateModal(false);
  };

  // Filtered list
  const filteredQuotations = quotations.filter(q => {
    const matchesSearch = 
      q.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || q.status === statusFilter;
    const matchesClient = clientFilter === 'ALL' || q.clientName === clientFilter;
    return matchesSearch && matchesStatus && matchesClient;
  });

  const statusBadges: Record<QuoteStatus, { label: string; color: string; icon: any }> = {
    BORRADOR: { label: 'Borrador', color: 'bg-slate-100 text-slate-700 border-slate-300', icon: Clock },
    ENVIADA: { label: 'Enviada', color: 'bg-sky-50 text-sky-700 border-sky-300', icon: Send },
    APROBADA: { label: 'Aprobada', color: 'bg-emerald-50 text-emerald-700 border-emerald-300', icon: CheckCircle2 },
    RECHAZADA: { label: 'Rechazada', color: 'bg-rose-50 text-rose-700 border-rose-300', icon: XCircle },
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header with Title and Action Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Módulo Comercial · Cotizaciones de Servicios
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Diseño, cálculo y tarificación de servicios de almacenaje, manipuleo de carga in/out, transporte y maquila logística.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Cotización</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Cotizaciones</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{quotations.length}</div>
          <span className="text-[11px] text-slate-500">Registradas en sistema</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Cotizaciones Aprobadas</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {quotations.filter(q => q.status === 'APROBADA').length}
          </div>
          <span className="text-[11px] text-emerald-700">Contratos activos</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Monto Total Cotizado</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            ${quotations.reduce((acc, q) => acc + q.total, 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500">Moneda base USD</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Tasa de Cierre</span>
          <div className="text-2xl font-black text-sky-600 mt-1">
            {quotations.length > 0
              ? `${Math.round((quotations.filter(q => q.status === 'APROBADA').length / quotations.length) * 100)}%`
              : '0%'}
          </div>
          <span className="text-[11px] text-sky-700">Efectividad comercial</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por número o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium focus:outline-none"
            >
              <option value="ALL">Todos los Estados</option>
              <option value="BORRADOR">Borrador</option>
              <option value="ENVIADA">Enviada</option>
              <option value="APROBADA">Aprobada</option>
              <option value="RECHAZADA">Rechazada</option>
            </select>

            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium focus:outline-none"
            >
              <option value="ALL">Todos los Clientes</option>
              {clients.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <span className="text-xs text-slate-400 font-mono">
          {filteredQuotations.length} cotizaciones encontradas
        </span>
      </div>

      {/* Quotations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3 px-4">N° Cotización</th>
                <th className="py-3 px-4">Cliente / Cuenta</th>
                <th className="py-3 px-4">Fecha Emisión</th>
                <th className="py-3 px-4">Válida Hasta</th>
                <th className="py-3 px-4">Servicios Incluidos</th>
                <th className="py-3 px-4 text-right">Subtotal</th>
                <th className="py-3 px-4 text-right">Total (Inc. IVA)</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No se encontraron cotizaciones con los criterios seleccionados.
                  </td>
                </tr>
              ) : (
                filteredQuotations.map((quote) => {
                  const badge = statusBadges[quote.status];
                  const Icon = badge.icon;
                  return (
                    <tr key={quote.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {quote.quoteNumber}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {quote.clientName}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {quote.createdAt}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {quote.validUntil}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <span className="line-clamp-1">
                          {quote.items.map(i => i.unit).join(' · ')} ({quote.items.length} ítems)
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600">
                        ${quote.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-slate-900">
                        ${quote.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}>
                          <Icon className="w-3 h-3" />
                          <span>{badge.label}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedQuoteForView(quote)}
                            title="Ver detalle / Imprimir"
                            className="p-1 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {quote.status === 'BORRADOR' && (
                            <button
                              onClick={() => onUpdateQuoteStatus(quote.id, 'ENVIADA')}
                              title="Marcar como Enviada"
                              className="p-1 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          )}

                          {quote.status === 'ENVIADA' && (
                            <button
                              onClick={() => onUpdateQuoteStatus(quote.id, 'APROBADA')}
                              title="Aprobar Cotización"
                              className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          {onDeleteQuotation && currentUser.role === 'ADMIN' && (
                            <button
                              onClick={() => {
                                if (window.confirm(`¿Eliminar la cotización ${quote.quoteNumber}?`)) {
                                  onDeleteQuotation(quote.id);
                                }
                              }}
                              title="Eliminar cotización"
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

      {/* CREATE QUOTATION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-600" />
                <h3 className="font-black text-slate-900 text-lg">Nueva Cotización de Servicios Logísticos</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Cliente / Empresa
                  </label>
                  <select
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Moneda de Facturación
                  </label>
                  <select
                    value={newCurrency}
                    onChange={(e) => setNewCurrency(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                  >
                    <option value="USD">USD - Dólares Estadounidenses</option>
                    <option value="CLP">CLP - Pesos Chilenos</option>
                    <option value="EUR">EUR - Euros</option>
                    <option value="COP">COP - Pesos Colombianos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Vigencia de la Oferta (Días)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="90"
                    value={newValidDays}
                    onChange={(e) => setNewValidDays(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                  />
                </div>
              </div>

              {/* Items Breakdown Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-700">Ítems & Tarifas por Servicio</span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-2.5 py-1 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-800 text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Agregar Ítem</span>
                  </button>
                </div>

                <div className="p-3 space-y-3 max-h-72 overflow-y-auto">
                  {quoteItems.map((item, index) => (
                    <div key={item.id} className="p-3 bg-slate-50/70 border border-slate-200 rounded-lg grid grid-cols-12 gap-2 items-center text-xs">
                      <div className="col-span-12 sm:col-span-4">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase">Servicio</label>
                        <select
                          value={item.serviceType}
                          onChange={(e) => handleUpdateItem(item.id, 'serviceType', e.target.value)}
                          className="w-full p-1.5 bg-white border border-slate-200 rounded text-[11px] font-medium"
                        >
                          <option value="ALMACENAJE_PALLET_DIA">Almacenaje (Pallet/Día)</option>
                          <option value="MANIPULEO_IN_OUT">Manipuleo In/Out (Mov/Pallet)</option>
                          <option value="TRANSPORTE">Flete / Transporte (Viaje)</option>
                          <option value="ETIQUETADO">Etiquetado GS1 (Pallet/Caja)</option>
                          <option value="MAQUILA">Maquila / Acondicionamiento</option>
                          <option value="CROSS_DOCKING">Cross-Docking Rápido</option>
                        </select>
                      </div>

                      <div className="col-span-12 sm:col-span-4">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase">Descripción</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                          className="w-full p-1.5 bg-white border border-slate-200 rounded text-[11px]"
                        />
                      </div>

                      <div className="col-span-4 sm:col-span-1">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase">Tarifa</label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.unitRate}
                          onChange={(e) => handleUpdateItem(item.id, 'unitRate', parseFloat(e.target.value) || 0)}
                          className="w-full p-1.5 bg-white border border-slate-200 rounded text-[11px] font-mono"
                        />
                      </div>

                      <div className="col-span-4 sm:col-span-1">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase">Cant. Est.</label>
                        <input
                          type="number"
                          value={item.estimatedQty}
                          onChange={(e) => handleUpdateItem(item.id, 'estimatedQty', parseInt(e.target.value) || 0)}
                          className="w-full p-1.5 bg-white border border-slate-200 rounded text-[11px] font-mono"
                        />
                      </div>

                      <div className="col-span-3 sm:col-span-1 text-right">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase">Total</label>
                        <span className="font-mono font-bold text-slate-900">${item.total.toLocaleString()}</span>
                      </div>

                      <div className="col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                          title="Quitar ítem"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotal, IVA, Total Calculation Bar */}
                <div className="bg-slate-100 p-3 flex items-center justify-end gap-6 text-xs border-t border-slate-200">
                  <div>
                    <span className="text-slate-500 mr-2">Subtotal:</span>
                    <strong className="font-mono text-slate-900">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 mr-2">IVA (19%):</span>
                    <strong className="font-mono text-slate-900">${tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div className="text-sm font-black text-sky-800 bg-sky-100 px-3 py-1 rounded-lg">
                    <span>Total Oferta: </span>
                    <span className="font-mono">${total.toLocaleString(undefined, { minimumFractionDigits: 2 })} {newCurrency}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Condiciones Generales & Notas
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white rounded-xl shadow-sm"
                >
                  Generar y Guardar Cotización
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW / PRINT QUOTATION MODAL */}
      {selectedQuoteForView && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl border border-slate-200 my-8 print:p-0 print:border-none">
            <div className="flex items-center justify-between pb-6 border-b border-slate-200">
              <div>
                <div className="font-black text-xl text-slate-900 tracking-tight">STADIUS WMS · LOGÍSTICA & ALMACENES</div>
                <div className="text-xs text-slate-500">Propuesta Comercial y Tarifario de Servicios</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm font-black text-sky-600">{selectedQuoteForView.quoteNumber}</div>
                <div className="text-xs text-slate-400">Emisión: {selectedQuoteForView.createdAt}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 my-6 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <div className="text-slate-400 uppercase font-bold text-[10px]">Cliente Depositante:</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{selectedQuoteForView.clientName}</div>
                <div className="text-slate-500 font-mono">{selectedQuoteForView.clientTaxId}</div>
              </div>
              <div className="text-right">
                <div className="text-slate-400 uppercase font-bold text-[10px]">Validez de la Oferta:</div>
                <div className="font-bold text-slate-900 mt-0.5">{selectedQuoteForView.validUntil}</div>
                <div className="text-slate-500">Ejecutivo: {selectedQuoteForView.createdBy}</div>
              </div>
            </div>

            {/* Services Table */}
            <table className="w-full text-xs text-left my-4 border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px]">
                  <th className="py-2">Descripción del Servicio</th>
                  <th className="py-2 text-center">Unidad</th>
                  <th className="py-2 text-right">Tarifa Unitaria</th>
                  <th className="py-2 text-right">Cant. Est.</th>
                  <th className="py-2 text-right">Total ({selectedQuoteForView.currency})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedQuoteForView.items.map(item => (
                  <tr key={item.id} className="py-2">
                    <td className="py-2 font-medium text-slate-800">{item.description}</td>
                    <td className="py-2 text-center text-slate-500 font-mono">{item.unit}</td>
                    <td className="py-2 text-right text-slate-600 font-mono">${item.unitRate.toFixed(2)}</td>
                    <td className="py-2 text-right text-slate-600 font-mono">{item.estimatedQty.toLocaleString()}</td>
                    <td className="py-2 text-right font-black text-slate-900 font-mono">${item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="border-t border-slate-200 pt-3 text-xs space-y-1 text-right">
              <div>
                <span className="text-slate-500 mr-4">Subtotal Neto:</span>
                <span className="font-mono font-bold text-slate-900">${selectedQuoteForView.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div>
                <span className="text-slate-500 mr-4">IVA (19%):</span>
                <span className="font-mono text-slate-700">${selectedQuoteForView.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="text-base font-black text-sky-900 border-t border-slate-200 pt-2">
                <span className="mr-4">Total Cotización:</span>
                <span className="font-mono">${selectedQuoteForView.total.toLocaleString(undefined, { minimumFractionDigits: 2 })} {selectedQuoteForView.currency}</span>
              </div>
            </div>

            {/* Notes */}
            <div className="mt-6 p-3 bg-slate-50 rounded-lg text-slate-600 text-[11px] leading-relaxed border border-slate-200">
              <strong>Términos & Condiciones: </strong>{selectedQuoteForView.notes}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200 mt-6 print:hidden">
              <button
                onClick={() => setSelectedQuoteForView(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cerrar
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex items-center gap-2"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir / Exportar PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
