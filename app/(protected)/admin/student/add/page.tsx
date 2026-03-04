'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, CheckCircle2, AlertCircle } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'react-toastify';
import { json } from 'zod';

type Step = 'details' | 'verification' | 'confirmation';

type Course = {
  CourseID: string;
  Name: string;
  Level: string;
};

export default function AddStudentPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('details');
  const [loading, setLoading] = useState(false);
  const [loadingFormData, setLoadingFormData] = useState(true);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    tempPassword: '',
    courseId: '',
    intakeMonth: '',
    intakeYear: '',
    isNewIntake: false,
  });

  // Form options
  const [courses, setCourses] = useState<Course[]>([]);
  const [intakes, setIntakes] = useState<string[]>([]);

  // Generated/API response values
  const [userId, setUserId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [enrollmentId, setEnrollmentId] = useState('');
  const [clerkCreated, setClerkCreated] = useState(false);

  const months = [
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
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) =>
    (currentYear - i).toString()
  );

  // Load courses and intakes on mount
  useEffect(() => {
    const loadFormData = async () => {
      try {
        setLoadingFormData(true);

        const response = await fetch('/api/admin/students/data');
        
        const result = await response.json();
        console.log("here");


        const { courses, intakes } = result;

        if (!response.ok) throw new Error('Failed to fetch');

        // const { courses, intakes } = await response.json();

        setCourses(courses || []);
        setIntakes(intakes || []);
      } catch (error) {
        console.error('Error loading form data:', error);
        toast.error('Failed to load courses and intakes');
      } finally {
        setLoadingFormData(false);
      }
    };

    loadFormData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateTempPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, tempPassword: password }));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleStepOneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Student name is required');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }
    if (!formData.tempPassword.trim()) {
      toast.error('Temporary password is required');
      return;
    }
    if (!formData.courseId) {
      toast.error('Course is required');
      return;
    }
    if (!formData.intakeMonth || (!formData.intakeYear && !formData.isNewIntake)) {
      toast.error('Intake month and year are required');
      return;
    }

    try {
      setLoading(true);

      // Create Clerk user
      const clerkResponse = await fetch('/api/admin/students/create-clerk-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.tempPassword,
          name: formData.name,
        }),
      });

      if (!clerkResponse.ok) {
        const error = await clerkResponse.json();
        throw new Error(error.error);
      }

      const clerkData = await clerkResponse.json();
      setUserId(clerkData.userId);
      setClerkCreated(true);
      setCurrentStep('verification');
    } catch (error) {
      console.error('Error creating Clerk user:', error);
      const message = error instanceof Error ? error.message : 'Failed to create user in Clerk';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleStepTwoSubmit = async () => {
    if (!userId) {
      toast.error('Clerk user not created');
      return;
    }

    try {
      setLoading(true);

      // Format intake
      const intakeValue = formData.isNewIntake
        ? `${formData.intakeMonth}${formData.intakeYear}`
        : formData.intakeYear;

      // Create in Supabase
      const response = await fetch('/api/admin/students/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          courseId: formData.courseId,
          intake: intakeValue,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const data = await response.json();
      setStudentId(data.student.StudentID);
      setStudentCode(data.student.StudentCode);
      setEnrollmentId(data.enrollment.EnrollmentID);

      setCurrentStep('confirmation');
    } catch (error) {
      console.error('Error creating student:', error);
      const message = error instanceof Error ? error.message : 'Failed to create student';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    router.push('/admin/student');
  };

  if (loadingFormData) {
    return (
      <div className="p-6 space-y-4">
        <AdminBreadcrumb />
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Student</h1>
        <p className="text-sm text-gray-500 mt-1">
          Create a new student account and enroll them in a course
        </p>
      </div>

      <div className="max-w-3xl">
        <Tabs value={currentStep} onValueChange={(value) => setCurrentStep(value as Step)} disabled={loading}>
          {/* Step 1: Student Details */}
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Student Details</CardTitle>
                <CardDescription>
                  Enter the student information. All other IDs will be auto-generated.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleStepOneSubmit} className="space-y-6">
                  {/* Student Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Student Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="e.g., John Doe"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="e.g., student@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                    <p className="text-xs text-gray-500">Email used for login</p>
                  </div>

                  {/* Temporary Password */}
                  <div className="space-y-2">
                    <Label htmlFor="tempPassword">Temporary Password *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="tempPassword"
                        name="tempPassword"
                        type="text"
                        placeholder="Click 'Generate' to create a secure password"
                        value={formData.tempPassword}
                        onChange={handleInputChange}
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={generateTempPassword}
                      >
                        Generate
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">Student must change on first login</p>
                  </div>

                  {/* Course Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="courseId">Course *</Label>
                    <Select value={formData.courseId} onValueChange={(value) => handleSelectChange('courseId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map(course => (
                          <SelectItem key={course.CourseID} value={course.CourseID}>
                            {course.CourseID} - {course.Name} ({course.Level})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">Shows CourseID, Name, and Level</p>
                  </div>

                  {/* Intake Selection */}
                  <div className="space-y-4">
                    <Label>Intake *</Label>

                    {/* Existing Intake or New */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          id="existingIntake"
                          name="intakeType"
                          checked={!formData.isNewIntake}
                          onChange={() => setFormData(prev => ({ ...prev, isNewIntake: false, intakeMonth: '', intakeYear: '' }))}
                          className="rounded"
                        />
                        <Label htmlFor="existingIntake" className="mb-0 cursor-pointer font-normal">
                          Select existing intake
                        </Label>
                      </div>

                      {!formData.isNewIntake && (
                        <Select value={formData.intakeYear} onValueChange={(value) => handleSelectChange('intakeYear', value)}>
                          <SelectTrigger className="ml-6">
                            <SelectValue placeholder="Select intake" />
                          </SelectTrigger>
                          <SelectContent>
                            {intakes.map(intake => (
                              <SelectItem key={intake} value={intake}>
                                {intake}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      <div className="flex items-center gap-2 mt-4">
                        <input
                          type="radio"
                          id="newIntake"
                          name="intakeType"
                          checked={formData.isNewIntake}
                          onChange={() => setFormData(prev => ({ ...prev, isNewIntake: true, intakeYear: '' }))}
                          className="rounded"
                        />
                        <Label htmlFor="newIntake" className="mb-0 cursor-pointer font-normal">
                          Create new intake (MM/YYYY)
                        </Label>
                      </div>

                      {formData.isNewIntake && (
                        <div className="ml-6 flex gap-3">
                          <Select value={formData.intakeMonth} onValueChange={(value) => handleSelectChange('intakeMonth', value)}>
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Month" />
                            </SelectTrigger>
                            <SelectContent>
                              {months.map(month => (
                                <SelectItem key={month.value} value={month.value}>
                                  {month.label} ({month.value})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select value={formData.intakeYear} onValueChange={(value) => handleSelectChange('intakeYear', value)}>
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                              {years.map(year => (
                                <SelectItem key={year} value={year}>
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="rounded-lg bg-blue-50 p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Auto-generated IDs:</strong> StudentID (UUID), StudentCode (STU000001, STU000002...), EnrollmentID (UUID), and WalletID will be automatically generated.
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Creating Clerk User...' : 'Continue to Verification'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 2: Verification */}
          <TabsContent value="verification">
            <Card>
              <CardHeader>
                <CardTitle>Verify Credentials</CardTitle>
                <CardDescription>
                  Review the credentials before finalizing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg border p-4 space-y-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Name:</span>
                    <span className="text-sm">{formData.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Email:</span>
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-sm">{formData.email}</code>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(formData.email, 'Email')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Temporary Password:</span>
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-sm">{formData.tempPassword}</code>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(formData.tempPassword, 'Password')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Course:</span>
                    <span className="text-sm">
                      {courses.find(c => c.CourseID === formData.courseId)?.Name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Intake:</span>
                    <span className="text-sm font-mono">
                      {formData.isNewIntake
                        ? `${formData.intakeMonth}/${formData.intakeYear}`
                        : formData.intakeYear
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Role:</span>
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                      Student
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Clerk Status:</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-700">User created</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-yellow-50 p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>⚠️ Important:</strong> Save the email and password securely. The student will need to change the password on first login.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleStepTwoSubmit} disabled={loading}>
                    {loading ? 'Creating in Database...' : 'Finalize & Create'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep('details')}
                    disabled={loading}
                  >
                    Back
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 3: Confirmation */}
          <TabsContent value="confirmation">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Student Created Successfully
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg bg-green-50 p-4">
                  <p className="text-sm text-green-800">
                    <strong>Success!</strong> The student account has been created in both Clerk and the database.
                  </p>
                </div>

                <div className="rounded-lg border p-4 space-y-3 bg-gray-50">
                  <h3 className="font-semibold text-sm">Auto-Generated IDs</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">StudentID:</span>
                      <div className="flex items-center gap-2">
                        <code className="font-mono">{studentId}</code>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(studentId, 'StudentID')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">StudentCode:</span>
                      <div className="flex items-center gap-2">
                        <code className="font-mono">{studentCode}</code>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(studentCode, 'StudentCode')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">EnrollmentID:</span>
                      <div className="flex items-center gap-2">
                        <code className="font-mono">{enrollmentId}</code>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(enrollmentId, 'EnrollmentID')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-4 space-y-3 bg-gray-50">
                  <h3 className="font-semibold text-sm">Student Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Name:</span> {formData.name}</div>
                    <div><span className="font-medium">Email:</span> {formData.email}</div>
                    <div>
                      <span className="font-medium">Course:</span> {courses.find(c => c.CourseID === formData.courseId)?.Name}
                    </div>
                    <div>
                      <span className="font-medium">Intake:</span> {formData.isNewIntake ? `${formData.intakeMonth}/${formData.intakeYear}` : formData.intakeYear}
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-blue-50 p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Next steps:</strong> The student can now log in with their email and temporary password. They will be prompted to change their password on first login.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleFinish}>
                    Back to Student List
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => copyToClipboard(`Email: ${formData.email}\nPassword: ${formData.tempPassword}`, 'Credentials')}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Credentials
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}