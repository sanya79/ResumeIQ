import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";

export interface AccordionItemData {
  id: string;
  question: string;
  answer: ReactNode;
}

interface AccordionProps {
  items: readonly AccordionItemData[];
  className?: string;
  /** Allow more than one item open at once. Default: single-open. */
  multiple?: boolean;
}

/** Expand/collapse list — built for FAQs but generic enough for any
 * question/answer or summary/detail pairing. Height-animates via
 * grid-template-rows so no manual height measurement is needed. */
export function Accordion({ items, className, multiple = false }: AccordionProps) {
  const [openIds, setOpenIds] = useState<string[]>([]);

  function toggle(id: string) {
    setOpenIds((prev) => {
      const isOpen = prev.includes(id);
      if (multiple) {
        return isOpen ? prev.filter((i) => i !== id) : [...prev, id];
      }
      return isOpen ? [] : [id];
    });
  }

  return (
    <div className={cn("flex flex-col divide-y divide-surface-border", className)}>
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        return (
          <div key={item.id} className="py-2">
            <button
              type="button"
              onClick={() => toggle(item.id)}
              aria-expanded={isOpen}
              aria-controls={`${item.id}-panel`}
              className="flex w-full items-center justify-between gap-4 py-3 text-left"
            >
              <span className="text-sm font-medium text-foreground sm:text-base">{item.question}</span>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.25 }}
                className="shrink-0 text-foreground-secondary"
              >
                <ChevronDown size={18} />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`${item.id}-panel`}
                  role="region"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pb-3 text-sm leading-relaxed text-foreground-secondary">{item.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
