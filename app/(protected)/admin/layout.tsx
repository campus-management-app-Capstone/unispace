import AdminBreadcrumb from "@/components/AdminBreadcrumb";

/**
 * Admin layout — wraps all /admin routes with a breadcrumb trail.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <AdminBreadcrumb />
      {children}
    </div>
  );
}
