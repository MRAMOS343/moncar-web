import { useState, useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDebounce } from "@/hooks/useDebounce";
import { useIsMobile } from "@/hooks/use-mobile";
import { safeParseInt, safeParseFloat, validateInRange, validateInteger, validateNonEmptyArray } from "@/utils/validation";
import { getProductByIdSafe } from "@/utils/safeData";
import { logger } from "@/utils/logger";
import { LIMITS } from "@/constants/limits";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";
import { useProductCache } from "@/hooks/useProductCache";
import { Product, SaleItem } from "@/types";
import { Trash2, Plus, Search } from "lucide-react";
import { saleSchema, SaleFormData } from "@/schemas";
import { METODOS_PAGO, IVA_PREDETERMINADO } from "@/constants";
import { formatCurrency } from "@/utils/formatters";

interface SaleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warehouseId: string;
  onSave: (sale: SaleFormData) => void;
}

export function SaleModal({ open, onOpenChange, warehouseId, onSave }: SaleModalProps) {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { products } = useData();
  const { getProductName, getProductById: getProductByIdCached } = useProductCache();
  const [enviandoFormulario, setEnviandoFormulario] = useState(false);
  const [productos, setProductos] = useState<SaleItem[]>([]);
  const [productoSeleccionadoId, setProductoSeleccionadoId] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const busquedaDebounced = useDebounce(busquedaProducto, 300);
  const isMountedRef = useRef(true);

  // Configuración del formulario con validación
  const formulario = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      metodoPago: 'efectivo',
      cliente: "",
      items: [],
    },
  });

  // Filtrar productos basado en la búsqueda con debounce
  const productosFiltrados = useMemo(() => {
    if (!busquedaDebounced.trim()) {
      return products.slice(0, 10); // Limit initial results
    }
    const busquedaLower = busquedaDebounced.toLowerCase();
    return products.filter(producto =>
      producto.nombre.toLowerCase().includes(busquedaLower) ||
      producto.sku.toLowerCase().includes(busquedaLower) ||
      producto.marca.toLowerCase().includes(busquedaLower)
    );
  }, [busquedaDebounced, products]);

  // Calcular totales de la venta
  const totales = useMemo(() => {
    const subtotal = productos.reduce((suma, producto) => {
      const descuento = producto.discount || 0;
      const totalProducto = producto.qty * producto.unitPrice;
      return suma + (totalProducto - (totalProducto * descuento / 100));
    }, 0);
    
    const iva = subtotal * (IVA_PREDETERMINADO / 100);
    const total = subtotal + iva;

    return { subtotal, iva, total };
  }, [productos]);

  // Limpiar formulario cuando se abre el modal
  useEffect(() => {
    if (open) {
      formulario.reset({
        metodoPago: 'efectivo',
        cliente: "",
        items: [],
      });
      setProductos([]);
      setProductoSeleccionadoId("");
      setCantidad(1);
      setBusquedaProducto("");
    }
  }, [open, formulario]);

  const agregarProducto = () => {
    if (!productoSeleccionadoId) {
      toast({
        title: "Error",
        description: "Debe seleccionar un producto.",
        variant: "destructive",
      });
      return;
    }

    // Usar validación robusta con límites constantes
    const validacionCantidad = validateInRange(
      cantidad, 
      LIMITS.SALE.QUANTITY_MIN, 
      LIMITS.SALE.QUANTITY_MAX, 
      "Cantidad"
    );
    if (!validacionCantidad.valid) {
      toast({
        title: "Error",
        description: validacionCantidad.error,
        variant: "destructive",
      });
      return;
    }

    const validacionEntero = validateInteger(cantidad, "Cantidad");
    if (!validacionEntero.valid) {
      toast({
        title: "Error",
        description: validacionEntero.error,
        variant: "destructive",
      });
      return;
    }

    // Obtener producto de forma segura
    const producto = getProductByIdCached(productoSeleccionadoId);
    if (!producto) {
      toast({
        title: "Error",
        description: "El producto seleccionado no es válido.",
        variant: "destructive",
      });
      return;
    }

    // Verificar si el producto ya existe en la lista
    const indiceProductoExistente = productos.findIndex(item => item.productId === productoSeleccionadoId);
    
    if (indiceProductoExistente >= 0) {
      // Actualizar producto existente
      const productosActualizados = [...productos];
      productosActualizados[indiceProductoExistente].qty += cantidad;
      setProductos(productosActualizados);
    } else {
      // Agregar nuevo producto
      const nuevoProducto: SaleItem = {
        productId: productoSeleccionadoId,
        qty: cantidad,
        unitPrice: producto.precio,
        discount: 0,
      };
      setProductos([...productos, nuevoProducto]);
    }

    logger.info('Producto agregado a la venta', {
      productId: productoSeleccionadoId,
      cantidad,
      producto: producto.nombre
    });

    setProductoSeleccionadoId("");
    setCantidad(1);
    setBusquedaProducto("");
  };

  const eliminarProducto = (indice: number) => {
    setProductos(productos.filter((_, i) => i !== indice));
  };

  const actualizarCantidadProducto = (indice: number, qty: number) => {
    if (qty <= 0 || qty > 9999 || !Number.isInteger(qty)) return;
    const productosActualizados = [...productos];
    productosActualizados[indice].qty = qty;
    setProductos(productosActualizados);
  };

  const actualizarDescuentoProducto = (indice: number, descuento: number) => {
    if (descuento < 0 || descuento > 100) return;
    const productosActualizados = [...productos];
    productosActualizados[indice].discount = descuento;
    setProductos(productosActualizados);
  };

  const enviarFormulario = async (datos: SaleFormData) => {
    const validacionItems = validateNonEmptyArray(productos, "Productos");
    if (!validacionItems.valid) {
      toast({
        title: "Error",
        description: validacionItems.error,
        variant: "destructive",
      });
      return;
    }

    setEnviandoFormulario(true);

    try {
      const datosVenta = {
        ...datos,
        items: productos,
      };
      
      logger.info('Iniciando registro de venta', { total: totales.total });
      
      await onSave(datosVenta);
      
      if (!isMountedRef.current) {
        logger.warn('Componente desmontado antes de completar venta');
        return;
      }
      
      toast({
        title: "Venta registrada",
        description: `Venta por ${formatCurrency(totales.total)} registrada exitosamente.`,
      });
      
      logger.info('Venta registrada exitosamente', { total: totales.total });
      onOpenChange(false);
    } catch (error) {
      if (!isMountedRef.current) return;
      
      logger.error('Error al registrar venta:', error);
      toast({
        title: "Error",
        description: "Ha ocurrido un error al registrar la venta.",
        variant: "destructive",
      });
    } finally {
      if (isMountedRef.current) {
        setEnviandoFormulario(false);
      }
    }
  };

  // Use cached product name function from hook

  // Cleanup al desmontar componente y configurar isMountedRef
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      logger.debug('SaleModal desmontado, cancelando operaciones pendientes');
    };
  }, []);

  const FormContent = () => (
    <Form {...formulario}>
      <form onSubmit={formulario.handleSubmit(enviarFormulario)} className="space-y-6">
            {/* Detalles de la venta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={formulario.control}
                name="metodoPago"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de Pago *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar método" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {METODOS_PAGO.map((metodo) => (
                          <SelectItem key={metodo} value={metodo}>
                            {metodo.charAt(0).toUpperCase() + metodo.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formulario.control}
                name="cliente"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre del cliente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Add Product Section */}
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-semibold">Agregar Productos</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-2 block">Buscar Producto</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nombre, SKU o marca..."
                      value={busquedaProducto}
                      onChange={(e) => setBusquedaProducto(e.target.value)}
                      className="pl-8"
                      autoFocus
                    />
                  </div>
                  {busquedaProducto && (
                    <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-40 overflow-y-auto">
                      {productosFiltrados.slice(0, 5).map((producto) => (
                        <button
                          key={producto.id}
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
                          onClick={() => {
                            setProductoSeleccionadoId(producto.id);
                            setBusquedaProducto(`${producto.nombre} - ${producto.marca}`);
                          }}
                        >
                          <div>
                            <span className="font-medium">{producto.nombre}</span>
                            <span className="text-muted-foreground"> - {producto.marca}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            SKU: {producto.sku} | ${producto.precio}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Cantidad</label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    min="1"
                    value={cantidad}
                    onChange={(e) => setCantidad(safeParseInt(e.target.value, 1))}
                    placeholder="1"
                    className={isMobile ? "mobile-input" : ""}
                  />
                </div>

                <Button type="button" onClick={agregarProducto} disabled={!productoSeleccionadoId}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar
                </Button>
              </div>
            </div>

            {/* Tabla de productos */}
            {productos.length > 0 && (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead className="w-24">Cantidad</TableHead>
                      <TableHead className="w-28">Precio Unit.</TableHead>
                      <TableHead className="w-24">Desc. %</TableHead>
                      <TableHead className="w-28">Subtotal</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productos.map((producto, indice) => {
                      const subtotal = producto.qty * producto.unitPrice;
                      const descuento = producto.discount || 0;
                      const total = subtotal - (subtotal * descuento / 100);
                      
                      return (
                        <TableRow key={indice}>
                          <TableCell>
                            <div className="text-sm">
                              {getProductName(producto.productId)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              min="1"
                              value={producto.qty}
                              onChange={(e) => actualizarCantidadProducto(indice, safeParseInt(e.target.value, 1))}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              ${producto.unitPrice.toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              inputMode="decimal"
                              min="0"
                              max="100"
                              value={producto.discount || 0}
                              onChange={(e) => actualizarDescuentoProducto(indice, safeParseFloat(e.target.value, 0))}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              ${total.toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => eliminarProducto(indice)}
                              aria-label="Eliminar producto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Totales de la venta */}
            {productos.length > 0 && (
              <div className="flex justify-end">
                <div className="w-80 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${totales.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>IVA (16%):</span>
                    <span>${totales.iva.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>${totales.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {isMobile ? (
              <DrawerFooter>
                <Button type="submit" disabled={enviandoFormulario || productos.length === 0} className="mobile-button">
                  {enviandoFormulario ? "Registrando..." : "Registrar Venta"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  disabled={enviandoFormulario}
                  className="mobile-button"
                >
                  Cancelar
                </Button>
              </DrawerFooter>
            ) : (
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  disabled={enviandoFormulario}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={enviandoFormulario || productos.length === 0}>
                  {enviandoFormulario ? "Registrando..." : "Registrar Venta"}
                </Button>
              </DialogFooter>
            )}
          </form>
        </Form>
  );

  return isMobile ? (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[95vh]">
        <DrawerHeader>
          <DrawerTitle>Nueva Venta</DrawerTitle>
          <DrawerDescription>
            Registra una nueva venta agregando productos y especificando el método de pago.
          </DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-4">
          <FormContent />
        </div>
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Venta</DialogTitle>
          <DialogDescription>
            Registra una nueva venta agregando productos y especificando el método de pago.
          </DialogDescription>
        </DialogHeader>
        <FormContent />
      </DialogContent>
    </Dialog>
  );
}