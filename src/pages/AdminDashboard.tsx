import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Clock, 
  DollarSign, 
  FileText, 
  UserCheck, 
  UserX, 
  Calendar, 
  MessageSquare, 
  Bell,
  Settings,
  TrendingUp,
  Eye,
  Loader2
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useUserRole } from "@/hooks/use-user-role";

const AdminDashboard = () => {
  const { role, loading: roleLoading } = useUserRole();
  const { students, instructors, lessons, announcements, loading } = useDashboardData('admin');
  const { toast } = useToast();
  
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [announcementAudience, setAnnouncementAudience] = useState("all");
  const [processing, setProcessing] = useState<string | null>(null);

  // Get pending students
  const pendingStudents = students.filter(student => student.status === 'pending');
  const activeStudents = students.filter(student => student.status === 'active');
  
  // Calculate stats
  const stats = {
    totalStudents: students.length,
    activeInstructors: instructors.filter(inst => inst.status === 'active').length,
    pendingApplications: pendingStudents.length,
    totalRevenue: 0, // Would need to calculate from payments table
    lessonsThisWeek: lessons.filter(lesson => {
      const lessonDate = new Date(lesson.lesson_date);
      const now = new Date();
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      return lessonDate >= weekStart && lessonDate < weekEnd;
    }).length,
    completedLessons: lessons.filter(lesson => lesson.status === 'completed').length
  };

  const handleApproveStudent = async (studentId: string) => {
    setProcessing(`approve-${studentId}`);
    try {
      const { error } = await supabase
        .from('students')
        .update({ status: 'active' })
        .eq('id', studentId);

      if (error) throw error;
      
      toast({
        title: "Student Approved",
        description: "Student has been approved and can now access the system.",
      });
    } catch (error) {
      console.error('Error approving student:', error);
      toast({
        title: "Error",
        description: "Failed to approve student. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectStudent = async (studentId: string) => {
    setProcessing(`reject-${studentId}`);
    try {
      const { error } = await supabase
        .from('students')
        .update({ status: 'rejected' })
        .eq('id', studentId);

      if (error) throw error;
      
      toast({
        title: "Student Rejected",
        description: "Student application has been rejected.",
      });
    } catch (error) {
      console.error('Error rejecting student:', error);
      toast({
        title: "Error",
        description: "Failed to reject student. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!announcementTitle.trim() || !announcementMessage.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both title and message.",
        variant: "destructive",
      });
      return;
    }

    setProcessing('announcement');
    try {
      const { error } = await supabase
        .from('announcements')
        .insert({
          title: announcementTitle,
          message: announcementMessage,
          audience: announcementAudience,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          priority: 'normal'
        });

      if (error) throw error;
      
      setAnnouncementTitle("");
      setAnnouncementMessage("");
      setAnnouncementAudience("all");
      
      toast({
        title: "Announcement Created",
        description: "Announcement has been sent successfully.",
      });
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast({
        title: "Error",
        description: "Failed to create announcement. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Messages
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Students</p>
                    <p className="text-2xl font-bold">{stats.totalStudents}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <UserCheck className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Active Instructors</p>
                    <p className="text-2xl font-bold">{stats.activeInstructors}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Applications</p>
                    <p className="text-2xl font-bold">{stats.pendingApplications}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">${stats.totalRevenue}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Applications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Pending Applications
                </CardTitle>
                <CardDescription>
                  Review and approve new student applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingStudents.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No pending applications</p>
                  ) : (
                    pendingStudents.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={student.profile_picture_url} alt={`${student.first_name} ${student.last_name}`} />
                            <AvatarFallback>{student.first_name[0]}{student.last_name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.first_name} {student.last_name}</p>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                            <p className="text-xs text-muted-foreground">
                              Permit: {student.learner_permit_number || 'Not provided'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Status: Pending approval
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => handleApproveStudent(student.id)}
                            disabled={processing === `approve-${student.id}`}
                          >
                            {processing === `approve-${student.id}` ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <UserCheck className="h-4 w-4 mr-1" />
                            )}
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleRejectStudent(student.id)}
                            disabled={processing === `reject-${student.id}`}
                          >
                            {processing === `reject-${student.id}` ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <UserX className="h-4 w-4 mr-1" />
                            )}
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Students */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Recent Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeStudents.slice(0, 5).map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={student.profile_picture_url} alt={`${student.first_name} ${student.last_name}`} />
                          <AvatarFallback>{student.first_name[0]}{student.last_name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.first_name} {student.last_name}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Phone: {student.phone || 'Not provided'}
                          </p>
                        </div>
                      </div>
                      <Badge variant={student.status === "active" ? "default" : "secondary"}>
                        {student.status}
                      </Badge>
                    </div>
                  ))}
                  {activeStudents.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No active students</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Instructor Schedule Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Instructor Schedule Overview
              </CardTitle>
              <CardDescription>
                Manage and monitor instructor schedules and assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lessons.slice(0, 5).map((lesson) => (
                  <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium">
                            {lesson.instructor.first_name} {lesson.instructor.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Student: {lesson.student.first_name} {lesson.student.last_name}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {new Date(lesson.lesson_date).toLocaleDateString()} at {lesson.lesson_time}
                          </p>
                          <p className="text-xs text-muted-foreground">{lesson.lesson_type} Lesson</p>
                        </div>
                      </div>
                    </div>
                    <Badge variant={lesson.status === "completed" ? "default" : "secondary"}>
                      {lesson.status}
                    </Badge>
                  </div>
                ))}
                {lessons.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No lessons scheduled</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Announcement Creator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Create Announcement
              </CardTitle>
              <CardDescription>
                Send updates to all students and instructors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="announcement-title">Title</Label>
                  <Input 
                    id="announcement-title" 
                    placeholder="Enter announcement title..."
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="announcement-audience">Send To</Label>
                  <Select value={announcementAudience} onValueChange={setAnnouncementAudience}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="students">Students Only</SelectItem>
                      <SelectItem value="instructors">Instructors Only</SelectItem>
                      <SelectItem value="admins">Admins Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="announcement-message">Message</Label>
                <Textarea 
                  id="announcement-message"
                  placeholder="Enter your announcement message..."
                  className="min-h-[100px]"
                  value={announcementMessage}
                  onChange={(e) => setAnnouncementMessage(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleCreateAnnouncement}
                disabled={processing === 'announcement'}
              >
                {processing === 'announcement' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Bell className="h-4 w-4 mr-2" />
                )}
                Send Announcement
              </Button>
            </CardContent>
          </Card>

          {/* Rate Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Rate Management
              </CardTitle>
              <CardDescription>
                Update registration fees and lesson rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="registration-fee">Registration Fee</Label>
                  <Input id="registration-fee" placeholder="$50.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lesson-rate">Per Lesson Rate</Label>
                  <Input id="lesson-rate" placeholder="$45.00" />
                </div>
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button className="w-full">Update Rates</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;