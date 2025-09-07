import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { User, Calendar, Clock, MessageSquare, Bell, Users, Star, FileText, Loader2 } from "lucide-react";
import { EditProfileDialog } from "@/components/EditProfileDialog";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const InstructorDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [instructor, setInstructor] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [completingId, setCompletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchInstructorData = async () => {
      if (!user) { setLoading(false); return; }

      try {
        // Get instructor data
        const { data: instructorData } = await supabase
          .from('instructors')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (instructorData) {
          setInstructor(instructorData);

          // Get lessons for this instructor
          const { data: lessonsData } = await supabase
            .from('lessons')
            .select(`
              *,
              student:students(*)
            `)
            .eq('instructor_id', instructorData.id)
            .order('lesson_date', { ascending: true })
            .order('lesson_time', { ascending: true });

          if (lessonsData) {
            setLessons(lessonsData);
          }
        }

        // Get announcements
        const { data: announcementsData } = await supabase
          .from('announcements')
          .select('*')
          .in('audience', ['all', 'instructors'])
          .order('created_at', { ascending: false })
          .limit(5);

        if (announcementsData) {
          setAnnouncements(announcementsData);
        }
      } catch (error) {
        console.error('Error fetching instructor data:', error);
        toast({
          title: "Error",
          description: "Failed to load instructor data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInstructorData();
  }, [user, toast]);

  // Realtime updates for lessons affecting this instructor
  useEffect(() => {
    if (!instructor?.id) return;

    const channel = supabase
      .channel(`instructor-lessons-${instructor.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lessons', filter: `instructor_id=eq.${instructor.id}` },
        async () => {
          // Refresh lessons on any insert/update/delete for this instructor
          const { data: lessonsData } = await supabase
            .from('lessons')
            .select(`
              *,
              student:students(*)
            `)
            .eq('instructor_id', instructor.id)
            .order('lesson_date', { ascending: true })
            .order('lesson_time', { ascending: true });
          if (lessonsData) setLessons(lessonsData);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [instructor?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="text-center">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Access Denied</h2>
            <p className="text-muted-foreground">You need to sign in as an instructor to view this page.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!instructor) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Instructor Profile Not Found</h2>
            <p className="text-muted-foreground">Please contact the administrator to set up your instructor profile.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Filter today's lessons
  const today = format(new Date(), 'yyyy-MM-dd');
  const getDateOnly = (value: string) => {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    try {
      return format(new Date(value), 'yyyy-MM-dd');
    } catch {
      return '';
    }
  };
  const todayLessons = lessons.filter(lesson => getDateOnly(lesson.lesson_date) === today);

  // Placeholder lessons for demo when no real lessons today
  const placeholderLessons = [
    {
      lesson_time: "10:00",
      status: "scheduled",
      student: { first_name: "Joe", last_name: "Blow" },
      lesson_type: "Basic Driving",
      duration_minutes: 60,
      notes: "Demo placeholder lesson",
    },
    {
      lesson_time: "14:00",
      status: "scheduled",
      student: { first_name: "Timothy", last_name: "Green" },
      lesson_type: "Highway Practice",
      duration_minutes: 90,
      notes: "Demo placeholder lesson",
    },
  ];

  const lessonsToShow = todayLessons.length > 0 ? todayLessons : placeholderLessons;

  // Get all students who have lessons with this instructor
  const myStudents = lessons.reduce((acc: any[], lesson) => {
    if (lesson.student && !acc.find(s => s.id === lesson.student.id)) {
      acc.push({
        ...lesson.student,
        lessonsCount: lessons.filter(l => l.student_id === lesson.student.id).length,
        nextLesson: lessons
          .filter(l => l.student_id === lesson.student.id && l.lesson_date >= today)
          .sort((a, b) => new Date(a.lesson_date).getTime() - new Date(b.lesson_date).getTime())[0]?.lesson_date
      });
    }
    return acc;
  }, []);

  const handleEditProfile = () => {
    setEditProfileOpen(true);
  };

  const handleProfileUpdate = () => {
    // Trigger a re-fetch of data after profile update
    window.location.reload();
  };

  const handleMarkComplete = async (lesson: any) => {
    if (!lesson?.id) {
      toast({ title: "Demo item", description: "This is a placeholder and cannot be updated.", variant: "destructive" });
      return;
    }
    setCompletingId(lesson.id);
    try {
      const { error } = await supabase
        .from('lessons')
        .update({ status: 'completed' })
        .eq('id', lesson.id);
      if (error) throw error;

      // Optimistic update
      setLessons(prev => prev.map(l => l.id === lesson.id ? { ...l, status: 'completed' } : l));
      toast({ title: "Marked complete", description: "Lesson has been marked as completed." });
    } catch (err) {
      console.error('Mark complete error:', err);
      toast({ title: "Error", description: "Failed to mark lesson complete.", variant: "destructive" });
    } finally {
      setCompletingId(null);
    }
  };

  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
            <Button variant="outline" size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              Messages
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={instructor.profile_picture_url || "/placeholder.svg"} alt={`${instructor.first_name} ${instructor.last_name}`} />
                    <AvatarFallback>{`${instructor.first_name?.[0] || ''}${instructor.last_name?.[0] || ''}`}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{instructor.first_name} {instructor.last_name}</h3>
                    <p className="text-sm text-muted-foreground">{instructor.email}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>License:</span>
                    <span>{instructor.license_number || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Experience:</span>
                    <span>{instructor.years_of_experience ? `${instructor.years_of_experience} years` : 'Not provided'}</span>
                  </div>
                  {instructor.hourly_rate && (
                    <div className="flex justify-between">
                      <span>Hourly Rate:</span>
                      <span>K{instructor.hourly_rate}</span>
                    </div>
                  )}
                </div>
                {instructor.specializations && instructor.specializations.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Specialties:</span>
                    <div className="flex flex-wrap gap-1">
                      {instructor.specializations.map((specialty: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <Button variant="outline" size="sm" className="w-full" onClick={handleEditProfile}>
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Today's Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Today's Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-primary">{todayLessons.length}</p>
                    <p className="text-xs text-muted-foreground">Today's Lessons</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-primary">
                      {todayLessons.reduce((total, lesson) => total + (lesson.duration_minutes / 60), 0).toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">Hours Today</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-green-600">
                      {todayLessons.filter(lesson => lesson.status === 'completed').length}
                    </p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-amber-600">
                      {todayLessons.filter(lesson => lesson.status === 'scheduled').length}
                    </p>
                    <p className="text-xs text-muted-foreground">Upcoming</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Add Lesson Feedback
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  View All Students
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Update Schedule
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message Admin
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Today's Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lessonsToShow.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">No lessons scheduled for today</p>
                  ) : (
                    lessonsToShow.map((lesson, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{lesson.lesson_time}</p>
                            <Badge variant={lesson.status === "completed" ? "default" : "secondary"}>
                              {lesson.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {lesson.student ? `${lesson.student.first_name} ${lesson.student.last_name}` : 'Unknown Student'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {lesson.lesson_type} • {lesson.duration_minutes} minutes
                          </p>
                          {lesson.notes && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Note: {lesson.notes}
                            </p>
                          )}
                        </div>
                        {lesson.status === "scheduled" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkComplete(lesson)}
                            disabled={!lesson.id || completingId === lesson.id}
                          >
                            {completingId === lesson.id && (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            )}
                            Mark Complete
                          </Button>
                        )}
                        {lesson.status === "completed" && (
                          <Button variant="outline" size="sm">
                            Add Feedback
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* My Students */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  My Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myStudents.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">No students have booked lessons yet</p>
                  ) : (
                    myStudents.map((student, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={student.profile_picture_url} alt={`${student.first_name} ${student.last_name}`} />
                            <AvatarFallback>{student.first_name[0]}{student.last_name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.first_name} {student.last_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {student.lessonsCount} lesson{student.lessonsCount !== 1 ? 's' : ''} scheduled
                            </p>
                            {student.nextLesson && (
                              <p className="text-xs text-muted-foreground">
                                Next: {format(new Date(student.nextLesson), 'MMM dd, yyyy')}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">
                            {student.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add Feedback Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Add Lesson Feedback
              </CardTitle>
              <CardDescription>
                Record feedback for completed lessons
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Student</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    aria-label="Select Student"
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                  >
                    <option value="">Select a student...</option>
                    {myStudents.map((student: any) => (
                      <option key={student.id} value={student.id}>
                        {student.first_name} {student.last_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Performance Rating</label>
                  <select className="w-full p-2 border rounded-md" aria-label="Performance Rating">
                    <option>Select rating...</option>
                    <option>Excellent</option>
                    <option>Good</option>
                    <option>Needs Improvement</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Feedback Comments</label>
                <Textarea 
                  placeholder="Enter detailed feedback about the student's performance, areas of improvement, and recommendations..."
                  className="min-h-[100px]"
                />
              </div>
              <Button>Submit Feedback</Button>
            </CardContent>
          </Card>

          {/* Announcements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Announcements
              </CardTitle>
            </CardHeader>
              <CardContent>
              <div className="space-y-4">
                {announcements.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No announcements</p>
                ) : (
                  announcements.map((announcement, index) => (
                    <div key={index} className="p-4 border-l-4 border-primary bg-muted/50">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{announcement.title}</h4>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(announcement.created_at), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{announcement.message}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <EditProfileDialog
        open={editProfileOpen}
        onOpenChange={setEditProfileOpen}
        userType="instructor"
        userData={instructor}
        onProfileUpdate={handleProfileUpdate}
      />
      
      <Footer />
    </div>
  );
};

export default InstructorDashboard;