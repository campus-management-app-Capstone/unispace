"use client";

import { useEffect, useMemo, useState } from "react";
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

const CUSTOM_TYPE_VALUE = "__custom__";

type FacilityDetails = {
  FacilityID: string;
  Name: string;
  Type: string;
  Capacity: number | null;
};

export default function EditFacilityPage() {
  const params = useParams<{ facilityId: string }>();
  const router = useRouter();
  const facilityId = params.facilityId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [types, setTypes] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    selectedType: "",
    customType: "",
    capacity: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const res = await fetch(`/api/admin/facilities/${facilityId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load facility");
        }

        const facility = data.facility as FacilityDetails;
        const existingTypes = data.types || [];

        const isExistingType = existingTypes.includes(facility.Type);

        setTypes(existingTypes);
        setFormData({
          name: facility.Name || "",
          selectedType: isExistingType ? facility.Type : CUSTOM_TYPE_VALUE,
          customType: isExistingType ? "" : facility.Type || "",
          capacity: facility.Capacity === null ? "" : String(facility.Capacity),
        });
      } catch (err) {
        console.error(err);
        toast.error(err instanceof Error ? err.message : "Failed to load facility");
      } finally {
        setLoading(false);
      }
    };

    if (facilityId) {
      load();
    }
  }, [facilityId]);

  const resolvedType = useMemo(() => {
    if (formData.selectedType === CUSTOM_TYPE_VALUE) {
      return formData.customType.trim();
    }

    return formData.selectedType.trim();
  }, [formData.selectedType, formData.customType]);

  const onSubmit = async (e: React.FormEvent) => {
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
      setSaving(true);

      const res = await fetch(`/api/admin/facilities/${facilityId}`, {
        method: "PUT",
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
        throw new Error(data.error || "Failed to update facility");
      }

      toast.success("Facility updated successfully");
      router.push("/admin/facility");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to update facility");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading facility details...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Facility</h1>
        <p className="text-sm text-gray-500 mt-1">Update facility details and capacity.</p>
      </div>

      <div className="max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Facility Details</CardTitle>
            <CardDescription>Capacity can be left empty (nullable).</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Facility Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
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
                <Button type="submit" disabled={saving} className="transition-colors hover:bg-primary/90">
                  {saving ? "Updating Facility..." : "Save Changes"}
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
