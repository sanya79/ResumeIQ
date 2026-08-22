import { useToastStore, type ToastVariant } from "@/stores/toastStore";

/** Imperative toast API: `toast.success("Resume parsed")`. */
export function useToast() {
  const push = useToastStore((s) => s.push);

  function fire(variant: ToastVariant, title: string, description?: string, duration?: number) {
    push({ variant, title, description, duration });
  }

  return {
    success: (title: string, description?: string, duration?: number) => fire("success", title, description, duration),
    error: (title: string, description?: string, duration?: number) => fire("error", title, description, duration),
    info: (title: string, description?: string, duration?: number) => fire("info", title, description, duration),
    warning: (title: string, description?: string, duration?: number) => fire("warning", title, description, duration),
  };
}
