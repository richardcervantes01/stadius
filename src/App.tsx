/**
 * STADIUS WMS - Warehouse Management System
 * SaaS Multi-Tenant Platform Architecture
 */
import React, { useState, useEffect } from 'react';
import { 
  MasterInventoryItem, 
  CycleCountOrder, 
  SosAlert, 
  User,
  SkuPriceRecord,
  ClientAccount,
  AppTab,
  MainNavModule,
  SubNavOption,
  LogisticsQuotation,
  ContractedService,
  LogisticsSettlement,
  SkuMasterItem,
  WarehouseLocationRecord,
  StockOnHandRecord,
  TenantConfig,
  QuoteStatus,
  LocationOccupancyStatus,
  DashboardIndicator,
  CompanyTenant
} from './types/inventory';
import { 
  loadStoredInventory, 
  saveStoredInventory, 
  loadStoredOrders, 
  saveStoredOrders, 
  loadStoredSosAlerts, 
  saveStoredSosAlerts, 
  loadStoredUsers, 
  saveStoredUsers, 
  loadActiveUser, 
  saveActiveUser,
  loadStoredPrices,
  saveStoredPrices,
  loadStoredClients,
  saveStoredClients,
  loadActiveClient,
  saveActiveClient,
  loadActivePeriod,
  saveActivePeriod,
  loadAuthSession,
  saveAuthSession,
  clearAuthSession,
  loadStoredQuotations,
  saveStoredQuotations,
  loadStoredContractedServices,
  saveStoredContractedServices,
  loadStoredSettlements,
  saveStoredSettlements,
  loadStoredSkuCatalog,
  saveStoredSkuCatalog,
  loadStoredWarehouseLocations,
  saveStoredWarehouseLocations,
  loadStoredStockOnHand,
  saveStoredStockOnHand,
  loadStoredTenantConfig,
  saveStoredTenantConfig,
  loadStoredDashboardIndicators,
  saveStoredDashboardIndicators,
  resetAllToDefaultDemo
} from './utils/storage';
import { INITIAL_DASHBOARD_INDICATORS, INITIAL_COMPANIES } from './data/initialData';
import { audioAlert } from './utils/audioAlert';
import { Sidebar } from './components/Sidebar';
import { DashboardOverview } from './components/DashboardOverview';
import { QuotationsModule } from './components/commercial/QuotationsModule';
import { ServicesInquiryModule } from './components/commercial/ServicesInquiryModule';
import { SettlementsModule } from './components/commercial/SettlementsModule';
import { SkuCatalogModule } from './components/operations/SkuCatalogModule';
import { GenericOperationsModule } from './components/operations/GenericOperationsModule';
import { WarehouseLayoutMap } from './components/operations/WarehouseLayoutMap';
import { StockOnHandModule } from './components/operations/StockOnHandModule';
import { TenantSettingsModule } from './components/systems/TenantSettingsModule';
import { LoginScreen } from './components/LoginScreen';
import { ClientHistoryModal } from './components/ClientHistoryModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { ExcelImportModule } from './components/ExcelImportModule';
import { ValuationModule } from './components/ValuationModule';
import { OrderManagementModule } from './components/OrderManagementModule';
import { OperatorCountModule } from './components/OperatorCountModule';
import { ReportsKpiModule } from './components/ReportsKpiModule';
import { SosTriageDrawer } from './components/SosAlertModal';
import { UserManagementModal } from './components/UserManagementModal';
import { ArchitectureSchemaModal } from './components/ArchitectureSchemaModal';
import { 
  Boxes, 
  Bell, 
  Volume2, 
  VolumeX, 
  Database, 
  Building, 
  Calendar, 
  Filter, 
  LogOut, 
  Shield, 
  Lock, 
  ChevronRight, 
  ScanLine, 
  Upload, 
  BadgeDollarSign, 
  ClipboardList, 
  BarChart3,
  KeyRound,
  RotateCcw
} from 'lucide-react';

