"use client";

import { useEffect, useMemo, useState } from "react";
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

const CUSTOM_TYPE_VALUE = "__custom__";

export default function AddFacilityPage() {
  const router = useRouter();

  const [types, setTypes] = useState<string[]>([]);
  const [loadingFormData, setLoadingFormData] = useState(true);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    selectedType: "",
    customType: "",
    capacity: "",
  });

  useEffect(() => {
    const loadFormData = async () => {
      try {
        setLoadingFormData(true);

        const res = await fetch("/api/admin/facilities/data");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load facility form data");
        }

        setTypes(data.types || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load existing facility types");
      } finally {
        setLoadingFormData(false);
      }
    };

    loadFormData();
  }, []);

  const resolvedType = useMemo(() => {
    if (formData.selectedType === CUSTOM_TYPE_VALUE) {
      return formData.customType.trim();
    }

    return formData.selectedType.trim();
  }, [formData.selectedType, formData.customType]);

  const handleCreateFacility = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Facility name is required");
      return;
    }

    if (!resolvedType) {
      toast.error("Facility type is required");
      return;
    }

    if (formData.capacity !== "" && Number(formData.capacity) < 0) {
      toast.error("Capacity cannot be negative");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/admin/facilities/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          type: resolvedType,
          capacity: formData.capacity === "" ? null : Number(formData.capacity),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create facility");
      }

      toast.success(`Facility ${data.facility?.Name ?? formData.name} created`);
      router.push("/admin/facility");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to create facility");
    } finally {
      setLoading(false);
    }
  };

  if (loadingFormData) {
    return <div className="p-6">Loading form data...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Facility</h1>
        <p className="text-sm text-gray-500 mt-1">Create a new facility record.</p>
      </div>

      <div className="max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Facility Details</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleCreateFacility} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Facility Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Lecture Hall A"
                />
              </div>

              <div className="space-y-2">
                <Label>Type *</Label>
                <Select
                  value={formData.selectedType}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, selectedType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose existing type or custom" />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                    <SelectItem value={CUSTOM_TYPE_VALUE}>Other (Custom Type)</SelectItem>
                  </SelectContent>
                </Select>

                {formData.selectedType === CUSTOM_TYPE_VALUE && (
                  <Input
                    value={formData.customType}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, customType: e.target.value }))
                    }
                    placeholder="Enter custom type"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity (Optional)</Label>
                <Input
                  id="capacity"
                  type="number"
                  min={0}
                  value={formData.capacity}
                  onChange={(e) => setFormData((prev) => ({ ...prev, capacity: e.target.value }))}
                  placeholder="Leave blank for null"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="transition-colors hover:bg-primary/90">
                  {loading ? "Creating Facility..." : "Create Facility"}
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
