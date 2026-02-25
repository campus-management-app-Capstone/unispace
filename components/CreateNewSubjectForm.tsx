// "use client";

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

// constant for tutorial/lecture durations 
const Durations = [1, 1.15, 1.30, 1.45, 2] as const;

// zod schema for subject creation
const subjectFormSchema = z.object({
    SubjectID: z.string().min(2, "Subject code must be at least 2 characters.").max(20, "Subject code must be at most 20 characters."),
    Name: z.string().min(3, "Subject name must be at least 3 characters.").max(100, "Subject name must be at most 100 characters."),
    CourseID: z.string().min(1, "Please select a course."),
    Duration: z.number().int("Must be a whole number.").min(1, "At least 1 hour is required.").max(4, "Maximum 4 hours."),
    Semester: z.number().int("Must be a whole number.").min(1, "At least semester 1 is required.").max(16, "Maximum semester 16."),
});

export type subjectFormValues = z.infer<typeof subjectFormSchema>;

interface CreateNewSubjectFormProps {
    courses: { CourseID: string; Name: string }[];
    onSubmit: (data: subjectFormValues) => Promise<void>;
    isSubmitting: boolean;
    onCancel: () => void;
}
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

    const handleFormSubmit = useCallback(
        async (data: subjectFormValues) => {
            await onSubmit(data);
            form.reset();
        },
        [onSubmit, form]
    );

    return (
        <form
            id="create-course-form"
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
                                onValueChange={field.onChange}
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
                                value={field.value}
                                onValueChange={field.onChange}
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
                                        <SelectItem key={duration} value={duration}>
                                            {duration}
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
                    name="Semester"
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
        </form>
    )
}