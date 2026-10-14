import React, { useState } from 'react';
import { 
  AlertOctagon, 
  X, 
  MapPin, 
  Send, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  User as UserIcon,
  PhoneCall,
  Volume2
} from 'lucide-react';
import { SosAlert, SosReason, User } from '../types/inventory';
import { audioAlert } from '../utils/audioAlert';

interface SosAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  currentWarehouse: string;
  currentAisle: string;
  currentLocationCode: string;
  orderId?: string;
  orderTitle?: string;
  onTriggerSos: (alert: SosAlert) => void;
}

export const SosAlertModal: React.FC<SosAlertModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentWarehouse,
  currentAisle,
  currentLocationCode,
  orderId,
  orderTitle,
  onTriggerSos,
}) => {
  const [reason, setReason] = useState<SosReason>('DISCREPANCIA_GRAVE');
  const [description, setDescription] = useState('');
  const [warehouse, setWarehouse] = useState(currentWarehouse);
  const [aisle, setAisle] = useState(currentAisle);
  const [locationCode, setLocationCode] = useState(currentLocationCode);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Play loud synthesized alarm sound
    audioAlert.playSosAlert();

    const newAlert: SosAlert = {
      id: `SOS-${Date.now()}`,
      orderId,
      orderTitle,
      operatorId: currentUser.id,
      operatorName: currentUser.name,
      warehouse: warehouse || 'B01 - Bodega Central',
      aisle: aisle || 'Pasillo Activo',
      locationCode: locationCode || 'Piso Almacén',
      reason,
      description: description || 'El operador requiere asistencia inmediata del supervisor en su ubicación.',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'ACTIVE',
    };

    onTriggerSos(newAlert);
    onClose();
  };

  const reasonOptions: { key: SosReason; label: string; desc: string }[] = [
    { 
      key: 'DISCREPANCIA_GRAVE', 
      label: 'Discrepancia Crítica de Stock', 
      desc: 'Faltante o sobrante masivo que supera la tolerancia permitida' 
    },
    { 
      key: 'PRODUCTO_DANADO', 
      label: 'Producto Dañado / Derrame', 
      desc: 'Caja rota, tarima ladeada, líquido derramado en la ubicación' 
    },
    { 
      key: 'APOYO_MONTACARGAS', 
      label: 'Requiere Montacargas / Altura', 
      desc: 'Pallet en altura inaccesible manualmente o trabado en la viga' 
    },
    { 
      key: 'ACCESIBILIDAD_SEGURIDAD', 
      label: 'Seguridad / Pasillo Bloqueado', 
      desc: 'Riesgo físico de caída de objetos o bloqueo total de circulación' 
    },
    { 
      key: 'ETIQUETA_ILEGIBLE', 
      label: 'Código de Barra Ilegible / Sin Marbete', 
      desc: 'No se puede escanear o confirmar el SKU con certeza' 
    },
    { 
      key: 'OTRO', 
      label: 'Otro Apoyo General', 
      desc: 'Consulta administrativa o requerimiento con supervisión' 
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border-2 border-rose-600 animate-in fade-in zoom-in-95 duration-200">
        {/* Banner Alert Header */}
        <div className="bg-rose-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-700 border border-rose-400 flex items-center justify-center animate-pulse">
              <AlertOctagon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-wide uppercase">
                EMISIÓN DE ALERTA SOS · PISO WMS
              </h2>
              <p className="text-xs text-rose-100">
                Llamado prioritario a supervisores con notificación sonora
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-rose-700 rounded-lg text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Coordinates Block */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase">
              <MapPin className="w-4 h-4 text-rose-600" />
              <span>Ubicación Exacta del Incidente:</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 font-bold block">Bodega</label>
                <input
                  type="text"
                  value={warehouse}
                  onChange={(e) => setWarehouse(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded p-1.5 font-medium"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold block">Pasillo</label>
                <input
                  type="text"
                  value={aisle}
                  onChange={(e) => setAisle(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded p-1.5 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold block">Ubicación</label>
                <input
                  type="text"
                  value={locationCode}
                  onChange={(e) => setLocationCode(e.target.value)}
                  className="w-full text-xs bg-white border border-rose-300 font-mono font-bold text-rose-700 rounded p-1.5"
                />
              </div>
            </div>
          </div>

          {/* Reason radio grid */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase mb-2">
              Motivo de la Asistencia Requerida:
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {reasonOptions.map((opt) => (
                <div
                  key={opt.key}
                  onClick={() => setReason(opt.key)}
                  className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                    reason === opt.key
                      ? 'bg-rose-50 border-rose-500 text-rose-950 font-semibold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold flex items-center justify-between">
                    <span>{opt.label}</span>
                    {reason === opt.key && <span className="text-rose-600 font-bold">●</span>}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
              Observaciones adicionales para el supervisor:
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describa brevemente qué ocurrió para agilizar el apoyo..."
              className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          {/* Operator identification */}
          <div className="text-xs text-slate-500 flex items-center justify-between bg-slate-100 p-2.5 rounded-lg">
            <span>Operador solicitante:</span>
            <span className="font-bold text-slate-900">{currentUser.name} ({currentUser.badgeCode})</span>
          </div>

          {/* Trigger button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-transform active:scale-98"
            >
              <Send className="w-5 h-5" />
              <span>DISPARAR ALERTA SOS INMEDIATA</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface SosTriageDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: SosAlert[];
  currentUser: User;
  onUpdateAlertStatus: (alertId: string, status: 'ATTENDING' | 'RESOLVED') => void;
}

export const SosTriageDrawer: React.FC<SosTriageDrawerProps> = ({
  isOpen,
  onClose,
  alerts,
  currentUser,
  onUpdateAlertStatus,
}) => {
  if (!isOpen) return null;

  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE' || a.status === 'ATTENDING');
  const resolvedAlerts = alerts.filter(a => a.status === 'RESOLVED');

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <div>
              <h3 className="font-bold text-sm">Centro de Notificaciones & SOS Piso</h3>
              <p className="text-[11px] text-slate-400">Panel de despacho para supervisores</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Active alerts section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4 text-rose-600" />
                <span>Alertas en Curso ({activeAlerts.length})</span>
              </span>
              <button
                onClick={() => audioAlert.playSosAlert()}
                className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1"
                title="Probar sonido de sirena"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Test Audio</span>
              </button>
            </div>

            {activeAlerts.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-slate-500 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <span>No hay alertas SOS pendientes en este momento. Todos los pasillos operan normalmente.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {activeAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`rounded-xl border p-4 space-y-3 ${
                      alert.status === 'ATTENDING'
                        ? 'bg-amber-50/60 border-amber-300'
                        : 'bg-rose-50/70 border-rose-400 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800">
                          {alert.id}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 mt-1">
                          {alert.reason.replace(/_/g, ' ')}
                        </h4>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        alert.status === 'ATTENDING'
                          ? 'bg-amber-200 text-amber-900'
                          : 'bg-rose-200 text-rose-900 animate-pulse'
                      }`}>
                        {alert.status === 'ATTENDING' ? 'En Atención' : 'Pendiente ¡Alerta!'}
                      </span>
                    </div>

                    {/* Coordinates */}
                    <div className="text-xs font-mono bg-white/80 p-2 rounded border border-slate-200 space-y-1">
                      <div className="font-bold text-rose-700">
                        {alert.warehouse} · {alert.aisle} · {alert.locationCode}
                      </div>
                      <div className="text-[11px] text-slate-600 font-sans">
                        Operador: <strong>{alert.operatorName}</strong> ({alert.createdAt})
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 italic">
                      "{alert.description}"
                    </p>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      {alert.status === 'ACTIVE' && (
                        <button
                          onClick={() => onUpdateAlertStatus(alert.id, 'ATTENDING')}
                          className="flex-1 py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>Atender Llamado</span>
                        </button>
                      )}

                      <button
                        onClick={() => onUpdateAlertStatus(alert.id, 'RESOLVED')}
                        className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Marcar Resuelto</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Historical resolved alerts */}
          <div>
            <span className="text-xs font-black uppercase text-slate-500 block mb-3">
              Historial de Alertas Resueltas ({resolvedAlerts.length})
            </span>

            <div className="space-y-2">
              {resolvedAlerts.map(alert => (
                <div key={alert.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{alert.locationCode} ({alert.aisle})</span>
                    <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Resuelto
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Atendido por: {alert.resolvedBy || 'Supervisor'} · Respuesta:{' '}
                    <strong>{Math.round((alert.responseTimeSeconds || 300) / 60)} min</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
