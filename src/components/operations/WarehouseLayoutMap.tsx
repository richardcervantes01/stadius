import React, { useState } from 'react';
import {
  MapPin,
  Warehouse,
  Boxes,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  Filter,
  Eye,
  Layers,
  Building,
  RefreshCw
} from 'lucide-react';
import { WarehouseLocationRecord, LocationOccupancyStatus, User } from '../../types/inventory';

interface WarehouseLayoutMapProps {
  locations: WarehouseLocationRecord[];
  currentUser: User;
  onUpdateLocationStatus: (locationId: string, newStatus: LocationOccupancyStatus) => void;
  onScheduleLocationCount?: (locationCode: string) => void;
}

export const WarehouseLayoutMap: React.FC<WarehouseLayoutMapProps> = ({
  locations,
  currentUser,
  onUpdateLocationStatus,
  onScheduleLocationCount,
}) => {
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('B01 - Bodega Central');
  const [selectedAisle, setSelectedAisle] = useState<string>('Pasillo 01');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedLocation, setSelectedLocation] = useState<WarehouseLocationRecord | null>(locations[0] || null);

  // Group locations for current aisle and warehouse
  const aisleLocations = locations.filter(l => 
    l.warehouse === selectedWarehouse && 
    l.aisle === selectedAisle &&
    (statusFilter === 'ALL' || l.status === statusFilter)
  );

  // Collect distinct racks and levels
  const racks = Array.from(new Set(aisleLocations.map(l => l.rack))).sort();
  const levels = Array.from(new Set(aisleLocations.map(l => l.level))).reverse(); // Top level at top

  // Status statistics for this aisle
  const totalCells = aisleLocations.length;
  const emptyCells = aisleLocations.filter(l => l.status === 'VACIO').length;
  const partialCells = aisleLocations.filter(l => l.status === 'PARCIAL').length;
  const fullCells = aisleLocations.filter(l => l.status === 'LLENO').length;
  const blockedCells = aisleLocations.filter(l => l.status === 'BLOQUEADO').length;

  const occupancyPercent = totalCells > 0 ? Math.round(((fullCells + (partialCells * 0.5)) / totalCells) * 100) : 0;

  const statusColors: Record<LocationOccupancyStatus, { bg: string; text: string; border: string; label: string }> = {
    VACIO: { bg: 'bg-emerald-50 hover:bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300', label: 'Vacío / Disponible' },
    PARCIAL: { bg: 'bg-amber-50 hover:bg-amber-100', text: 'text-amber-800', border: 'border-amber-300', label: 'Ocupación Parcial' },
    LLENO: { bg: 'bg-slate-800 hover:bg-slate-700', text: 'text-white', border: 'border-slate-700', label: 'Lleno (Capacidad Máx)' },
    BLOQUEADO: { bg: 'bg-rose-50 hover:bg-rose-100', text: 'text-rose-700', border: 'border-rose-300', label: 'Bloqueado / Mantenimiento' },
  };

  const handleToggleLock = (location: WarehouseLocationRecord) => {
    const nextStatus: LocationOccupancyStatus = location.status === 'BLOQUEADO' ? 'VACIO' : 'BLOQUEADO';
    onUpdateLocationStatus(location.id, nextStatus);
    setSelectedLocation({ ...location, status: nextStatus });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Operaciones de Almacén · Mapa de Ubicaciones (Layout Visual)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Topología espacial interactiva de racks, pasillos, alturas de estantería y estado de ocupación física de celdas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-600">Ocupación pasillo: <strong>{occupancyPercent}%</strong></span>
          </div>
        </div>
      </div>

      {/* Warehouse and Aisle Selector Tabs */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Warehouse buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setSelectedWarehouse('B01 - Bodega Central')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                selectedWarehouse === 'B01 - Bodega Central'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bodega Central (B01)
            </button>
            <button
              onClick={() => setSelectedWarehouse('B02 - Cadena Frío')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                selectedWarehouse === 'B02 - Cadena Frío'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cadena de Frío (B02)
            </button>
          </div>

          <span className="text-slate-300">|</span>

          {/* Aisle selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-bold text-slate-500 uppercase text-[11px]">Pasillo:</span>
            <select
              value={selectedAisle}
              onChange={(e) => setSelectedAisle(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none"
            >
              <option value="Pasillo 01">Pasillo 01</option>
              <option value="Pasillo 02">Pasillo 02</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1.5 text-xs ml-2">
            <span className="font-bold text-slate-500 uppercase text-[11px]">Estado:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none"
            >
              <option value="ALL">Todos los Estados</option>
              <option value="VACIO">Vacío / Disponible</option>
              <option value="PARCIAL">Parcial</option>
              <option value="LLENO">Lleno</option>
              <option value="BLOQUEADO">Bloqueado</option>
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-400 inline-block" />
            <span className="text-slate-600">Vacío ({emptyCells})</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-100 border border-amber-400 inline-block" />
            <span className="text-slate-600">Parcial ({partialCells})</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-800 border border-slate-900 inline-block" />
            <span className="text-slate-600">Lleno ({fullCells})</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-100 border border-rose-400 inline-block" />
            <span className="text-slate-600">Bloqueado ({blockedCells})</span>
          </span>
        </div>
      </div>

      {/* Main Grid: Visual 2D Rack Elevation Matrix + Location Inspector Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 2D Elevation Matrix (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-black text-slate-900 text-sm tracking-tight">
                Elevación de Racks en {selectedAisle} ({selectedWarehouse})
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Haz clic en cualquier celda para inspeccionar el pallet y stock almacenado.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500">
              {totalCells} posiciones
            </span>
          </div>

          {aisleLocations.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No hay ubicaciones configuradas para este pasillo o filtro.
            </div>
          ) : (
            <div className="space-y-6 pt-2">
              {/* Racks Columns Container */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {racks.map(rackName => {
                  const rackLocations = aisleLocations.filter(l => l.rack === rackName);

                  return (
                    <div key={rackName} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="font-black text-xs text-slate-900 uppercase font-mono tracking-wider">
                          {rackName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {rackLocations.length} celdas
                        </span>
                      </div>

                      {/* Levels Stack (Top to Bottom) */}
                      <div className="space-y-2">
                        {levels.map(lvl => {
                          const cell = rackLocations.find(l => l.level === lvl);
                          if (!cell) return null;

                          const isSelected = selectedLocation?.id === cell.id;
                          const style = statusColors[cell.status];

                          return (
                            <div
                              key={cell.id}
                              onClick={() => setSelectedLocation(cell)}
                              className={`p-3 rounded-xl border cursor-pointer transition-all ${style.bg} ${style.border} ${
                                isSelected ? 'ring-2 ring-amber-500 shadow-md scale-[1.01]' : 'shadow-2xs'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className={`font-mono font-black text-xs ${style.text}`}>
                                    {cell.locationCode}
                                  </span>
                                  <span className="text-[10px] text-slate-400">({cell.level})</span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  {cell.status === 'BLOQUEADO' ? (
                                    <Lock className="w-3.5 h-3.5 text-rose-600" />
                                  ) : cell.status === 'LLENO' ? (
                                    <Boxes className="w-3.5 h-3.5 text-slate-300" />
                                  ) : (
                                    <span className={`text-[10px] font-bold ${style.text}`}>
                                      {cell.status === 'PARCIAL' ? '1/2' : '0/1'}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {cell.currentSku && (
                                <div className="mt-1.5 pt-1.5 border-t border-slate-200/40 text-[11px] truncate flex items-center justify-between">
                                  <span className="font-medium text-slate-700 truncate">{cell.skuDescription || cell.currentSku}</span>
                                  <span className="font-mono font-bold text-slate-900 shrink-0 ml-1">
                                    {cell.currentQty} u.
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Location Inspector Panel (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-600" />
              <h3 className="font-black text-slate-900 text-sm tracking-tight">Inspector de Celda</h3>
            </div>
            {selectedLocation && (
              <span className="font-mono text-xs font-bold text-slate-900 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                {selectedLocation.locationCode}
              </span>
            )}
          </div>

          {!selectedLocation ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Selecciona una celda de la elevación para ver detalles.
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              {/* Location Status Badge */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-medium text-slate-600">Estado de la Ubicación:</span>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${statusColors[selectedLocation.status].bg} ${statusColors[selectedLocation.status].text} ${statusColors[selectedLocation.status].border}`}>
                  {statusColors[selectedLocation.status].label}
                </span>
              </div>

              {/* Physical details */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Bodega:</span>
                  <span className="font-bold text-slate-900">{selectedLocation.warehouse}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Pasillo / Rack:</span>
                  <span className="font-mono text-slate-800">{selectedLocation.aisle} · {selectedLocation.rack}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Nivel / Posición:</span>
                  <span className="font-mono text-slate-800">{selectedLocation.level} · {selectedLocation.position}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Capacidad Máxima:</span>
                  <span className="font-bold text-slate-900">{selectedLocation.maxPalletCapacity} Pallet Estándar</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Zona Térmica:</span>
                  <span className="font-mono text-slate-700">{selectedLocation.temperatureZone}</span>
                </div>
              </div>

              {/* On-hand Stored Content */}
              <div className="border-t border-slate-100 pt-3 space-y-2 bg-slate-50/70 p-3 rounded-xl border border-slate-200">
                <span className="font-bold text-[11px] text-slate-900 uppercase block mb-1">
                  Carga & Stock Actual en Celda
                </span>

                {selectedLocation.currentSku ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Cliente Asignado:</span>
                      <strong className="text-slate-900">{selectedLocation.assignedClient}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Artículo SKU:</span>
                      <strong className="font-mono text-slate-900">{selectedLocation.currentSku}</strong>
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium">
                      {selectedLocation.skuDescription}
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
                      <span className="text-slate-500">Lote Activo:</span>
                      <span className="font-mono font-bold text-slate-900">{selectedLocation.currentBatch}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Cantidad Existente:</span>
                      <span className="text-sm font-black text-emerald-600 font-mono">
                        {selectedLocation.currentQty} unidades
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-3 text-slate-400">
                    Celda vacía. No hay mercadería registrada en esta posición.
                  </div>
                )}
              </div>

              {/* Interactive Actions */}
              <div className="border-t border-slate-100 pt-3 space-y-2">
                <button
                  onClick={() => handleToggleLock(selectedLocation)}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    selectedLocation.status === 'BLOQUEADO'
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                  }`}
                >
                  {selectedLocation.status === 'BLOQUEADO' ? (
                    <>
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Desbloquear Celda</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Bloquear Celda para Mantenimiento</span>
                    </>
                  )}
                </button>

                {onScheduleLocationCount && (
                  <button
                    onClick={() => {
                      onScheduleLocationCount(selectedLocation.locationCode);
                      alert(`Ubicación ${selectedLocation.locationCode} programada para verificación.`);
                    }}
                    className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    Programar Auditoría de Conteo
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
