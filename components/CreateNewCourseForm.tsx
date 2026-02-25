"use client";

import { useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** Available academic levels */
const LEVELS = ["Foundation", "Diploma", "Undergraduate"] as const;

/** Zod schema for course creation */
const courseFormSchema = z.object({
  CourseID: z
    .string()
    .min(2, "Course code must be at least 2 characters.")
    .max(20, "Course code must be at most 20 characters."),
  Name: z
    .string()
    .min(3, "Course name must be at least 3 characters.")
    .max(100, "Course name must be at most 100 characters."),
  DepartmentID: z
    .string()
    .min(1, "Please select a department."),
  Level: z
    .string()
    .min(1, "Please select a level."),
  TotalSemester: z
    .number()
    .int("Must be a whole number.")
    .min(1, "At least 1 semester is required.")
    .max(16, "Maximum 16 semesters."),
});

export type CourseFormValues = z.infer<typeof courseFormSchema>;

interface CreateNewCourseFormProps {
  departments: { DepartmentID: string; Name: string }[];
  onSubmit: (data: CourseFormValues) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

/**
 * CreateNewCourseForm — React Hook Form + Zod validated form
 * for creating a new course. Renders inside a Dialog.
 */
export default function CreateNewCourseForm({
  departments,
  onSubmit,
  isSubmitting,
  onCancel,
}: CreateNewCourseFormProps) {
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      CourseID: "",
      Name: "",
      DepartmentID: "",
      Level: "",
      TotalSemester: 1,
    },
  });

  const handleFormSubmit = useCallback(
    async (data: CourseFormValues) => {
      await onSubmit(data);
    },
    [onSubmit]
  );

  return (
    <form
      id="create-course-form"
      onSubmit={form.handleSubmit(handleFormSubmit)}
      className="space-y-1"
    >
      <FieldGroup>
        {/* Course Code */}
        <Controller
          name="CourseID"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="create-course-id">Course Code</FieldLabel>
              <Input
                {...field}
                id="create-course-id"
                aria-invalid={fieldState.invalid}
                placeholder="e.g. CS101"
                autoComplete="off"
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        {/* Course Name */}
        <Controller
          name="Name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="create-course-name">Course Name</FieldLabel>
              <Input
                {...field}
                id="create-course-name"
                aria-invalid={fieldState.invalid}
                placeholder="e.g. Intro to Computer Science"
                autoComplete="off"
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        {/* Department */}
        <Controller
          name="DepartmentID"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="create-course-dept">Department</FieldLabel>
              <Select
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  id="create-course-dept"
                  aria-invalid={fieldState.invalid}
                  className="w-full"
                >
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.DepartmentID} value={d.DepartmentID}>
                      {d.Name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        {/* Level */}
        <Controller
          name="Level"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="create-course-level">Level</FieldLabel>
              <Select
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  id="create-course-level"
                  aria-invalid={fieldState.invalid}
                  className="w-full"
                >
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        {/* Total Semesters */}
        <Controller
          name="TotalSemester"
          control={form.control}
          render={({ field: { onChange, value, ...rest }, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="create-course-semesters">
                Total Semesters
              </FieldLabel>
              <Input
                {...rest}
                id="create-course-semesters"
                type="number"
                min={1}
                max={16}
                value={value}
                onChange={(e) => onChange(e.target.valueAsNumber || 0)}
                aria-invalid={fieldState.invalid}
                placeholder="e.g. 8"
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
      </FieldGroup>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Course"}
        </Button>
      </div>
    </form>
  );
}
