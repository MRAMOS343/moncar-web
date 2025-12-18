import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { userProfileSchema, UserProfileFormData } from '@/schemas/userProfileSchema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { User, Building2, Package, Shield, Settings, Bell } from "lucide-react";
import { showSuccessToast } from "@/utils/toastHelpers";

export default function ConfiguracionPage() {
  const { currentUser, updateUserRole } = useAuth();
  
  // Formulario de Perfil con validación
  const profileForm = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      nombre: currentUser?.nombre || "",
      email: currentUser?.email || "",
      telefono: ""
    }
  });

  // Estado para Configuración de Empresa
  const [companySettings, setCompanySettings] = useState({
    nombreEmpresa: "Refaccionaria AutoParts",
    rfc: "RPM850101ABC",
    direccion: "Av. Insurgentes Sur 1234, CDMX",
    telefono: "55-1234-5678",
  });

  // Estado para Configuración de Inventario
  const [inventorySettings, setInventorySettings] = useState({
    stockMinimo: "10",
    alertasActivas: true,
    formatoSKU: "AUTO-####",
  });

  // Estado para Notificaciones
  const [notifications, setNotifications] = useState({
    stockBajo: true,
    nuevasVentas: true,
    nuevosProveedores: false,
    reportesDiarios: true,
  });

  const handleSaveProfile = profileForm.handleSubmit((data: UserProfileFormData) => {
    showSuccessToast("Perfil actualizado", "Los cambios se han guardado correctamente.");
  });

  const handleSaveCompany = () => {
    showSuccessToast("Configuración de empresa actualizada", "Los cambios se han guardado correctamente.");
  };

  const handleSaveInventory = () => {
    showSuccessToast("Configuración de inventario actualizada", "Los cambios se han guardado correctamente.");
  };

  const handleSaveNotifications = () => {
    showSuccessToast("Preferencias de notificaciones actualizadas", "Los cambios se han guardado correctamente.");
  };

  return (
    <main role="main" aria-label="Contenido principal">
      <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">
          Gestiona las preferencias y configuraciones del sistema
        </p>
      </div>

      <Tabs defaultValue="perfil" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="perfil" className="gap-2">
            <User className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="empresa" className="gap-2">
            <Building2 className="h-4 w-4" />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="inventario" className="gap-2">
            <Package className="h-4 w-4" />
            Inventario
          </TabsTrigger>
          <TabsTrigger value="permisos" className="gap-2">
            <Shield className="h-4 w-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="sistema" className="gap-2">
            <Settings className="h-4 w-4" />
            Sistema
          </TabsTrigger>
        </TabsList>

        {/* Pestaña: Perfil de Usuario */}
        <TabsContent value="perfil" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>
                Actualiza tu información de perfil y preferencias
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre completo</Label>
                  <Input
                    id="nombre"
                    {...profileForm.register('nombre')}
                  />
                  {profileForm.formState.errors.nombre && (
                    <p className="text-sm text-destructive">{profileForm.formState.errors.nombre.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...profileForm.register('email')}
                  />
                  {profileForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{profileForm.formState.errors.email.message}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  {...profileForm.register('telefono')}
                  placeholder="55-1234-5678"
                />
                {profileForm.formState.errors.telefono && (
                  <p className="text-sm text-destructive">{profileForm.formState.errors.telefono.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rol actual</Label>
                <Select value={currentUser?.role} onValueChange={(value) => updateUserRole(value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="gerente">Gerente</SelectItem>
                    <SelectItem value="cajero">Cajero</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSaveProfile} className="btn-hover">Guardar cambios</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notificaciones</CardTitle>
              <CardDescription>
                Configura qué alertas deseas recibir
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alertas de stock bajo</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibir notificaciones cuando el inventario esté bajo
                  </p>
                </div>
                <Switch
                  checked={notifications.stockBajo}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, stockBajo: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Nuevas ventas</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificar sobre cada venta realizada
                  </p>
                </div>
                <Switch
                  checked={notifications.nuevasVentas}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, nuevasVentas: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Nuevos proveedores</Label>
                  <p className="text-sm text-muted-foreground">
                    Alertas cuando se registren nuevos proveedores
                  </p>
                </div>
                <Switch
                  checked={notifications.nuevosProveedores}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, nuevosProveedores: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Reportes diarios</Label>
                  <p className="text-sm text-muted-foreground">
                    Resumen diario de actividad por email
                  </p>
                </div>
                <Switch
                  checked={notifications.reportesDiarios}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, reportesDiarios: checked })}
                />
              </div>
              <Button onClick={handleSaveNotifications} className="btn-hover">Guardar preferencias</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña: Configuración de Empresa */}
        <TabsContent value="empresa" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Datos de la Empresa</CardTitle>
              <CardDescription>
                Información general y fiscal de tu negocio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombreEmpresa">Nombre de la empresa</Label>
                <Input
                  id="nombreEmpresa"
                  value={companySettings.nombreEmpresa}
                  onChange={(e) => setCompanySettings({ ...companySettings, nombreEmpresa: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rfc">RFC</Label>
                  <Input
                    id="rfc"
                    value={companySettings.rfc}
                    onChange={(e) => setCompanySettings({ ...companySettings, rfc: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefonoEmpresa">Teléfono</Label>
                  <Input
                    id="telefonoEmpresa"
                    value={companySettings.telefono}
                    onChange={(e) => setCompanySettings({ ...companySettings, telefono: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección fiscal</Label>
                <Textarea
                  id="direccion"
                  value={companySettings.direccion}
                  onChange={(e) => setCompanySettings({ ...companySettings, direccion: e.target.value })}
                  rows={3}
                />
              </div>
              <Button onClick={handleSaveCompany} className="btn-hover">Guardar cambios</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña: Configuración de Inventario */}
        <TabsContent value="inventario" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Parámetros de Inventario</CardTitle>
              <CardDescription>
                Configura alertas y formatos para la gestión de productos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stockMinimo">Stock mínimo global (unidades)</Label>
                <Input
                  id="stockMinimo"
                  type="number"
                  value={inventorySettings.stockMinimo}
                  onChange={(e) => setInventorySettings({ ...inventorySettings, stockMinimo: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">
                  Umbral predeterminado para alertas de inventario bajo
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alertas automáticas</Label>
                  <p className="text-sm text-muted-foreground">
                    Activar notificaciones cuando el stock esté por debajo del mínimo
                  </p>
                </div>
                <Switch
                  checked={inventorySettings.alertasActivas}
                  onCheckedChange={(checked) => setInventorySettings({ ...inventorySettings, alertasActivas: checked })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="formatoSKU">Formato de SKU</Label>
                <Input
                  id="formatoSKU"
                  value={inventorySettings.formatoSKU}
                  onChange={(e) => setInventorySettings({ ...inventorySettings, formatoSKU: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">
                  Ejemplo: AUTO-#### genera códigos como AUTO-0001
                </p>
              </div>
              <Button onClick={handleSaveInventory} className="btn-hover">Guardar configuración</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña: Roles y Permisos */}
        <TabsContent value="permisos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Roles</CardTitle>
              <CardDescription>
                Define los permisos para cada rol del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Administrador</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Acceso completo a todas las funcionalidades del sistema
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Switch checked disabled />
                      <Label className="text-sm">Gestión de inventario</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked disabled />
                      <Label className="text-sm">Ventas y compras</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked disabled />
                      <Label className="text-sm">Reportes y predicciones</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked disabled />
                      <Label className="text-sm">Gestión de usuarios</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked disabled />
                      <Label className="text-sm">Configuración del sistema</Label>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Gerente</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Gestión de operaciones y supervisión de equipos
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Switch checked disabled />
                      <Label className="text-sm">Gestión de inventario</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked disabled />
                      <Label className="text-sm">Ventas y compras</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked disabled />
                      <Label className="text-sm">Reportes y predicciones</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch disabled />
                      <Label className="text-sm text-muted-foreground">Gestión de usuarios</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch disabled />
                      <Label className="text-sm text-muted-foreground">Configuración del sistema</Label>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Cajero</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Operaciones básicas de venta y consulta
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Switch checked disabled />
                      <Label className="text-sm">Consulta de inventario</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked disabled />
                      <Label className="text-sm">Registro de ventas</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch disabled />
                      <Label className="text-sm text-muted-foreground">Reportes y predicciones</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch disabled />
                      <Label className="text-sm text-muted-foreground">Gestión de usuarios</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch disabled />
                      <Label className="text-sm text-muted-foreground">Configuración del sistema</Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña: Sistema */}
        <TabsContent value="sistema" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información del Sistema</CardTitle>
              <CardDescription>
                Detalles técnicos y configuraciones avanzadas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">Versión</Label>
                  <p className="font-medium">1.0.0</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">Último respaldo</Label>
                  <p className="font-medium">Hoy, 08:00</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">Base de datos</Label>
                  <p className="font-medium">Local Storage</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">Usuarios activos</Label>
                  <p className="font-medium">3</p>
                </div>
              </div>
              <div className="pt-4 space-y-2">
                <Button variant="outline" className="w-full">
                  Exportar datos
                </Button>
                <Button variant="outline" className="w-full">
                  Limpiar caché
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </main>
  );
}
