import React, { useState, useRef } from 'react';
import { 
  FileSpreadsheet, 
  UploadCloud, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Building2, 
  FileCheck,
  Search,
  Check,
  PackageCheck
} from 'lucide-react';
import { 
  StorageType, 
  MasterInventoryItem, 
  ExcelImportPreview 
} from '../types/inventory';
import { 
  parseExcelOrCsvFile, 
  downloadTemplateFile 
} from '../utils/excelParser';

interface ExcelImportModuleProps {
  masterInventory: MasterInventoryItem[];
  onAddInventoryItems: (newItems: MasterInventoryItem[]) => void;
  clients: import('../types/inventory').ClientAccount[];
  activeClient: string;
  activePeriod: string;
  currentUser: import('../types/inventory').User;
  onDeleteInventoryItem?: (itemId: string) => void;
  onClearInventory?: () => void;
}

export const ExcelImportModule: React.FC<ExcelImportModuleProps> = ({
  masterInventory,
  onAddInventoryItems,
  clients,
  activeClient,
  activePeriod,
  currentUser,
  onDeleteInventoryItem,
  onClearInventory,
}) => {
  const [selectedStorageType, setSelectedStorageType] = useState<StorageType>('RACK_HEIGHT');
  const [importClient, setImportClient] = useState(activeClient !== 'ALL' ? activeClient : (clients[0]?.name || 'Retail Pro S.A.'));
  const [importPeriod, setImportPeriod] = useState(activePeriod !== 'ALL' ? activePeriod : '2026-10');
  const [importDate, setImportDate] = useState(new Date().toISOString().substring(0, 10));
  const [preview, setPreview] = useState<ExcelImportPreview | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [previewFilter, setPreviewFilter] = useState<'ALL' | 'VALID' | 'ERRORS'>('ALL');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isAdmin = currentUser.role === 'ADMIN';

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setSuccessMessage(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const buffer = evt.target?.result as ArrayBuffer;
      if (buffer) {
        const result = parseExcelOrCsvFile(buffer, file.name, selectedStorageType);
        setPreview(result);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleLoadDemoPreview = () => {
    setFileName(`Datos_Simulados_${selectedStorageType === 'RACK_HEIGHT' ? 'Racks_Altura' : 'Piso_Nivel'}.xlsx`);
    setSuccessMessage(null);

    const isRack = selectedStorageType === 'RACK_HEIGHT';
    const demoRows: MasterInventoryItem[] = isRack
      ? [
          {
            id: `DEMO-${Date.now()}-1`,
            clientName: importClient,
            period: importPeriod,
            uploadDate: importDate,
            warehouse: 'B01 - Bodega Central',
            aisle: 'Pasillo 04',
            locationCode: 'P04-R04-01',
            verticalLevel: 'Altura A (Piso)',
            sku: 'SKU-IND-330',
            description: 'Compresor de Aire 50L 2.5HP Lubricado',
            batch: 'LOT-2026-CP1',
            theoreticalQty: 14,
            unitCost: 210.00,
            category: 'A - Alta Rotación',
            storageType: 'RACK_HEIGHT',
          },
          {
            id: `DEMO-${Date.now()}-2`,
            clientName: importClient,
            period: importPeriod,
            uploadDate: importDate,
            warehouse: 'B01 - Bodega Central',
            aisle: 'Pasillo 04',
            locationCode: 'P04-R04-02',
            verticalLevel: 'Altura B (Media)',
            sku: 'SKU-IND-331',
            description: 'Manguera Neumática Espiral 15m con Racor',
            batch: 'LOT-2026-MG',
            theoreticalQty: 42,
            unitCost: 28.50,
            category: 'B - Media Rotación',
            storageType: 'RACK_HEIGHT',
          },
          {
            id: `DEMO-${Date.now()}-3`,
            clientName: importClient,
            period: importPeriod,
            uploadDate: importDate,
            warehouse: 'B01 - Bodega Central',
            aisle: 'Pasillo 05',
            locationCode: 'P05-R05-01',
            verticalLevel: 'Altura C (Superior)',
            sku: 'SKU-ILUM-901',
            description: 'Reflector LED Industrial 150W IP65',
            batch: 'LOT-2025-L9',
            theoreticalQty: 25,
            unitCost: 45.00,
            category: 'B - Media Rotación',
            storageType: 'RACK_HEIGHT',
          },
          {
            id: `DEMO-${Date.now()}-4`,
            clientName: importClient,
            period: importPeriod,
            uploadDate: importDate,
            warehouse: 'B01 - Bodega Central',
            aisle: 'Pasillo 05',
            locationCode: 'P05-R05-02',
            verticalLevel: 'Altura A (Piso)',
            sku: 'SKU-ILUM-902',
            description: 'Luminaria Hermética LED 2x18W',
            batch: 'LOT-2026-L1',
            theoreticalQty: 60,
            unitCost: 31.00,
            category: 'C - Baja Rotación',
            storageType: 'RACK_HEIGHT',
          },
        ]
      : [
          {
            id: `DEMO-${Date.now()}-5`,
            clientName: importClient,
            period: importPeriod,
            uploadDate: importDate,
            warehouse: 'B01 - Bodega Central',
            aisle: 'Zona Piso N-03',
            locationCode: 'ZPN-03-B01',
            verticalLevel: 'Nivel 1 (Piso Directo)',
            sku: 'SKU-AGRO-201',
            description: 'Saco Fertilizante Granulado NPK 50kg',
            batch: 'LOT-2026-NPK',
            theoreticalQty: 85,
            unitCost: 42.00,
            category: 'A - Alta Rotación',
            storageType: 'FLOOR_LEVEL',
          },
          {
            id: `DEMO-${Date.now()}-6`,
            clientName: importClient,
            period: importPeriod,
            uploadDate: importDate,
            warehouse: 'B01 - Bodega Central',
            aisle: 'Zona Piso N-03',
            locationCode: 'ZPN-03-B02',
            verticalLevel: 'Nivel 2 (Remonte)',
            sku: 'SKU-AGRO-202',
            description: 'Semilla Certificada Híbrida Maíz x20kg',
            batch: 'LOT-2026-SEM',
            theoreticalQty: 40,
            unitCost: 78.00,
            category: 'A - Alta Rotación',
            storageType: 'FLOOR_LEVEL',
          },
        ];

    // Simulate 1 controlled warning/error for demonstration of error engine
    const demoErrors = [
      {
        row: 5,
        field: 'Validación WMS',
        message: 'Aviso: Los registros demo están listos para ser incorporados al catálogo.',
      },
    ];

    setPreview({
      validRows: demoRows,
      errors: demoErrors,
      totalParsed: demoRows.length,
      validCount: demoRows.length,
      errorCount: 0,
    });
  };

  const handleConfirmImport = () => {
    if (!preview || preview.validRows.length === 0) return;

    const rowsWithMetadata = preview.validRows.map(row => ({
      ...row,
      clientName: importClient,
      period: importPeriod,
      uploadDate: importDate,
    }));

    onAddInventoryItems(rowsWithMetadata);
    setSuccessMessage(`Se importaron exitosamente ${rowsWithMetadata.length} ubicaciones para el cliente "${importClient}" (Periodo: ${importPeriod}).`);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Title & Overview Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
              <FileSpreadsheet className="w-5 h-5 text-amber-500" />
              <span>Módulo 1: Carga y Estructura de Datos (Excel / CSV)</span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Importación masiva con validación previa de inconsistencias, tipologías físicas (Racks vs Piso) y control de duplicidad.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => downloadTemplateFile(selectedStorageType)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Descargar Plantilla Excel</span>
            </button>

            <button
              onClick={handleLoadDemoPreview}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors"
            >
              <FileCheck className="w-4 h-4 text-amber-600" />
              <span>Cargar Datos Demo de Prueba</span>
            </button>
          </div>
        </div>

        {/* Parámetros de Carga: Cliente, Periodo y Fecha */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
              Cliente / Cuenta Asignada:
            </label>
            <select
              value={importClient}
              onChange={(e) => setImportClient(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {clients.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
              Periodo de Inventario:
            </label>
            <input
              type="text"
              required
              value={importPeriod}
              onChange={(e) => setImportPeriod(e.target.value)}
              placeholder="Ej: 2026-10"
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
              Fecha de Carga Base:
            </label>
            <input
              type="date"
              required
              value={importDate}
              onChange={(e) => setImportDate(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Tipología selector pills */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
              Tipología de Almacenamiento:
            </span>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => {
                setSelectedStorageType('RACK_HEIGHT');
                setPreview(null);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md transition-all ${
                selectedStorageType === 'RACK_HEIGHT'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-500" />
              <span>Estructura Racks / Altura</span>
            </button>

            <button
              onClick={() => {
                setSelectedStorageType('FLOOR_LEVEL');
                setPreview(null);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md transition-all ${
                selectedStorageType === 'FLOOR_LEVEL'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>Estructura Piso / Nivel</span>
            </button>
          </div>
        </div>

        {/* Format Columns Spec Legend */}
        <div className="mt-3 text-xs bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-600 font-mono">
          <span className="font-semibold text-slate-800 font-sans">Columnas requeridas para esta estructura: </span>
          {selectedStorageType === 'RACK_HEIGHT' ? (
            <span>Bodega · Pasillo/Rack · Ubicación · <strong>Altura (A/B/C)</strong> · SKU · Descripción · Lote (opc) · Cantidad Teórica · Categoría ABC</span>
          ) : (
            <span>Bodega · Pasillo · Ubicación · <strong>Nivel (Piso 1/Remonte)</strong> · SKU · Descripción · Lote (opc) · Cantidad Teórica · Categoría ABC</span>
          )}
        </div>
      </div>

      {/* Upload Dropzone */}
      <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center hover:border-amber-500 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileUpload}
          className="hidden"
          id="excel-file-upload"
        />
        <label
          htmlFor="excel-file-upload"
          className="cursor-pointer flex flex-col items-center justify-center space-y-3"
        >
          <div className="w-14 h-14 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center text-amber-600">
            <UploadCloud className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-800">
              Haz clic aquí para seleccionar tu archivo Excel (.xlsx / .csv)
            </p>
            <p className="text-xs text-slate-500">
              Soporta archivos de exportación ERP (SAP, WMS, Oracle, NetSuite)
            </p>
          </div>
          <span className="inline-block px-4 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
            Explorar Archivos
          </span>
        </label>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      {/* Previsualization Section */}
      {preview && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Header & Stats Cards */}
          <div className="p-5 border-b border-slate-200 bg-slate-50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-amber-500" />
                  <span>Previsualización y Validación de Datos: {fileName}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Revisa los registros antes de confirmar la inserción en la base de datos maestra.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreview(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmImport}
                  disabled={preview.validRows.length === 0}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirmar e Importar {preview.validRows.length} Registros</span>
                </button>
              </div>
            </div>

            {/* Diagnostics Metric Pills */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <div className="text-xs text-slate-500 font-medium">Total Parseados</div>
                <div className="text-lg font-bold text-slate-800 font-mono mt-0.5">
                  {preview.totalParsed}
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-emerald-200">
                <div className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Válidos para Carga</span>
                </div>
                <div className="text-lg font-bold text-emerald-700 font-mono mt-0.5">
                  {preview.validCount}
                </div>
              </div>

              <div className={`p-3 rounded-lg border ${preview.errorCount > 0 ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-white border-slate-200 text-slate-500'}`}>
                <div className="text-xs font-medium flex items-center gap-1.5">
                  <AlertTriangle className={`w-3.5 h-3.5 ${preview.errorCount > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
                  <span>Inconsistencias Detectadas</span>
                </div>
                <div className="text-lg font-bold font-mono mt-0.5">
                  {preview.errorCount}
                </div>
              </div>
            </div>

            {/* Error Detail Box if any */}
            {preview.errors.length > 0 && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg">
                <div className="text-xs font-semibold text-rose-900 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Detalle de advertencias y errores en el archivo:</span>
                </div>
                <ul className="text-xs text-rose-800 space-y-1 list-disc pl-5 max-h-32 overflow-y-auto">
                  {preview.errors.map((err, i) => (
                    <li key={i}>
                      <strong>Fila {err.row} [{err.field}]:</strong> {err.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Table Preview Filter Tabs */}
          <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Filtrar vista:</span>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md text-xs">
                <button
                  onClick={() => setPreviewFilter('ALL')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    previewFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Todos ({preview.validRows.length})
                </button>
                <button
                  onClick={() => setPreviewFilter('VALID')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    previewFilter === 'VALID' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Válidos
                </button>
              </div>
            </div>

            <span className="text-xs text-slate-400 font-mono">
              Estructura: {selectedStorageType === 'RACK_HEIGHT' ? 'Racks / Altura' : 'Piso / Nivel'}
            </span>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100/80 sticky top-0 text-slate-600 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Bodega</th>
                  <th className="py-2.5 px-3">Pasillo</th>
                  <th className="py-2.5 px-3">Ubicación</th>
                  <th className="py-2.5 px-3">{selectedStorageType === 'RACK_HEIGHT' ? 'Altura' : 'Nivel'}</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Descripción</th>
                  <th className="py-2.5 px-3">Lote</th>
                  <th className="py-2.5 px-3 text-right">Cant. Teórica</th>
                  <th className="py-2.5 px-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {preview.validRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-slate-900">{row.warehouse}</td>
                    <td className="py-2.5 px-3 font-mono">{row.aisle}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-amber-700">{row.locationCode}</td>
                    <td className="py-2.5 px-3 font-medium">{row.verticalLevel}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">{row.sku}</td>
                    <td className="py-2.5 px-3 max-w-xs truncate" title={row.description}>{row.description}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{row.batch || '-'}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-right text-slate-900">{row.theoreticalQty}</td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                        <Check className="w-3 h-3" /> Válido
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Existing Master Inventory Repository Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Inventario Maestro Actual ({masterInventory.length} Ubicaciones Registradas)
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span>Filtro activo: Cliente <strong>{activeClient}</strong> · Periodo <strong>{activePeriod}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar SKU, pasillo o ubicación..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 w-56"
              />
            </div>

            {/* Admin Only Delete All button */}
            {isAdmin && onClearInventory && masterInventory.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('[ADMINISTRADOR] ¿Estás seguro de eliminar TODOS los registros del inventario maestro? Esta acción es irreversible.')) {
                    onClearInventory();
                  }
                }}
                className="px-2.5 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1"
                title="Eliminar todos los datos (Solo Administrador)"
              >
                <span>Vaciar Base</span>
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto max-h-80">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/90 text-slate-600 font-semibold uppercase tracking-wider text-[11px] sticky top-0 border-b border-slate-200">
              <tr>
                <th className="py-2 px-3">Cliente</th>
                <th className="py-2 px-3">Periodo / Fecha</th>
                <th className="py-2 px-3">Bodega</th>
                <th className="py-2 px-3">Pasillo</th>
                <th className="py-2 px-3">Ubicación</th>
                <th className="py-2 px-3">Nivel / Altura</th>
                <th className="py-2 px-3">SKU</th>
                <th className="py-2 px-3">Descripción</th>
                <th className="py-2 px-3">Lote</th>
                <th className="py-2 px-3 text-right">Cant. Teórica</th>
                <th className="py-2 px-3">Tipología</th>
                {isAdmin && <th className="py-2 px-3 text-center">Acción</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {masterInventory
                .filter(item => {
                  if (activeClient !== 'ALL' && item.clientName && item.clientName !== activeClient) {
                    return false;
                  }
                  if (activePeriod !== 'ALL' && item.period && item.period !== activePeriod) {
                    return false;
                  }
                  if (!searchFilter) return true;
                  const query = searchFilter.toLowerCase();
                  return (
                    item.sku.toLowerCase().includes(query) ||
                    item.locationCode.toLowerCase().includes(query) ||
                    item.aisle.toLowerCase().includes(query) ||
                    item.description.toLowerCase().includes(query) ||
                    (item.clientName && item.clientName.toLowerCase().includes(query))
                  );
                })
                .map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2 px-3 font-semibold text-slate-800">{item.clientName || 'Retail Pro S.A.'}</td>
                    <td className="py-2 px-3 font-mono text-[11px] text-indigo-700">
                      <div>{item.period || '2026-10'}</div>
                      <div className="text-[10px] text-slate-400">{item.uploadDate || '2026-10-12'}</div>
                    </td>
                    <td className="py-2 px-3 font-medium text-slate-900">{item.warehouse}</td>
                    <td className="py-2 px-3 font-mono">{item.aisle}</td>
                    <td className="py-2 px-3 font-mono font-bold text-amber-700">{item.locationCode}</td>
                    <td className="py-2 px-3">{item.verticalLevel}</td>
                    <td className="py-2 px-3 font-mono font-semibold text-slate-900">{item.sku}</td>
                    <td className="py-2 px-3 max-w-xs truncate" title={item.description}>{item.description}</td>
                    <td className="py-2 px-3 font-mono text-slate-500">{item.batch || '—'}</td>
                    <td className="py-2 px-3 font-mono font-bold text-right text-slate-900">{item.theoreticalQty}</td>
                    <td className="py-2 px-3">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        item.storageType === 'RACK_HEIGHT' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {item.storageType === 'RACK_HEIGHT' ? 'Racks' : 'Piso'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (onDeleteInventoryItem) {
                              onDeleteInventoryItem(item.id);
                            }
                          }}
                          title="Eliminar este ítem (Solo Administrador)"
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        >
                          ✕
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
