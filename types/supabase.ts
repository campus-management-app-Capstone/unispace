export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      Admin: {
        Row: {
          AdminCode: string
          AdminID: string
          UserID: string
        }
        Insert: {
          AdminCode?: string
          AdminID?: string
          UserID: string
        }
        Update: {
          AdminCode?: string
          AdminID?: string
          UserID?: string
        }
        Relationships: [
          {
            foreignKeyName: "Admin_UserID_fkey"
            columns: ["UserID"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["UserID"]
          },
        ]
      }
      Announcement: {
        Row: {
          AnnouncementID: string
          Content: string
          CreatedAt: string
          Target: string
          Title: string
          UserID: string
        }
        Insert: {
          AnnouncementID?: string
          Content: string
          CreatedAt?: string
          Target: string
          Title: string
          UserID: string
        }
        Update: {
          AnnouncementID?: string
          Content?: string
          CreatedAt?: string
          Target?: string
          Title?: string
          UserID?: string
        }
        Relationships: [
          {
            foreignKeyName: "Announcement_UserID_fkey"
            columns: ["UserID"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["UserID"]
          },
        ]
      }
      Attendance: {
        Row: {
          AttendanceID: string
          ClassID: string
          Code: string
          Date: string
          StartTime: string
          Status: string
        }
        Insert: {
          AttendanceID?: string
          ClassID: string
          Code: string
          Date?: string
          StartTime: string
          Status: string
        }
        Update: {
          AttendanceID?: string
          ClassID?: string
          Code?: string
          Date?: string
          StartTime?: string
          Status?: string
        }
        Relationships: [
          {
            foreignKeyName: "Attendance_ClassID_fkey"
            columns: ["ClassID"]
            isOneToOne: false
            referencedRelation: "Class"
            referencedColumns: ["ClassID"]
          },
        ]
      }
      AttendanceRecord: {
        Row: {
          AttendanceID: string
          AttendanceRecordID: string
          Status: string
          StudentID: string
        }
        Insert: {
          AttendanceID: string
          AttendanceRecordID?: string
          Status: string
          StudentID: string
        }
        Update: {
          AttendanceID?: string
          AttendanceRecordID?: string
          Status?: string
          StudentID?: string
        }
        Relationships: [
          {
            foreignKeyName: "AttendanceRecord_AttendanceID_fkey"
            columns: ["AttendanceID"]
            isOneToOne: false
            referencedRelation: "Attendance"
            referencedColumns: ["AttendanceID"]
          },
          {
            foreignKeyName: "AttendanceRecord_StudentID_fkey"
            columns: ["StudentID"]
            isOneToOne: false
            referencedRelation: "Student"
            referencedColumns: ["StudentID"]
          },
        ]
      }
      Booking: {
        Row: {
          BookingID: string
          EndTime: string
          FacilityID: string
          StartTime: string
          UserID: string
        }
        Insert: {
          BookingID?: string
          EndTime: string
          FacilityID: string
          StartTime: string
          UserID: string
        }
        Update: {
          BookingID?: string
          EndTime?: string
          FacilityID?: string
          StartTime?: string
          UserID?: string
        }
        Relationships: [
          {
            foreignKeyName: "Booking_FacilityID_fkey"
            columns: ["FacilityID"]
            isOneToOne: false
            referencedRelation: "Facility"
            referencedColumns: ["FacilityID"]
          },
          {
            foreignKeyName: "Booking_UserID_fkey"
            columns: ["UserID"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["UserID"]
          },
        ]
      }
      Class: {
        Row: {
          ClassID: string
          Group: string
          LecturerID: string
          SubjectID: string
          Type: string | null
        }
        Insert: {
          ClassID: string
          Group: string
          LecturerID: string
          SubjectID: string
          Type?: string | null
        }
        Update: {
          ClassID?: string
          Group?: string
          LecturerID?: string
          SubjectID?: string
          Type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Class_LecturerID_fkey"
            columns: ["LecturerID"]
            isOneToOne: false
            referencedRelation: "Lecturer"
            referencedColumns: ["LecturerID"]
          },
          {
            foreignKeyName: "Class_SubjectID_fkey"
            columns: ["SubjectID"]
            isOneToOne: false
            referencedRelation: "Subject"
            referencedColumns: ["SubjectID"]
          },
        ]
      }
      ClassRegistration: {
        Row: {
          ClassID: string
          ClassRegistrationID: string
          EnrollmentID: string
        }
        Insert: {
          ClassID: string
          ClassRegistrationID?: string
          EnrollmentID: string
        }
        Update: {
          ClassID?: string
          ClassRegistrationID?: string
          EnrollmentID?: string
        }
        Relationships: [
          {
            foreignKeyName: "ClassRegistration_ClassID_fkey"
            columns: ["ClassID"]
            isOneToOne: false
            referencedRelation: "Class"
            referencedColumns: ["ClassID"]
          },
          {
            foreignKeyName: "ClassRegistration_EnrollmentID_fkey"
            columns: ["EnrollmentID"]
            isOneToOne: false
            referencedRelation: "Enrollment"
            referencedColumns: ["EnrollmentID"]
          },
        ]
      }
      Course: {
        Row: {
          CourseID: string
          DepartmentID: string
          Level: string
          Name: string
          TotalSemester: number
        }
        Insert: {
          CourseID: string
          DepartmentID: string
          Level: string
          Name: string
          TotalSemester: number
        }
        Update: {
          CourseID?: string
          DepartmentID?: string
          Level?: string
          Name?: string
          TotalSemester?: number
        }
        Relationships: [
          {
            foreignKeyName: "Course_DepartmentID_fkey"
            columns: ["DepartmentID"]
            isOneToOne: false
            referencedRelation: "Department"
            referencedColumns: ["DepartmentID"]
          },
        ]
      }
      Department: {
        Row: {
          DepartmentID: string
          Name: string
        }
        Insert: {
          DepartmentID: string
          Name: string
        }
        Update: {
          DepartmentID?: string
          Name?: string
        }
        Relationships: []
      }
      Enrollment: {
        Row: {
          CourseID: string
          EnrollmentID: string
          Intake: string
          StudentID: string
        }
        Insert: {
          CourseID: string
          EnrollmentID?: string
          Intake: string
          StudentID: string
        }
        Update: {
          CourseID?: string
          EnrollmentID?: string
          Intake?: string
          StudentID?: string
        }
        Relationships: [
          {
            foreignKeyName: "Enrollment_CourseID_fkey"
            columns: ["CourseID"]
            isOneToOne: false
            referencedRelation: "Course"
            referencedColumns: ["CourseID"]
          },
          {
            foreignKeyName: "Enrollment_StudentID_fkey"
            columns: ["StudentID"]
            isOneToOne: false
            referencedRelation: "Student"
            referencedColumns: ["StudentID"]
          },
        ]
      }
      Facility: {
        Row: {
          Capacity: number | null
          FacilityID: string
          Name: string
          Type: string
        }
        Insert: {
          Capacity?: number | null
          FacilityID: string
          Name: string
          Type: string
        }
        Update: {
          Capacity?: number | null
          FacilityID?: string
          Name?: string
          Type?: string
        }
        Relationships: []
      }
      Lecturer: {
        Row: {
          DepartmentID: string
          EmployedTime: string
          LecturerCode: string
          LecturerID: string
          UserID: string
        }
        Insert: {
          DepartmentID: string
          EmployedTime?: string
          LecturerCode?: string
          LecturerID?: string
          UserID: string
        }
        Update: {
          DepartmentID?: string
          EmployedTime?: string
          LecturerCode?: string
          LecturerID?: string
          UserID?: string
        }
        Relationships: [
          {
            foreignKeyName: "Lecturer_DepartmentID_fkey"
            columns: ["DepartmentID"]
            isOneToOne: false
            referencedRelation: "Department"
            referencedColumns: ["DepartmentID"]
          },
          {
            foreignKeyName: "Lecturer_UserID_fkey"
            columns: ["UserID"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["UserID"]
          },
        ]
      }
      LecturerTeach: {
        Row: {
          LecturerID: string
          LecturerTeachID: string
          SubjectID: string
        }
        Insert: {
          LecturerID?: string
          LecturerTeachID?: string
          SubjectID: string
        }
        Update: {
          LecturerID?: string
          LecturerTeachID?: string
          SubjectID?: string
        }
        Relationships: [
          {
            foreignKeyName: "LecturerTeach_LecturerID_fkey"
            columns: ["LecturerID"]
            isOneToOne: false
            referencedRelation: "Lecturer"
            referencedColumns: ["LecturerID"]
          },
          {
            foreignKeyName: "LecturerTeach_SubjectID_fkey"
            columns: ["SubjectID"]
            isOneToOne: false
            referencedRelation: "Subject"
            referencedColumns: ["SubjectID"]
          },
        ]
      }
      ParkingSession: {
        Row: {
          End: string | null
          ParkingSessionID: string
          RegisteredCarID: string | null
          Start: string
        }
        Insert: {
          End?: string | null
          ParkingSessionID?: string
          RegisteredCarID?: string | null
          Start?: string
        }
        Update: {
          End?: string | null
          ParkingSessionID?: string
          RegisteredCarID?: string | null
          Start?: string
        }
        Relationships: [
          {
            foreignKeyName: "ParkingSession_RegisteredCarID_fkey"
            columns: ["RegisteredCarID"]
            isOneToOne: false
            referencedRelation: "RegisteredCar"
            referencedColumns: ["RegisteredCarID"]
          },
        ]
      }
      RegisteredCar: {
        Row: {
          Carplate: string
          RegisteredCarID: string
          UserID: string
          VehicleMade: string
          VehicleModel: string
        }
        Insert: {
          Carplate: string
          RegisteredCarID?: string
          UserID: string
          VehicleMade: string
          VehicleModel: string
        }
        Update: {
          Carplate?: string
          RegisteredCarID?: string
          UserID?: string
          VehicleMade?: string
          VehicleModel?: string
        }
        Relationships: [
          {
            foreignKeyName: "RegiteredCar_UserID_fkey"
            columns: ["UserID"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["UserID"]
          },
        ]
      }
      Student: {
        Row: {
          StudentCode: string
          StudentID: string
          UserID: string
        }
        Insert: {
          StudentCode?: string
          StudentID?: string
          UserID: string
        }
        Update: {
          StudentCode?: string
          StudentID?: string
          UserID?: string
        }
        Relationships: [
          {
            foreignKeyName: "Student_UserID_fkey"
            columns: ["UserID"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["UserID"]
          },
        ]
      }
      Subject: {
        Row: {
          Duration: number | null
          Name: string
          SubjectID: string
        }
        Insert: {
          Duration?: number | null
          Name: string
          SubjectID: string
        }
        Update: {
          Duration?: number | null
          Name?: string
          SubjectID?: string
        }
        Relationships: []
      }
      Syllabus: {
        Row: {
          CourseID: string | null
          Semester: number | null
          SubjectID: string
          SyllabusID: string
        }
        Insert: {
          CourseID?: string | null
          Semester?: number | null
          SubjectID: string
          SyllabusID?: string
        }
        Update: {
          CourseID?: string | null
          Semester?: number | null
          SubjectID?: string
          SyllabusID?: string
        }
        Relationships: [
          {
            foreignKeyName: "Syllabus_CourseID_fkey"
            columns: ["CourseID"]
            isOneToOne: false
            referencedRelation: "Course"
            referencedColumns: ["CourseID"]
          },
          {
            foreignKeyName: "Syllabus_SubjectID_fkey"
            columns: ["SubjectID"]
            isOneToOne: false
            referencedRelation: "Subject"
            referencedColumns: ["SubjectID"]
          },
        ]
      }
      TimetableSlot: {
        Row: {
          ClassID: string | null
          Day: string | null
          End: string | null
          FacilityID: string | null
          Start: string | null
          TimetableSlotID: string
        }
        Insert: {
          ClassID?: string | null
          Day?: string | null
          End?: string | null
          FacilityID?: string | null
          Start?: string | null
          TimetableSlotID?: string
        }
        Update: {
          ClassID?: string | null
          Day?: string | null
          End?: string | null
          FacilityID?: string | null
          Start?: string | null
          TimetableSlotID?: string
        }
        Relationships: [
          {
            foreignKeyName: "TimetableSlot_ClassID_fkey"
            columns: ["ClassID"]
            isOneToOne: false
            referencedRelation: "Class"
            referencedColumns: ["ClassID"]
          },
          {
            foreignKeyName: "TimetableSlot_FacilityID_fkey"
            columns: ["FacilityID"]
            isOneToOne: false
            referencedRelation: "Facility"
            referencedColumns: ["FacilityID"]
          },
        ]
      }
      Transaction: {
        Row: {
          Amount: number
          For: string
          StripeSessionID: string | null
          Time: string
          TransactionID: string
          Type: string
          WalletID: string
        }
        Insert: {
          Amount: number
          For: string
          StripeSessionID?: string | null
          Time?: string
          TransactionID?: string
          Type: string
          WalletID: string
        }
        Update: {
          Amount?: number
          For?: string
          StripeSessionID?: string | null
          Time?: string
          TransactionID?: string
          Type?: string
          WalletID?: string
        }
        Relationships: [
          {
            foreignKeyName: "Transaction_WalletID_fkey"
            columns: ["WalletID"]
            isOneToOne: false
            referencedRelation: "Wallet"
            referencedColumns: ["WalletID"]
          },
        ]
      }
      User: {
        Row: {
          UserID: string
        }
        Insert: {
          UserID: string
        }
        Update: {
          UserID?: string
        }
        Relationships: []
      }
      Wallet: {
        Row: {
          Balance: number
          UserID: string
          WalletID: string
        }
        Insert: {
          Balance?: number
          UserID: string
          WalletID?: string
        }
        Update: {
          Balance?: number
          UserID?: string
          WalletID?: string
        }
        Relationships: [
          {
            foreignKeyName: "Wallet_UserID_fkey"
            columns: ["UserID"]
            isOneToOne: true
            referencedRelation: "User"
            referencedColumns: ["UserID"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      class_type: "Lecture" | "Tutorial"
      user_role: "student" | "lecturer" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      class_type: ["Lecture", "Tutorial"],
      user_role: ["student", "lecturer", "admin"],
    },
  },
} as const
