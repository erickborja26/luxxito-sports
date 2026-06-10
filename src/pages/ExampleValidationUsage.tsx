/**
 * EJEMPLO DE USO COMPLETO: Validaciones, Accesibilidad, StatusBadge, IconButton, ConfirmModal y Tooltip
 * Este archivo contiene ejemplos de cómo usar TODOS los componentes accesibles
 */

import { useState, useRef } from "react";
import { AccessibleInput } from "@/components/ui/AccessibleInput";
import { StatusBadge } from "@/components/StatusBadge";
import { IconButton } from "@/components/ui/IconButton";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Tooltip, TooltipInfo } from "@/components/ui/tooltip";
import { useFormValidation } from "@/hooks/useFormValidation";
import {
  validateRequired,
  validateEmail,
  validateFutureDate,
  validatePassword,
  validateMatch,
  validateFile,
} from "@/lib/validators";

/**
 * Ejemplo 1: Formulario de registro con validación completa
 */
export function ExampleRegistrationForm() {
  const { errors, mostrarError, limpiarError, validarCampos } = useFormValidation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpiar error cuando el usuario empieza a escribir
    limpiarError(field);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar todos los campos
    const isValid = validarCampos([
      {
        fieldName: "email",
        validator: () => validateEmail(formData.email),
      },
      {
        fieldName: "password",
        validator: () => validatePassword(formData.password),
      },
      {
        fieldName: "confirmPassword",
        validator: () =>
          validateMatch(formData.password, formData.confirmPassword, "Contraseñas"),
      },
    ]);

    if (isValid) {
      // Enviar formulario
      console.log("Formulario válido, enviando...", formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Crear Cuenta</h1>

      {/* Email Input - Validación HTML5 + JS */}
      <AccessibleInput
        id="email"
        type="email"
        label="Correo Electrónico"
        isRequired
        value={formData.email}
        onChange={(e) => handleChange("email", e.target.value)}
        isError={!!errors.email}
        errorMessage={errors.email?.message}
        helpText="Usaremos este correo para tu cuenta"
        placeholder="tu@email.com"
      />

      {/* Password Input - Validación JavaScript pura */}
      <AccessibleInput
        id="password"
        type="password"
        label="Contraseña"
        isRequired
        value={formData.password}
        onChange={(e) => handleChange("password", e.target.value)}
        isError={!!errors.password}
        errorMessage={errors.password?.message}
        helpText="Mínimo 8 caracteres con mayúscula, minúscula y número"
      />

      {/* Confirm Password Input */}
      <AccessibleInput
        id="confirmPassword"
        type="password"
        label="Confirmar Contraseña"
        isRequired
        value={formData.confirmPassword}
        onChange={(e) => handleChange("confirmPassword", e.target.value)}
        isError={!!errors.confirmPassword}
        errorMessage={errors.confirmPassword?.message}
      />

      <button
        type="submit"
        className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Crear Cuenta
      </button>
    </form>
  );
}

/**
 * Ejemplo 2: Formulario de reserva con validación de fecha
 */
export function ExampleBookingForm() {
  const { errors, validarCampos } = useFormValidation();

  const [formData, setFormData] = useState({
    fecha: "",
    cancha: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = validarCampos([
      {
        fieldName: "fecha",
        validator: () => validateFutureDate(formData.fecha),
      },
      {
        fieldName: "cancha",
        validator: () => validateRequired(formData.cancha, "Cancha"),
      },
    ]);

    if (isValid) {
      console.log("Reserva válida", formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Reservar Cancha</h1>

      {/* Date Input - HTML5 + JS */}
      <AccessibleInput
        id="fecha"
        type="date"
        label="Fecha de Reserva"
        isRequired
        value={formData.fecha}
        onChange={(e) => setFormData((prev) => ({ ...prev, fecha: e.target.value }))}
        isError={!!errors.fecha}
        errorMessage={errors.fecha?.message}
        helpText="Solo se pueden reservar fechas futuras"
      />

      <AccessibleInput
        id="cancha"
        type="text"
        label="Seleccionar Cancha"
        isRequired
        value={formData.cancha}
        onChange={(e) => setFormData((prev) => ({ ...prev, cancha: e.target.value }))}
        isError={!!errors.cancha}
        errorMessage={errors.cancha?.message}
      />

      <button
        type="submit"
        className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90"
      >
        Confirmar Reserva
      </button>
    </form>
  );
}

/**
 * Ejemplo 3: Carga de archivos con validación
 */
export function ExampleFileUpload() {
  const { errors, mostrarError } = useFormValidation();
  const [fileName, setFileName] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar archivo
    const validation = validateFile(
      file,
      ["image/jpeg", "image/png", "application/pdf"],
      5 // 5MB
    );

    if (!validation.isValid) {
      mostrarError("comprobante", validation.message);
    } else {
      setFileName(file.name);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h2 className="text-xl font-bold">Subir Comprobante de Pago</h2>

      <AccessibleInput
        id="comprobante"
        type="file"
        label="Archivo de Comprobante"
        isRequired
        onChange={handleFileChange}
        isError={!!errors.comprobante}
        errorMessage={errors.comprobante?.message}
        helpText="JPG, PNG o PDF. Máximo 5MB."
        accept=".jpg,.jpeg,.png,.pdf"
      />

      {fileName && (
        <p className="text-sm text-green-600">✓ Archivo cargado: {fileName}</p>
      )}
    </div>
  );
}

/**
 * Ejemplo 4: StatusBadge - Estados de reservas y canchas
 */
export function ExampleStatusBadges() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-4">Estados de Reservas</h2>
        <div className="flex flex-wrap gap-3">
          <StatusBadge status="CONFIRMADA" />
          <StatusBadge status="PENDIENTE" />
          <StatusBadge status="PENDIENTE_REVISION" />
          <StatusBadge status="CANCELADA" />
          <StatusBadge status="VENCIDA" />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Estados de Canchas</h2>
        <div className="flex flex-wrap gap-3">
          <StatusBadge status="OPERATIVO" />
          <StatusBadge status="DAÑADO" />
          <StatusBadge status="BLOQUEADA" />
          <StatusBadge status="EN_PROCESO" />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Estados de Soporte</h2>
        <div className="flex flex-wrap gap-3">
          <StatusBadge status="ABIERTA" />
          <StatusBadge status="EN_PROCESO" />
          <StatusBadge status="RESUELTA" />
        </div>
      </div>

      <p className="text-sm text-muted-foreground mt-6">
        ✓ Cada estado usa: <strong>Color + Ícono + Texto</strong> (no solo color)
      </p>
    </div>
  );
}

/**
 * Ejemplo 5: IconButton - Botones solo ícono accesibles
 */
export function ExampleIconButtons() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">Botones de Acción</h2>
        <div className="flex flex-wrap gap-4">
          {/* Edit button */}
          <Tooltip content="Editar reserva">
            <IconButton aria-label="Editar reserva" variant="default" size="md">
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </IconButton>
          </Tooltip>

          {/* Delete button */}
          <Tooltip content="Eliminar reserva">
            <IconButton aria-label="Eliminar reserva" variant="destructive" size="md">
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </IconButton>
          </Tooltip>

          {/* Download button */}
          <Tooltip content="Descargar comprobante" position="bottom">
            <IconButton aria-label="Descargar comprobante" variant="outline" size="md">
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.293a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </IconButton>
          </Tooltip>

          {/* Info button */}
          <TooltipInfo
            label="Información"
            content="Precio: $50 • Fútbol 5 • 1 hora"
            position="right"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Ejemplo 6: ConfirmModal - Modal de confirmación
 */
export function ExampleConfirmModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const confirmModalRef = useRef<HTMLDialogElement>(null);

  const handleCancelReservation = async () => {
    setIsLoading(true);
    try {
      // Simular llamada API
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Reserva cancelada");
      alert("Reserva cancelada exitosamente");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div>
        <h2 className="text-xl font-bold mb-4">Modal de Confirmación</h2>
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md font-medium hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2"
        >
          Cancelar Reserva
        </button>
      </div>

      <ConfirmModal
        ref={confirmModalRef}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleCancelReservation}
        title="Cancelar Reserva"
        description="¿Estás seguro de que deseas cancelar tu reserva? Esta acción no se puede deshacer."
        confirmLabel="Sí, cancelar"
        confirmVariant="destructive"
        cancelLabel="No, mantener"
        isLoading={isLoading}
      />

      <p className="text-sm text-muted-foreground">
        Haz click en "Cancelar Reserva" para ver el modal en acción
      </p>
    </div>
  );
}

/**
 * Ejemplo 7: Tabla de reservas con estados, iconos y tooltips
 */
export function ExampleReservationTableComplete() {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<string | null>(null);

  const reservations = [
    {
      id: "1",
      cancha: "Cancha 1",
      fecha: "15/06/2024",
      estado: "CONFIRMADA",
      precio: 50,
      deporte: "Fútbol 5",
    },
    {
      id: "2",
      cancha: "Cancha 2",
      fecha: "16/06/2024",
      estado: "PENDIENTE_REVISION",
      precio: 60,
      deporte: "Básquet",
    },
    {
      id: "3",
      cancha: "Cancha 3",
      fecha: "12/06/2024",
      estado: "VENCIDA",
      precio: 40,
      deporte: "Voleibol",
    },
  ];

  const handleDeleteClick = (id: string) => {
    setSelectedReservation(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    console.log("Eliminando reserva:", selectedReservation);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    alert("Reserva eliminada");
    setDeleteModalOpen(false);
    setSelectedReservation(null);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Mis Reservas</h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-border rounded-lg overflow-hidden">
          <thead className="bg-muted">
            <tr>
              <th className="border border-border px-4 py-2 text-left">Cancha</th>
              <th className="border border-border px-4 py-2 text-left">Fecha</th>
              <th className="border border-border px-4 py-2 text-left">Estado</th>
              <th className="border border-border px-4 py-2 text-left">Info</th>
              <th className="border border-border px-4 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((res) => (
              <tr key={res.id}>
                <td className="border border-border px-4 py-2">{res.cancha}</td>
                <td className="border border-border px-4 py-2">{res.fecha}</td>
                <td className="border border-border px-4 py-2">
                  <StatusBadge status={res.estado} />
                </td>
                <td className="border border-border px-4 py-2">
                  <TooltipInfo
                    label="Detalles"
                    content={`${res.deporte} • $${res.precio}`}
                    position="top"
                  />
                </td>
                <td className="border border-border px-4 py-2 flex gap-2 justify-center">
                  <Tooltip content="Editar">
                    <IconButton
                      aria-label="Editar reserva"
                      variant="outline"
                      size="sm"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </IconButton>
                  </Tooltip>

                  <Tooltip content="Eliminar">
                    <IconButton
                      aria-label="Eliminar reserva"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(res.id)}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </IconButton>
                  </Tooltip>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Reserva"
        description="¿Estás seguro de que deseas eliminar esta reserva? Esta acción no se puede deshacer y perderás cualquier depósito relacionado."
        confirmLabel="Sí, eliminar"
        confirmVariant="destructive"
        cancelLabel="Cancelar"
      />
    </div>
  );
}
