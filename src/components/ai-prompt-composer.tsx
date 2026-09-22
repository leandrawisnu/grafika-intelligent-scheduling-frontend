"use client";

import { useRef } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

type AiPromptComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
};

export function AiPromptComposer({
  value,
  onChange,
  onSubmit,
  placeholder = "Tanya tentang jadwal…",
  disabled = false,
  loading = false,
  className,
}: AiPromptComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSend = !disabled && !loading && value.trim().length > 0;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) onSubmit();
    }
  };

  return (
    <div
      data-component="GIS/AiPromptComposer"
      className={cn(
        "relative rounded-[1.75rem] border border-border bg-background transition-colors focus-within:border-ring/60",
        className,
      )}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled || loading}
        rows={1}
        className="field-sizing-content max-h-40 min-h-[3.25rem] w-full resize-none bg-transparent px-5 pt-4 pb-14 text-base leading-relaxed outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
      />
      <button
        type="button"
        onClick={() => canSend && onSubmit()}
        disabled={!canSend}
        aria-label="Kirim pertanyaan"
        className={cn(
          "absolute right-3 bottom-3 flex size-9 items-center justify-center rounded-full transition-colors",
          canSend
            ? "bg-primary text-primary-foreground hover:bg-[color-mix(in_oklch,var(--primary),white_6%)]"
            : "bg-muted text-muted-foreground",
        )}
      >
        <ArrowUp className="size-4" aria-hidden />
      </button>
    </div>
  );
}
