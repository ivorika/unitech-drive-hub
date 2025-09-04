import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
  learner_permit_number: string;
  profile_picture_url: string;
}

interface Instructor {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  license_number: string;
  years_of_experience: number;
  status: string;
  profile_picture_url: string;
}

interface Lesson {
  id: string;
  lesson_date: string;
  lesson_time: string;
  lesson_type: string;
  status: string;
  duration_minutes: number;
  student: Student;
  instructor: Instructor;
}

interface Announcement {
  id: string;
  title: string;
  message: string;
  created_at: string;
  priority: string;
}

export const useDashboardData = (userRole: string | null) => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    if (!user || !userRole) {
      setLoading(false);
      return;
    }

    try {
      // Fetch announcements for all users
      const { data: announcementsData } = await supabase
        .from('announcements')
        .select('*')
        .or(`audience.eq.all,audience.eq.${userRole}s`)
        .order('created_at', { ascending: false })
        .limit(5);

      if (announcementsData) {
        setAnnouncements(announcementsData);
      }

      // Fetch role-specific data
      if (userRole === 'student') {
        // Get student's own data
        const { data: studentData } = await supabase
          .from('students')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (studentData) {
          setStudents([studentData]);

          // Get student's lessons with instructor info
          const { data: lessonsData } = await supabase
            .from('lessons')
            .select(`
              *,
              instructor:instructors(*),
              student:students(*)
            `)
            .eq('student_id', studentData.id)
            .order('lesson_date', { ascending: true });

          if (lessonsData) {
            setLessons(lessonsData);
          }
        }
      } else if (userRole === 'instructor') {
        // Get instructor's own data
        const { data: instructorData } = await supabase
          .from('instructors')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (instructorData) {
          setInstructors([instructorData]);

          // Get instructor's lessons with student info
          const { data: lessonsData } = await supabase
            .from('lessons')
            .select(`
              *,
              instructor:instructors(*),
              student:students(*)
            `)
            .eq('instructor_id', instructorData.id)
            .order('lesson_date', { ascending: true });

          if (lessonsData) {
            setLessons(lessonsData);
          }
        }
      } else if (userRole === 'admin') {
        // Get all data for admin
        const [studentsResponse, instructorsResponse, lessonsResponse] = await Promise.all([
          supabase.from('students').select('*').order('created_at', { ascending: false }),
          supabase.from('instructors').select('*').order('created_at', { ascending: false }),
          supabase.from('lessons').select(`
            *,
            instructor:instructors(*),
            student:students(*)
          `).order('lesson_date', { ascending: true })
        ]);

        if (studentsResponse.data) setStudents(studentsResponse.data);
        if (instructorsResponse.data) setInstructors(instructorsResponse.data);
        if (lessonsResponse.data) setLessons(lessonsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user, userRole]);

  return {
    students,
    instructors,
    lessons,
    announcements,
    loading,
    refetch: fetchDashboardData
  };
};