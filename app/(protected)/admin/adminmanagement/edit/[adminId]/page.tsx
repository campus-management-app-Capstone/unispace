"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AdminDetails = {
  AdminID: string;
  AdminCode: string;
  UserID: string;
  Name: string;
  Email: string;
  Role: string;
};

export default function EditAdminPage() {
  const params = useParams<{ adminId: string }>();
  const router = useRouter();
  const adminId = params.adminId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    adminCode: "",
    role: "admin",
    name: "",
    email: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const res = await fetch(`/api/admin/admins/${adminId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load admin");
        }

        const admin = data.admin as AdminDetails;

        setFormData({
          adminCode: admin.AdminCode || "",
          role: admin.Role || "admin",
          name: admin.Name || "",
          email: admin.Email || "",
        });
      } catch (err) {
        console.error(err);
        toast.error(err instanceof Error ? err.message : "Failed to load admin");
      } finally {
        setLoading(false);
      }
    };

    if (adminId) {
      load();
    }
  }, [adminId]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch(`/api/admin/admins/${adminId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update admin");
      }

      toast.success("Admin updated successfully");
      router.push("/admin/adminmanagement");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to update admin");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading admin details...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Admin</h1>
        <p className="text-sm text-gray-500 mt-1">Update admin profile details.</p>
      </div>

      <div className="max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Admin Details</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="adminCode">Admin Code</Label>
                <Input id="adminCode" value={formData.adminCode} disabled />
                <CardDescription>Admin code cannot be changed.</CardDescription>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" value={formData.role} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="transition-colors hover:bg-primary/90"
                >
                  {saving ? "Updating Admin..." : "Save Changes"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={saving}
                  className="transition-colors hover:bg-accent"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
