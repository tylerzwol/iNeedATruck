"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { JOB_REQUEST_STORAGE_KEY } from "@/lib/constants";

export function FindPageHeader({ requestedServices = [] }: { requestedServices?: string[] }) {
  const [hasJobRequest, setHasJobRequest] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const data = sessionStorage.getItem(JOB_REQUEST_STORAGE_KEY);
      setHasJobRequest(!!data);
    }
  }, []);

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Find a truck</h1>
        <p className="mt-2 text-stone-600 dark:text-stone-400">
          Browse local truck owners. Book a haul, move, or seasonal job.
        </p>
      </div>
      {hasJobRequest && (
        <Link
          href="/get-started"
          className="text-sm text-orange-600 hover:underline dark:text-orange-400"
        >
          Change your request
        </Link>
      )}
    </div>
  );
}
