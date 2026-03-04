import { createClerkSupabaseClient, createServerSupabaseClient } from './supabase';
import type { Database } from '@/types/supabase';
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