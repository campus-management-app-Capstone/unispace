"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AddAdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    tempPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const generateTempPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    setFormData((prev) => ({ ...prev, tempPassword: password }));
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Admin name is required");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!formData.tempPassword.trim()) {
      toast.error("Temporary password is required");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/admin/admins/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.tempPassword,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to create admin");
      }

      toast.success(`Admin created. Email: ${result.email}. AdminCode: ${result.adminCode}`);
      router.push("/admin/adminmanagement");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to create admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Admin</h1>
        <p className="text-sm text-gray-500 mt-1">Create a new administrator account.</p>
      </div>

      <div className="max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Admin Details</CardTitle>
            <CardDescription>
              Role is fixed to admin. AdminID and AdminCode are generated automatically.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleCreateAdmin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Admin Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Admin User"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="e.g., admin@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tempPassword">Temporary Password *</Label>
                <div className="flex gap-2">
                  <Input
                    id="tempPassword"
                    name="tempPassword"
                    type="text"
                    placeholder="Generate a secure password"
                    value={formData.tempPassword}
                    onChange={handleInputChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateTempPassword}
                    className="transition-colors hover:bg-accent"
                  >
                    Generate
                  </Button>
                </div>
              </div>

              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                  <strong>Auto Generated:</strong>
                  <br />
                  UserID (Clerk), AdminID, AdminCode, Role=admin
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="transition-colors hover:bg-primary/90"
                >
                  {loading ? "Creating Admin..." : "Create Admin"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
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
