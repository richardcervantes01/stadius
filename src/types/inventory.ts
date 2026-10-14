export type StorageType = 'RACK_HEIGHT' | 'FLOOR_LEVEL';

export type InventoryCountType = 'BLIND' | 'NON_BLIND';

export type OrderStatus = 
  | 'PENDING'       // Pendiente (Pre cargado)
  | 'IN_PROGRESS'   // En proceso (En trabajo)
  | 'COMPLETED';    // Terminado (Culminado)

export type LineStatus = 
  | 'PENDING' 
  | 'COUNTED' 
  | 'DISCREPANT' 
  | 'RECOUNT_PENDING' 
  | 'APPROVED';

export type UserRole = 'ADMIN' | 'SUPERVISOR' | 'OPERATOR' | 'COMERCIAL';

export type MainNavModule = 
  | 'DASHBOARD'
  | 'COMERCIAL'
  | 'INVENTARIOS'
  | 'OPERACIONES'
  | 'SISTEMAS';

export type SubNavOption =
  // Dashboard
  | 'OVERVIEW'
  // Comercial
  | 'COTIZACIONES'
  | 'CONSULTAS_SERVICIOS'
  | 'LIQUIDACIONES'
  | 'GESTION_CLIENTES'
  // Operaciones de Almacén (Logística & Core WMS)
  | 'INVENTARIOS_CORE'
  | 'INVENTARIOS_CICLICOS'
  | 'CATALOGO_SKUS'
  | 'MAPA_LAYOUT'
  | 'STOCK_ON_HAND'
  | 'GESTION_RECEPCION'
  | 'GESTION_UBICACIONES'
  | 'INVENTARIOS_FISICOS'
  | 'GESTION_PICKING'
  | 'GESTION_EMPAQUE'
  | 'GESTION_EXPEDICION'
  | 'GESTION_PATIOS'
  // Operaciones de Transporte
  | 'GESTION_ORDENES_ENVIO'
  | 'PLANIFICACION_RUTAS'
  | 'SELECCION_PROVEEDORES'
  | 'GESTION_CARGAS'
  | 'SEGUIMIENTO_TRAZABILIDAD'
  | 'AUDITORIA_FLETES'
  | 'GESTION_PATIOS_BASCULA'
  // Sistemas y Seguridad
  | 'GESTION_USUARIOS'
  | 'CAMBIO_CLAVE'
  | 'TENANT_PARAMS'
  | 'SCHEMA_SQL';

export type IndicatorCategory = 'TODOS' | 'INVENTARIOS' | 'OPERACIONES' | 'COMERCIAL' | 'ALERTAS' | 'SISTEMAS' | 'PERSONALIZADO';

export type IndicatorFormat = 'CURRENCY' | 'PERCENT' | 'NUMBER' | 'DECIMAL';

export type SystemMetricKey = 
  | 'INVENTORY_TOTAL_VALUE'
  | 'INVENTORY_ITEMS_COUNT'
  | 'INVENTORY_TOTAL_UNITS'
  | 'INVENTORY_DISCREPANCY_UNITS'
  | 'INVENTORY_DISCREPANCY_VALUE'
  | 'INVENTORY_ERI_PERCENT'
  | 'ORDERS_TOTAL_COUNT'
  | 'ORDERS_IN_PROGRESS_COUNT'
  | 'ORDERS_COMPLETED_COUNT'
  | 'SOS_ACTIVE_COUNT'
  | 'SOS_RESOLVED_COUNT'
  | 'WAREHOUSE_OCCUPANCY_PERCENT'
  | 'WAREHOUSE_TOTAL_PALLETS'
  | 'WAREHOUSE_OCCUPIED_PALLETS'
  | 'WAREHOUSE_AVAILABLE_PALLETS'
  | 'WAREHOUSE_LOCATIONS_COUNT'
  | 'WAREHOUSE_BLOCKED_COUNT'
  | 'STOCK_TOTAL_BATCHES'
  | 'STOCK_EXPIRED_BATCHES'
  | 'STOCK_TOTAL_UNITS'
  | 'COMMERCIAL_QUOTATIONS_TOTAL_VALUE'
  | 'COMMERCIAL_APPROVED_QUOTES_VALUE'
  | 'COMMERCIAL_QUOTES_COUNT'
  | 'COMMERCIAL_CONVERSION_RATE'
  | 'COMMERCIAL_SETTLEMENTS_TOTAL'
  | 'COMMERCIAL_CLIENTS_COUNT'
  | 'SYSTEM_USERS_COUNT';

