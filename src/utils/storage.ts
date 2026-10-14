import { 
  MasterInventoryItem, 
  CycleCountOrder, 
  SosAlert, 
  User,
  LogisticsQuotation,
  ContractedService,
  LogisticsSettlement,
  SkuMasterItem,
  WarehouseLocationRecord,
  StockOnHandRecord,
  TenantConfig,
  DashboardIndicator,
  CompanyTenant
} from '../types/inventory';
import { 
  INITIAL_INVENTORY_ITEMS, 
  INITIAL_ORDERS, 
  INITIAL_SOS_ALERTS, 
  INITIAL_USERS,
  INITIAL_CLIENTS,
  INITIAL_COMPANIES,
  INITIAL_QUOTATIONS,
  INITIAL_CONTRACTED_SERVICES,
  INITIAL_SETTLEMENTS,
  INITIAL_SKU_CATALOG,
  INITIAL_WAREHOUSE_LOCATIONS,
  INITIAL_STOCK_ON_HAND,
  INITIAL_TENANT_CONFIG,
  INITIAL_TENANT_CONFIG_B,
  INITIAL_DASHBOARD_INDICATORS
} from '../data/initialData';

const STORAGE_KEYS = {
  INVENTORY: 'stadius_inventory_v1',
  ORDERS: 'stadius_orders_v1',
  SOS_ALERTS: 'stadius_sos_alerts_v1',
  USERS: 'stadius_users_v1',
  ACTIVE_USER: 'stadius_active_user_v1',
  PRICES: 'stadius_sku_prices_v1',
  CLIENTS: 'stadius_clients_v1',
  COMPANIES: 'stadius_companies_v1',
  ACTIVE_CLIENT: 'stadius_active_client_v1',
  ACTIVE_PERIOD: 'stadius_active_period_v1',
  AUTH_SESSION: 'stadius_auth_session_v1',
  QUOTATIONS: 'stadius_quotations_v1',
  CONTRACTED_SERVICES: 'stadius_contracted_services_v1',
  SETTLEMENTS: 'stadius_settlements_v1',
  SKU_CATALOG: 'stadius_sku_catalog_v1',
  LOCATIONS: 'stadius_locations_v1',
  STOCK_ON_HAND: 'stadius_stock_on_hand_v1',
  TENANT_CONFIG: 'stadius_tenant_config_v1',
  INDICATORS: 'stadius_indicators_v1',
};

export function loadStoredClients(): import('../types/inventory').ClientAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_CLIENTS;
}

export function saveStoredClients(clients: import('../types/inventory').ClientAccount[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  } catch {}
}

export function loadActiveClient(): string {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.ACTIVE_CLIENT);
    if (val) return val;
  } catch {}
  return 'Retail Pro S.A.';
}

export function saveActiveClient(client: string) {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CLIENT, client);
    window.dispatchEvent(new Event('kardexflow_client_changed'));
  } catch {}
}

export function loadActivePeriod(): string {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.ACTIVE_PERIOD);
    if (val) return val;
  } catch {}
  return '2026-10';
}

export function saveActivePeriod(period: string) {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PERIOD, period);
    window.dispatchEvent(new Event('kardexflow_period_changed'));
  } catch {}
}

export function loadAuthSession(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null; // Not logged in by default
}

export function saveAuthSession(user: User) {
  try {
    localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(user));
  } catch {}
}

export function clearAuthSession() {
  try {
    localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
  } catch {}
}

export const INITIAL_SKU_PRICES: import('../types/inventory').SkuPriceRecord[] = [
  { sku: 'SKU-ELEC-401', description: 'Batería Industrial Litio 48V 100Ah', unitCost: 450.00, currency: 'USD', updatedAt: '2026-10-12' },
  { sku: 'SKU-ELEC-402', description: 'Inversor Solar Híbrido 5kW Onda Pura', unitCost: 320.00, currency: 'USD', updatedAt: '2026-10-12' },
  { sku: 'SKU-CAB-110', description: 'Bobina Cable Cobre THW 10AWG 100m', unitCost: 85.50, currency: 'USD', updatedAt: '2026-10-12' },
  { sku: 'SKU-HERR-801', description: 'Taladro Percutor Brushless 20V Kit Pro', unitCost: 145.00, currency: 'USD', updatedAt: '2026-10-12' },
  { sku: 'SKU-HERR-802', description: 'Rotomartillo SDS-Plus 800W Maletín', unitCost: 198.00, currency: 'USD', updatedAt: '2026-10-12' },
  { sku: 'SKU-EPP-301', description: 'Caja Casco Seguridad Dieléctrico x20', unitCost: 65.00, currency: 'USD', updatedAt: '2026-10-12' },
  { sku: 'SKU-LOG-501', description: 'Film Stretch Paletizador Manual 500mm', unitCost: 22.00, currency: 'USD', updatedAt: '2026-10-12' },
  { sku: 'SKU-LOG-502', description: 'Cinta Embalaje Acrílica 48mm x 100m Pack x36', unitCost: 48.00, currency: 'USD', updatedAt: '2026-10-12' },
  { sku: 'SKU-EST-901', description: 'Pallet Estiba Madera Certificada NIMF-15', unitCost: 18.50, currency: 'USD', updatedAt: '2026-10-12' },
  { sku: 'SKU-EST-902', description: 'Contenedor Plástico Plegable 600x400x320', unitCost: 34.00, currency: 'USD', updatedAt: '2026-10-12' },
  { sku: 'SKU-QUI-701', description: 'Tambor Limpiador Desengrasante 200L', unitCost: 280.00, currency: 'USD', updatedAt: '2026-10-12' },
  { sku: 'SKU-FRIO-101', description: 'Reactivo Bioquímico Conservación +4C', unitCost: 195.00, currency: 'USD', updatedAt: '2026-10-12' },
  { sku: 'SKU-FRIO-102', description: 'Vacuna Muestra Térmica Especial', unitCost: 520.00, currency: 'USD', updatedAt: '2026-10-12' },
];

