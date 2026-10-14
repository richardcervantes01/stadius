import { 
  CycleCountOrder, 
  SosAlert, 
  KpiSummary, 
  OperatorProductivityItem 
} from '../types/inventory';

export function calculateKpis(
  orders: CycleCountOrder[],
  sosAlerts: SosAlert[],
  selectedOrderId?: string
): KpiSummary {
  // Filter to single order or aggregate all orders
  const activeOrders = selectedOrderId && selectedOrderId !== 'ALL'
    ? orders.filter(o => o.id === selectedOrderId)
    : orders;

  const allLines = activeOrders.flatMap(o => o.lines);

  const totalLocations = allLines.length;
  const countedLines = allLines.filter(l => l.countedQty !== undefined && l.status !== 'PENDING');
  const countedLocations = countedLines.length;

  const progressPercent = totalLocations > 0 
    ? Math.round((countedLocations / totalLocations) * 100 * 10) / 10 
    : 0;

  // ERI: Exactitud de Registros de Inventario (% ubicaciones exactas sin discrepancia)
  let exactLocationsCount = 0;
  let missingSkusCount = 0;
  let excessSkusCount = 0;

  let totalTheoreticalUnits = 0;
  let totalCountedUnits = 0;
  let sumAbsoluteUnitDifferences = 0;
  let totalMissingUnits = 0;
  let totalExcessUnits = 0;

  let netFinancialDiscrepancy = 0;  // Positivos (sobrantes) - Negativos (faltantes)
  let shrinkageFinancialCost = 0;   // Valor absoluto de faltantes (merma pura)
  let recountRequiredCount = 0;

  // Productivity aggregation by operator
  const operatorStats: Record<string, { 
    name: string; 
    counts: number; 
    totalSeconds: number; 
    exactCounts: number; 
  }> = {};

  countedLines.forEach(line => {
    const theoretical = line.theoreticalQty;
    const counted = line.countedQty ?? 0;
    const diff = counted - theoretical;
    const unitCost = typeof line.unitCost === 'number' ? line.unitCost : 0;
    const diffCost = diff * unitCost;

    totalTheoreticalUnits += theoretical;
    totalCountedUnits += counted;
    sumAbsoluteUnitDifferences += Math.abs(diff);

    if (diff === 0) {
      exactLocationsCount++;
    } else if (diff < 0) {
      missingSkusCount++;
      totalMissingUnits += Math.abs(diff);
      shrinkageFinancialCost += Math.abs(diffCost);
    } else {
      excessSkusCount++;
      totalExcessUnits += diff;
    }

    netFinancialDiscrepancy += diffCost;

    if (line.recountRequired) {
      recountRequiredCount++;
    }

    // Productivity
    if (line.countedBy) {
      const opKey = line.countedBy;
      if (!operatorStats[opKey]) {
        operatorStats[opKey] = {
          name: line.countedBy,
          counts: 0,
          totalSeconds: 0,
          exactCounts: 0,
        };
      }
      operatorStats[opKey].counts++;
      operatorStats[opKey].totalSeconds += line.durationSeconds || 180; // default 3 min if unrecorded
      if (diff === 0) {
        operatorStats[opKey].exactCounts++;
      }
    }
  });

  // Calculate ERI
  const eriPercent = countedLocations > 0
    ? Math.round((exactLocationsCount / countedLocations) * 100 * 10) / 10
    : 100;

  // Calculate ERU (Standard APICS Units Accuracy)
  // ERU = max(0, 1 - (sum(|Fisico - Teorico|) / sum(Teorico))) * 100
  let eruPercent = 100;
  if (totalTheoreticalUnits > 0 && countedLocations > 0) {
    const accuracyRatio = 1 - (sumAbsoluteUnitDifferences / totalTheoreticalUnits);
    eruPercent = Math.max(0, Math.round(accuracyRatio * 100 * 10) / 10);
  }

  // Recount Rate: % de ubicaciones que requirieron re-conteo
  const recountRatePercent = countedLocations > 0
    ? Math.round((recountRequiredCount / countedLocations) * 100 * 10) / 10
    : 0;

  // Operator Productivity Table
  const operatorProductivity: OperatorProductivityItem[] = Object.entries(operatorStats).map(([opName, data], idx) => {
    const totalMinutes = Math.round(data.totalSeconds / 60);
    const hours = data.totalSeconds / 3600;
    const locationsPerHour = hours > 0 ? Math.round((data.counts / hours) * 10) / 10 : data.counts * 15;
    const accuracyRate = data.counts > 0 ? Math.round((data.exactCounts / data.counts) * 100 * 10) / 10 : 100;

    return {
      operatorId: `OP-${idx + 1}`,
      operatorName: opName,
      countsCompleted: data.counts,
      totalTimeMinutes: totalMinutes,
      locationsPerHour,
      accuracyRate,
    };
  });

  // SOS Response Time
  const resolvedAlerts = sosAlerts.filter(a => a.status === 'RESOLVED' && a.responseTimeSeconds !== undefined);
  let avgSosResponseTimeSeconds = 0;
  if (resolvedAlerts.length > 0) {
    const totalSecs = resolvedAlerts.reduce((acc, curr) => acc + (curr.responseTimeSeconds || 0), 0);
    avgSosResponseTimeSeconds = Math.round(totalSecs / resolvedAlerts.length);
  } else {
    avgSosResponseTimeSeconds = 480; // Default 8 min benchmark
  }

  return {
    totalLocations,
    countedLocations,
    progressPercent,
    eriPercent,
    eruPercent,
    missingSkusCount,
    excessSkusCount,
    exactSkusCount: exactLocationsCount,
    totalMissingUnits,
    totalExcessUnits,
    totalTheoreticalUnits,
    totalCountedUnits,
    netFinancialDiscrepancy: Math.round(netFinancialDiscrepancy * 100) / 100,
    shrinkageFinancialCost: Math.round(shrinkageFinancialCost * 100) / 100,
    recountRatePercent,
    avgSosResponseTimeSeconds,
    operatorProductivity,
  };
}
