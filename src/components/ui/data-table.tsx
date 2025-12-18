import { useState, useMemo, memo } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { cn } from "@/lib/utils";

// Definición de columna para la tabla
export interface Columna<T> {
  key: keyof T | string; // Clave del campo a mostrar
  header: string; // Texto del encabezado
  sortable?: boolean; // Si se puede ordenar por esta columna
  render?: (value: any, row: T) => React.ReactNode; // Función personalizada de renderizado
  className?: string; // Clases CSS adicionales
}

// Propiedades del componente DataTable
interface PropiedadesDataTable<T> {
  data: T[]; // Datos a mostrar en la tabla
  columns: Columna<T>[]; // Definición de columnas
  loading?: boolean; // Estado de carga
  searchable?: boolean; // Si permite búsqueda
  searchPlaceholder?: string; // Texto del placeholder de búsqueda
  pageSize?: number; // Número de elementos por página
  emptyMessage?: string; // Mensaje cuando no hay datos
  emptyDescription?: string; // Descripción adicional cuando no hay datos
  className?: string; // Clases CSS adicionales
}

type DireccionOrdenamiento = 'asc' | 'desc' | null;

function DataTableComponent<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  searchable = false,
  searchPlaceholder = "Buscar...",
  pageSize = 10,
  emptyMessage = "No hay datos disponibles",
  emptyDescription = "No se encontraron registros para mostrar",
  className
}: PropiedadesDataTable<T>) {
  // Estados del componente para manejar búsqueda, paginación y ordenamiento
  const [consultaBusqueda, setConsultaBusqueda] = useState("");
  const debouncedSearchQuery = useDebounce(consultaBusqueda, 300);
  const [paginaActual, setPaginaActual] = useState(1);
  const [campoOrdenamiento, setCampoOrdenamiento] = useState<keyof T | string | null>(null);
  const [direccionOrdenamiento, setDireccionOrdenamiento] = useState<DireccionOrdenamiento>(null);
  const [filasPorPagina, setFilasPorPagina] = useState(pageSize);

  // Filtrar y ordenar datos
  const datosProcesados = useMemo(() => {
    let filtrados = data;

    // Filtrado por búsqueda con debounce
    if (debouncedSearchQuery && searchable) {
      filtrados = data.filter(fila =>
        Object.values(fila).some(valor =>
          String(valor).toLowerCase().includes(debouncedSearchQuery.toLowerCase())
        )
      );
    }

    // Ordenamiento
    if (campoOrdenamiento && direccionOrdenamiento) {
      filtrados = [...filtrados].sort((a, b) => {
        const valorA = a[campoOrdenamiento];
        const valorB = b[campoOrdenamiento];
        
        if (valorA === valorB) return 0;
        
        const comparacion = valorA < valorB ? -1 : 1;
        return direccionOrdenamiento === 'asc' ? comparacion : -comparacion;
      });
    }

    return filtrados;
  }, [data, debouncedSearchQuery, searchable, campoOrdenamiento, direccionOrdenamiento]);

  // Paginación
  const totalPaginas = Math.ceil(datosProcesados.length / filasPorPagina);
  const indiceInicio = (paginaActual - 1) * filasPorPagina;
  const datosPaginados = datosProcesados.slice(indiceInicio, indiceInicio + filasPorPagina);

  // Resetear página cuando cambian los datos
  useMemo(() => {
    setPaginaActual(1);
  }, [datosProcesados.length]);

  const manejarOrdenamiento = (campo: keyof T | string) => {
    const columna = columns.find(col => col.key === campo);
    if (!columna?.sortable) return;

    if (campoOrdenamiento === campo) {
      setDireccionOrdenamiento(
        direccionOrdenamiento === 'asc' ? 'desc' : 
        direccionOrdenamiento === 'desc' ? null : 'asc'
      );
      if (direccionOrdenamiento === 'desc') {
        setCampoOrdenamiento(null);
      }
    } else {
      setCampoOrdenamiento(campo);
      setDireccionOrdenamiento('asc');
    }
  };

  const obtenerIconoOrdenamiento = (campo: keyof T | string) => {
    if (campoOrdenamiento !== campo) return <ArrowUpDown className="w-4 h-4" />;
    if (direccionOrdenamiento === 'asc') return <ArrowUp className="w-4 h-4" />;
    if (direccionOrdenamiento === 'desc') return <ArrowDown className="w-4 h-4" />;
    return <ArrowUpDown className="w-4 h-4" />;
  };

  const irAPagina = (pagina: number) => {
    setPaginaActual(Math.max(1, Math.min(pagina, totalPaginas)));
  };

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        {searchable && (
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Skeleton className="h-10 w-full max-w-sm" />
          </div>
        )}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead key={index}>
                    <Skeleton className="h-4 w-20" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Accessibility: Screen reader announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {loading 
          ? `Cargando ${searchable ? 'resultados de búsqueda' : 'datos'}...` 
          : `Mostrando ${datosProcesados.length} ${datosProcesados.length === 1 ? 'resultado' : 'resultados'}${totalPaginas > 1 ? `. Página ${paginaActual} de ${totalPaginas}` : ''}.`
        }
      </div>

      {/* Search and Controls */}
      {searchable && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={consultaBusqueda}
              onChange={(e) => setConsultaBusqueda(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead 
                  key={index}
                  className={cn(
                    column.sortable && "cursor-pointer hover:bg-muted/50 select-none",
                    column.className
                  )}
                  onClick={() => column.sortable && manejarOrdenamiento(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable && obtenerIconoOrdenamiento(column.key)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {datosPaginados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8">
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-muted-foreground">
                      {emptyMessage}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {emptyDescription}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              datosPaginados.map((fila, indice) => (
                <TableRow key={indice}>
                  {columns.map((columna, indiceColumna) => (
                    <TableCell key={indiceColumna} className={columna.className}>
                      {columna.render 
                        ? columna.render(fila[columna.key], fila)
                        : String(fila[columna.key] || '-')
                      }
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Filas por página:</span>
            <Select
              value={String(filasPorPagina)}
              onValueChange={(valor) => {
                setFilasPorPagina(Number(valor));
                setPaginaActual(1);
              }}
            >
              <SelectTrigger className="w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              {indiceInicio + 1}-{Math.min(indiceInicio + filasPorPagina, datosProcesados.length)} de {datosProcesados.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => irAPagina(1)}
              disabled={paginaActual === 1}
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => irAPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                let numeroPagina;
                if (totalPaginas <= 5) {
                  numeroPagina = i + 1;
                } else if (paginaActual <= 3) {
                  numeroPagina = i + 1;
                } else if (paginaActual >= totalPaginas - 2) {
                  numeroPagina = totalPaginas - 4 + i;
                } else {
                  numeroPagina = paginaActual - 2 + i;
                }

                return (
                  <Button
                    key={i}
                    variant={paginaActual === numeroPagina ? "default" : "outline"}
                    size="sm"
                    onClick={() => irAPagina(numeroPagina)}
                    className="w-8"
                  >
                    {numeroPagina}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => irAPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => irAPagina(totalPaginas)}
              disabled={paginaActual === totalPaginas}
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Memoized export for performance
export const DataTable = memo(DataTableComponent) as <T extends Record<string, any>>(props: PropiedadesDataTable<T>) => JSX.Element;