import { useToastStore, type ToastVariant } from "@/stores/toastStore";

/** Imperative toast API: `toast.success("Resume parsed")`. */
export function useToast() {
  const push = useToastStore((s) => s.push);

  function fire(variant: ToastVariant, title: string, description?: string) {
    push({ variant, title, description });
  }

  return {
    success: (title: string, description?: string) => fire("success", title, description),
    error: (title: string, description?: string) => fire("error", title, description),
    info: (title: string, description?: string) => fire("info", title, description),
    warning: (title: string, description?: string) => fire("warning", title, description),
  };
}
