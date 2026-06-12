import { useState, useCallback } from "react";

export interface FieldError {
  message: string;
  isVisible: boolean;
}

export interface FormErrors {
  [fieldName: string]: FieldError;
}

/**
 * Custom hook para manejar errores de validación en formularios
 *
 * Proporciona métodos para mostrar, limpiar y gestionar errores de campos individuales
 */
export function useFormValidation() {
  const [errors, setErrors] = useState<FormErrors>({});

  /**
   * Muestra un error en un campo específico
   */
  const mostrarError = useCallback((fieldName: string, message: string) => {
    setErrors((prevErrors) => ({
      ...prevErrors,
      [fieldName]: {
        message,
        isVisible: true,
      },
    }));
  }, []);

  /**
   * Limpia el error de un campo específico
   */
  const limpiarError = useCallback((fieldName: string) => {
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  /**
   * Limpia TODOS los errores del formulario
   */
  const limpiarTodos = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Obtiene el error de un campo específico
   */
  const obtenerError = useCallback(
    (fieldName: string): FieldError | null => {
      return errors[fieldName] || null;
    },
    [errors]
  );

  /**
   * Verifica si hay errores en el formulario
   */
  const tieneErrores = useCallback((): boolean => {
    return Object.keys(errors).length > 0;
  }, [errors]);

  /**
   * Valida múltiples campos con funciones de validación
   * Uso: validarCampos([
   *   { fieldName: 'email', validator: () => validateEmail(email) },
   *   { fieldName: 'fecha', validator: () => validateFutureDate(fecha) }
   * ])
   */
  const validarCampos = useCallback(
    (
      validations: Array<{
        fieldName: string;
        validator: () => { isValid: boolean; message: string };
      }>
    ) => {
      let hasErrors = false;
      const newErrors: FormErrors = {};

      validations.forEach(({ fieldName, validator }) => {
        const result = validator();
        if (!result.isValid) {
          hasErrors = true;
          newErrors[fieldName] = {
            message: result.message,
            isVisible: true,
          };
        }
      });

      setErrors(newErrors);
      return !hasErrors;
    },
    []
  );

  /**
   * Retorna el ID para aria-describedby del error
   */
  const obtenerIdError = useCallback((fieldName: string): string => {
    return `${fieldName}-error`;
  }, []);

  return {
    errors,
    mostrarError,
    limpiarError,
    limpiarTodos,
    obtenerError,
    tieneErrores,
    validarCampos,
    obtenerIdError,
  };
}
