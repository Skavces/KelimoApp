import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export default function Button({ children, className = "", ...rest }: Props) {
  return (
    <button
      className={
        "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium " +
        "bg-emerald-500 text-slate-900 hover:bg-emerald-400 transition " +
        className
      }
      {...rest}
    >
      {children}
    </button>
  );
}
