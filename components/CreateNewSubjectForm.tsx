import { useCallback, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
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

const Durations = [1, 1.15, 1.30, 1.45, 2] as const;

/** Zod schema for subject + syllabus creation */
const subjectFormSchema = z.object({
    SubjectID: z.string().min(2, "Subject code must be at least 2 characters.").max(20, "Subject code must be at most 20 characters."),
    Name: z.string().min(3, "Subject name must be at least 3 characters.").max(100, "Subject name must be at most 100 characters."),
    CourseID: z.string().min(1, "Please select a course."),
    Duration: z.number().min(1, "At least 1 hour is required.").max(4, "Maximum 4 hours."),
    Semester: z.number().int("Must be a whole number.").min(1, "At least semester 1 is required.").max(16, "Maximum semester 16."),
});

export type subjectFormValues = z.infer<typeof subjectFormSchema>;

interface CreateNewSubjectFormProps {
    courses: { CourseID: string; Name: string; TotalSemester: number }[];
    onSubmit: (data: subjectFormValues) => Promise<void>;
    isSubmitting: boolean;
    onCancel: () => void;
}

/**
 * CreateNewSubjectForm — creates a Subject and assigns it to a
 * Course + Semester via the Syllabus table.
 */
export default function CreateNewSubjectForm({
    courses,
    onSubmit,
    isSubmitting,
    onCancel,
}: CreateNewSubjectFormProps) {
    const form = useForm<subjectFormValues>({
        resolver: zodResolver(subjectFormSchema),
        defaultValues: {
            SubjectID: "",
            Name: "",
            CourseID: courses[0]?.CourseID || "",
            Duration: 1,
            Semester: 1,
        },
    });

    const selectedCourseID = useWatch({ control: form.control, name: "CourseID" });

    /** Derive max semesters from the currently selected course */
    const maxSemesters = useMemo(() => {
        const course = courses.find((c) => c.CourseID === selectedCourseID);
        return course?.TotalSemester ?? 8;
    }, [courses, selectedCourseID]);

    /** Generate semester options from 1..maxSemesters */
    const semesterOptions = useMemo(
        () => Array.from({ length: maxSemesters }, (_, i) => i + 1),
        [maxSemesters]
    );

    const handleFormSubmit = useCallback(
        async (data: subjectFormValues) => {
            await onSubmit(data);
            form.reset();
        },
        [onSubmit, form]
    );

    return (
        <form
            id="create-subject-form"
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-1"
        >
            <FieldGroup>
                {/* Subject Code */}
                <Controller
                    name="SubjectID"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="create-subject-id">Subject Code</FieldLabel>
                            <Input
                                {...field}
                                id="create-subject-id"
                                aria-invalid={fieldState.invalid}
                                placeholder="e.g. CS01-0123"
                                autoComplete="off"
                            />
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                        </Field>
                    )}
                />

                {/* Subject Name */}
                <Controller
                    name="Name"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="create-subject-name">Subject Name</FieldLabel>
                            <Input
                                {...field}
                                id="create-subject-name"
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

                {/* Course */}
                <Controller
                    name="CourseID"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="create-subject-course">Course</FieldLabel>
                            <Select
                                name={field.name}
                                value={field.value}
                                onValueChange={(v) => {
                                    field.onChange(v);
                                    form.setValue("Semester", 1);
                                }}
                            >
                                <SelectTrigger
                                    id="create-subject-course"
                                    aria-invalid={fieldState.invalid}
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Select course" />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses.map((d) => (
                                        <SelectItem key={d.CourseID} value={d.CourseID}>
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

                {/* Duration */}
                <Controller
                    name="Duration"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="create-subject-duration">Duration</FieldLabel>
                            <Select
                                name={field.name}
                                value={String(field.value)}
                                onValueChange={(v) => field.onChange(Number(v))}
                            >
                                <SelectTrigger
                                    id="create-subject-duration"
                                    aria-invalid={fieldState.invalid}
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Select duration" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Durations.map((duration) => (
                                        <SelectItem key={duration} value={String(duration)}>
                                            {duration} hr{duration > 1 ? "s" : ""}
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

                {/* Semester — which semester this subject is assigned to */}
                <Controller
                    name="Semester"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="create-subject-semester">
                                Semester
                            </FieldLabel>
                            <Select
                                name={field.name}
                                value={String(field.value)}
                                onValueChange={(v) => field.onChange(Number(v))}
                            >
                                <SelectTrigger
                                    id="create-subject-semester"
                                    aria-invalid={fieldState.invalid}
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Select semester" />
                                </SelectTrigger>
                                <SelectContent>
                                    {semesterOptions.map((sem) => (
                                        <SelectItem key={sem} value={String(sem)}>
                                            Semester {sem}
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
            </FieldGroup>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Subject"}
                </Button>
            </div>
        </form>
    )
}