export interface DashboardIndicator {
  id: string;
  title: string;
  description: string;
  category: IndicatorCategory;
  format: IndicatorFormat;
  iconName: string;
  metricType: 'DIRECT' | 'FORMULA';
  primaryMetric: SystemMetricKey;
  formulaOperator?: '+' | '-' | '*' | '/';
  secondaryMetric?: SystemMetricKey;
  factor?: number; // e.g. 100 or multiplier/divisor
  targetGoal?: number;
  targetComparison?: '>=' | '<=' | '==' | '>';
  targetLabel?: string;
  colorTheme: 'amber' | 'emerald' | 'sky' | 'rose' | 'purple' | 'indigo';
  isCustom?: boolean;
  isVisible: boolean;
  order: number;
}

export type WmsModule = 
  | 'HUB'               // Panel Principal / Varios Módulos WMS
  | 'INBOUND'           // Recepción de Mercancías
  | 'PUTAWAY'           // Almacenamiento & Ubicación
  | 'OPERATIONS'        // Módulo Operaciones
  | 'PICKING_PACKING'   // Preparación & Empaque
  | 'OUTBOUND'          // Despacho & Salida
  | 'MASTER_DATA';      // Maestros & Configuración

export type OperationsSubmenu = 'INVENTARIOS' | 'MOVIMIENTOS' | 'BLOQUEOS';

export type AppTab = 'EXCEL' | 'VALORIZADO' | 'ORDERS' | 'COUNT' | 'KPIS';

export interface ClientAccount {
  id: string;
  name: string;
  code: string;
  contactEmail?: string;
  phone?: string;
  activeContracts?: number;
  assignedSpaces?: number;
  companyId?: string; // Multi-tenant isolation (e.g. 'EMP-A', 'EMP-B')
  taxId?: string;
  address?: string;
  industry?: string;
  status?: 'ACTIVO' | 'INACTIVO';
}

export interface SkuPriceRecord {
  sku: string;
  description: string;
  unitCost: number;
  currency: string;
  updatedAt: string;
  category?: string;
}

export interface CompanyTenant {
  id: string;
  code: string;
  name: string;
  taxId: string;
  country: string;
  city: string;
  warehouseCount: number;
  active: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  badgeCode: string;
  shift: 'MANANA' | 'TARDE' | 'NOCHE';
  active: boolean;
  assignedWarehouse: string;
  phone?: string;
  department?: string;
  // Multi-Empresa (Multi-Tenant) Isolation
  companyId?: string; // e.g. 'EMP-A' | 'EMP-B'
  companyName?: string; // e.g. 'Empresa A - Logística & WMS Stadius S.A.'
  // Granular Access Control (configured by Administrator per user)
  allowedModules?: MainNavModule[]; // which modules user can access
  allowedSubOptions?: SubNavOption[]; // which sub-options user can access
}

// ==========================================
// MÓDULO COMERCIAL
// ==========================================
export type QuoteStatus = 'BORRADOR' | 'ENVIADA' | 'APROBADA' | 'RECHAZADA';

export interface QuotationItem {
  id: string;
  serviceType: 'ALMACENAJE_PALLET_DIA' | 'MANIPULEO_IN_OUT' | 'TRANSPORTE' | 'ETIQUETADO' | 'MAQUILA' | 'CROSS_DOCKING';
  description: string;
  unit: string;
  unitRate: number;
  estimatedQty: number;
  total: number;
}

export interface LogisticsQuotation {
  id: string;
  quoteNumber: string;
  tenantId: string;
  clientName: string;
  clientTaxId: string;
  createdAt: string;
  validUntil: string;
  status: QuoteStatus;
  currency: string;
  items: QuotationItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes: string;
  createdBy: string;
}

export interface ContractedService {
  id: string;
  tenantId: string;
  clientName: string;
  serviceType: string;
  warehouse: string;
  contractStart: string;
  contractEnd: string;
  contractedPallets: number;
  occupiedPallets: number;
  occupancyPercent: number;
  dailyStorageRate: number;
  handlingRatePerPallet: number;
  slaTargetPercent: number;
  slaCurrentPercent: number;
  status: 'ACTIVO' | 'POR_VENCER' | 'SUSPENDIDO';
}

