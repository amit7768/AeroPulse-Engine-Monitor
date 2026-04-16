"use client";

import { useEffect, useState } from "react";

interface ClientTimeProps {
  date: Date | string;
  options?: Intl.DateTimeFormatOptions;
}

/**
 * Renders a locale-formatted time string only on the client to prevent
 * SSR/client hydration mismatches caused by differing server vs. browser
 * locale settings or timezone offsets.
 */
export default function ClientTime({ date, options }: ClientTimeProps) {
  const [formatted, setFormatted] = useState<string | null>(null);

  useEffect(() => {
    const d = typeof date === "string" ? new Date(date) : date;
    setFormatted(d.toLocaleTimeString([], options));
  }, [date, options]);

  // Render nothing during SSR and on first client paint — React will
  // reconcile silently once useEffect fires with the real value.
  if (formatted === null) return null;

  return <span suppressHydrationWarning>{formatted}</span>;
}
