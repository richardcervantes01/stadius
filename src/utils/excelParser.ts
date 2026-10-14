import * as XLSX from 'xlsx';
import { MasterInventoryItem, StorageType, ExcelImportPreview, ExcelValidationError } from '../types/inventory';

// Normalize header text for resilient matching
function normalizeHeader(header: string): string {
  return (header || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .trim()
    .replace(/[^a-z0-9]/g, '');
}

export function parseExcelOrCsvFile(
  fileBuffer: ArrayBuffer,
  fileName: string,
  storageType: StorageType
): ExcelImportPreview {
  const workbook = XLSX.read(fileBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // Convert to JSON with raw headers
  const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  const validRows: MasterInventoryItem[] = [];
  const errors: ExcelValidationError[] = [];
  const seenLocationsAndSkus = new Set<string>();

  if (rawRows.length === 0) {
    errors.push({
      row: 1,
      field: 'Archivo',
      message: 'El archivo está vacío o no contiene filas con datos válidos.',
    });
    return {
      validRows: [],
      errors,
      totalParsed: 0,
      validCount: 0,
      errorCount: errors.length,
    };
  }

  // Find column mapping by analyzing first row keys
  const sampleRow = rawRows[0];
  const keys = Object.keys(sampleRow);

  const getColValue = (row: Record<string, unknown>, targets: string[]): string => {
    for (const key of keys) {
      const norm = normalizeHeader(key);
      if (targets.some(t => norm.includes(t) || t.includes(norm))) {
        const val = row[key];
        return val !== undefined && val !== null ? String(val).trim() : '';
      }
    }
    return '';
  };

  rawRows.forEach((row, index) => {
    const rowNum = index + 2; // Row in spreadsheet (1-indexed + header)

    const warehouse = getColValue(row, ['bodega', 'almacen', 'warehouse', 'centro']);
    const aisle = getColValue(row, ['pasillo', 'rack', 'aisle', 'zona']);
    const locationCode = getColValue(row, ['ubicacion', 'location', 'posicion', 'modulo', 'hueco']);
    const verticalLevel = storageType === 'RACK_HEIGHT' 
      ? getColValue(row, ['altura', 'viga', 'height', 'nivelaltura'])
      : getColValue(row, ['nivel', 'piso', 'floor', 'bahia']);
    const sku = getColValue(row, ['sku', 'codigo', 'codigoproducto', 'item', 'articulo', 'material']);
    const description = getColValue(row, ['descripcion', 'nombre', 'producto', 'description', 'detalle']);
    const batch = getColValue(row, ['lote', 'batch', 'lot', 'serie']);
    const rawQty = getColValue(row, ['cantidad', 'teorica', 'qty', 'stock', 'existencia', 'saldo']);
    const rawCost = getColValue(row, ['costo', 'costounitario', 'precio', 'unitcost', 'valor']);
    const rawCategory = getColValue(row, ['categoria', 'clase', 'familia', 'category', 'abcrotacion']);

    let rowHasError = false;

    if (!warehouse) {
      errors.push({ row: rowNum, field: 'Bodega', message: 'El campo Bodega / Almacén es obligatorio.' });
      rowHasError = true;
    }
    if (!aisle) {
      errors.push({ row: rowNum, field: 'Pasillo/Rack', message: 'El campo Pasillo / Rack es obligatorio.' });
      rowHasError = true;
    }
    if (!locationCode) {
      errors.push({ row: rowNum, field: 'Ubicación', message: 'El campo Ubicación física es obligatorio.' });
      rowHasError = true;
    }
    if (!verticalLevel) {
      errors.push({ 
        row: rowNum, 
        field: storageType === 'RACK_HEIGHT' ? 'Altura' : 'Nivel', 
        message: storageType === 'RACK_HEIGHT' ? 'Debe especificar la Altura en Rack (ej: A, B, C).' : 'Debe especificar el Nivel de Piso (ej: Nivel 1, Remonte).' 
      });
      rowHasError = true;
    }
    if (!sku) {
      errors.push({ row: rowNum, field: 'SKU', message: 'El código de SKU / Artículo es obligatorio.' });
      rowHasError = true;
    }
    if (!description) {
      errors.push({ row: rowNum, field: 'Descripción', message: 'La descripción del producto es obligatoria.' });
      rowHasError = true;
    }

    // Number conversions
    const parsedQty = parseFloat(rawQty.replace(',', '.'));
    if (isNaN(parsedQty) || parsedQty < 0) {
      errors.push({ row: rowNum, field: 'Cantidad Teórica', message: `Cantidad inválida: "${rawQty}". Debe ser un número >= 0.` });
      rowHasError = true;
    }

    // Unit cost conversion (defaults to 0.0 if not specified in file)
    const parsedCost = rawCost ? parseFloat(rawCost.replace(',', '.')) : 0.0;
    const finalCost = isNaN(parsedCost) || parsedCost < 0 ? 0.0 : parsedCost;

    // Duplicate detection in file (Same location + SKU)
    const duplicateKey = `${warehouse}::${locationCode}::${sku}::${batch || 'NONE'}`;
    if (seenLocationsAndSkus.has(duplicateKey)) {
      errors.push({ row: rowNum, field: 'Duplicado', message: `Ubicación ${locationCode} con SKU ${sku} ya está repetida en el archivo.` });
      rowHasError = true;
    } else {
      seenLocationsAndSkus.add(duplicateKey);
    }

    const rawClient = getColValue(row, ['cliente', 'client', 'cuenta', 'empresa']);
    const rawPeriod = getColValue(row, ['periodo', 'period', 'mes']);
    const rawDate = getColValue(row, ['fecha', 'date', 'fechacarga']);

    if (!rowHasError) {
      validRows.push({
        id: `IMP-${Date.now()}-${index}`,
        clientName: rawClient || 'Retail Pro S.A.',
        period: rawPeriod || '2026-10',
        uploadDate: rawDate || new Date().toISOString().substring(0, 10),
        warehouse,
        aisle,
        locationCode,
        verticalLevel,
        sku,
        description,
        batch: batch || undefined,
        theoreticalQty: parsedQty,
        unitCost: finalCost,
        category: rawCategory || 'B - General',
        storageType,
      });
    }
  });

  return {
    validRows,
    errors,
    totalParsed: rawRows.length,
    validCount: validRows.length,
    errorCount: errors.length,
  };
}

/**
 * Generates and downloads a ready-to-use Excel template with sample warehouse records
 */
export function downloadTemplateFile(type: StorageType) {
  const isRack = type === 'RACK_HEIGHT';

  const sampleData = isRack
    ? [
        {
          Bodega: 'B01 - Bodega Central',
          Pasillo: 'Pasillo 01',
          Ubicacion: 'P01-R01-01',
          Altura: 'Altura A (Piso)',
          SKU: 'SKU-ELEC-401',
          Descripcion: 'Batería Industrial Litio 48V 100Ah',
          Lote: 'LOT-2026-A1',
          Cantidad_Teorica: 18,
          Categoria: 'A - Alta Rotación',
        },
        {
          Bodega: 'B01 - Bodega Central',
          Pasillo: 'Pasillo 01',
          Ubicacion: 'P01-R01-02',
          Altura: 'Altura B (Media)',
          SKU: 'SKU-ELEC-402',
          Descripcion: 'Inversor Solar Híbrido 5kW Onda Pura',
          Lote: 'LOT-2026-A2',
          Cantidad_Teorica: 24,
          Categoria: 'A - Alta Rotación',
        },
        {
          Bodega: 'B01 - Bodega Central',
          Pasillo: 'Pasillo 02',
          Ubicacion: 'P02-R02-01',
          Altura: 'Altura C (Superior)',
          SKU: 'SKU-HERR-801',
          Descripcion: 'Taladro Percutor Brushless 20V Kit Pro',
          Lote: 'LOT-2026-H1',
          Cantidad_Teorica: 35,
          Categoria: 'B - Media Rotación',
        },
      ]
    : [
        {
          Bodega: 'B01 - Bodega Central',
          Pasillo: 'Zona Piso N-01',
          Ubicacion: 'ZPN-01-B01',
          Nivel: 'Nivel 1 (Piso Directo)',
          SKU: 'SKU-EST-901',
          Descripcion: 'Pallet Estiba Madera Certificada NIMF-15',
          Lote: 'LOTE-STD',
          Cantidad_Teorica: 120,
          Categoria: 'B - Media Rotación',
        },
        {
          Bodega: 'B01 - Bodega Central',
          Pasillo: 'Zona Piso N-01',
          Ubicacion: 'ZPN-01-B02',
          Nivel: 'Nivel 2 (Remonte)',
          SKU: 'SKU-EST-902',
          Descripcion: 'Contenedor Plástico Plegable 600x400x320',
          Lote: 'LOTE-STD',
          Cantidad_Teorica: 95,
          Categoria: 'B - Media Rotación',
        },
      ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const colWidths = Object.keys(sampleData[0]).map(() => ({ wch: 22 }));
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, isRack ? 'Plantilla_Racks_Altura' : 'Plantilla_Piso_Nivel');

  const fileName = isRack 
    ? 'Plantilla_Inventario_Racks_Altura.xlsx' 
    : 'Plantilla_Inventario_Piso_Nivel.xlsx';

  XLSX.writeFile(workbook, fileName);
}

/**
 * Downloads a template specifically for SKU Prices / Valuation
 */
export function downloadPriceTemplateFile() {
  const samplePrices = [
    {
      SKU: 'SKU-ELEC-401',
      Descripcion: 'Batería Industrial Litio 48V 100Ah',
      Costo_Unitario: 450.00,
      Moneda: 'USD',
    },
    {
      SKU: 'SKU-ELEC-402',
      Descripcion: 'Inversor Solar Híbrido 5kW Onda Pura',
      Costo_Unitario: 320.00,
      Moneda: 'USD',
    },
    {
      SKU: 'SKU-CAB-110',
      Descripcion: 'Bobina Cable Cobre THW 10AWG 100m',
      Costo_Unitario: 85.50,
      Moneda: 'USD',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(samplePrices);
  worksheet['!cols'] = [{ wch: 18 }, { wch: 38 }, { wch: 16 }, { wch: 10 }];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Catalogo_Precios');
  XLSX.writeFile(workbook, 'Plantilla_Catalogo_Precios_SKU.xlsx');
}

/**
 * Parses an Excel or CSV file with SKU and Cost/Price
 */
export function parsePricesFile(fileBuffer: ArrayBuffer): {
  prices: { sku: string; description: string; unitCost: number; currency: string }[];
  errors: string[];
} {
  const workbook = XLSX.read(fileBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  const prices: { sku: string; description: string; unitCost: number; currency: string }[] = [];
  const errors: string[] = [];

  rawRows.forEach((row, idx) => {
    const keys = Object.keys(row);
    let sku = '';
    let description = '';
    let rawCost = '';
    let currency = 'USD';

    for (const k of keys) {
      const norm = k.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (norm.includes('sku') || norm.includes('codigo') || norm.includes('item') || norm.includes('articulo')) {
        sku = String(row[k]).trim();
      } else if (norm.includes('desc') || norm.includes('nombre') || norm.includes('producto')) {
        description = String(row[k]).trim();
      } else if (norm.includes('costo') || norm.includes('precio') || norm.includes('valor') || norm.includes('price')) {
        rawCost = String(row[k]).trim();
      } else if (norm.includes('moneda') || norm.includes('currency')) {
        currency = String(row[k]).trim() || 'USD';
      }
    }

    if (!sku) {
      errors.push(`Fila ${idx + 2}: SKU vacío.`);
      return;
    }

    const parsedCost = parseFloat(rawCost.replace(',', '.'));
    if (isNaN(parsedCost) || parsedCost < 0) {
      errors.push(`Fila ${idx + 2} (${sku}): Costo inválido "${rawCost}".`);
      return;
    }

    prices.push({
      sku,
      description: description || sku,
      unitCost: parsedCost,
      currency: currency || 'USD',
    });
  });

  return { prices, errors };
}
