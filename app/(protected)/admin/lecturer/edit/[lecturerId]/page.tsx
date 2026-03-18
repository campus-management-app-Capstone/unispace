"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

type LecturerDetails = {
  LecturerID: string;
  LecturerCode: string;
  UserID: string;
  DepartmentID: string;
  EmployedTime: string;
  Role: string;
  Name: string;
  Email: string;
};

function formatDate(value: string) {
  if (!value) return "-";
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EditLecturerPage() {
  const params = useParams<{ lecturerId: string }>();
  const router = useRouter();
  const lecturerId = params.lecturerId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [departments, setDepartments] = useState<Department[]>([]);

  const [formData, setFormData] = useState({
    lecturerCode: "",
    employedTime: "",
    name: "",
    email: "",
    departmentId: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const res = await fetch(`/api/admin/lecturers/${lecturerId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load lecturer");
        }

        const lecturer = data.lecturer as LecturerDetails;

        setDepartments(data.departments || []);
        setFormData({
          lecturerCode: lecturer.LecturerCode || "",
          employedTime: lecturer.EmployedTime || "",
          name: lecturer.Name || "",
          email: lecturer.Email || "",
          departmentId: lecturer.DepartmentID || "",
        });
      } catch (err) {
        console.error(err);
        toast.error(err instanceof Error ? err.message : "Failed to load lecturer");
      } finally {
        setLoading(false);
      }
    };

    if (lecturerId) {
      load();
    }
  }, [lecturerId]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.departmentId) {
      toast.error("Name, email, and department are required");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch(`/api/admin/lecturers/${lecturerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          departmentId: formData.departmentId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update lecturer");
      }

      toast.success("Lecturer updated successfully");
      router.push("/admin/lecturer");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to update lecturer");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading lecturer details...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Lecturer</h1>
        <p className="text-sm text-gray-500 mt-1">Update lecturer profile and department assignment.</p>
      </div>

      <div className="max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Lecturer Details</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="lecturerCode">Lecturer Code</Label>
                <Input id="lecturerCode" value={formData.lecturerCode} disabled />
                <CardDescription>Lecturer code cannot be changed.</CardDescription>
              </div>

              <div className="space-y-2">
                <Label htmlFor="employedTime">Employed Time</Label>
                <Input id="employedTime" value={formatDate(formData.employedTime)} disabled />
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

              <div className="space-y-2">
                <Label>Department *</Label>
                <Select
                  value={formData.departmentId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, departmentId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
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

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="transition-colors hover:bg-primary/90"
                >
                  {saving ? "Updating Lecturer..." : "Save Changes"}
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