export default function App() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return loadAuthSession() !== null;
  });
  const [currentUser, setCurrentUser] = useState<User>(() => {
    return loadAuthSession() || loadActiveUser();
  });

  // Sidebar Layout State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Active Navigation Modules State
  const [activeModule, setActiveModule] = useState<MainNavModule>(() => {
    return currentUser.role === 'OPERATOR' ? 'OPERACIONES' : 'DASHBOARD';
  });
  const [activeSubOption, setActiveSubOption] = useState<SubNavOption>(() => {
    return currentUser.role === 'OPERATOR' ? 'INVENTARIOS_CORE' : 'OVERVIEW';
  });

  // Core WMS Sub-tabs (Inventarios Cíclicos)
  const [activeTab, setActiveTab] = useState<AppTab>(
    currentUser.role === 'OPERATOR' ? 'COUNT' : 'ORDERS'
  );

  // Master State - Core WMS
  const [masterInventory, setMasterInventory] = useState<MasterInventoryItem[]>([]);
  const [orders, setOrders] = useState<CycleCountOrder[]>([]);
  const [sosAlerts, setSosAlerts] = useState<SosAlert[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [prices, setPrices] = useState<SkuPriceRecord[]>([]);
  const [clients, setClients] = useState<ClientAccount[]>([]);
  const [activeClient, setActiveClient] = useState<string>('Retail Pro S.A.');
  const [activePeriod, setActivePeriod] = useState<string>('2026-10');

  // Commercial & Operations State
  const [quotations, setQuotations] = useState<LogisticsQuotation[]>([]);
  const [services, setServices] = useState<ContractedService[]>([]);
  const [settlements, setSettlements] = useState<LogisticsSettlement[]>([]);
  const [skuCatalog, setSkuCatalog] = useState<SkuMasterItem[]>([]);
  const [warehouseLocations, setWarehouseLocations] = useState<WarehouseLocationRecord[]>([]);
  const [stockOnHand, setStockOnHand] = useState<StockOnHandRecord[]>([]);
  const [tenantConfig, setTenantConfig] = useState<TenantConfig>(loadStoredTenantConfig());
  const [indicators, setIndicators] = useState<DashboardIndicator[]>([]);

  // UI Modals & Drawers
  const [selectedOrderIdForCount, setSelectedOrderIdForCount] = useState<string | null>(null);
  const [showSosDrawer, setShowSosDrawer] = useState<boolean>(false);
  const [showUserModal, setShowUserModal] = useState<boolean>(false);
  const [showSchemaModal, setShowSchemaModal] = useState<boolean>(false);
  const [showClientHistoryModal, setShowClientHistoryModal] = useState<boolean>(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState(audioAlert.getMuted());

  // Load from local storage on mount
  useEffect(() => {
    setMasterInventory(loadStoredInventory());
    setOrders(loadStoredOrders());
    setSosAlerts(loadStoredSosAlerts());
    setUsers(loadStoredUsers());
    setPrices(loadStoredPrices());
    setClients(loadStoredClients());
    setActiveClient(loadActiveClient());
    setActivePeriod(loadActivePeriod());
    setQuotations(loadStoredQuotations());
    setServices(loadStoredContractedServices());
    setSettlements(loadStoredSettlements());
    setSkuCatalog(loadStoredSkuCatalog());
    setWarehouseLocations(loadStoredWarehouseLocations());
    setStockOnHand(loadStoredStockOnHand());
    setTenantConfig(loadStoredTenantConfig());
    setIndicators(loadStoredDashboardIndicators());

    const sessionUser = loadAuthSession();
    if (sessionUser) {
      setCurrentUser(sessionUser);
      setIsAuthenticated(true);
      if (sessionUser.role === 'OPERATOR') {
        setActiveModule('INVENTARIOS');
        setActiveSubOption('INVENTARIOS_CORE');
        setActiveTab('COUNT');
      }
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  // Ensure operator stays on COUNT tab inside Operaciones -> Inventarios
  useEffect(() => {
    if (currentUser.role === 'OPERATOR') {
      if (activeModule !== 'OPERACIONES' && activeModule !== 'INVENTARIOS' && activeModule !== 'SISTEMAS') {
        setActiveModule('OPERACIONES');
        setActiveSubOption('INVENTARIOS_CORE');
      }
      if (activeTab !== 'COUNT') {
        setActiveTab('COUNT');
      }
    }
  }, [currentUser.role, activeModule, activeTab]);

  // Dynamic available periods
  const availablePeriods = Array.from(new Set([
    '2026-10',
    '2026-11',
    '2026-12',
    ...masterInventory.map(i => i.period).filter(Boolean),
    ...orders.map(o => o.period).filter(Boolean),
    ...settlements.map(s => s.period).filter(Boolean),
  ])).sort();

  // Authentication Handlers
  const handleLoginSuccess = (user: User) => {
    saveAuthSession(user);
    saveActiveUser(user);
    setCurrentUser(user);
    setIsAuthenticated(true);
    if (user.role === 'OPERATOR') {
      setActiveModule('OPERACIONES');
      setActiveSubOption('INVENTARIOS_CORE');
      setActiveTab('COUNT');
    } else if (user.role === 'COMERCIAL') {
      setActiveModule('COMERCIAL');
      setActiveSubOption('COTIZACIONES');
    } else {
      setActiveModule('DASHBOARD');
      setActiveSubOption('OVERVIEW');
      setActiveTab('ORDERS');
    }
  };

  const handleUpdatePassword = (newPassword: string) => {
    const updatedUser: User = { ...currentUser, password: newPassword };
    setCurrentUser(updatedUser);
    saveActiveUser(updatedUser);
    saveAuthSession(updatedUser);
    const updatedUsers = users.map(u => u.id === currentUser.id ? { ...u, password: newPassword } : u);
    setUsers(updatedUsers);
    saveStoredUsers(updatedUsers);
    alert('Contraseña actualizada exitosamente.');
  };

  const handleLogout = () => {
    clearAuthSession();
    setIsAuthenticated(false);
  };

  const toggleMute = () => {
    const next = !isMuted;
    audioAlert.setMuted(next);
    setIsMuted(next);
  };

  // Client Selection Handlers
  const handleChangeClient = (clientName: string) => {
    setActiveClient(clientName);
    saveActiveClient(clientName);
  };

  const handleChangePeriod = (period: string) => {
    setActivePeriod(period);
    saveActivePeriod(period);
  };

  const handleAddClient = (clientName: string) => {
    const newClient: ClientAccount = {
      id: `CLI-${Date.now()}`,
      name: clientName,
      code: clientName.substring(0, 3).toUpperCase(),
    };
    const updated = [...clients, newClient];
    setClients(updated);
    saveStoredClients(updated);
    setActiveClient(clientName);
    saveActiveClient(clientName);
  };

  // Master Inventory Handlers
  const handleAddInventoryItems = (newItems: MasterInventoryItem[]) => {
    const priceMap = new Map<string, number>();
    prices.forEach(p => priceMap.set(p.sku.toLowerCase(), p.unitCost));

    const enriched = newItems.map(item => ({
      ...item,
      clientName: item.clientName || activeClient,
      period: item.period || activePeriod,
      uploadDate: item.uploadDate || new Date().toISOString().substring(0, 10),
      unitCost: priceMap.get(item.sku.toLowerCase()) || 0,
    }));

    const updated = [...enriched, ...masterInventory];
    setMasterInventory(updated);
    saveStoredInventory(updated);
  };

  const handleDeleteInventoryItem = (itemId: string) => {
    if (currentUser.role !== 'ADMIN') {
      alert('[Acceso Restringido] Solo el usuario Administrador puede eliminar datos.');
      return;
    }
    const updated = masterInventory.filter(i => i.id !== itemId);
    setMasterInventory(updated);
    saveStoredInventory(updated);
  };

  const handleClearInventory = () => {
    if (currentUser.role !== 'ADMIN') {
      alert('[Acceso Restringido] Solo el usuario Administrador puede eliminar datos.');
      return;
    }
    setMasterInventory([]);
    saveStoredInventory([]);
  };

  // SKU Prices Handlers
  const handleSavePrices = (updatedPrices: SkuPriceRecord[]) => {
    setPrices(updatedPrices);
    saveStoredPrices(updatedPrices);
  };

  const handleCrossReferencePrices = (updatedPrices: SkuPriceRecord[]) => {
    setPrices(updatedPrices);
    saveStoredPrices(updatedPrices);

    const priceMap = new Map<string, number>();
    updatedPrices.forEach(p => priceMap.set(p.sku.toLowerCase(), p.unitCost));

    const updatedInventory = masterInventory.map(item => ({
      ...item,
      unitCost: priceMap.get(item.sku.toLowerCase()) || 0,
    }));
    setMasterInventory(updatedInventory);
    saveStoredInventory(updatedInventory);

    const updatedOrders = orders.map(order => ({
      ...order,
      lines: order.lines.map(line => {
        const cost = priceMap.get(line.sku.toLowerCase()) || 0;
        const diffUnits = (line.countedQty !== undefined ? line.countedQty : line.theoreticalQty) - line.theoreticalQty;
        return {
          ...line,
          unitCost: cost,
          discrepancyCost: diffUnits * cost,
        };
      }),
    }));
    setOrders(updatedOrders);
    saveStoredOrders(updatedOrders);
  };

  // Order Handlers
  const handleCreateOrder = (newOrder: CycleCountOrder) => {
    const updated = [newOrder, ...orders];
    setOrders(updated);
    saveStoredOrders(updated);
  };

  const handleSelectOrderForCount = (orderId: string) => {
    setSelectedOrderIdForCount(orderId);
    setActiveModule('INVENTARIOS');
    setActiveSubOption('INVENTARIOS_CORE');
    setActiveTab('COUNT');
  };

  const handleDeleteOrder = (orderId: string) => {
    if (currentUser.role !== 'ADMIN') {
      alert('[Acceso Restringido] Solo el usuario Administrador puede eliminar datos.');
      return;
    }
    const updated = orders.filter(o => o.id !== orderId);
    setOrders(updated);
    saveStoredOrders(updated);
    if (selectedOrderIdForCount === orderId) {
      setSelectedOrderIdForCount(null);
    }
  };

  const handleReopenOrder = (orderId: string) => {
    if (currentUser.role !== 'ADMIN') {
      alert('[Acceso Restringido] Solo el usuario Administrador puede reabrir órdenes finalizadas.');
      return;
    }
    const updated = orders.map(o => {
      if (o.id !== orderId) return o;
      return {
        ...o,
        status: 'IN_PROGRESS' as const,
        reopenedBy: currentUser.name,
        reopenedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };
    });
    setOrders(updated);
    saveStoredOrders(updated);
    alert(`Orden ${orderId} ha sido reabierta exitosamente.`);
  };

  // Floor Count Updates
  const handleUpdateLineCount = (
    orderId: string, 
    lineId: string, 
    countedQty: number, 
    notes?: string, 
    tags?: string[], 
    durationSeconds?: number
  ) => {
    const updatedOrders = orders.map(order => {
      if (order.id !== orderId) return order;

      const updatedLines = order.lines.map(line => {
        if (line.id !== lineId) return line;

        const isRecount = line.status === 'RECOUNT_PENDING' || line.recountRequired;
        const diff = countedQty - line.theoreticalQty;
        const absDiff = Math.abs(diff);
        const marginTolerance = Math.ceil((line.theoreticalQty * (order.tolerancePercentage || 0)) / 100);
        const isDiscrepant = absDiff > marginTolerance;

        return {
          ...line,
          countedQty: isRecount ? line.countedQty : countedQty,
          recountedQty: isRecount ? countedQty : undefined,
          status: isDiscrepant ? ('DISCREPANT' as const) : ('COUNTED' as const),
          recountRequired: isDiscrepant && !isRecount,
          discrepancyUnits: diff,
          discrepancyCost: diff * (line.unitCost || 0),
          countedAt: new Date().toISOString(),
          countedBy: currentUser.name,
          notes: notes !== undefined ? notes : line.notes,
          tags: tags !== undefined ? tags : line.tags,
          durationSeconds: durationSeconds || line.durationSeconds || 0,
        };
      });

      const allCounted = updatedLines.every(l => l.status === 'COUNTED' || l.status === 'DISCREPANT' || l.status === 'APPROVED');
      const countedCount = updatedLines.filter(l => l.status !== 'PENDING').length;

      return {
        ...order,
        status: allCounted ? ('COMPLETED' as const) : ('IN_PROGRESS' as const),
        countedLocations: countedCount,
        lines: updatedLines,
        startedAt: order.startedAt || new Date().toISOString(),
        completedAt: allCounted ? new Date().toISOString() : undefined,
      };
    });

    setOrders(updatedOrders);
    saveStoredOrders(updatedOrders);
  };

  // SOS Alerts Handlers
  const handleTriggerSosAlert = (alertData: Omit<SosAlert, 'id' | 'createdAt' | 'status'>) => {
    const newAlert: SosAlert = {
      ...alertData,
      id: `SOS-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'ACTIVE',
    };
    const updated = [newAlert, ...sosAlerts];
    setSosAlerts(updated);
    saveStoredSosAlerts(updated);
    audioAlert.playSosAlert();
  };

  const handleUpdateAlertStatus = (alertId: string, status: 'ATTENDING' | 'RESOLVED') => {
    const updated = sosAlerts.map(a => {
      if (a.id !== alertId) return a;
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      return {
        ...a,
        status,
        attendedAt: status === 'ATTENDING' ? now : a.attendedAt,
        resolvedAt: status === 'RESOLVED' ? now : a.resolvedAt,
        resolvedBy: status === 'RESOLVED' ? currentUser.name : a.resolvedBy,
      };
    });
    setSosAlerts(updated);
    saveStoredSosAlerts(updated);
  };

  // KPI & Reconciliation Handlers
  const handleApproveLineAdjustment = (orderId: string, lineId: string) => {
    const updatedOrders = orders.map(order => {
      if (order.id !== orderId) return order;
      return {
        ...order,
        lines: order.lines.map(line => {
          if (line.id !== lineId) return line;
          return {
            ...line,
            status: 'APPROVED' as const,
            recountRequired: false,
          };
        }),
      };
    });
    setOrders(updatedOrders);
    saveStoredOrders(updatedOrders);
  };

  const handleRequestRecount = (orderId: string, lineId: string) => {
    const updatedOrders = orders.map(order => {
      if (order.id !== orderId) return order;
      return {
        ...order,
        status: 'IN_PROGRESS' as const,
        lines: order.lines.map(line => {
          if (line.id !== lineId) return line;
          return {
            ...line,
            status: 'RECOUNT_PENDING' as const,
            recountRequired: true,
          };
        }),
      };
    });
    setOrders(updatedOrders);
    saveStoredOrders(updatedOrders);
  };

  const handleApproveAllValidLines = (orderId: string) => {
    const updatedOrders = orders.map(order => {
      if (order.id !== orderId) return order;
      return {
        ...order,
        lines: order.lines.map(line => {
          if (line.status === 'DISCREPANT') {
            return {
              ...line,
              status: 'APPROVED' as const,
              recountRequired: false,
            };
          }
          return line;
        }),
      };
    });
    setOrders(updatedOrders);
    saveStoredOrders(updatedOrders);
  };

  // User Management
  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    saveActiveUser(user);
    saveAuthSession(user);
    if (user.role === 'OPERATOR') {
      setActiveModule('OPERACIONES');
      setActiveSubOption('INVENTARIOS_CORE');
      setActiveTab('COUNT');
    }
  };

  // Dashboard Indicators Handlers
  const handleSaveIndicator = (indicator: DashboardIndicator) => {
    const exists = indicators.some(i => i.id === indicator.id);
    const updated = exists
      ? indicators.map(i => i.id === indicator.id ? indicator : i)
      : [indicator, ...indicators];
    setIndicators(updated);
    saveStoredDashboardIndicators(updated);
  };

  const handleDeleteIndicator = (id: string) => {
    const updated = indicators.filter(i => i.id !== id);
    setIndicators(updated);
    saveStoredDashboardIndicators(updated);
  };

  const handleResetIndicators = () => {
    setIndicators(INITIAL_DASHBOARD_INDICATORS);
    saveStoredDashboardIndicators(INITIAL_DASHBOARD_INDICATORS);
  };

  const handleAddUser = (newUser: User) => {
    if (currentUser.role !== 'ADMIN') {
      alert('[Acceso Restringido] Solo el Administrador puede crear usuarios.');
      return;
    }
    const updated = [...users, newUser];
    setUsers(updated);
    saveStoredUsers(updated);
  };

  const handleUpdateUserPermissions = (userId: string, allowedModules: MainNavModule[], allowedSubOptions: SubNavOption[]) => {
    if (currentUser.role !== 'ADMIN') {
      alert('[Acceso Restringido] Solo el usuario Administrador puede modificar opciones y permisos de usuarios.');
      return;
    }
    const updated = users.map(u => u.id === userId ? { ...u, allowedModules, allowedSubOptions } : u);
    setUsers(updated);
    saveStoredUsers(updated);
    // If updating current active user, sync currentUser
    if (currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, allowedModules, allowedSubOptions }));
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (currentUser.role !== 'ADMIN') {
      alert('[Acceso Restringido] Solo el usuario Administrador puede eliminar datos.');
      return;
    }
    const updated = users.filter(u => u.id !== userId);
    setUsers(updated);
    saveStoredUsers(updated);
  };

  // Commercial Handlers
  const handleSaveQuotation = (quotation: LogisticsQuotation) => {
    const exists = quotations.some(q => q.id === quotation.id);
    const updated = exists 
      ? quotations.map(q => q.id === quotation.id ? quotation : q)
      : [quotation, ...quotations];
    setQuotations(updated);
    saveStoredQuotations(updated);
  };

  const handleUpdateQuoteStatus = (quoteId: string, status: QuoteStatus) => {
    const updated = quotations.map(q => q.id === quoteId ? { ...q, status } : q);
    setQuotations(updated);
    saveStoredQuotations(updated);
  };

  const handleDeleteQuotation = (quoteId: string) => {
    const updated = quotations.filter(q => q.id !== quoteId);
    setQuotations(updated);
    saveStoredQuotations(updated);
  };

  const handleSaveSettlement = (settlement: LogisticsSettlement) => {
    const exists = settlements.some(s => s.id === settlement.id);
    const updated = exists
      ? settlements.map(s => s.id === settlement.id ? settlement : s)
      : [settlement, ...settlements];
    setSettlements(updated);
    saveStoredSettlements(updated);
  };

  const handleUpdateSettlementStatus = (settlementId: string, status: LogisticsSettlement['status']) => {
    const updated = settlements.map(s => s.id === settlementId ? { ...s, status } : s);
    setSettlements(updated);
    saveStoredSettlements(updated);
  };

  // Warehouse Operations Handlers
  const handleSaveSku = (skuItem: SkuMasterItem) => {
    const exists = skuCatalog.some(s => s.id === skuItem.id);
    const updated = exists
      ? skuCatalog.map(s => s.id === skuItem.id ? skuItem : s)
      : [skuItem, ...skuCatalog];
    setSkuCatalog(updated);
    saveStoredSkuCatalog(updated);
  };

  const handleDeleteSku = (skuId: string) => {
    const updated = skuCatalog.filter(s => s.id !== skuId);
    setSkuCatalog(updated);
    saveStoredSkuCatalog(updated);
  };

  const handleUpdateLocationStatus = (locationId: string, newStatus: LocationOccupancyStatus) => {
    const updated = warehouseLocations.map(l => l.id === locationId ? { ...l, status: newStatus } : l);
    setWarehouseLocations(updated);
    saveStoredWarehouseLocations(updated);
  };

  // Tenant Config Handler
  const handleSaveTenantConfig = (newConfig: TenantConfig) => {
    setTenantConfig(newConfig);
    saveStoredTenantConfig(newConfig);
  };

  // If NOT authenticated, display Login Screen
  if (!isAuthenticated) {
    return (
      <LoginScreen
        users={users.length > 0 ? users : loadStoredUsers()}
        companies={INITIAL_COMPANIES}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  const isOperator = currentUser.role === 'OPERATOR';
  const isAdmin = currentUser.role === 'ADMIN';
  const activeSosCount = sosAlerts.filter(a => a.status === 'ACTIVE').length;

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans antialiased text-slate-900 selection:bg-amber-500 selection:text-slate-950">
      
      {/* 1. Permanent Responsive Navigation Sidebar */}
      <Sidebar
        currentUser={currentUser}
        users={users}
        onSelectUser={handleSelectUser}
        activeModule={activeModule}
        activeSubOption={activeSubOption}
        onNavigate={(mod, sub) => {
          setActiveModule(mod);
          setActiveSubOption(sub);
          if (mod === 'INVENTARIOS' && isOperator) {
            setActiveTab('COUNT');
          }
        }}
        onLogout={handleLogout}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        activeSosCount={activeSosCount}
        onOpenSosAlerts={() => setShowSosDrawer(true)}
      />

      {/* 2. Main Right Section: Top Navigation Bar + Scrollable Workspace + Status Bar */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        
        {/* Top Navbar Header */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 text-slate-100 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-xs z-20">
          
          {/* Breadcrumb Navigation Indicator */}
          {/* Breadcrumb Navigation Indicator with EMPRESA Badge */}
          <div className="flex items-center gap-2 overflow-hidden">
            {/* EMPRESA ACTIVE BADGE */}
            <div 
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-xs"
              title={`Empresa / Tenant activo: ${currentUser.companyName || 'Empresa A - Logística & WMS Stadius S.A.'}`}
            >
              <Building className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-mono text-[10px] text-amber-400 uppercase tracking-wider font-black">
                {currentUser.companyId || 'EMP-A'}
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-white text-xs truncate max-w-[130px] sm:max-w-[200px]">
                {currentUser.companyId === 'EMP-B' ? 'Empresa B (Nexus SpA)' : 'Empresa A (Stadius S.A.)'}
              </span>
            </div>

            <ChevronRight className="w-3.5 h-3.5 text-slate-600 hidden sm:inline" />
            <span className="text-xs font-semibold text-slate-300 truncate hidden md:inline">
              {activeModule === 'DASHBOARD' && 'Panel de Control'}
              {activeModule === 'COMERCIAL' && 'Módulo Comercial'}
              {(activeModule === 'OPERACIONES' || activeModule === 'INVENTARIOS') && 'Operaciones de Almacén'}
              {activeModule === 'SISTEMAS' && 'Sistemas y Seguridad'}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-xs font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-700 font-mono truncate">
              {activeSubOption === 'INVENTARIOS_CORE' || activeSubOption === 'INVENTARIOS_CICLICOS' 
                ? 'Inventarios Cíclicos (Core WMS)' 
                : activeSubOption}
            </span>
          </div>

          {/* Right Global Controls: Filters, SOS, Audio, Role */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Filtro de Cliente SOLO para Inventarios Cíclicos según requerimiento:
                "el filtro del cliente solo debe ser para los inventarios ciclicos, las demás funciones del sistema no debe estar filtrado por los clientes" */}
            {!isOperator && (activeSubOption === 'INVENTARIOS_CORE' || activeSubOption === 'INVENTARIOS_CICLICOS' || activeModule === 'INVENTARIOS') && (
              <div className="hidden lg:flex items-center gap-2 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
                <div className="flex items-center gap-1.5 px-2">
                  <Building className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Cliente Inv:</span>
                  <select
                    value={activeClient}
                    onChange={(e) => handleChangeClient(e.target.value)}
                    className="bg-transparent text-xs font-bold text-white focus:outline-none max-w-[130px] truncate"
                    title="Filtro exclusivo para Inventarios Cíclicos"
                  >
                    <option value="ALL">Todos los Clientes</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.name} className="bg-slate-900">{c.name}</option>
                    ))}
                  </select>
                </div>
                <span className="text-slate-700">|</span>
                <div className="flex items-center gap-1.5 px-2">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <select
                    value={activePeriod}
                    onChange={(e) => handleChangePeriod(e.target.value)}
                    className="bg-transparent text-xs font-mono font-bold text-indigo-300 focus:outline-none"
                    title="Periodo de inventario"
                  >
                    <option value="ALL">Todos los Periodos</option>
                    {availablePeriods.map(p => (
                      <option key={p} value={p} className="bg-slate-900">{p}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Audio Toggle */}
            <button
              onClick={toggleMute}
              title={isMuted ? 'Activar sonido de alertas' : 'Silenciar alertas'}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* SOS Live Alert Bell */}
            {((activeModule === 'OPERACIONES' || activeModule === 'INVENTARIOS') && (activeSubOption === 'INVENTARIOS_CORE' || activeSubOption === 'INVENTARIOS_CICLICOS')) && (
              <button
                onClick={() => setShowSosDrawer(true)}
                className={`relative flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  activeSosCount > 0
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Bell className={`w-3.5 h-3.5 ${activeSosCount > 0 ? 'text-rose-400' : 'text-slate-400'}`} />
                <span className="hidden sm:inline text-[11px]">SOS</span>
                {activeSosCount > 0 && (
                  <span className="w-4 h-4 flex items-center justify-center bg-rose-600 text-white font-bold rounded-full text-[9px]">
                    {activeSosCount}
                  </span>
                )}
              </button>
            )}

            {/* Architecture SQL DDL (Admin & Supervisor) */}
            {(isAdmin || currentUser.role === 'SUPERVISOR') && (
              <button
                onClick={() => setShowSchemaModal(true)}
                title="Ver Modelo de Datos & Esquema SQL Multi-Tenant"
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
              >
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[11px]">SQL DDL</span>
              </button>
            )}

            {/* Change password shortcut button */}
            <button
              onClick={() => setShowChangePasswordModal(true)}
              title="Cambiar contraseña de acceso"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
            </button>

            {/* Reset Demo button for Admin */}
            {isAdmin && (
              <button
                onClick={() => {
                  if (window.confirm('¿Deseas restaurar la base de datos a los valores de prueba originales?')) {
                    resetAllToDefaultDemo();
                  }
                }}
                title="Reiniciar a datos demo"
                className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors hidden sm:block"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Logout button */}
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Scrollable Main Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* A. PANEL DE CONTROL (DASHBOARD) */}
            {activeModule === 'DASHBOARD' && activeSubOption === 'OVERVIEW' && (
              <DashboardOverview
                currentUser={currentUser}
                masterInventory={masterInventory}
                orders={orders}
                sosAlerts={sosAlerts}
                quotations={quotations}
                services={services}
                settlements={settlements}
                skuCatalog={skuCatalog}
                warehouseLocations={warehouseLocations}
                stockOnHand={stockOnHand}
                users={users}
                clients={clients}
                indicators={indicators}
                onSaveIndicator={handleSaveIndicator}
                onDeleteIndicator={handleDeleteIndicator}
                onResetIndicators={handleResetIndicators}
                onNavigate={(mod, sub) => {
                  setActiveModule(mod);
                  setActiveSubOption(sub);
                  if ((mod === 'OPERACIONES' || mod === 'INVENTARIOS') && isOperator) {
                    setActiveTab('COUNT');
                  }
                }}
                onOpenSosDrawer={() => setShowSosDrawer(true)}
              />
            )}

            {/* B. MÓDULO COMERCIAL */}
            {activeModule === 'COMERCIAL' && (
              <>
                {activeSubOption === 'COTIZACIONES' && (
                  <QuotationsModule
                    quotations={quotations}
                    clients={clients}
                    currentUser={currentUser}
                    onSaveQuotation={handleSaveQuotation}
                    onUpdateQuoteStatus={handleUpdateQuoteStatus}
                    onDeleteQuotation={handleDeleteQuotation}
                  />
                )}

                {activeSubOption === 'CONSULTAS_SERVICIOS' && (
                  <ServicesInquiryModule
                    services={services}
                    clients={clients}
                    currentUser={currentUser}
                  />
                )}

                {activeSubOption === 'LIQUIDACIONES' && (
                  <SettlementsModule
                    settlements={settlements}
                    clients={clients}
                    currentUser={currentUser}
                    onSaveSettlement={handleSaveSettlement}
                    onUpdateSettlementStatus={handleUpdateSettlementStatus}
                  />
                )}
              </>
            )}

            {/* C. OPERACIONES DE ALMACÉN (LOGÍSTICA & CORE WMS) */}
            {(activeModule === 'OPERACIONES' || activeModule === 'INVENTARIOS') && (
              <>
                {/* 1. Inventarios Cíclicos & Control (Core WMS - dentro de Operaciones) */}
                {(activeSubOption === 'INVENTARIOS_CORE' || activeSubOption === 'INVENTARIOS_CICLICOS' || activeModule === 'INVENTARIOS') && (
                  <div className="space-y-4">
                    {/* Secondary Sub-tabs Bar for Core WMS */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex items-center justify-between gap-2 overflow-x-auto">
                      {isOperator ? (
                        <div className="flex items-center justify-between w-full px-2">
                          <button
                            onClick={() => setActiveTab('COUNT')}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 text-slate-950 shadow-sm"
                          >
                            <ScanLine className="w-4 h-4" />
                            <span>Terminal Móvil de Conteo en Piso</span>
                          </button>
                          <span className="text-[11px] text-slate-500 font-mono">
                            Gafete: <strong>{currentUser.badgeCode}</strong> · Turno: <strong>{currentUser.shift}</strong>
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 sm:gap-2">
                          {isAdmin && (
                            <button
                              onClick={() => setActiveTab('EXCEL')}
                              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all ${
                                activeTab === 'EXCEL'
                                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                              }`}
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>1. Carga Excel (Físico)</span>
                            </button>
                          )}

                          <button
                            onClick={() => setActiveTab('VALORIZADO')}
                            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all ${
                              activeTab === 'VALORIZADO'
                                ? 'bg-emerald-500 text-slate-950 font-black shadow-xs'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            }`}
                          >
                            <BadgeDollarSign className="w-3.5 h-3.5" />
                            <span>Catálogo Valorizado</span>
                          </button>

                          <button
                            onClick={() => setActiveTab('ORDERS')}
                            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all ${
                              activeTab === 'ORDERS'
                                ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            }`}
                          >
                            <ClipboardList className="w-3.5 h-3.5" />
                            <span>2. Gestión de Órdenes</span>
                          </button>

                          <button
                            onClick={() => setActiveTab('COUNT')}
                            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all ${
                              activeTab === 'COUNT'
                                ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            }`}
                          >
                            <ScanLine className="w-3.5 h-3.5" />
                            <span>3. Conteo en Piso</span>
                          </button>

                          <button
                            onClick={() => setActiveTab('KPIS')}
                            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all ${
                              activeTab === 'KPIS'
                                ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            }`}
                          >
                            <BarChart3 className="w-3.5 h-3.5" />
                            <span>4. KPIs & Conciliación</span>
                          </button>
                        </div>
                      )}

                      <button
                        onClick={() => setShowClientHistoryModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 border border-amber-500/30 rounded-xl transition-colors shrink-0"
                      >
                        <Filter className="w-3.5 h-3.5 text-amber-600" />
                        <span>Histórico Cliente</span>
                      </button>
                    </div>

                    {/* Sub-tab Views Render */}
                    {isOperator ? (
                      <OperatorCountModule
                        orders={orders}
                        selectedOrderId={selectedOrderIdForCount}
                        onSelectOrderId={(id) => setSelectedOrderIdForCount(id)}
                        currentUser={currentUser}
                        onUpdateLineCount={handleUpdateLineCount}
                        onTriggerSosAlert={handleTriggerSosAlert}
                        onReopenOrder={handleReopenOrder}
                      />
                    ) : (
                      <>
                        {activeTab === 'EXCEL' && isAdmin && (
                          <ExcelImportModule
                            masterInventory={masterInventory}
                            onAddInventoryItems={handleAddInventoryItems}
                            clients={clients}
                            activeClient={activeClient}
                            activePeriod={activePeriod}
                            currentUser={currentUser}
                            onDeleteInventoryItem={handleDeleteInventoryItem}
                            onClearInventory={handleClearInventory}
                          />
                        )}

                        {activeTab === 'VALORIZADO' && (
                          <ValuationModule
                            masterInventory={masterInventory}
                            prices={prices}
                            orders={orders}
                            onSavePrices={handleSavePrices}
                            onCrossReferencePrices={handleCrossReferencePrices}
                          />
                        )}

                        {activeTab === 'ORDERS' && (
                          <OrderManagementModule
                            orders={orders}
                            masterInventory={masterInventory}
                            users={users}
                            currentUser={currentUser}
                            clients={clients}
                            activeClient={activeClient}
                            activePeriod={activePeriod}
                            onCreateOrder={handleCreateOrder}
                            onSelectOrderForCount={handleSelectOrderForCount}
                            onDeleteOrder={handleDeleteOrder}
                            onReopenOrder={handleReopenOrder}
                          />
                        )}

                        {activeTab === 'COUNT' && (
                          <OperatorCountModule
                            orders={orders}
                            selectedOrderId={selectedOrderIdForCount}
                            onSelectOrderId={(id) => setSelectedOrderIdForCount(id)}
                            currentUser={currentUser}
                            onUpdateLineCount={handleUpdateLineCount}
                            onTriggerSosAlert={handleTriggerSosAlert}
                            onReopenOrder={handleReopenOrder}
                          />
                        )}

                        {activeTab === 'KPIS' && (
                          <ReportsKpiModule
                            orders={orders}
                            sosAlerts={sosAlerts}
                            currentUser={currentUser}
                            onApproveLineAdjustment={handleApproveLineAdjustment}
                            onRequestRecount={handleRequestRecount}
                            onApproveAllValidLines={handleApproveAllValidLines}
                            onReopenOrder={handleReopenOrder}
                          />
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* 2. Catálogo de SKUs */}
                {['GESTION_RECEPCION', 'GESTION_UBICACIONES', 'INVENTARIOS_FISICOS', 'GESTION_PICKING', 'GESTION_EMPAQUE', 'GESTION_EXPEDICION', 'GESTION_PATIOS', 'GESTION_ORDENES_ENVIO', 'PLANIFICACION_RUTAS', 'SELECCION_PROVEEDORES', 'GESTION_CARGAS', 'SEGUIMIENTO_TRAZABILIDAD', 'AUDITORIA_FLETES', 'GESTION_PATIOS_BASCULA'].includes(activeSubOption) && (
                  <GenericOperationsModule 
                    title={activeSubOption.replace(/_/g, ' ')}
                    description="Funcionalidad en desarrollo para la optimización de procesos operativos."
                  />
                )}
                {activeSubOption === 'CATALOGO_SKUS' && (
                  <SkuCatalogModule
                    skuCatalog={skuCatalog}
                    clients={clients}
                    currentUser={currentUser}
                    onSaveSku={handleSaveSku}
                    onDeleteSku={handleDeleteSku}
                  />
                )}

                {/* 3. Mapa de Ubicaciones (Layout) */}
                {activeSubOption === 'MAPA_LAYOUT' && (
                  <WarehouseLayoutMap
                    locations={warehouseLocations}
                    currentUser={currentUser}
                    onUpdateLocationStatus={handleUpdateLocationStatus}
                    onScheduleLocationCount={(code) => {
                      setActiveModule('OPERACIONES');
                      setActiveSubOption('INVENTARIOS_CORE');
                      setActiveTab('ORDERS');
                    }}
                  />
                )}

                {/* 4. Consulta de Stock On-Hand */}
                {activeSubOption === 'STOCK_ON_HAND' && (
                  <StockOnHandModule
                    stockRecords={stockOnHand}
                    clients={clients}
                    currentUser={currentUser}
                  />
                )}
              </>
            )}

            {/* E. MÓDULO DE SISTEMAS Y SEGURIDAD */}
            {activeModule === 'SISTEMAS' && (
              <>
                {activeSubOption === 'GESTION_USUARIOS' && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <h3 className="font-black text-slate-900 text-lg">Gestión de Usuarios y Roles (RBAC)</h3>
                        <p className="text-xs text-slate-500">Creación, asignación de permisos, turnos y desactivación de cuentas.</p>
                      </div>
                      <button
                        onClick={() => setShowUserModal(true)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-sm"
                      >
                        Abrir Panel de Creación
                      </button>
                    </div>

                    {/* Quick Users Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                            <th className="p-3">Gafete</th>
                            <th className="p-3">Nombre & Correo</th>
                            <th className="p-3">Rol</th>
                            <th className="p-3">Turno</th>
                            <th className="p-3">Bodega</th>
                            <th className="p-3">Departamento</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {users.map(u => (
                            <tr key={u.id} className="hover:bg-slate-50">
                              <td className="p-3 font-mono font-bold text-slate-900">{u.badgeCode}</td>
                              <td className="p-3">
                                <span className="font-bold text-slate-900 block">{u.name}</span>
                                <span className="text-[11px] text-slate-400 font-mono">{u.email}</span>
                              </td>
                              <td className="p-3">
                                <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                                  u.role === 'ADMIN' ? 'bg-slate-900 text-white' :
                                  u.role === 'SUPERVISOR' ? 'bg-purple-100 text-purple-800' :
                                  u.role === 'COMERCIAL' ? 'bg-sky-100 text-sky-800' :
                                  'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="p-3 font-medium text-slate-600">{u.shift}</td>
                              <td className="p-3 text-slate-600">{u.assignedWarehouse}</td>
                              <td className="p-3 text-slate-500">{u.department || 'Operaciones'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeSubOption === 'CAMBIO_CLAVE' && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-xl mx-auto space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                      <KeyRound className="w-5 h-5 text-amber-500" />
                      <h3 className="font-black text-slate-900 text-lg">Cambio Seguro de Contraseña</h3>
                    </div>
                    <p className="text-xs text-slate-500">
                      Actualiza tu clave de acceso para el usuario <strong>{currentUser.email}</strong>.
                    </p>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const currentInput = (e.currentTarget.elements.namedItem('currPass') as HTMLInputElement).value;
                        const newPass = (e.currentTarget.elements.namedItem('newPass') as HTMLInputElement).value;
                        const confirmPass = (e.currentTarget.elements.namedItem('confirmPass') as HTMLInputElement).value;

                        if (currentUser.password && currentInput !== currentUser.password) {
                          alert('La contraseña actual es incorrecta.');
                          return;
                        }
                        if (newPass.length < 6) {
                          alert('La nueva contraseña debe tener al menos 6 caracteres.');
                          return;
                        }
                        if (newPass !== confirmPass) {
                          alert('La confirmación no coincide con la nueva contraseña.');
                          return;
                        }

                        handleUpdatePassword(newPass);
                        e.currentTarget.reset();
                      }}
                      className="space-y-3 text-xs"
                    >
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Contraseña Actual</label>
                        <input
                          type="password"
                          name="currPass"
                          required
                          placeholder="••••••••"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Nueva Contraseña</label>
                        <input
                          type="password"
                          name="newPass"
                          required
                          placeholder="Mínimo 6 caracteres"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Confirmar Nueva Contraseña</label>
                        <input
                          type="password"
                          name="confirmPass"
                          required
                          placeholder="Repita la nueva contraseña"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-xs transition-colors"
                        >
                          Actualizar Contraseña
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeSubOption === 'TENANT_PARAMS' && (
                  <TenantSettingsModule
                    tenantConfig={tenantConfig}
                    currentUser={currentUser}
                    onSaveTenantConfig={handleSaveTenantConfig}
                  />
                )}

                {activeSubOption === 'SCHEMA_SQL' && (
                  <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <Database className="w-5 h-5 text-indigo-400" />
                        <h3 className="font-black text-sm tracking-tight text-white">
                          Modelo Relacional Multi-Tenant (PostgreSQL / Supabase DDL)
                        </h3>
                      </div>
                      <button
                        onClick={() => setShowSchemaModal(true)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                      >
                        Abrir Modal Completo
                      </button>
                    </div>
                    <p className="text-xs text-slate-300">
                      Incluye la estructura completa de tablas con clave de inquilino <code className="text-amber-400 font-mono">tenant_id</code>: usuarios, bodegas, ubicaciones, órdenes de conteo cíclico, alertas SOS, catálogos de SKUs, cotizaciones y liquidaciones.
                    </p>
                    <div className="bg-slate-950 p-4 rounded-xl font-mono text-[11px] text-indigo-300 overflow-x-auto max-h-96">
                      <pre>
{`-- STADIUS WMS - ESQUEMA MULTI-TENANT (PostgreSQL / Supabase)
CREATE TABLE tenants (id UUID PRIMARY KEY, company_name VARCHAR(150), ...);
CREATE TABLE users (id UUID PRIMARY KEY, tenant_id UUID REFERENCES tenants(id), role user_role, ...);
CREATE TABLE storage_locations (id UUID PRIMARY KEY, tenant_id UUID, location_code VARCHAR, ...);
CREATE TABLE logistics_quotations (id UUID PRIMARY KEY, tenant_id UUID, quote_number VARCHAR, ...);
CREATE TABLE logistics_settlements (id UUID PRIMARY KEY, tenant_id UUID, settlement_number VARCHAR, ...);
CREATE TABLE cycle_count_orders (id UUID PRIMARY KEY, tenant_id UUID, ...);
CREATE TABLE sos_alerts (id UUID PRIMARY KEY, tenant_id UUID, status sos_status, ...);`}
                      </pre>
                    </div>
                  </div>
                )}
              </>
            )}

          </div>
        </main>

        {/* Global Footer System Status Bar */}
        <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-2 px-4 select-none shrink-0">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping" />
                <span>Stadius WMS Online</span>
              </span>
              <span>·</span>
              <span>Tenant: <strong className="text-white font-mono">{tenantConfig.tenantId}</strong></span>
              <span>·</span>
              <span>Bodega: <strong className="text-white">{currentUser.assignedWarehouse}</strong></span>
              <span>·</span>
              <span>Cliente: <strong className="text-amber-400">{activeClient}</strong></span>
              <span>·</span>
              <span>Sesión: <strong className="text-amber-400">{currentUser.name} [{currentUser.role}]</strong></span>
            </div>

            <div className="flex items-center gap-3 text-[11px]">
              <span>Stadius WMS Enterprise v3.0 SaaS</span>
              {isAdmin && (
                <button
                  onClick={() => setShowSchemaModal(true)}
                  className="text-amber-400 hover:underline"
                >
                  Ver Esquema SQL
                </button>
              )}
            </div>
          </div>
        </footer>

      </div>

      {/* Modals & Slide-over Drawers */}
      <ClientHistoryModal
        isOpen={showClientHistoryModal}
        onClose={() => setShowClientHistoryModal(false)}
        clients={clients}
        activeClient={activeClient}
        onSelectClient={handleChangeClient}
        orders={orders}
        currentUser={currentUser}
        onReopenOrder={handleReopenOrder}
        onDeleteOrder={handleDeleteOrder}
        onViewOrderInCount={handleSelectOrderForCount}
        onAddClient={handleAddClient}
      />

      <SosTriageDrawer
        isOpen={showSosDrawer}
        onClose={() => setShowSosDrawer(false)}
        alerts={sosAlerts}
        currentUser={currentUser}
        onUpdateAlertStatus={handleUpdateAlertStatus}
      />

      <UserManagementModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        users={users}
        companies={INITIAL_COMPANIES}
        onAddUser={handleAddUser}
        onDeleteUser={handleDeleteUser}
        onUpdateUserPermissions={handleUpdateUserPermissions}
      />

      <ArchitectureSchemaModal
        isOpen={showSchemaModal}
        onClose={() => setShowSchemaModal(false)}
      />

      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        currentUser={currentUser}
        onChangePasswordSuccess={handleUpdatePassword}
      />
    </div>
  );
}
