import { Suspense } from "react";
import { ScreenshotPageClient } from "./screenshot-page-client";

export default function ScreenshotPage() {
  return (
    <Suspense fallback={null}>
      <ScreenshotPageClient />
    </Suspense>
  );
}
