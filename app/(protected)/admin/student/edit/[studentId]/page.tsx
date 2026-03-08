'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Course = {
  CourseID: string;
  Name: string;
  Level: string;
};

type StudentDetails = {
  StudentID: string;
  StudentCode: string;
  Name: string;
  Email: string;
  CourseID: string;
  Intake: string;
};

function formatIntake(intake: string) {
  if (!intake) return '';

  const year = intake.slice(0, 4);
  const month = intake.slice(4, 6);

  const months: Record<string, string> = {
    '01': 'Jan',
    '02': 'Feb',
    '03': 'Mar',
    '04': 'Apr',
    '05': 'May',
    '06': 'Jun',
    '07': 'Jul',
    '08': 'Aug',
    '09': 'Sep',
    '10': 'Oct',
    '11': 'Nov',
    '12': 'Dec',
  };

  return `${months[month] ?? month} ${year}`;
}

export default function EditStudentPage() {
  const params = useParams<{ studentId: string }>();
  const router = useRouter();
  const studentId = params.studentId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [courses, setCourses] = useState<Course[]>([]);
  const [intakes, setIntakes] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    studentCode: '',
    name: '',
    email: '',
    courseId: '',
    intake: '',
  });

  const [isNewIntake, setIsNewIntake] = useState(false);
  const [intakeMonth, setIntakeMonth] = useState('');
  const [intakeYear, setIntakeYear] = useState('');

  const months = useMemo(
    () => [
      { value: '01', label: 'January' },
      { value: '02', label: 'February' },
      { value: '03', label: 'March' },
      { value: '04', label: 'April' },
      { value: '05', label: 'May' },
      { value: '06', label: 'June' },
      { value: '07', label: 'July' },
      { value: '08', label: 'August' },
      { value: '09', label: 'September' },
      { value: '10', label: 'October' },
      { value: '11', label: 'November' },
      { value: '12', label: 'December' },
    ],
    []
  );

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/students/${studentId}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Failed to load student');

        const student = data.student as StudentDetails;

        setCourses(data.courses || []);
        setIntakes(data.intakes || []);
        setFormData({
          studentCode: student.StudentCode,
          name: student.Name || '',
          email: student.Email || '',
          courseId: student.CourseID || '',
          intake: student.Intake || '',
        });
      } catch (err) {
        console.error(err);
        toast.error(err instanceof Error ? err.message : 'Failed to load student');
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      load();
    }
  }, [studentId]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.courseId) {
      toast.error('Name, email, and course are required');
      return;
    }

    const intake = isNewIntake ? `${intakeYear}${intakeMonth}` : formData.intake;
    if (!intake) {
      toast.error('Please select an intake');
      return;
    }

    try {
      setSaving(true);

      const res = await fetch(`/api/admin/students/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          courseId: formData.courseId,
          intake,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update student');
      }

      toast.success('Student updated successfully');
      router.push('/admin/student');
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Failed to update student');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading student details...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Student</h1>
        <p className="text-sm text-gray-500 mt-1">Update student profile and enrollment details.</p>
      </div>

      <div className="max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Student Details</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="studentCode">Student Code</Label>
                <Input id="studentCode" value={formData.studentCode} disabled />
                <CardDescription>Student code cannot be changed.</CardDescription>
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
                <Label>Course *</Label>
                <Select
                  value={formData.courseId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, courseId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.CourseID} value={course.CourseID}>
                        {course.CourseID} - {course.Name} ({course.Level})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label>Intake *</Label>

                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={!isNewIntake}
                    onChange={() => setIsNewIntake(false)}
                  />
                  <span>Select existing intake</span>
                </div>

                {!isNewIntake && (
                  <Select
                    value={formData.intake}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, intake: value }))}
                  >
                    <SelectTrigger className="ml-6">
                      <SelectValue placeholder="Select intake" />
                    </SelectTrigger>
                    <SelectContent>
                      {intakes.map((intake) => (
                        <SelectItem key={intake} value={intake}>
                          {formatIntake(intake)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <div className="flex items-center gap-2 mt-4">
                  <input
                    type="radio"
                    checked={isNewIntake}
                    onChange={() => {
                      setIsNewIntake(true);
                      setFormData((prev) => ({ ...prev, intake: '' }));
                    }}
                  />
                  <span>Create new intake</span>
                </div>

                {isNewIntake && (
                  <div className="ml-6 flex gap-3">
                    <Select value={intakeMonth} onValueChange={setIntakeMonth}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={intakeYear} onValueChange={setIntakeYear}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Updating Student...' : 'Save Changes'}
                </Button>

                <Button type="button" variant="outline" onClick={() => router.back()} disabled={saving}>
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