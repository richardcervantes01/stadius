import React, { useState } from 'react';
import { Database, X, Copy, Check, Server, Shield, Layers } from 'lucide-react';

interface ArchitectureSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureSchemaModal: React.FC<ArchitectureSchemaModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sqlDDL = `-- ============================================================================
-- STADIUS WMS - ESQUEMA RELACIONAL MULTI-TENANT (PostgreSQL / Supabase / Cloud SQL)
-- Módulo de Inventarios Cíclicos, Control de Discrepancias & Alertas SOS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TENANTS (Organizaciones SaaS / Clientes Multi-Tenant)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(50) UNIQUE NOT NULL,
    company_name VARCHAR(150) NOT NULL,
    plan_type VARCHAR(30) DEFAULT 'ENTERPRISE',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. USERS & ROLES
CREATE TYPE user_role AS ENUM ('ADMIN', 'SUPERVISOR', 'OPERATOR', 'COMERCIAL');
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    badge_code VARCHAR(30) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(120) NOT NULL,
    role user_role DEFAULT 'OPERATOR',
    shift VARCHAR(20) DEFAULT 'MANANA', -- MANANA, TARDE, NOCHE
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (tenant_id, email),
    UNIQUE (tenant_id, badge_code)
);

-- 3. BODEGAS & CENTROS DE DISTRIBUCIÓN
CREATE TABLE warehouses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code VARCHAR(30) NOT NULL,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (tenant_id, code)
);

-- 4. UBICACIONES FÍSICAS (Racks/Altura vs Piso/Nivel)
CREATE TYPE storage_type AS ENUM ('RACK_HEIGHT', 'FLOOR_LEVEL');
CREATE TABLE storage_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    aisle VARCHAR(50) NOT NULL,             -- Pasillo o Rack
    location_code VARCHAR(50) NOT NULL,     -- Código físico (ej: P01-R01-02)
    storage_type storage_type NOT NULL,     -- RACK_HEIGHT / FLOOR_LEVEL
    vertical_level VARCHAR(50) NOT NULL,    -- Altura (A, B, C) o Nivel (Piso 1, Remonte)
    is_blocked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (tenant_id, warehouse_id, location_code)
);

-- 5. CATÁLOGO MAESTRO DE SKUs & STOCK TEÓRICO EN WMS
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES storage_locations(id) ON DELETE CASCADE,
    sku VARCHAR(60) NOT NULL,
    description TEXT NOT NULL,
    batch_number VARCHAR(60),               -- Lote (opcional)
    theoretical_qty NUMERIC(14, 2) NOT NULL DEFAULT 0,
    unit_cost NUMERIC(12, 4) NOT NULL DEFAULT 0,
    category_abc VARCHAR(30) DEFAULT 'B - Media Rotación',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (tenant_id, location_id, sku, batch_number)
);

-- 6. ÓRDENES DE INVENTARIO CÍCLICO
CREATE TYPE count_type AS ENUM ('BLIND', 'NON_BLIND');
CREATE TYPE order_status AS ENUM ('PENDING', 'IN_PROGRESS', 'COUNTED', 'DISCREPANCY_REVIEW', 'APPROVED');
CREATE TABLE cycle_count_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    order_code VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    type count_type DEFAULT 'BLIND',        -- Ciego vs No Ciego
    status order_status DEFAULT 'PENDING',
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    tolerance_percentage NUMERIC(5, 2) DEFAULT 0.00,
    assigned_operator_id UUID REFERENCES users(id),
    supervisor_id UUID REFERENCES users(id),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (tenant_id, order_code)
);

-- 7. LÍNEAS DE CONTEO FÍSICO POR UBICACIÓN
CREATE TYPE line_status AS ENUM ('PENDING', 'COUNTED', 'DISCREPANT', 'RECOUNT_PENDING', 'APPROVED');
CREATE TABLE cycle_count_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES cycle_count_orders(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES storage_locations(id),
    sku VARCHAR(60) NOT NULL,
    description TEXT NOT NULL,
    batch_number VARCHAR(60),
    theoretical_qty NUMERIC(14, 2) NOT NULL,
    counted_qty NUMERIC(14, 2),
    recounted_qty NUMERIC(14, 2),
    unit_cost NUMERIC(12, 4) NOT NULL,
    discrepancy_units NUMERIC(14, 2) GENERATED ALWAYS AS (counted_qty - theoretical_qty) STORED,
    discrepancy_cost NUMERIC(14, 2) GENERATED ALWAYS AS ((counted_qty - theoretical_qty) * unit_cost) STORED,
    status line_status DEFAULT 'PENDING',
    recount_required BOOLEAN DEFAULT FALSE,
    duration_seconds INT DEFAULT 0,
    operator_notes TEXT,
    observation_tags TEXT[],               -- ['Producto dañado', 'Bulto abierto']
    counted_at TIMESTAMP WITH TIME ZONE,
    counted_by_id UUID REFERENCES users(id)
);

-- 8. ALERTAS SOS DE PISO (Llamado a Supervisión en Tiempo Real)
CREATE TYPE sos_reason AS ENUM (
    'DISCREPANCIA_GRAVE', 
    'PRODUCTO_DANADO', 
    'ACCESIBILIDAD_SEGURIDAD', 
    'APOYO_MONTACARGAS', 
    'ETIQUETA_ILEGIBLE', 
    'OTRO'
);
CREATE TYPE sos_status AS ENUM ('ACTIVE', 'ATTENDING', 'RESOLVED');
CREATE TABLE sos_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    order_id UUID REFERENCES cycle_count_orders(id),
    operator_id UUID NOT NULL REFERENCES users(id),
    location_id UUID REFERENCES storage_locations(id),
    reason sos_reason NOT NULL,
    description TEXT,
    status sos_status DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    attended_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by_id UUID REFERENCES users(id),
    response_time_seconds INT GENERATED ALWAYS AS (
        EXTRACT(EPOCH FROM (resolved_at - created_at))::INT
    ) STORED
);

-- 9. LOGS DE AUDITORÍA Y CONCILIACIÓN CONTABLE
CREATE TABLE inventory_adjustments_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES cycle_count_orders(id),
    line_id UUID NOT NULL REFERENCES cycle_count_lines(id),
    sku VARCHAR(60) NOT NULL,
    qty_before NUMERIC(14, 2) NOT NULL,
    qty_after NUMERIC(14, 2) NOT NULL,
    delta_qty NUMERIC(14, 2) NOT NULL,
    financial_impact NUMERIC(14, 2) NOT NULL,
    approved_by UUID NOT NULL REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. MÓDULO COMERCIAL: COTIZACIONES & TARIFARIOS LOGÍSTICOS
CREATE TYPE quote_status AS ENUM ('BORRADOR', 'ENVIADA', 'APROBADA', 'RECHAZADA');
CREATE TABLE logistics_quotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    quote_number VARCHAR(50) NOT NULL,
    client_id UUID REFERENCES clients(id),
    client_name VARCHAR(120) NOT NULL,
    status quote_status DEFAULT 'BORRADOR',
    currency VARCHAR(10) DEFAULT 'USD',
    subtotal NUMERIC(14, 2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    valid_until DATE NOT NULL,
    notes TEXT,
    created_by_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (tenant_id, quote_number)
);

CREATE TABLE quotation_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id UUID NOT NULL REFERENCES logistics_quotations(id) ON DELETE CASCADE,
    service_type VARCHAR(60) NOT NULL, -- ALMACENAJE, MANIPULEO, FLETE, ETIQUETADO
    description TEXT NOT NULL,
    unit VARCHAR(30) NOT NULL,         -- Pallet/Dia, Mov/Pallet, Viaje
    unit_rate NUMERIC(14, 4) NOT NULL,
    estimated_qty NUMERIC(14, 2) NOT NULL,
    total_price NUMERIC(14, 2) NOT NULL
);

-- 11. MÓDULO COMERCIAL: LIQUIDACIONES & FACTURACIÓN DE ESTADÍA
CREATE TYPE settlement_status AS ENUM ('GENERADA', 'REVISADA', 'FACTURADA', 'PAGADA');
CREATE TABLE logistics_settlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    settlement_number VARCHAR(50) NOT NULL,
    client_name VARCHAR(120) NOT NULL,
    period VARCHAR(20) NOT NULL,        -- '2026-10'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    pallet_days INT NOT NULL,
    storage_amount NUMERIC(14, 2) NOT NULL,
    inbound_pallets INT NOT NULL,
    inbound_amount NUMERIC(14, 2) NOT NULL,
    outbound_pallets INT NOT NULL,
    outbound_amount NUMERIC(14, 2) NOT NULL,
    extra_services_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    subtotal NUMERIC(14, 2) NOT NULL,
    tax_amount NUMERIC(14, 2) NOT NULL,
    total_amount NUMERIC(14, 2) NOT NULL,
    status settlement_status DEFAULT 'GENERADA',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_by_id UUID REFERENCES users(id),
    UNIQUE (tenant_id, settlement_number)
);

-- 12. ÍNDICES OPTIMIZADOS PARA RENDIMIENTO
CREATE INDEX idx_locations_tenant_wh ON storage_locations(tenant_id, warehouse_id);
CREATE INDEX idx_lines_order ON cycle_count_lines(order_id, status);
CREATE INDEX idx_sos_tenant_active ON sos_alerts(tenant_id, status);
CREATE INDEX idx_quotes_tenant_status ON logistics_quotations(tenant_id, status);
CREATE INDEX idx_settlements_tenant_period ON logistics_settlements(tenant_id, period);
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlDDL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="font-bold text-sm">Arquitectura de Datos Multi-Tenant & Esquema SQL DDL</h3>
              <p className="text-[11px] text-slate-400">PostgreSQL / Supabase / Cloud SQL optimizado para WMS</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '¡Copiado!' : 'Copiar SQL DDL'}</span>
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Overview cards */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Multi-Tenancy por Columna</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Aislamiento seguro con <code className="font-mono text-indigo-600">tenant_id</code> y Row-Level Security (RLS) en cada consulta.
            </p>
          </div>

          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-600" />
              <span>2 Tipologías Físicas</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Columnas dinámicas para Racks/Altura (A/B/C) y Pisos/Niveles (Piso 1, Bahía, Remonte).
            </p>
          </div>

          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-indigo-600" />
              <span>Columnas Calculadas</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              <code className="font-mono text-slate-700">STORED GENERATED</code> para discrepancias de unidades y costos financieros automáticos.
            </p>
          </div>
        </div>

        {/* Code Viewer */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-950 font-mono text-xs text-slate-200 leading-relaxed">
          <pre>{sqlDDL}</pre>
        </div>
      </div>
    </div>
  );
};