export function loadStoredPrices(): import('../types/inventory').SkuPriceRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRICES);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_SKU_PRICES;
}

export function saveStoredPrices(prices: import('../types/inventory').SkuPriceRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.PRICES, JSON.stringify(prices));
  } catch {}
}

export function loadStoredInventory(): MasterInventoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVENTORY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_INVENTORY_ITEMS;
}

export function saveStoredInventory(items: MasterInventoryItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(items));
    window.dispatchEvent(new Event('kardexflow_inventory_updated'));
  } catch {}
}

export function loadStoredOrders(): CycleCountOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_ORDERS;
}

export function saveStoredOrders(orders: CycleCountOrder[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    window.dispatchEvent(new Event('kardexflow_orders_updated'));
  } catch {}
}

export function loadStoredSosAlerts(): SosAlert[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SOS_ALERTS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_SOS_ALERTS;
}

export function saveStoredSosAlerts(alerts: SosAlert[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.SOS_ALERTS, JSON.stringify(alerts));
    window.dispatchEvent(new Event('kardexflow_sos_updated'));
  } catch {}
}

export function loadStoredUsers(): User[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_USERS;
}

export function saveStoredUsers(users: User[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch {}
}

export function loadActiveUser(): User {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_USERS[0]; // Admin by default
}

export function saveActiveUser(user: User) {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(user));
  } catch {}
}

export function resetAllToDefaultDemo() {
  try {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    window.location.reload();
  } catch {}
}

export function loadStoredQuotations(): LogisticsQuotation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUOTATIONS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_QUOTATIONS;
}

export function saveStoredQuotations(quotes: LogisticsQuotation[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(quotes));
  } catch {}
}

export function loadStoredContractedServices(): ContractedService[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONTRACTED_SERVICES);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_CONTRACTED_SERVICES;
}

export function saveStoredContractedServices(services: ContractedService[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.CONTRACTED_SERVICES, JSON.stringify(services));
  } catch {}
}

export function loadStoredSettlements(): LogisticsSettlement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTLEMENTS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_SETTLEMENTS;
}

export function saveStoredSettlements(settlements: LogisticsSettlement[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(settlements));
  } catch {}
}

export function loadStoredSkuCatalog(): SkuMasterItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SKU_CATALOG);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_SKU_CATALOG;
}

export function saveStoredSkuCatalog(catalog: SkuMasterItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.SKU_CATALOG, JSON.stringify(catalog));
  } catch {}
}

export function loadStoredWarehouseLocations(): WarehouseLocationRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOCATIONS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_WAREHOUSE_LOCATIONS;
}

export function saveStoredWarehouseLocations(locations: WarehouseLocationRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(locations));
  } catch {}
}

export function loadStoredStockOnHand(): StockOnHandRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STOCK_ON_HAND);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_STOCK_ON_HAND;
}

export function saveStoredStockOnHand(stock: StockOnHandRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.STOCK_ON_HAND, JSON.stringify(stock));
  } catch {}
}

export function loadStoredCompanies(): CompanyTenant[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPANIES);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_COMPANIES;
}

export function saveStoredCompanies(companies: CompanyTenant[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));
  } catch {}
}

export function loadStoredTenantConfig(companyId: string = 'EMP-A'): TenantConfig {
  try {
    const key = `${STORAGE_KEYS.TENANT_CONFIG}_${companyId}`;
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
    
    // Fallback to legacy single key if EMP-A
    if (companyId === 'EMP-A') {
      const legacy = localStorage.getItem(STORAGE_KEYS.TENANT_CONFIG);
      if (legacy) return JSON.parse(legacy);
    }
  } catch {}
  return companyId === 'EMP-B' ? INITIAL_TENANT_CONFIG_B : INITIAL_TENANT_CONFIG;
}

export function saveStoredTenantConfig(config: TenantConfig, companyId?: string) {
  try {
    const targetCompanyId = companyId || config.tenantId || 'EMP-A';
    const key = `${STORAGE_KEYS.TENANT_CONFIG}_${targetCompanyId}`;
    localStorage.setItem(key, JSON.stringify(config));
    if (targetCompanyId === 'EMP-A') {
      localStorage.setItem(STORAGE_KEYS.TENANT_CONFIG, JSON.stringify(config));
    }
  } catch {}
}

export function loadStoredDashboardIndicators(): DashboardIndicator[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INDICATORS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_DASHBOARD_INDICATORS;
}

export function saveStoredDashboardIndicators(indicators: DashboardIndicator[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.INDICATORS, JSON.stringify(indicators));
  } catch {}
}


