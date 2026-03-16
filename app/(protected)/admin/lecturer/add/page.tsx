"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Department = {
  DepartmentID: string;
  Name: string;
};

export default function AddLecturerPage() {
  const router = useRouter();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingFormData, setLoadingFormData] = useState(true);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    tempPassword: "",
    departmentId: "",
  });

  useEffect(() => {
    const loadFormData = async () => {
      try {
        setLoadingFormData(true);

        const res = await fetch("/api/admin/lecturers/data");
        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.error || "Failed to load departments");
        }

        setDepartments(result.departments || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load departments");
      } finally {
        setLoadingFormData(false);
      }
    };

    loadFormData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
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

  const handleCreateLecturer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Lecturer name is required");
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

    if (!formData.departmentId) {
      toast.error("Department is required");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/admin/lecturers/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.tempPassword,
          departmentId: formData.departmentId,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to create lecturer");
      }

      toast.success(
        `Lecturer created. Email: ${result.email}. LecturerCode: ${result.lecturerCode}`
      );

      router.push("/admin/lecturer");
    } catch (err) {
      if (!(err instanceof Error) || !err.message.toLowerCase().includes("email already exists")) {
        console.error(err);
      }
      toast.error(err instanceof Error ? err.message : "Failed to create lecturer");
    } finally {
      setLoading(false);
    }
  };

  if (loadingFormData) {
    return (
      <div className="p-6 space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Lecturer</h1>
        <p className="text-sm text-gray-500 mt-1">
          Create a new lecturer account and assign a department
        </p>
      </div>

      <div className="max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Lecturer Details</CardTitle>
            <CardDescription>
              Enter lecturer information. Role is set to lecturer automatically.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleCreateLecturer} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Lecturer Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Jane Doe"
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
                  placeholder="e.g., lecturer@email.com"
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
                <p className="text-xs text-gray-500">Lecturer can reset password later in account settings.</p>
              </div>

              <div className="space-y-2">
                <Label>Department *</Label>
                <Select
                  value={formData.departmentId}
                  onValueChange={(value) => handleSelectChange("departmentId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department.DepartmentID} value={department.DepartmentID}>
                        {department.DepartmentID} - {department.Name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                  <strong>Auto Generated:</strong>
                  <br />
                  UserID (Clerk), LecturerID (UUID), LecturerCode, EmployedTime, Role=lecturer
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="transition-colors hover:bg-primary/90"
                >
                  {loading ? "Creating Lecturer..." : "Create Lecturer"}
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