export interface LogisticsSettlement {
  id: string;
  settlementNumber: string;
  tenantId: string;
  clientName: string;
  period: string; // ej: '2026-10'
  startDate: string;
  endDate: string;
  palletDays: number;
  storageAmount: number;
  inboundPallets: number;
  inboundAmount: number;
  outboundPallets: number;
  outboundAmount: number;
  extraServicesAmount: number;
  subtotal: number;
  tax: number;
  total: number;
  status: 'GENERADA' | 'REVISADA' | 'FACTURADA' | 'PAGADA';
  createdAt: string;
  reviewedBy?: string;
}

// ==========================================
// OPERACIONES DE ALMACÉN (LOGÍSTICA)
// ==========================================
export type AbcClassification = 'A' | 'B' | 'C';
export type UnitOfMeasure = 'PALLET' | 'CAJA' | 'UNIDAD' | 'BIDON';
export type StorageEnvironment = 'AMBIENTE' | 'REFRIGERADO' | 'CONGELADO' | 'PELIGROSO';

export type ControlType = 'SERIE' | 'LOTE' | 'GENERAL';

export interface SkuMasterItem {
  id: string;
  tenantId: string;
  sku: string;
  additionalCodes: string[];
  barcode: string;
  barcodeType?: 'EAN-13' | 'Code128' | 'GS1-128' | 'QR';
  description: string;
  clientName: string;
  family: string;
  dimensionsMeters: {
    length: number;
    width: number;
    height: number;
  };
  weightKg: number;
  volumeM3: number;
  unitOfMeasure: UnitOfMeasure;
  unitCost: number;
  currency: 'PEN' | 'USD';
  controlType: ControlType;
  storageEnvironment: StorageEnvironment;
  active: boolean;
  
  // Auditing
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  
  // Integration
  externalId?: string;
  sourceSystem?: string;
  syncStatus?: 'SYNCED' | 'PENDING' | 'ERROR';
  lastSyncedAt?: string;
}

export type LocationOccupancyStatus = 'VACIO' | 'PARCIAL' | 'LLENO' | 'BLOQUEADO';

export interface WarehouseLocationRecord {
  id: string;
  tenantId: string;
  warehouse: string;
  aisle: string;         // ej: 'Pasillo A'
  rack: string;          // ej: 'Rack 02'
  level: string;         // ej: 'Nivel 3'
  position: string;      // ej: 'Posición 04'
  locationCode: string;  // ej: 'A-02-03-04'
  status: LocationOccupancyStatus;
  maxPalletCapacity: number;
  currentPallets: number;
  assignedClient?: string;
  currentSku?: string;
  skuDescription?: string;
  currentBatch?: string;
  currentQty?: number;
  temperatureZone: StorageEnvironment;
}

export type StockCondition = 'DISPONIBLE' | 'CUARENTENA' | 'RESERVADO' | 'DANADO';

export interface StockOnHandRecord {
  id: string;
  tenantId: string;
  sku: string;
  description: string;
  clientName: string;
  warehouse: string;
  locationCode: string;
  batch: string;
  expiryDate: string;
  receptionDate: string;
  unitCost: number;
  qtyAvailable: number;
  qtyReserved: number;
  qtyQuarantine: number;
  qtyDamaged: number;
  totalQty: number;
  condition: StockCondition;
  lastInventoryDate: string;
}

// ==========================================
// TENANT / EMPRESA
// ==========================================
export interface TenantConfig {
  tenantId: string;
  companyName: string;
  taxId: string; // RUT / NIT / CIF
  country: string;
  city: string;
  address: string;
  phone: string;
  billingEmail: string;
  currency: string;
  dateFormat: string;
  defaultWarehouse: string;
  skuPrefix: string;
  mermaTolerancePercent: number;
  sosAutoEscalateMinutes: number;
  allowBlindCountOnly: boolean;
  activePlan: 'ENTERPRISE_MULTI_TENANT' | 'PROFESSIONAL';
}

