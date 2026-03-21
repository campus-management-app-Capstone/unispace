'use client';

import { useState, useEffect } from 'react';
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
import {
Card,
CardContent,
CardDescription,
CardHeader,
CardTitle,
} from '@/components/ui/card';
import { toast } from 'react-toastify';

function formatIntake(intake: string) {
  if (!intake) return "";

  const year = intake.slice(0, 4);
  const month = intake.slice(4, 6);

  const months: Record<string, string> = {
    "01": "Jan",
    "02": "Feb",
    "03": "Mar",
    "04": "Apr",
    "05": "May",
    "06": "Jun",
    "07": "Jul",
    "08": "Aug",
    "09": "Sep",
    "10": "Oct",
    "11": "Nov",
    "12": "Dec",
  };

  return `${months[month] ?? month} ${year}`;
}

type Course = {
CourseID: string;
Name: string;
Level: string;
};

export default function AddStudentPage() {
const router = useRouter();

const [loading, setLoading] = useState(false);
const [loadingFormData, setLoadingFormData] = useState(true);

const [courses, setCourses] = useState<Course[]>([]);
const [intakes, setIntakes] = useState<string[]>([]);

const [formData, setFormData] = useState({
name: '',
email: '',
tempPassword: '',
courseId: '',
intakeMonth: '',
intakeYear: '',
isNewIntake: false,
});

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

/*
Load courses + intake options
*/
useEffect(() => {
const loadFormData = async () => {
try {
setLoadingFormData(true);

const response = await fetch('/api/admin/students/data');

if (!response.ok) {
throw new Error('Failed to fetch form data');
}

const result = await response.json();

setCourses(result.courses || []);
setIntakes(result.intakes || []);

} catch (error) {
console.error(error);
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

/*
Generate temporary password
*/
const generateTempPassword = () => {
const chars =
'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';

let password = '';

for (let i = 0; i < 12; i++) {
password += chars.charAt(Math.floor(Math.random() * chars.length));
}

setFormData(prev => ({ ...prev, tempPassword: password }));
};

/*
Submit → Create student
*/
const handleCreateStudent = async (e: React.FormEvent) => {
e.preventDefault();

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

if (formData.isNewIntake) {
  if (!formData.intakeMonth || !formData.intakeYear) {
    toast.error('Please select intake month and year');
    return;
  }
} else {
  if (!formData.intakeYear) {
    toast.error('Please select an existing intake');
    return;
  }
}

try {
  setLoading(true);

  const intake = formData.isNewIntake
  ? `${formData.intakeYear}${formData.intakeMonth}`
  : formData.intakeYear;

  const response = await fetch('/api/admin/students/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: formData.name,
      email: formData.email,
      password: formData.tempPassword,
      courseId: formData.courseId,
      intake,
    }),
  });

const result = await response.json();

if (!response.ok) {
throw new Error(result.error);
}

toast.success(
`Student Created!
Email: ${result.email}
StudentCode: ${result.studentCode}`
);

router.push('/admin/student');

} catch (error) {
if (!(error instanceof Error) || !error.message.toLowerCase().includes("email already exists")) {
  console.error(error);
}

toast.error(
  error instanceof Error
    ? error.message
    : 'Failed to create student'
);
} finally {
setLoading(false);
}
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
<h1 className="text-3xl font-bold tracking-tight">
Add New Student
</h1>

<p className="text-sm text-gray-500 mt-1">
Create a new student account and enroll them in a course
</p>
</div>

<div className="max-w-3xl">
<Card>
<CardHeader>
<CardTitle>Student Details</CardTitle>

<CardDescription>
Enter the student information. IDs will be generated
automatically.
</CardDescription>
</CardHeader>

<CardContent>
<form onSubmit={handleCreateStudent} className="space-y-6">

{/* Name */}

<div className="space-y-2">
<Label htmlFor="name">Student Name *</Label>

<Input
id="name"
name="name"
placeholder="e.g., John Doe"
value={formData.name}
onChange={handleInputChange}
/>
</div>

{/* Email */}

<div className="space-y-2">
  <Label htmlFor="email">Email *</Label>

  <Input
    id="email"
    name="email"
    type="email"
    placeholder="e.g., student@email.com"
    value={formData.email}
    onChange={handleInputChange}
  />
</div>

{/* Password */}

<div className="space-y-2">
<Label htmlFor="tempPassword">
Temporary Password *
</Label>

<div className="flex gap-2">
<Input
id="tempPassword"
name="tempPassword"
type="text"
placeholder="Generate a secure password"
value={formData.tempPassword}
onChange={handleInputChange}
/>

<Button
type="button"
variant="outline"
onClick={generateTempPassword}
className="transition-colors hover:bg-accent"
>
Generate
</Button>
</div>
<p className="text-xs text-gray-500">
Password must be at least 8 characters and cannot be a weak or commonly breached password.
</p>
</div>

{/* Course */}

<div className="space-y-2">
<Label>Course *</Label>

<Select
value={formData.courseId}
onValueChange={(value) =>
handleSelectChange('courseId', value)
}
>
<SelectTrigger>
<SelectValue placeholder="Select a course" />
</SelectTrigger>

<SelectContent>
{courses.map(course => (
<SelectItem
key={course.CourseID}
value={course.CourseID}
>
{course.CourseID} - {course.Name} (
{course.Level})
</SelectItem>
))}
</SelectContent>
</Select>
</div>

{/* Intake */}

<div className="space-y-4">

<Label>Intake *</Label>

<div className="space-y-3">

<div className="flex items-center gap-2">

<input
type="radio"
checked={!formData.isNewIntake}
onChange={() =>
setFormData(prev => ({
...prev,
isNewIntake: false,
}))
}
/>

<span>Select existing intake</span>

</div>

{!formData.isNewIntake && (

<Select
value={formData.intakeYear}
onValueChange={(value) =>
handleSelectChange('intakeYear', value)
}
>

<SelectTrigger className="ml-6">
<SelectValue placeholder="Select intake" />
</SelectTrigger>

<SelectContent>

{intakes.map(intake => (

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
checked={formData.isNewIntake}
onChange={() =>
setFormData(prev => ({
...prev,
isNewIntake: true,
}))
}
/>

<span>Create new intake</span>

</div>

{formData.isNewIntake && (

<div className="ml-6 flex gap-3">

<Select
value={formData.intakeMonth}
onValueChange={(value) =>
handleSelectChange('intakeMonth', value)
}
>

<SelectTrigger className="flex-1">
<SelectValue placeholder="Month" />
</SelectTrigger>

<SelectContent>

{months.map(month => (

<SelectItem
key={month.value}
value={month.value}
>
{month.label}
</SelectItem>

))}

</SelectContent>
</Select>

<Select
value={formData.intakeYear}
onValueChange={(value) =>
handleSelectChange('intakeYear', value)
}
>

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

{/* Info */}

<div className="rounded-lg bg-blue-50 p-4">

<p className="text-sm text-blue-800">

<strong>Auto Generated:</strong>
<br />
UserID, StudentID, StudentCode, EnrollmentID
</p>

</div>

{/* Buttons */}

<div className="flex gap-3 pt-4">

<Button
type="submit"
disabled={loading}
className="transition-colors hover:bg-primary/90"
>

{loading
? 'Creating Student...'
: 'Create Student'}

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
