import { createClerkSupabaseClient, createServerSupabaseClient } from './supabase';
import type { TablesInsert, TablesUpdate } from '@/types/supabase';

// ============================================================================
// USER OPERATIONS
// ============================================================================

/**
 * Get a user by their UserID
 */
export async function getUser(userId: string) {
  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase
    .from('User')
    .select('*')
    .eq('UserID', userId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create a new user
 */
export async function createUser(userData: TablesInsert<'User'>) {
  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase
    .from('User')
    .insert([userData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers() {
  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase
    .from('User')
    .select('*')
    .order('UserID', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Update a user
 */
export async function updateUser(
  userId: string,
  updates: TablesUpdate<'User'>
) {
  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase
    .from('User')
    .update(updates)
    .eq('UserID', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a user
 */
export async function deleteUser(userId: string) {
  const supabase = await createClerkSupabaseClient();
  const { error } = await supabase
    .from('User')
    .delete()
    .eq('UserID', userId);

  if (error) throw error;
}

// ============================================================================
// STUDENT OPERATIONS
// ============================================================================

/**
 * Create a new student
 */
export async function createStudent(studentData: TablesInsert<'Student'>) {
  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase
    .from('Student')
    .insert([studentData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get student by StudentID
 */
export async function getStudent(studentId: string) {
  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase
    .from('Student')
    .select('*')
    .eq('StudentID', studentId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get student by UserID
 */
export async function getStudentByUserId(userId: string) {
  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase
    .from('Student')
    .select('*')
    .eq('UserID', userId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get all students
 */
export async function getAllStudents() {
  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase
    .from('Student')
    .select('*')
    .order('StudentID', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Update a student
 */
export async function updateStudent(
  studentId: string,
  updates: TablesUpdate<'Student'>
) {
  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase
    .from('Student')
    .update(updates)
    .eq('StudentID', studentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a student
 */
export async function deleteStudent(studentId: string) {
  const supabase = await createClerkSupabaseClient();
  const { error } = await supabase
    .from('Student')
    .delete()
    .eq('StudentID', studentId);

  if (error) throw error;
}

// ============================================================================
// LECTURER OPERATIONS
// ============================================================================

/**
 * Create a new lecturer
 */
export async function createLecturer(lecturerData: TablesInsert<'Lecturer'>) {
  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase
    .from('Lecturer')
    .insert([lecturerData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get lecturer by LecturerID
 */
export async function getLecturer(lecturerId: string) {
  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase
    .from('Lecturer')
    .select('*')
    .eq('LecturerID', lecturerId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get lecturer by UserID
 */
export async function getLecturerByUserId(userId: string) {
  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase
    .from('Lecturer')
    .select('*')
    .eq('UserID', userId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get all lecturers
 */
export async function getAllLecturers() {
  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase
    .from('Lecturer')
    .select('*')
    .order('LecturerID', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Update a lecturer
 */
export async function updateLecturer(
  lecturerId: string,
  updates: TablesUpdate<'Lecturer'>
) {
  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase
    .from('Lecturer')
    .update(updates)
    .eq('LecturerID', lecturerId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a lecturer
 */
export async function deleteLecturer(lecturerId: string) {
  const supabase = await createClerkSupabaseClient();
  const { error } = await supabase
    .from('Lecturer')
    .delete()
    .eq('LecturerID', lecturerId);

  if (error) throw error;
}

// ============================================================================
// ADMIN OPERATIONS
// ============================================================================

/**
 * Create a new admin
 */
export async function createAdmin(adminData: TablesInsert<'Admin'>) {
  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase
    .from('Admin')
    .insert([adminData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get admin by AdminID
 */
export async function getAdmin(adminId: string) {
  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase
    .from('Admin')
    .select('*')
    .eq('AdminID', adminId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get admin by UserID
 */
export async function getAdminByUserId(userId: string) {
  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase
    .from('Admin')
    .select('*')
    .eq('UserID', userId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get all admins
 */
export async function getAllAdmins() {
  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase
    .from('Admin')
    .select('*')
    .order('AdminID', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Delete an admin
 */
export async function deleteAdmin(adminId: string) {
  const supabase = await createClerkSupabaseClient();
  const { error } = await supabase
    .from('Admin')
    .delete()
    .eq('AdminID', adminId);

  if (error) throw error;
}

// ============================================================================
// FACILITY OPERATIONS
// ============================================================================

/**
 * Create a new facility
 */
export async function createFacility(facilityData: TablesInsert<'Facility'>) {
  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase
    .from('Facility')
    .insert([facilityData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get facility by FacilityID
 */
export async function getFacility(facilityId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('Facility')
    .select('*')
    .eq('FacilityID', facilityId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get all facilities
 */
export async function getAllFacilities() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('Facility')
    .select('*')
    .order('FacilityID', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Get facilities by type (e.g., 'classroom', 'lab')
 */
export async function getFacilitiesByType(type: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('Facility')
    .select('*')
    .eq('Type', type)
    .order('FacilityID', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Get available facilities
 */
export async function getAvailableFacilities() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('Facility')
    .select('*')
    .eq('Status', 'available')
    .order('FacilityID', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Update a facility
 */
export async function updateFacility(
  facilityId: string,
  updates: TablesUpdate<'Facility'>
) {
  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase
    .from('Facility')
    .update(updates)
    .eq('FacilityID', facilityId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a facility
 */
export async function deleteFacility(facilityId: string) {
  const supabase = await createClerkSupabaseClient();
  const { error } = await supabase
    .from('Facility')
    .delete()
    .eq('FacilityID', facilityId);

  if (error) throw error;
}

// ============================================================================
// ENROLLMENT OPERATIONS
// ============================================================================

/**
 * Get all enrollments
 */
export async function getAllEnrollments() {
  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase
    .from('Enrollment')
    .select('*')
    .order('Intake', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get enrollments by student ID
 */
export async function getEnrollmentsByStudentId(studentId: string) {
  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase
    .from('Enrollment')
    .select('*')
    .eq('StudentID', studentId);

  if (error) throw error;
  return data;
}

/**
 * Create a new enrollment
 */
export async function createEnrollment(enrollmentData: TablesInsert<'Enrollment'>) {
  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase
    .from('Enrollment')
    .insert([enrollmentData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete an enrollment
 */
export async function deleteEnrollment(enrollmentId: string) {
  const supabase = await createClerkSupabaseClient();
  const { error } = await supabase
    .from('Enrollment')
    .delete()
    .eq('EnrollmentID', enrollmentId);

  if (error) throw error;
}

// ============================================================================
// COURSE OPERATIONS
// ============================================================================

/**
 * Get all courses with their details (CourseID, Name, Level)
 */
export async function getAllCourses() {
  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase
    .from('Course')
    .select('CourseID, Name, Level')
    .order('CourseID', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Get all distinct intakes from Enrollment table
 */
export async function getAllIntakes() {
  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase
    .from('Enrollment')
    .select('Intake')
    .order('Intake', { ascending: false });

  if (error) throw error;
  
  // Get unique intakes
  const uniqueIntakes = Array.from(
    new Set((data || []).map(e => e.Intake).filter(Boolean))
  );
  
  return uniqueIntakes;
}

/**
 * Get student with course and enrollment details
 */
export async function getStudentWithDetails(studentId: string) {
  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase
    .from('Student')
    .select(`
      *,
      Enrollment (
        EnrollmentID,
        CourseID,
        Intake,
        Balance
      )
    `)
    .eq('StudentID', studentId)
    .single();

  if (error) throw error;
  return data;
}

// ============================================================================
// CLASS OPERATIONS
// ============================================================================

/**
 * Shape of a class record joined with its subject and lecturer.
 */
export interface ClassWithSubjectAndLecturer {
  ClassID: string;
  Group: string;
  LecturerID: string;
  SubjectID: string;
  Type: string | null;
  Subject: {
    SubjectID: string;
    Name: string;
    Duration: number | null;
  } | null;
  Lecturer: {
    LecturerID: string;
    LecturerCode: string;
  } | null;
}

/**
 * Get all classes with related subject and lecturer information.
 */
export async function getAllClassesWithDetails() {
  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase
    .from('Class')
    .select(`
      ClassID,
      Group,
      LecturerID,
      SubjectID,
      Type,
      Subject (
        SubjectID,
        Name,
        Duration
      ),
      Lecturer (
        LecturerID,
        LecturerCode
      )
    `)
    .order('ClassID', { ascending: true });

  if (error) throw error;
  return (data || []) as ClassWithSubjectAndLecturer[];
}

/**
 * Create a new class record.
 */
export async function createClass(classData: TablesInsert<'Class'>) {
  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase
    .from('Class')
    .insert([classData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update an existing class by its ClassID.
 */
export async function updateClass(
  classId: string,
  updates: TablesUpdate<'Class'>
) {
  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase
    .from('Class')
    .update(updates)
    .eq('ClassID', classId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a class by its ClassID.
 */
export async function deleteClass(classId: string) {
  const supabase = await createClerkSupabaseClient();
  const { error } = await supabase
    .from('Class')
    .delete()
    .eq('ClassID', classId);

  if (error) throw error;
}

/**
 * Get a single class with its subject, lecturer, and enrolled students.
 */
export async function getClassWithStudents(classId: string) {
  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase
    .from('Class')
    .select(`
      ClassID,
      Group,
      LecturerID,
      SubjectID,
      Type,
      Subject (
        SubjectID,
        Name,
        Duration
      ),
      Lecturer (
        LecturerID,
        LecturerCode
      ),
      ClassRegistration (
        ClassRegistrationID,
        Enrollment (
          EnrollmentID,
          Intake,
          Student (
            StudentID,
            StudentCode
          )
        )
      )
    `)
    .eq('ClassID', classId)
    .single();

  if (error) throw error;
  return data;
}

// ============================================================================
// ATTENDANCE OPERATIONS
// ============================================================================

/** Generate a random 6-digit code for attendance. */
function generateAttendanceCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Get classes taught by a lecturer (for attendance class selector).
 */
export async function getClassesByLecturerId(lecturerId: string) {
  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase
    .from('Class')
    .select(`
      ClassID,
      Group,
      SubjectID,
      Type,
      Subject ( SubjectID, Name, Duration )
    `)
    .eq('LecturerID', lecturerId)
    .order('ClassID', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Get classes a student is registered in (via Enrollment -> ClassRegistration).
 */
export async function getClassesForStudent(studentId: string) {
  const supabase = await createClerkSupabaseClient();
  const enrollments = await getEnrollmentsByStudentId(studentId);
  const enrollmentIds = (enrollments ?? []).map((e) => e.EnrollmentID);
  if (enrollmentIds.length === 0) return [];

  const { data: regs, error: regError } = await supabase
    .from('ClassRegistration')
    .select('ClassID')
    .in('EnrollmentID', enrollmentIds);

  if (regError) throw regError;
  const classIds = [...new Set((regs ?? []).map((r) => r.ClassID))];
  if (classIds.length === 0) return [];

  const { data: classes, error: classError } = await supabase
    .from('Class')
    .select(`
      ClassID,
      Group,
      SubjectID,
      Type,
      Subject ( SubjectID, Name )
    `)
    .in('ClassID', classIds)
    .order('ClassID', { ascending: true });

  if (classError) throw classError;
  return classes ?? [];
}

/**
 * Create an open attendance session for a class (code, start time, status Ongoing).
 * code_status enum: Ongoing | Ended.
 */
export async function createAttendance(classId: string) {
  const supabase = await createClerkSupabaseClient();
  const code = generateAttendanceCode();
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const startTime = now.toISOString().slice(11, 19);

  const row: TablesInsert<'Attendance'> = {
    ClassID: classId,
    Code: code,
    Date: date,
    StartTime: startTime,
    Status: 'Ongoing',
  };

  const { data, error } = await supabase
    .from('Attendance')
    .insert([row])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get the active (Ongoing status) attendance for a class, if any.
 * code_status enum: Ongoing | Ended.
 */
export async function getActiveAttendanceByClassId(classId: string) {
  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase
    .from('Attendance')
    .select('*')
    .eq('ClassID', classId)
    .eq('Status', 'Ongoing')
    .order('StartTime', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Get the active (Ongoing status) attendance by its 6-digit code.
 * This is used by the student sign-in page where only the code is known.
 */
export async function getActiveAttendanceByCode(code: string) {
  const supabase = await createClerkSupabaseClient();
  const sanitizedCode = code.trim();
  if (!sanitizedCode) {
    return null;
  }

  const { data, error } = await supabase
    .from('Attendance')
    .select('*')
    .eq('Code', sanitizedCode)
    .eq('Status', 'Ongoing')
    .order('StartTime', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Update attendance code and start time (for 60s rotation).
 */
export async function rotateAttendanceCode(attendanceId: string) {
  const supabase = await createClerkSupabaseClient();
  const code = generateAttendanceCode();
  const now = new Date();
  const startTime = now.toISOString().slice(11, 19);

  const { data, error } = await supabase
    .from('Attendance')
    .update({ Code: code, StartTime: startTime })
    .eq('AttendanceID', attendanceId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get a single attendance by ID.
 */
export async function getAttendanceById(attendanceId: string) {
  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase
    .from('Attendance')
    .select('*')
    .eq('AttendanceID', attendanceId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Close an attendance session and mark missing students as Absent.
 * Sets Attendance.Status to Ended (code_status: Ongoing | Ended).
 */
export async function closeAttendance(attendanceId: string) {
  const supabase = await createClerkSupabaseClient();
  const attendance = await getAttendanceById(attendanceId);
  const classData = await getClassWithStudents(attendance.ClassID);
  if (!classData) throw new Error('Class not found');

  const registrations = (classData as { ClassRegistration?: Array<{ Enrollment?: { Student?: { StudentID: string } } }> })
    .ClassRegistration ?? [];
  const studentIds = registrations
    .map((r) => r.Enrollment?.Student?.StudentID)
    .filter(Boolean) as string[];

  const { data: existing } = await supabase
    .from('AttendanceRecord')
    .select('StudentID')
    .eq('AttendanceID', attendanceId)
    .eq('Status', 'Present');

  const presentIds = new Set((existing ?? []).map((r) => r.StudentID));
  const absentIds = studentIds.filter((id) => !presentIds.has(id));

  for (const studentId of absentIds) {
    await supabase.from('AttendanceRecord').insert({
      AttendanceID: attendanceId,
      StudentID: studentId,
      Status: 'Absent',
    });
  }

  const { data, error } = await supabase
    .from('Attendance')
    .update({ Status: 'Ended' })
    .eq('AttendanceID', attendanceId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get attendance records for an attendance session (Present/Absent list).
 */
export async function getAttendanceRecords(attendanceId: string) {
  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase
    .from('AttendanceRecord')
    .select('AttendanceRecordID, StudentID, Status')
    .eq('AttendanceID', attendanceId)
    .order('StudentID', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Get attendance records with student code for display (e.g. lecturer code page).
 */
export async function getAttendanceRecordsWithStudents(attendanceId: string) {
  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase
    .from('AttendanceRecord')
    .select('AttendanceRecordID, StudentID, Status, Student(StudentCode)')
    .eq('AttendanceID', attendanceId)
    .order('StudentID', { ascending: true });

  if (error) throw error;
  return (data ?? []) as Array<{
    AttendanceRecordID: string;
    StudentID: string;
    Status: string;
    Student: { StudentCode: string | null } | null;
  }>;
}

/**
 * Create a Present record when a student submits the code.
 */
export async function createAttendanceRecord(
  attendanceId: string,
  studentId: string
) {
  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase
    .from('AttendanceRecord')
    .insert([{ AttendanceID: attendanceId, StudentID: studentId, Status: 'Present' }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Check if a student already has a record for this attendance (no double submit).
 */
export async function hasAttendanceRecord(attendanceId: string, studentId: string) {
  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase
    .from('AttendanceRecord')
    .select('AttendanceRecordID')
    .eq('AttendanceID', attendanceId)
    .eq('StudentID', studentId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

// ============================================================================
// STUDENT ATTENDANCE OVERVIEW (for attendance overview page)
// ============================================================================

/** Per-subject attendance within a semester (intake). */
export interface SubjectAttendanceRow {
  subjectId: string;
  subjectName: string;
  attended: number;
  total: number;
}

/** One semester (intake) with overall percentage and per-subject breakdown. */
export interface SemesterAttendanceSummary {
  intake: string;
  overallPercentage: number;
  subjects: SubjectAttendanceRow[];
}

/** Full overview: semesters list + overall intake percentage + student identifiers. */
export interface StudentAttendanceOverview {
  studentId: string;
  primaryIntake: string;
  semesters: SemesterAttendanceSummary[];
  overallIntakeAttendance: number;
}

/**
 * Get attendance overview for a student: per-intake (semester) subject breakdown
 * and overall intake percentage. Fetches from Enrollment → ClassRegistration →
 * Class/Subject, Attendance (Ended), and AttendanceRecord (Present).
 */
export async function getStudentAttendanceOverview(
  studentId: string
): Promise<StudentAttendanceOverview> {
  const supabase = await createClerkSupabaseClient();

  const enrollments = await getEnrollmentsByStudentId(studentId);
  const enrollmentIds = (enrollments ?? []).map((e) => e.EnrollmentID);
  if (enrollmentIds.length === 0) {
    return {
      studentId,
      primaryIntake: '',
      semesters: [],
      overallIntakeAttendance: 0,
    };
  }

  const intakeByEnrollmentId = new Map<string, string>();
  (enrollments ?? []).forEach((e) => intakeByEnrollmentId.set(e.EnrollmentID, e.Intake));

  const { data: regs, error: regError } = await supabase
    .from('ClassRegistration')
    .select('EnrollmentID, ClassID')
    .in('EnrollmentID', enrollmentIds);

  if (regError) throw regError;
  const regList = regs ?? [];
  const classIds = [...new Set(regList.map((r) => r.ClassID).filter(Boolean))] as string[];
  if (classIds.length === 0) {
    return {
      studentId,
      primaryIntake: (enrollments ?? [])[0]?.Intake ?? '',
      semesters: [],
      overallIntakeAttendance: 0,
    };
  }

  const { data: classes, error: classError } = await supabase
    .from('Class')
    .select('ClassID, SubjectID, Subject(Name)')
    .in('ClassID', classIds);

  if (classError) throw classError;
  const classList = (classes ?? []) as Array<{
    ClassID: string;
    SubjectID: string;
    Subject: { Name: string | null } | null;
  }>;
  const classToSubject = new Map<
    string,
    { subjectId: string; subjectName: string }
  >();
  classList.forEach((c) => {
    classToSubject.set(c.ClassID, {
      subjectId: c.SubjectID,
      subjectName: c.Subject?.Name ?? c.SubjectID,
    });
  });

  const { data: attendances, error: attError } = await supabase
    .from('Attendance')
    .select('AttendanceID, ClassID')
    .in('ClassID', classIds)
    .eq('Status', 'Ended');

  if (attError) throw attError;
  const attendanceList = attendances ?? [];
  const attendanceToClassId = new Map<string, string>();
  const totalByClassId = new Map<string, number>();
  attendanceList.forEach((a) => {
    attendanceToClassId.set(a.AttendanceID, a.ClassID);
    totalByClassId.set(a.ClassID, (totalByClassId.get(a.ClassID) ?? 0) + 1);
  });
  const attendanceIds = attendanceList.map((a) => a.AttendanceID);

  let presentAttendanceIds = new Set<string>();
  if (attendanceIds.length > 0) {
    const { data: records, error: recError } = await supabase
      .from('AttendanceRecord')
      .select('AttendanceID')
      .eq('StudentID', studentId)
      .eq('Status', 'Present')
      .in('AttendanceID', attendanceIds);

    if (!recError && records) {
      presentAttendanceIds = new Set(records.map((r) => r.AttendanceID));
    }
  }

  const attendedByClassId = new Map<string, number>();
  attendanceList.forEach((a) => {
    if (presentAttendanceIds.has(a.AttendanceID)) {
      attendedByClassId.set(
        a.ClassID,
        (attendedByClassId.get(a.ClassID) ?? 0) + 1
      );
    }
  });

  const classToIntake = new Map<string, string>();
  regList.forEach((r) => {
    const intake = intakeByEnrollmentId.get(r.EnrollmentID);
    if (intake) classToIntake.set(r.ClassID, intake);
  });

  const byIntakeSubject = new Map<
    string,
    Map<string, { subjectName: string; attended: number; total: number }>
  >();

  function addToIntakeSubject(
    intake: string,
    subjectId: string,
    subjectName: string,
    attended: number,
    total: number
  ) {
    let bySubject = byIntakeSubject.get(intake);
    if (!bySubject) {
      bySubject = new Map();
      byIntakeSubject.set(intake, bySubject);
    }
    const existing = bySubject.get(subjectId);
    if (existing) {
      existing.attended += attended;
      existing.total += total;
    } else {
      bySubject.set(subjectId, { subjectName, attended, total });
    }
  }

  classIds.forEach((classId) => {
    const intake = classToIntake.get(classId) ?? '';
    const subject = classToSubject.get(classId);
    if (!subject) return;
    const total = totalByClassId.get(classId) ?? 0;
    const attended = attendedByClassId.get(classId) ?? 0;
    addToIntakeSubject(
      intake,
      subject.subjectId,
      subject.subjectName,
      attended,
      total
    );
  });

  const semesters: SemesterAttendanceSummary[] = [];
  const intakesSorted = [...byIntakeSubject.keys()].sort().reverse();

  let totalAttendedAll = 0;
  let totalSessionsAll = 0;

  intakesSorted.forEach((intake) => {
    const bySubject = byIntakeSubject.get(intake)!;
    let semesterAttended = 0;
    let semesterTotal = 0;
    const subjects: SubjectAttendanceRow[] = [];

    bySubject.forEach((value, subjectId) => {
      semesterAttended += value.attended;
      semesterTotal += value.total;
      totalAttendedAll += value.attended;
      totalSessionsAll += value.total;
      subjects.push({
        subjectId,
        subjectName: value.subjectName,
        attended: value.attended,
        total: value.total,
      });
    });

    const overallPercentage =
      semesterTotal > 0
        ? Math.round((semesterAttended / semesterTotal) * 100)
        : 100;

    semesters.push({
      intake,
      overallPercentage,
      subjects,
    });
  });

  const overallIntakeAttendance =
    totalSessionsAll > 0
      ? Math.round((totalAttendedAll / totalSessionsAll) * 1000) / 10
      : 0;

  const primaryIntake = intakesSorted[0] ?? (enrollments ?? [])[0]?.Intake ?? '';

  return {
    studentId,
    primaryIntake,
    semesters,
    overallIntakeAttendance,
  };
}