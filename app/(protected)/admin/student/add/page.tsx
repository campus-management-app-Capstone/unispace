'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminBreadcrumb from '@/components/AdminBreadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-toastify';

export default function AddStudentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    userId: '',
    intake: new Date().getFullYear().toString(),
    courseId: '',
  });

  const currentYear = new Date().getFullYear();
  const intakeOptions = Array.from({ length: 10 }, (_, i) => 
    (currentYear - i).toString()
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.studentId.trim()) {
      toast.error('Student ID is required');
      return;
    }
    if (!formData.userId.trim()) {
      toast.error('User ID is required');
      return;
    }
    if (!formData.intake) {
      toast.error('Intake year is required');
      return;
    }
    if (!formData.courseId.trim()) {
      toast.error('Course ID is required');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('/api/admin/students/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create student');
      }

      toast.success('Student added successfully');
      router.push('/admin/student');
    } catch (error) {
      console.error('Error creating student:', error);
      const message = error instanceof Error ? error.message : 'Failed to create student';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <AdminBreadcrumb />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Student</h1>
        <p className="text-sm text-gray-500 mt-1">
          Create a new student record and enroll them in a course
        </p>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
            <CardDescription>
              Fill in the student details and select their intake year and course
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Student ID */}
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID *</Label>
                <Input
                  id="studentId"
                  name="studentId"
                  placeholder="e.g., STU001"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  required
                />
                <p className="text-xs text-gray-500">Unique identifier for the student</p>
              </div>

              {/* User ID */}
              <div className="space-y-2">
                <Label htmlFor="userId">User ID *</Label>
                <Input
                  id="userId"
                  name="userId"
                  placeholder="e.g., user_123abc"
                  value={formData.userId}
                  onChange={handleInputChange}
                  required
                />
                <p className="text-xs text-gray-500">
                  The User ID from the User table (linked via Clerk)
                </p>
              </div>

              {/* Intake Year */}
              <div className="space-y-2">
                <Label htmlFor="intake">Intake Year *</Label>
                <Select value={formData.intake} onValueChange={(value) => handleSelectChange('intake', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {intakeOptions.map(year => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">The year the student was admitted</p>
              </div>

              {/* Course ID */}
              <div className="space-y-2">
                <Label htmlFor="courseId">Course ID *</Label>
                <Input
                  id="courseId"
                  name="courseId"
                  placeholder="e.g., CS101"
                  value={formData.courseId}
                  onChange={handleInputChange}
                  required
                />
                <p className="text-xs text-gray-500">
                  The course the student is enrolling in
                </p>
              </div>

              {/* Info Box */}
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This will create a Student record and an Enrollment record. 
                  Ensure the User ID exists in the User table and the Course ID exists in the Course table.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Add Student'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
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