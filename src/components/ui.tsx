import {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

export type NoticeTone = "neutral" | "success" | "warning" | "error";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
};

export function Button({ className = "", variant = "primary", ...props }: ButtonProps) {
  const variants = {
    primary: "bg-teal-700 text-white hover:bg-teal-800 disabled:bg-zinc-300",
    secondary: "border border-zinc-300 bg-white text-zinc-800 hover:border-teal-500 hover:text-teal-800 disabled:text-zinc-400",
    danger: "bg-rose-700 text-white hover:bg-rose-800 disabled:bg-zinc-300",
  };

  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-bold transition ${variants[variant]} disabled:cursor-not-allowed ${className}`}
      {...props}
    />
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="min-h-11 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
      {...props}
    />
  );
}

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className="min-h-11 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-950 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
      {...props}
    />
  );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className="min-h-32 w-full resize-y rounded-md border border-zinc-300 bg-white px-3 py-3 text-base leading-7 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-zinc-100"
      {...props}
    />
  );
}

export function Notice({ tone = "neutral", children }: { tone?: NoticeTone; children: ReactNode }) {
  const tones = {
    neutral: "border-zinc-200 bg-white text-zinc-700",
    success: "border-teal-200 bg-teal-50 text-teal-900",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    error: "border-rose-200 bg-rose-50 text-rose-900",
  };

  return <div className={`rounded-md border px-4 py-3 text-sm font-medium ${tones[tone]}`}>{children}</div>;
}

export function Toast({ tone = "success", children }: { tone?: NoticeTone; children: ReactNode }) {
  const tones = {
    neutral: {
      box: "border-zinc-200 bg-white text-zinc-900",
      icon: "text-zinc-600",
      Icon: Info,
    },
    success: {
      box: "border-teal-300 bg-teal-50 text-teal-950",
      icon: "text-teal-700",
      Icon: CheckCircle2,
    },
    warning: {
      box: "border-amber-300 bg-amber-50 text-amber-950",
      icon: "text-amber-700",
      Icon: AlertTriangle,
    },
    error: {
      box: "border-rose-300 bg-rose-50 text-rose-950",
      icon: "text-rose-700",
      Icon: XCircle,
    },
  };
  const { Icon, box, icon } = tones[tone];

  return (
    <div
      className={`fixed right-4 top-4 z-50 flex w-[calc(100%-2rem)] max-w-md items-start gap-3 rounded-lg border px-4 py-4 text-base font-bold shadow-soft sm:right-6 sm:top-6 ${box}`}
      role="status"
      aria-live="polite"
    >
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${icon}`} aria-hidden="true" />
      <div className="min-w-0 break-words leading-6">{children}</div>
    </div>
  );
}
