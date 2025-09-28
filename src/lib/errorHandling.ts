import { toast } from "@/hooks/use-toast";

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export const handleSupabaseError = (error: any, context: string = "operação") => {
  console.error(`Error in ${context}:`, error);
  
  let userMessage = `Erro na ${context}`;
  
  if (error?.message) {
    // Common Supabase error patterns
    if (error.message.includes("duplicate key")) {
      userMessage = "Este registro já existe no sistema.";
    } else if (error.message.includes("foreign key")) {
      userMessage = "Erro de referência de dados. Verifique se todos os dados relacionados existem.";
    } else if (error.message.includes("not null")) {
      userMessage = "Alguns campos obrigatórios não foram preenchidos.";
    } else if (error.message.includes("permission denied") || error.message.includes("RLS")) {
      userMessage = "Você não tem permissão para realizar esta ação.";
    } else if (error.message.includes("network")) {
      userMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
    } else {
      userMessage = error.message;
    }
  }
  
  toast({
    title: "Erro",
    description: userMessage,
    variant: "destructive",
  });
  
  return { message: userMessage, originalError: error };
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 6) {
    return { isValid: false, message: "A senha deve ter pelo menos 6 caracteres." };
  }
  if (password.length > 100) {
    return { isValid: false, message: "A senha é muito longa." };
  }
  return { isValid: true };
};

export const validateRequired = (value: string, fieldName: string): { isValid: boolean; message?: string } => {
  if (!value || value.trim().length === 0) {
    return { isValid: false, message: `${fieldName} é obrigatório.` };
  }
  return { isValid: true };
};

export const validateAge = (dateOfBirth: string, minAge: number = 16): { isValid: boolean; message?: string } => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  if (age < minAge) {
    return { isValid: false, message: `A idade deve ser pelo menos ${minAge} anos.` };
  }
  
  return { isValid: true };
};