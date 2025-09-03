import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Calendar, Clock, MessageSquare, Bell, FileText, CheckCircle, Plus } from "lucide-react";
import { EditProfileDialog } from "@/components/EditProfileDialog";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useUserRole } from "@/hooks/use-user-role";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useToast } from "@/hooks/use-toast";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { role, loading: roleLoading } = useUserRole();
  const { students, lessons, announcements, loading: dataLoading } = useDashboardData(role);

  const loading = roleLoading || dataLoading;
  const student = students[0]; // Student dashboard shows their own data
  
  // Calculate progress data
  const completedLessons = lessons.filter(lesson => lesson.status === 'completed').length;
  const hoursCompleted = completedLessons; // Assuming 1 lesson = 1 hour for now
  const totalRequiredHours = 18; // Standard requirement
  const progressPercentage = (hoursCompleted / totalRequiredHours) * 100;
  
  // Filter upcoming lessons
  const upcomingLessons = lessons
    .filter(lesson => lesson.status === 'scheduled' && new Date(lesson.lesson_date) >= new Date())
    .sort((a, b) => new Date(a.lesson_date).getTime() - new Date(b.lesson_date).getTime())
    .slice(0, 3);

  // Mock feedback data for now - will integrate lesson_feedback table later
  const recentFeedback = lessons
    .filter(lesson => lesson.status === 'completed')
    .slice(0, 2)
    .map((lesson, index) => ({
      date: lesson.lesson_date,
      instructor: `${lesson.instructor.first_name} ${lesson.instructor.last_name}`,
      comment: index === 0 ? "Great improvement on lane changing. Keep practicing mirror checks." : "Excellent progress on city driving. Ready for highway practice.",
      rating: index === 0 ? "Good" : "Excellent"
    }));

  const handleScheduleLesson = () => {
    navigate('/schedule-lesson');
  };

  const [editProfileOpen, setEditProfileOpen] = useState(false);

  const handleEditProfile = () => {
    setEditProfileOpen(true);
  };

  const handleProfileUpdate = () => {
    // Trigger a re-fetch of data after profile update
    window.location.reload();
  };

  const handleMessageInstructor = () => {
    toast({
      title: "Feature coming soon", 
      description: "Messaging feature will be available soon.",
    });
  };

  const handleViewDocuments = () => {
    toast({
      title: "Feature coming soon",
      description: "Document management will be available soon.",
    });
  };

  const handlePurchaseHours = () => {
    toast({
      title: "Feature coming soon",
      description: "Online payment system will be available soon.",
    });
  };

  const handleRescheduleLesson = (lessonId: string) => {
    toast({
      title: "Feature coming soon",
      description: "Lesson rescheduling will be available soon.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="max-w-7xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No student profile found. Please complete your profile setup.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Student Dashboard</h1>
            <Button variant="outline" size="sm" onClick={handleMessageInstructor}>
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
                    <AvatarImage src={student.profile_picture_url || "/placeholder.svg"} alt={`${student.first_name} ${student.last_name}`} />
                    <AvatarFallback>{student.first_name?.[0]}{student.last_name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{student.first_name} {student.last_name}</h3>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Phone:</span>
                    <span>{student.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Learner's Permit:</span>
                    <span>{student.learner_permit_number || 'Not provided'}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full" onClick={handleEditProfile}>
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Progress Tracker */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Progress Tracker
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Hours Completed</span>
                    <span>{hoursCompleted} / {totalRequiredHours}</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Lessons Completed:</span>
                    <span>{completedLessons}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Upcoming Lessons:</span>
                    <span>{upcomingLessons.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Until Road Test:</span>
                    <span>{Math.max(0, totalRequiredHours - hoursCompleted)} hours</span>
                  </div>
                </div>
                {hoursCompleted >= totalRequiredHours && (
                  <Badge variant="default" className="w-full justify-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Road Test Eligible
                  </Badge>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline" onClick={handleScheduleLesson}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Lesson
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={handleMessageInstructor}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message Instructor
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={handleViewDocuments}>
                  <FileText className="h-4 w-4 mr-2" />
                  View Documents
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={handlePurchaseHours}>
                  <Clock className="h-4 w-4 mr-2" />
                  Purchase More Hours
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Lessons */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Lessons
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingLessons.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No upcoming lessons scheduled</p>
                    <Button onClick={handleScheduleLesson}>
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule Your First Lesson
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingLessons.map((lesson) => (
                      <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{lesson.lesson_type}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(lesson.lesson_date), 'MMM dd, yyyy')} at {lesson.lesson_time}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Instructor: {lesson.instructor.first_name} {lesson.instructor.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Duration: {lesson.duration_minutes} minutes
                          </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleRescheduleLesson(lesson.id)}>
                          Reschedule
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Feedback */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Instructor Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentFeedback.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No feedback available yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentFeedback.map((feedback, index) => (
                      <div key={index} className="space-y-2 p-3 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{feedback.instructor}</span>
                          <Badge variant={feedback.rating === "Excellent" ? "default" : "secondary"}>
                            {feedback.rating}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{feedback.comment}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(feedback.date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Announcements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Announcements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {announcements.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No announcements at this time</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="p-4 border-l-4 border-primary bg-muted/50">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{announcement.title}</h4>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(announcement.created_at), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{announcement.message}</p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {announcement.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <EditProfileDialog
        open={editProfileOpen}
        onOpenChange={setEditProfileOpen}
        userType="student"
        userData={student}
        onProfileUpdate={handleProfileUpdate}
      />
      
      <Footer />
    </div>
  );
};

export default StudentDashboard;