export interface MasterInventoryItem {
  id: string;
  clientName: string;      // Cliente / Cuenta asociada
  period: string;          // Periodo (ej: 2026-10)
  uploadDate: string;      // Fecha de carga
  warehouse: string;       // Bodega
  aisle: string;           // Pasillo / Rack
  locationCode: string;    // Ubicación (ej: A-12-03)
  verticalLevel: string;   // Altura (A, B, C...) o Nivel (P1, P2...)
  sku: string;             // Código de artículo
  description: string;     // Descripción
  batch?: string;          // Lote (opcional)
  theoreticalQty: number;  // Cantidad teórica en WMS
  unitCost: number;        // Costo unitario para merma financiera ($)
  category: string;        // Categoría / Clase ABC
  storageType: StorageType;
}

export interface CycleCountLine {
  id: string;
  orderId: string;
  warehouse: string;
  aisle: string;
  locationCode: string;
  verticalLevel: string;
  sku: string;
  description: string;
  batch?: string;
  theoreticalQty: number;
  countedQty?: number;
  recountedQty?: number;
  unitCost: number;
  status: LineStatus;
  recountRequired: boolean;
  discrepancyUnits: number; // countedQty - theoreticalQty
  discrepancyCost: number;  // discrepancyUnits * unitCost
  countedAt?: string;
  countedBy?: string;
  durationSeconds?: number;
  notes?: string;
  tags?: string[];
}

export interface CycleCountOrder {
  id: string;
  title: string;
  type: InventoryCountType;
  status: OrderStatus;
  storageType: StorageType;
  clientName: string;          // Cliente asociado
  companyId?: string;          // Multi-tenant (EMP-A, EMP-B)
  period: string;              // Periodo de inventario (ej: 2026-10)
  warehouse: string;
  aisles: string[];
  locationRangeStart?: string;
  locationRangeEnd?: string;
  selectedLocations?: string[];
  selectedLevels?: string[];
  categoryFilter?: string;
  tolerancePercentage: number; // e.g. 0% para exactitud total, 2% margen
  assignedOperatorId: string;
  assignedOperatorName: string;
  supervisorId: string;
  supervisorName: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  reopenedBy?: string;
  reopenedAt?: string;
  totalLocations: number;
  countedLocations: number;
  lines: CycleCountLine[];
}

export type SosReason = 
  | 'DISCREPANCIA_GRAVE' 
  | 'PRODUCTO_DANADO' 
  | 'ACCESIBILIDAD_SEGURIDAD' 
  | 'APOYO_MONTACARGAS' 
  | 'ETIQUETA_ILEGIBLE' 
  | 'OTRO';

export interface SosAlert {
  id: string;
  companyId?: string;
  orderId?: string;
  orderTitle?: string;
  operatorId: string;
  operatorName: string;
  warehouse: string;
  aisle: string;
  locationCode: string;
  reason: SosReason;
  description: string;
  createdAt: string;
  status: 'ACTIVE' | 'ATTENDING' | 'RESOLVED';
  attendedAt?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  responseTimeSeconds?: number;
}

export interface KpiSummary {
  totalLocations: number;
  countedLocations: number;
  progressPercent: number;
  eriPercent: number;           // Exactitud de Registros de Inventario (% ubicaciones exactas)
  eruPercent: number;           // Exactitud de Registros por Unidades (% unidades netas)
  missingSkusCount: number;     // Faltantes (cant < teórica)
  excessSkusCount: number;      // Sobrantes (cant > teórica)
  exactSkusCount: number;       // Exactos (cant == teórica)
  totalMissingUnits: number;
  totalExcessUnits: number;
  totalTheoreticalUnits: number;
  totalCountedUnits: number;
  netFinancialDiscrepancy: number;   // (Sobrantes $ - Faltantes $)
  shrinkageFinancialCost: number;    // Solo valor absoluto de faltantes perdidos ($)
  recountRatePercent: number;        // Tasa de re-conteo (% que requirió segunda revisión)
  avgSosResponseTimeSeconds: number; // Tiempo promedio de resolución de alertas
  operatorProductivity: OperatorProductivityItem[];
}

export interface OperatorProductivityItem {
  operatorId: string;
  operatorName: string;
  countsCompleted: number;
  totalTimeMinutes: number;
  locationsPerHour: number;
  accuracyRate: number;
}

export interface ExcelValidationError {
  row: number;
  field: string;
  message: string;
}

export interface ExcelImportPreview {
  validRows: MasterInventoryItem[];
  errors: ExcelValidationError[];
  totalParsed: number;
  validCount: number;
  errorCount: number;
}
