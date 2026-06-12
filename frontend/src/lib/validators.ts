/**
 * Validadores puros para uso en formularios.
 * Cada validador retorna un objeto {isValid: boolean, message: string}
 */

export interface ValidationResult {
  isValid: boolean;
  message: string;
}

/**
 * Valida que un campo no esté vacío
 */
export function validateRequired(value: string, fieldName: string): ValidationResult {
  if (!value || value.trim() === "") {
    return {
      isValid: false,
      message: `Por favor completa el campo ${fieldName.toLowerCase()}.`,
    };
  }
  return { isValid: true, message: "" };
}

/**
 * Valida formato de email con regex estricto
 * Sigue RFC 5322 (versión simplificada)
 */
export function validateEmail(email: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email.trim()) {
    return {
      isValid: false,
      message: "Por favor ingresa tu correo electrónico.",
    };
  }

  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      message: "El correo electrónico no tiene un formato válido.",
    };
  }

  return { isValid: true, message: "" };
}

/**
 * Valida que una fecha no esté en el pasado
 */
export function validateFutureDate(dateString: string): ValidationResult {
  if (!dateString) {
    return {
      isValid: false,
      message: "Por favor selecciona una fecha.",
    };
  }

  const selectedDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    return {
      isValid: false,
      message: "La fecha no puede ser en el pasado.",
    };
  }

  return { isValid: true, message: "" };
}

/**
 * Valida que una fecha esté en el futuro (más estricto, excluye hoy)
 */
export function validateFutureDateTime(dateString: string): ValidationResult {
  if (!dateString) {
    return {
      isValid: false,
      message: "Por favor selecciona una fecha y hora.",
    };
  }

  const selectedDate = new Date(dateString);
  const now = new Date();

  if (selectedDate <= now) {
    return {
      isValid: false,
      message: "Por favor selecciona una fecha y hora posteriores a ahora.",
    };
  }

  return { isValid: true, message: "" };
}

/**
 * Valida tipo y tamaño de archivo
 */
export function validateFile(
  file: File,
  allowedMimeTypes: string[] = ["image/jpeg", "image/png", "application/pdf"],
  maxSizeMB: number = 5
): ValidationResult {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (!file) {
    return {
      isValid: false,
      message: "Por favor selecciona un archivo.",
    };
  }

  if (!allowedMimeTypes.includes(file.type)) {
    const extensions = allowedMimeTypes
      .map((type) => {
        if (type === "image/jpeg") return "JPG";
        if (type === "image/png") return "PNG";
        if (type === "application/pdf") return "PDF";
        return type.split("/")[1].toUpperCase();
      })
      .join(", ");
    return {
      isValid: false,
      message: `El archivo debe ser uno de los siguientes formatos: ${extensions}.`,
    };
  }

  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      message: `El archivo es demasiado grande. El tamaño máximo permitido es ${maxSizeMB}MB.`,
    };
  }

  return { isValid: true, message: "" };
}

/**
 * Valida que una contraseña cumpla requisitos mínimos
 * - Mínimo 8 caracteres
 * - Al menos una mayúscula
 * - Al menos una minúscula
 * - Al menos un número
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return {
      isValid: false,
      message: "Por favor ingresa una contraseña.",
    };
  }

  if (password.length < 8) {
    return {
      isValid: false,
      message: "La contraseña debe tener al menos 8 caracteres.",
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: "La contraseña debe incluir al menos una letra mayúscula.",
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: "La contraseña debe incluir al menos una letra minúscula.",
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: "La contraseña debe incluir al menos un número.",
    };
  }

  return { isValid: true, message: "" };
}

/**
 * Valida que dos valores coincidan (para confirmar contraseña, por ejemplo)
 */
export function validateMatch(value: string, confirmValue: string, fieldName: string): ValidationResult {
  if (value !== confirmValue) {
    return {
      isValid: false,
      message: `Los valores de ${fieldName.toLowerCase()} no coinciden.`,
    };
  }
  return { isValid: true, message: "" };
}

/**
 * Valida longitud mínima
 */
export function validateMinLength(value: string, minLength: number, fieldName: string): ValidationResult {
  if (value.length < minLength) {
    return {
      isValid: false,
      message: `${fieldName} debe tener al menos ${minLength} caracteres.`,
    };
  }
  return { isValid: true, message: "" };
}

/**
 * Valida longitud máxima
 */
export function validateMaxLength(value: string, maxLength: number, fieldName: string): ValidationResult {
  if (value.length > maxLength) {
    return {
      isValid: false,
      message: `${fieldName} no puede exceder ${maxLength} caracteres.`,
    };
  }
  return { isValid: true, message: "" };
}
