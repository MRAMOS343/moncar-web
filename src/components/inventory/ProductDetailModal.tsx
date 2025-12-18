import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Package, Plus, X, Edit2, Check, Trash2 } from 'lucide-react';
import { Product, Inventory } from '@/types';
import { cn } from '@/lib/utils';
import { showSuccessToast } from '@/utils/toastHelpers';

// Predefined specifications for quick selection
const PREDEFINED_SPECIFICATIONS = [
  'Voltaje',
  'Corriente',
  'Material',
  'Peso',
  'Dimensiones',
  'Capacidad',
  'Potencia',
  'Resistencia',
  'Temperatura máxima',
  'Garantía',
  'Color',
  'Tamaño',
  'Amperaje',
  'Compatibilidad eléctrica',
];

interface InventoryWithProduct extends Inventory {
  product: Product;
}

interface Specification {
  id: string;
  label: string;
  value: string;
}

interface Compatibility {
  id: string;
  marca: string;
  modelo: string;
  año: string;
}

interface ProductDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryWithProduct | null;
}

// Mock data for specifications - in production this would come from DB
const getInitialSpecs = (product: Product): Specification[] => [
  { id: '1', label: 'Voltaje', value: '12 V' },
  { id: '2', label: 'Corriente', value: '100 A' },
  { id: '3', label: 'Material', value: 'Aluminio' },
  { id: '4', label: 'Peso', value: '2.5 kg' },
];

const getInitialCompatibility = (): Compatibility[] => [
  { id: '1', marca: 'Honda', modelo: 'Accord', año: '2018' },
  { id: '2', marca: 'Toyota', modelo: 'Camry', año: '2019' },
];

const getInitialEquivalences = (): string[] => [
  'Bosch',
  'Denso',
  'Valeo',
];

