/**
 * Exporta datos a un archivo CSV
 * @param data Array de objetos con los datos a exportar
 * @param filename Nombre del archivo (sin extensión)
 * @param columns Opcional: Columnas específicas a exportar con sus headers personalizados
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; header: string }[]
) {
  if (data.length === 0) {
    console.warn('No hay datos para exportar');
    return;
  }

  // Determinar columnas a exportar
  const columnsToExport = columns || 
    Object.keys(data[0]).map(key => ({ key: key as keyof T, header: key }));

  // Crear headers
  const headers = columnsToExport.map(col => col.header).join(',');

  // Crear filas
  const rows = data.map(row => 
    columnsToExport.map(col => {
      const value = row[col.key];
      // Escapar valores que contienen comas o comillas
      const stringValue = String(value ?? '');
      return stringValue.includes(',') || stringValue.includes('"')
        ? `"${stringValue.replace(/"/g, '""')}"`
        : stringValue;
    }).join(',')
  );

  // Combinar headers y rows
  const csv = [headers, ...rows].join('\n');

  // Crear blob y descargar
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
