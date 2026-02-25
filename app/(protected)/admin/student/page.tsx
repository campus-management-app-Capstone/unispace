'use client';

import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';
import AdminBreadcrumb from '@/components/AdminBreadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StudentTable from '@/components/StudentTable';
import { toast } from 'react-toastify';

type Student = {
  StudentID: string;
  UserID: string;
};

type Enrollment = {
  EnrollmentID: string;
  StudentID: string;
  CourseID: string;
  Intake: string;
};

export default function StudentManagementPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIntake, setActiveIntake] = useState<string | null>(null);
  const [intakes, setIntakes] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/students');
      
      if (!response.ok) throw new Error('Failed to fetch');
      
      const { students: studentsData, enrollments: enrollmentsData } = await response.json();

      setStudents(studentsData || []);
      setEnrollments(enrollmentsData || []);

      // Extract unique intakes and sort them
      const uniqueIntakes = Array.from(
        new Set((enrollmentsData || []).map((e: Enrollment) => e.Intake))
      ).sort().reverse();

      setIntakes(uniqueIntakes);
      
      // Set first intake as default
      if (uniqueIntakes.length > 0) {
        setActiveIntake(uniqueIntakes[0]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  // Filter students by intake
  const getStudentsByIntake = (intake: string | null) => {
    if (!intake) return students;

    const studentIdsInIntake = enrollments
      .filter(e => e.Intake === intake)
      .map(e => e.StudentID);

    return students.filter(s => studentIdsInIntake.includes(s.StudentID));
  };

  // Filter by search term
  const filteredStudents = getStudentsByIntake(activeIntake).filter(student => {
    const lowerSearch = searchTerm.toLowerCase();
    return (
      student.StudentID.toLowerCase().includes(lowerSearch) ||
      student.UserID.toLowerCase().includes(lowerSearch)
    );
  });

  if (loading) {
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
      {/* Breadcrumb */}
      <AdminBreadcrumb />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage student records organized by intake year
          </p>
        </div>
        <Link href="/admin/student/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by Student ID or User ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Intake Tabs */}
      {intakes.length > 0 ? (
        <Tabs 
          value={activeIntake || undefined} 
          onValueChange={setActiveIntake}
          className="w-full"
        >
          <TabsList className="grid w-full overflow-x-auto">
            {intakes.map(intake => (
              <TabsTrigger key={intake} value={intake} className="whitespace-nowrap">
                {intake || 'No Intake'}
              </TabsTrigger>
            ))}
          </TabsList>

          {intakes.map(intake => (
            <TabsContent key={intake} value={intake} className="mt-4">
              <StudentTable 
                students={filteredStudents}
                intake={intake}
                onDataChange={loadData}
              />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No intakes found</p>
          <p className="text-sm text-gray-400">Add a student to create the first intake</p>
        </div>
      )}

      {/* No results */}
      {intakes.length > 0 && filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-2">No students found in {activeIntake}</p>
          <p className="text-sm text-gray-400">Try adjusting your search filters</p>
        </div>
      )}
    </div>
  );
}