export function ProductDetailModal({ open, onOpenChange, item }: ProductDetailModalProps) {
  const [specifications, setSpecifications] = useState<Specification[]>([]);
  const [compatibilities, setCompatibilities] = useState<Compatibility[]>([]);
  const [equivalences, setEquivalences] = useState<string[]>([]);
  const [editingSpecId, setEditingSpecId] = useState<string | null>(null);
  const [newSpecLabel, setNewSpecLabel] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  const [showAddSpec, setShowAddSpec] = useState(false);
  const [specMode, setSpecMode] = useState<'select' | 'custom'>('select');
  const [selectedPredefinedSpec, setSelectedPredefinedSpec] = useState('');
  const [newEquivalence, setNewEquivalence] = useState('');
  const [showAddEquivalence, setShowAddEquivalence] = useState(false);
  const [showAddCompatibility, setShowAddCompatibility] = useState(false);
  const [newCompatibility, setNewCompatibility] = useState({ marca: '', modelo: '', año: '' });

  // Initialize data when modal opens with a new item
  const initializeData = () => {
    if (item) {
      setSpecifications(getInitialSpecs(item.product));
      setCompatibilities(getInitialCompatibility());
      setEquivalences(getInitialEquivalences());
    }
  };

  const handleAddCompatibility = () => {
    if (newCompatibility.marca.trim() && newCompatibility.modelo.trim() && newCompatibility.año.trim()) {
      const newCompat: Compatibility = {
        id: Date.now().toString(),
        marca: newCompatibility.marca.trim(),
        modelo: newCompatibility.modelo.trim(),
        año: newCompatibility.año.trim(),
      };
      setCompatibilities([...compatibilities, newCompat]);
      setNewCompatibility({ marca: '', modelo: '', año: '' });
      setShowAddCompatibility(false);
      showSuccessToast('Vehículo agregado', `${newCompat.marca} ${newCompat.modelo} ha sido agregado.`);
    }
  };

  const handleRemoveCompatibility = (id: string) => {
    setCompatibilities(compatibilities.filter(c => c.id !== id));
    showSuccessToast('Vehículo eliminado', 'El vehículo ha sido eliminado de la compatibilidad.');
  };

  // Reset state when modal opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && item) {
      initializeData();
    }
    onOpenChange(newOpen);
  };

  if (!item) return null;

  const { product, onHand } = item;

  const handleAddSpecification = () => {
    const label = specMode === 'select' ? selectedPredefinedSpec : newSpecLabel.trim();
    if (label && newSpecValue.trim()) {
      const newSpec: Specification = {
        id: Date.now().toString(),
        label: label,
        value: newSpecValue.trim(),
      };
      setSpecifications([...specifications, newSpec]);
      setNewSpecLabel('');
      setNewSpecValue('');
      setSelectedPredefinedSpec('');
      setShowAddSpec(false);
      setSpecMode('select');
      showSuccessToast('Especificación agregada', `${label} ha sido agregada.`);
    }
  };

  // Get available predefined specs (filter out already used ones)
  const availablePredefinedSpecs = PREDEFINED_SPECIFICATIONS.filter(
    spec => !specifications.some(s => s.label.toLowerCase() === spec.toLowerCase())
  );

  const handleRemoveSpecification = (id: string) => {
    setSpecifications(specifications.filter(spec => spec.id !== id));
    showSuccessToast('Especificación eliminada', 'La especificación ha sido eliminada.');
  };

  const handleUpdateSpecification = (id: string, newValue: string) => {
    setSpecifications(specifications.map(spec => 
      spec.id === id ? { ...spec, value: newValue } : spec
    ));
    setEditingSpecId(null);
  };

  const handleAddEquivalence = () => {
    if (newEquivalence.trim() && !equivalences.includes(newEquivalence.trim())) {
      setEquivalences([...equivalences, newEquivalence.trim()]);
      setNewEquivalence('');
      setShowAddEquivalence(false);
      showSuccessToast('Equivalencia agregada', `${newEquivalence} ha sido agregada.`);
    }
  };

  const handleRemoveEquivalence = (equiv: string) => {
    setEquivalences(equivalences.filter(e => e !== equiv));
    showSuccessToast('Equivalencia eliminada', 'La equivalencia ha sido eliminada.');
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-2xl font-bold">{product.nombre}</DialogTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>SKU: {product.sku}</span>
            <span>•</span>
            <span>{product.marca}</span>
            <span>•</span>
            <Badge variant="outline">{product.categoria}</Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column: Image and Compatibility */}
              <div className="space-y-6">
                {/* Product Image */}
                <div className="aspect-square bg-muted rounded-xl flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
                  <Package className="w-24 h-24 text-muted-foreground/30" />
                </div>

                {/* Compatibility Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-primary">Compatibilidad</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAddCompatibility(true)}
                      className="h-8 px-2"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Agregar
                    </Button>
                  </div>
                  <Separator />
                  
                  {showAddCompatibility && (
                    <div className="flex flex-col gap-2 p-3 bg-muted/50 rounded-lg">
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          placeholder="Marca"
                          value={newCompatibility.marca}
                          onChange={(e) => setNewCompatibility({ ...newCompatibility, marca: e.target.value })}
                        />
                        <Input
                          placeholder="Modelo"
                          value={newCompatibility.modelo}
                          onChange={(e) => setNewCompatibility({ ...newCompatibility, modelo: e.target.value })}
                        />
                        <Input
                          placeholder="Año"
                          value={newCompatibility.año}
                          onChange={(e) => setNewCompatibility({ ...newCompatibility, año: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddCompatibility()}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button size="sm" onClick={handleAddCompatibility}>
                          <Check className="w-4 h-4 mr-1" />
                          Agregar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => {
                            setShowAddCompatibility(false);
                            setNewCompatibility({ marca: '', modelo: '', año: '' });
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {compatibilities.map((compat) => (
                      <div 
                        key={compat.id}
                        className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 group hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span className="font-medium">{compat.marca}</span>
                          <span className="text-muted-foreground">{compat.modelo}</span>
                          <Badge variant="outline" className="text-xs">{compat.año}</Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveCompatibility(compat.id)}
                        >
                          <X className="w-3 h-3 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    {compatibilities.length === 0 && (
                      <p className="text-sm text-muted-foreground italic">
                        No hay vehículos compatibles registrados
                      </p>
                    )}
                  </div>

                  <div className="pt-2">
                    <Label className="text-muted-foreground text-sm">Stock</Label>
                    <p className="font-medium">{onHand} {product.unidad}</p>
                  </div>
                </div>

                {/* Equivalences Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Equivalencias</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAddEquivalence(true)}
                      className="h-8 px-2"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Agregar
                    </Button>
                  </div>
                  <Separator />
                  
                  {showAddEquivalence && (
                    <div className="flex gap-2 mb-3">
                      <Input
                        placeholder="Nueva equivalencia (ej: Bosch)"
                        value={newEquivalence}
                        onChange={(e) => setNewEquivalence(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddEquivalence()}
                        className="flex-1"
                      />
                      <Button size="sm" onClick={handleAddEquivalence}>
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => {
                          setShowAddEquivalence(false);
                          setNewEquivalence('');
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  <ul className="space-y-2">
                    {equivalences.map((equiv, index) => (
                      <li 
                        key={index} 
                        className="flex items-center justify-between group py-1.5 px-2 rounded-md hover:bg-muted/50"
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {equiv}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveEquivalence(equiv)}
                        >
                          <X className="w-3 h-3 text-destructive" />
                        </Button>
                      </li>
                    ))}
                    {equivalences.length === 0 && (
                      <p className="text-sm text-muted-foreground italic">
                        No hay equivalencias registradas
                      </p>
                    )}
                  </ul>
                </div>
              </div>

              {/* Right Column: Technical Specifications */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-primary">Ficha Técnica</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddSpec(true)}
                    className="h-8 px-2"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar
                  </Button>
                </div>
                <Separator />

                {showAddSpec && (
                  <div className="mb-3 p-4 bg-muted/50 rounded-lg space-y-4">
                    {/* Mode Toggle */}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={specMode === 'select' ? 'default' : 'outline'}
                        onClick={() => setSpecMode('select')}
                        className="flex-1"
                      >
                        Seleccionar existente
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={specMode === 'custom' ? 'default' : 'outline'}
                        onClick={() => setSpecMode('custom')}
                        className="flex-1"
                      >
                        Agregar nuevo
                      </Button>
                    </div>

                    {/* Input Fields */}
                    <div className="flex gap-2">
                      {specMode === 'select' ? (
                        <Select
                          value={selectedPredefinedSpec}
                          onValueChange={setSelectedPredefinedSpec}
                        >
                          <SelectTrigger className="flex-1 bg-background">
                            <SelectValue placeholder="Selecciona una especificación" />
                          </SelectTrigger>
                          <SelectContent>
                            {availablePredefinedSpecs.length > 0 ? (
                              availablePredefinedSpecs.map((spec) => (
                                <SelectItem key={spec} value={spec}>
                                  {spec}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                                Todas las especificaciones predefinidas ya están en uso
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          placeholder="Nueva etiqueta (ej: Longitud)"
                          value={newSpecLabel}
                          onChange={(e) => setNewSpecLabel(e.target.value)}
                          className="flex-1"
                        />
                      )}
                      <Input
                        placeholder="Valor"
                        value={newSpecValue}
                        onChange={(e) => setNewSpecValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddSpecification()}
                        className="flex-1"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2">
                      <Button size="sm" onClick={handleAddSpecification}>
                        <Check className="w-4 h-4 mr-1" />
                        Agregar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => {
                          setShowAddSpec(false);
                          setNewSpecLabel('');
                          setNewSpecValue('');
                          setSelectedPredefinedSpec('');
                          setSpecMode('select');
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  {specifications.map((spec) => (
                    <div 
                      key={spec.id}
                      className={cn(
                        "flex items-center justify-between py-3 px-3 rounded-lg group",
                        "hover:bg-muted/50 transition-colors"
                      )}
                    >
                      <span className="text-muted-foreground font-medium min-w-[100px]">
                        {spec.label}:
                      </span>
                      
                      {editingSpecId === spec.id ? (
                        <div className="flex items-center gap-2 flex-1 ml-4">
                          <Input
                            defaultValue={spec.value}
                            className="h-8"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleUpdateSpecification(spec.id, e.currentTarget.value);
                              } else if (e.key === 'Escape') {
                                setEditingSpecId(null);
                              }
                            }}
                            autoFocus
                          />
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => setEditingSpecId(null)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className="font-medium flex-1 text-right">{spec.value}</span>
                          <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => setEditingSpecId(spec.id)}
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                              onClick={() => handleRemoveSpecification(spec.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  
                  {specifications.length === 0 && (
                    <p className="text-sm text-muted-foreground italic py-4 text-center">
                      No hay especificaciones registradas
                    </p>
                  )}
                </div>

                {/* Price Info */}
                <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground">Precio:</span>
                    <span className="text-xl font-bold">${product.precio.toLocaleString('es-MX')} MXN</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">IVA ({product.iva}%):</span>
                    <span>${(product.precio * product.iva / 100).toLocaleString('es-MX')} MXN</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Total:</span>
                    <span className="text-lg font-bold text-primary">
                      ${(product.precio * (1 + product.iva / 100)).toLocaleString('es-MX')} MXN
                    </span>
                  </div>
                </div>

                {/* Description */}
                {product.descripcion && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Descripción</h4>
                    <p className="text-sm text-muted-foreground">{product.descripcion}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
