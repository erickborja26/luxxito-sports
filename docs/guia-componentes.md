# Guía corta de componentes de diseño

Esta guía describe los componentes compartidos de UI y su uso recomendado. Usa estos wrappers y componentes para mantener consistencia visual y evitar estilos inline.

## Botones
Usa los componentes de intención en lugar de variantes directas.

### ButtonPrimary
Para la acción principal de cada pantalla.
```tsx
import { ButtonPrimary } from "@/components/ui/button-intents";

<ButtonPrimary onClick={handleSubmit}>Guardar</ButtonPrimary>
```

### ButtonSecondary
Para acciones secundarias o menos prioritarias.
```tsx
import { ButtonSecondary } from "@/components/ui/button-intents";

<ButtonSecondary onClick={handleCancel}>Cancelar</ButtonSecondary>
```

### ButtonDanger
Para acciones de eliminación, cancelación o riesgo.
```tsx
import { ButtonDanger } from "@/components/ui/button-intents";

<ButtonDanger onClick={handleDelete}>Eliminar</ButtonDanger>
```

## BadgeEstado
Usa `BadgeEstado` para estados de reserva, inventario e incidencias.

```tsx
import { BadgeEstado } from "@/components/ui/badge-estado";

<BadgeEstado status="CONFIRMADA" />
<BadgeEstado status="CANCELADA" />
```

## Modal
Usa el wrapper `Modal` para no exponer la API de Radix directamente.

```tsx
import {
  Modal,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  ModalClose,
} from "@/components/ui/modal";

<Modal>
  <ModalTrigger>Mostrar modal</ModalTrigger>
  <ModalContent>
    <ModalHeader>
      <ModalTitle>Confirmar acción</ModalTitle>
      <ModalDescription>¿Deseas continuar con este cambio?</ModalDescription>
    </ModalHeader>
    <ModalFooter>
      <ModalClose asChild>
        <button className="btn">Cerrar</button>
      </ModalClose>
    </ModalFooter>
  </ModalContent>
</Modal>
```

## FormField
Usa `FormField` para agrupar label, control y texto de ayuda o error.

```tsx
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";

<FormField label="Nombre" htmlFor="nombre" description="Ingresa tu nombre completo." error="Este campo es obligatorio.">
  <Input id="nombre" placeholder="Nombre completo" />
</FormField>
```

## Card
Usa `Card` y sus subcomponentes para secciones con fondo y bordes suaves.

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Resumen</CardTitle>
    <CardDescription>Estado general</CardDescription>
  </CardHeader>
  <CardContent>Contenido principal</CardContent>
  <CardFooter>Acciones</CardFooter>
</Card>
```

## Input
Usa `Input` para campos de texto.

```tsx
import { Input } from "@/components/ui/input";

<Input id="email" type="email" placeholder="correo@ejemplo.com" />
```

## Select
Usa `Select` para opciones desplegables.

```tsx
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Selecciona una opción" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="opcion1">Opción 1</SelectItem>
    <SelectItem value="opcion2">Opción 2</SelectItem>
  </SelectContent>
</Select>
```

## Toast
Usa `Toast` para notificaciones rápidas. Asegúrate de incluir `ToastProvider` y `ToastViewport` en la raíz de la app.

```tsx
import { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose } from "@/components/ui/toast";

<ToastProvider>
  <Toast>
    <ToastTitle>Guardado</ToastTitle>
    <ToastDescription>Los cambios se guardaron correctamente.</ToastDescription>
    <ToastClose>OK</ToastClose>
  </Toast>
  <ToastViewport />
</ToastProvider>
```

## Recomendaciones generales
- No uses estilos inline para la UI principal.
- Usa los componentes compartidos en lugar de `className` arbitrarias siempre que sea posible.
- Si un componente no existe, crea primero un wrapper en
  `frontend/src/components/ui`.
- Mantén la nomenclatura de intención (`Primary`, `Secondary`, `Danger`) para botones y estados.
