import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { User, Calendar, Clock, MessageSquare, Bell, Users, Star, FileText } from "lucide-react";
import { EditProfileDialog } from "@/components/EditProfileDialog";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const InstructorDashboard = () => {
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  
  // Mock data - replace with real data from Supabase
  const instructor = {
    name: "Sarah Johnson",
    email: "sarah.johnson@unitech.com",
    phone: "(416) 555-0456",
    license: "INS-789123",
    experience: "8 years",
    specialties: ["Highway Driving", "Defensive Driving", "Parallel Parking"],
    profilePicture: "/placeholder.svg"
  };

  const todayLessons = [
    { time: "9:00 AM", student: "John Smith", type: "In-Car Lesson", duration: "1 hour", status: "upcoming" },
    { time: "11:00 AM", student: "Emma Wilson", type: "Highway Practice", duration: "1.5 hours", status: "upcoming" },
    { time: "2:00 PM", student: "Mike Brown", type: "Road Test Prep", duration: "1 hour", status: "completed" },
    { time: "4:00 PM", student: "Lisa Chen", type: "Parallel Parking", duration: "1 hour", status: "upcoming" }
  ];

  const myStudents = [
    { name: "John Smith", hoursCompleted: 12, totalHours: 15, nextLesson: "2024-01-15", progress: "Good", avatar: "/placeholder.svg" },
    { name: "Emma Wilson", hoursCompleted: 8, totalHours: 18, nextLesson: "2024-01-16", progress: "Excellent", avatar: "/placeholder.svg" },
    { name: "Mike Brown", hoursCompleted: 16, totalHours: 18, nextLesson: "2024-01-17", progress: "Ready for Test", avatar: "/placeholder.svg" },
    { name: "Lisa Chen", hoursCompleted: 5, totalHours: 12, nextLesson: "2024-01-18", progress: "Needs Practice", avatar: "/placeholder.svg" }
  ];

  const announcements = [
    { date: "2024-01-12", title: "Schedule Update", message: "Please note the updated holiday schedule. Office closed Dec 25-26." },
    { date: "2024-01-10", title: "Training Session", message: "Mandatory safety training scheduled for Jan 20th at 2:00 PM." }
  ];

  const handleEditProfile = () => {
    setEditProfileOpen(true);
  };

  const handleProfileUpdate = () => {
    // Trigger a re-fetch of data after profile update
    window.location.reload();
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
                    <AvatarImage src={instructor.profilePicture} alt={instructor.name} />
                    <AvatarFallback>{instructor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{instructor.name}</h3>
                    <p className="text-sm text-muted-foreground">{instructor.email}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>License:</span>
                    <span>{instructor.license}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Experience:</span>
                    <span>{instructor.experience}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium">Specialties:</span>
                  <div className="flex flex-wrap gap-1">
                    {instructor.specialties.map((specialty, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
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
                    <p className="text-2xl font-bold text-primary">4</p>
                    <p className="text-xs text-muted-foreground">Total Lessons</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-primary">5.5</p>
                    <p className="text-xs text-muted-foreground">Hours Scheduled</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-green-600">1</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-amber-600">3</p>
                    <p className="text-xs text-muted-foreground">Remaining</p>
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
                  {todayLessons.map((lesson, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{lesson.time}</p>
                          <Badge variant={lesson.status === "completed" ? "default" : "secondary"}>
                            {lesson.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{lesson.student}</p>
                        <p className="text-xs text-muted-foreground">
                          {lesson.type} • {lesson.duration}
                        </p>
                      </div>
                      {lesson.status === "upcoming" && (
                        <Button variant="outline" size="sm">
                          Start Lesson
                        </Button>
                      )}
                      {lesson.status === "completed" && (
                        <Button variant="outline" size="sm">
                          Add Feedback
                        </Button>
                      )}
                    </div>
                  ))}
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
                  {myStudents.map((student, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={student.avatar} alt={student.name} />
                          <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {student.hoursCompleted}/{student.totalHours} hours
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Next: {student.nextLesson}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          student.progress === "Excellent" ? "default" :
                          student.progress === "Ready for Test" ? "default" :
                          student.progress === "Good" ? "secondary" : "destructive"
                        }>
                          {student.progress}
                        </Badge>
                      </div>
                    </div>
                  ))}
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
                  <select className="w-full p-2 border rounded-md">
                    <option>Select a student...</option>
                    <option>John Smith</option>
                    <option>Emma Wilson</option>
                    <option>Mike Brown</option>
                    <option>Lisa Chen</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Performance Rating</label>
                  <select className="w-full p-2 border rounded-md">
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
                {announcements.map((announcement, index) => (
                  <div key={index} className="p-4 border-l-4 border-primary bg-muted/50">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">{announcement.title}</h4>
                      <span className="text-xs text-muted-foreground">{announcement.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{announcement.message}</p>
                  </div>
                ))}
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