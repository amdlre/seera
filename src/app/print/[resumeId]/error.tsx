"use client";

import { useEffect } from "react";
import { logger } from "@/lib/logger";
import "../print.css";

export default function PrintError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("print-page-error", { message: error.message, digest: error.digest });
  }, [error]);

  return (
    <div style={{ padding: "24px", fontFamily: "Arial, sans-serif" }}>
      <p>حدث خطأ أثناء تجهيز السيرة للطباعة. أعد المحاولة من لوحة التحكم.</p>
      <p>Something went wrong preparing the resume for print. Please try again from the dashboard.</p>
    </div>
  );
}
