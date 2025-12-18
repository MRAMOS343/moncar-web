import { toast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, AlertCircle, Info, Download, Upload, Trash2 } from "lucide-react";

export const showSuccessToast = (title: string, description?: string) => {
  toast({
    title,
    description,
    duration: 3000,
    className: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
  });
};

export const showErrorToast = (title: string, description?: string) => {
  toast({
    title,
    description,
    variant: "destructive",
    duration: 5000,
  });
};

export const showWarningToast = (title: string, description?: string) => {
  toast({
    title,
    description,
    duration: 4000,
    className: "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800",
  });
};

export const showInfoToast = (title: string, description?: string) => {
  toast({
    title,
    description,
    duration: 3000,
  });
};

export const showActionToast = (
  title: string, 
  description: string, 
  actionLabel: string, 
  onAction: () => void
) => {
  const { dismiss } = toast({
    title,
    description,
    duration: 8000,
  });
};

export const showUndoToast = (
  title: string,
  description: string,
  onUndo: () => void
) => {
  showActionToast(title, description, "Deshacer", onUndo);
};
