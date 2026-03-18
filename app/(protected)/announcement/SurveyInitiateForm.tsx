"use client";

import * as React from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type LecturerClassOption = {
  ClassID: string;
  SubjectName: string | null;
  hasSurvey: boolean;
};

export default function SurveyInitiateForm({
  classes,
  action,
}: {
  classes: LecturerClassOption[];
  action: (formData: FormData) => void | Promise<void>;
}) {
  const firstAvailable = React.useMemo(
    () => classes.find((cls) => !cls.hasSurvey)?.ClassID ?? "",
    [classes]
  );
  const firstClass = React.useMemo(
    () => classes[0]?.ClassID ?? "",
    [classes]
  );

  const [selectedId, setSelectedId] = React.useState<string>(
    firstAvailable || firstClass
  );

  React.useEffect(() => {
    if (!selectedId) {
      setSelectedId(firstAvailable || firstClass);
      return;
    }
    const selected = classes.find((cls) => cls.ClassID === selectedId);
    if (!selected || selected.hasSurvey) {
      setSelectedId(firstAvailable || firstClass);
    }
  }, [classes, firstAvailable, firstClass, selectedId]);

  const selected = classes.find((cls) => cls.ClassID === selectedId);
  const isSendDisabled = !selectedId || !!selected?.hasSurvey;

  return (
    <form action={action} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
      <input type="hidden" name="classId" value={selectedId} />

      <div className="flex-1">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Class
        </label>
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger className="mt-1 w-full rounded-lg border border-slate-300 bg-white text-sm text-slate-800 focus:border-slate-500">
            <SelectValue placeholder="Select a class" />
          </SelectTrigger>
          <SelectContent align="start">
            {classes.map((cls) => {
              const label = `${cls.ClassID}${
                cls.SubjectName ? ` - ${cls.SubjectName}` : ""
              }`;
              return (
                <SelectItem
                  key={cls.ClassID}
                  value={cls.ClassID}
                  disabled={cls.hasSurvey}
                >
                  <span className="flex w-full items-center justify-between gap-3">
                    <span>{label}</span>
                    {cls.hasSurvey && (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                        Sent
                      </span>
                    )}
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="gap-2" disabled={isSendDisabled}>
        <Send className="size-4" />
        Send Survey
      </Button>
    </form>
  );
}
