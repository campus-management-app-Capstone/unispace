"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, SlidersHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Facility = {
  FacilityID: string;
  Name: string;
  Type: string;
  Capacity: number | null;
};

const typeColorMap: Record<string, string> = {
  lab: "bg-sky-100 text-sky-700 border-0",
  classroom: "bg-amber-100 text-amber-700 border-0",
  facility: "bg-emerald-100 text-emerald-700 border-0",
};

function getTypeBadgeColor(type?: string | null) {
  if (!type) {
    return "bg-gray-100 text-gray-600 border-0";
  }

  return typeColorMap[type.toLowerCase()] ?? "bg-slate-100 text-slate-700 border-0";
}

export default function FacilityManagementPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [minCapacity, setMinCapacity] = useState("");
  const [maxCapacity, setMaxCapacity] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/facilities/list");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch facilities");
      }

      setFacilities(data.facilities || []);
      setTypes(data.types || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load facilities");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredFacilities = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    const minNum = minCapacity === "" ? null : Number(minCapacity);
    const maxNum = maxCapacity === "" ? null : Number(maxCapacity);

    const parsedMin = minNum !== null && Number.isFinite(minNum) ? minNum : null;
    const parsedMax = maxNum !== null && Number.isFinite(maxNum) ? maxNum : null;

    return facilities
      .filter((facility) => {
        const matchesSearch =
          !query ||
          facility.Name.toLowerCase().includes(query) ||
          facility.Type.toLowerCase().includes(query);

        const matchesType = selectedType === "all" || facility.Type === selectedType;

        let matchesCapacity = true;

        if (parsedMin !== null || parsedMax !== null) {
          if (facility.Capacity === null) {
            matchesCapacity = false;
          } else if (parsedMin !== null && parsedMax !== null) {
            matchesCapacity = facility.Capacity >= parsedMin && facility.Capacity <= parsedMax;
          } else if (parsedMin !== null) {
            matchesCapacity = facility.Capacity >= parsedMin;
          } else if (parsedMax !== null) {
            matchesCapacity = facility.Capacity <= parsedMax;
          }
        }

        return matchesSearch && matchesType && matchesCapacity;
      })
      .sort((a, b) => a.Name.localeCompare(b.Name));
  }, [facilities, searchQuery, selectedType, minCapacity, maxCapacity]);

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedType !== "all" ||
    minCapacity !== "" ||
    maxCapacity !== "";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedType("all");
    setMinCapacity("");
    setMaxCapacity("");
  };

  const handleDeleteFacility = async (facilityId: string, facilityName: string) => {
    const confirmed = confirm(`Delete facility ${facilityName}?\nThis action cannot be undone.`);

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/facilities/delete/${facilityId}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to delete facility");
      }

      toast.success(`Facility ${facilityName} deleted`);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to delete facility");
    }
  };

  return (
    <div className="mx-auto w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Facility Directory</h1>
          <p className="text-sm text-muted-foreground">Manage facilities and capacity settings</p>
        </div>

        <Link href="/admin/facility/add">
          <Button className="gap-2 transition-colors hover:bg-primary/90">
            <Plus className="size-4" />
            Add Facility
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[220px] space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search facility..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Type</label>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {types.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Min Capacity</label>
          <Input
            type="number"
            min={0}
            placeholder="e.g. 20"
            value={minCapacity}
            onChange={(e) => setMinCapacity(e.target.value)}
            className="w-[140px]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Max Capacity</label>
          <Input
            type="number"
            min={0}
            placeholder="e.g. 200"
            value={maxCapacity}
            onChange={(e) => setMaxCapacity(e.target.value)}
            className="w-[140px]"
          />
        </div>

        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="gap-2 transition-colors hover:bg-accent"
          >
            <SlidersHorizontal className="size-4" />
            Clear
          </Button>
        )}
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</TableHead>
              <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</TableHead>
              <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Capacity</TableHead>
              <TableHead className="text-center w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={4}>
                    <div className="h-4 w-32 animate-pulse bg-muted rounded" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredFacilities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  No facilities found.
                </TableCell>
              </TableRow>
            ) : (
              filteredFacilities.map((facility) => (
                <TableRow key={facility.FacilityID} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="text-center font-medium">{facility.Name}</TableCell>
                  <TableCell className="text-center">
                    <Badge className={getTypeBadgeColor(facility.Type)}>{facility.Type}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {facility.Capacity === null ? "-" : facility.Capacity}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link href={`/admin/facility/edit/${facility.FacilityID}`}>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          className="transition-colors hover:bg-blue-50"
                        >
                          <Pencil className="size-4 text-blue-600" />
                        </Button>
                      </Link>

                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => handleDeleteFacility(facility.FacilityID, facility.Name)}
                        className="transition-colors hover:bg-red-50"
                      >
                        <Trash2 className="size-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
