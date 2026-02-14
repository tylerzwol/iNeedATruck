import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SERVICE_TYPES } from "@/lib/constants";

export default async function JobsPage() {
  const jobs = await prisma.job.findMany({
    include: {
      customer: { select: { name: true, email: true } },
      truckOwner: { select: { fullName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Jobs</h1>
      <p className="mt-2 text-stone-600 dark:text-stone-400">
        All job bookings and their status.
      </p>

      {jobs.length === 0 ? (
        <div className="mt-12 rounded-xl border border-dashed border-stone-300 bg-stone-50 p-12 text-center dark:border-stone-600 dark:bg-stone-800/50">
          <p className="text-stone-600 dark:text-stone-400">No jobs yet.</p>
          <Link href="/find" className="mt-4 inline-block text-orange-600 hover:underline">
            Find a truck to create a job →
          </Link>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-xl border border-stone-200 dark:border-stone-700">
          <table className="w-full">
            <thead className="bg-stone-100 dark:bg-stone-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-stone-900 dark:text-stone-100">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-stone-900 dark:text-stone-100">Truck owner</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-stone-900 dark:text-stone-100">Service</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-stone-900 dark:text-stone-100">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-stone-900 dark:text-stone-100">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-stone-900 dark:text-stone-100">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 dark:divide-stone-700">
              {jobs.map((job) => (
                <tr key={job.id} className="bg-white dark:bg-stone-800">
                  <td className="px-4 py-3">{job.customer?.name || "—"}</td>
                  <td className="px-4 py-3">{job.truckOwner?.fullName || "—"}</td>
                  <td className="px-4 py-3 text-sm">
                    {job.serviceType
                      ? SERVICE_TYPES.find((t) => t.value === job.serviceType)?.label ?? job.serviceType
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        job.status === "completed"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200"
                          : job.status === "cancelled"
                            ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200"
                      }`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">${Number(job.totalAmount)}</td>
                  <td className="px-4 py-3 text-sm text-stone-500">
                    {job.createdAt.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
