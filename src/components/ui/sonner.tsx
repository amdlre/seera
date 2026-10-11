"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      // Seera edit: richColors mapped to the app's semantic tokens so every toast
      // reads by convention — green success, red error, yellow warning, blue info.
      richColors
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          "--success-bg": "color-mix(in oklch, var(--success) 12%, var(--popover))",
          "--success-border": "color-mix(in oklch, var(--success) 45%, var(--popover))",
          "--success-text": "color-mix(in oklch, var(--success) 75%, var(--popover-foreground))",
          "--error-bg": "color-mix(in oklch, var(--destructive) 10%, var(--popover))",
          "--error-border": "color-mix(in oklch, var(--destructive) 45%, var(--popover))",
          "--error-text": "color-mix(in oklch, var(--destructive) 80%, var(--popover-foreground))",
          "--warning-bg": "color-mix(in oklch, var(--warning) 16%, var(--popover))",
          "--warning-border": "color-mix(in oklch, var(--warning) 60%, var(--popover))",
          "--warning-text": "color-mix(in oklch, var(--warning) 45%, var(--popover-foreground))",
          "--info-bg": "color-mix(in oklch, var(--info) 10%, var(--popover))",
          "--info-border": "color-mix(in oklch, var(--info) 45%, var(--popover))",
          "--info-text": "color-mix(in oklch, var(--info) 80%, var(--popover-foreground))",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
