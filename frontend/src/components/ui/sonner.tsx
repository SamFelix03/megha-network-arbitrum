"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:font-bold group-[.toaster]:text-lg group-[.toaster]:bg-black group-[.toaster]:text-franky-cyan group-[.toaster]:border group-[.toaster]:border-franky-cyan group-[.toaster]:shadow-lg group-[.toaster]:font-sen",
          description:
            "group-[.toast]:text-gray-400 group-[.toaster]:text-sm group-[.toaster]:font-sen",
          actionButton:
            "group-[.toast]:bg-franky-cyan group-[.toast]:text-black group-[.toast]:font-sen group-[.toast]:font-medium",
          cancelButton:
            "group-[.toast]:bg-franky-cyan group-[.toast]:text-black group-[.toast]:font-sen group-[.toast]:font-medium",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
