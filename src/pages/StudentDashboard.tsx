import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Calendar, Clock, MessageSquare, Bell, FileText, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const StudentDashboard = () => {
  // Mock data - replace with real data from Supabase
  const student = {
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "(416) 555-0123",
    learnerPermit: "L123456789",
    hoursCompleted: 12,
    hoursPaid: 15,
    profilePicture: "/placeholder.svg"
  };

  const upcomingLessons = [
    { date: "2024-01-15", time: "10:00 AM", instructor: "Sarah Johnson", type: "In-Car Lesson" },
    { date: "2024-01-18", time: "2:00 PM", instructor: "Mike Chen", type: "Highway Practice" },
    { date: "2024-01-22", time: "11:00 AM", instructor: "Sarah Johnson", type: "Parallel Parking" }
  ];

  const recentFeedback = [
    { date: "2024-01-10", instructor: "Sarah Johnson", comment: "Great improvement on lane changing. Keep practicing mirror checks.", rating: "Good" },
    { date: "2024-01-08", instructor: "Mike Chen", comment: "Excellent progress on city driving. Ready for highway practice.", rating: "Excellent" }
  ];

  const announcements = [
    { date: "2024-01-12", title: "Holiday Schedule", message: "Office will be closed Dec 25-26. Regular hours resume Dec 27." },
    { date: "2024-01-10", title: "New Instructor", message: "Welcome Maria Rodriguez to our team! She specializes in defensive driving." }
  ];

  const progressPercentage = (student.hoursCompleted / 18) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Student Dashboard</h1>
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
                    <AvatarImage src={student.profilePicture} alt={student.name} />
                    <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{student.name}</h3>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Phone:</span>
                    <span>{student.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Learner's Permit:</span>
                    <span>{student.learnerPermit}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
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
                    <span>{student.hoursCompleted} / 18</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Hours Paid:</span>
                    <span>{student.hoursPaid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hours Remaining:</span>
                    <span>{student.hoursPaid - student.hoursCompleted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Until Road Test:</span>
                    <span>{18 - student.hoursCompleted} hours</span>
                  </div>
                </div>
                {student.hoursCompleted >= 18 && (
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
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Lesson
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message Instructor
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  View Documents
                </Button>
                <Button className="w-full justify-start" variant="outline">
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
                <div className="space-y-4">
                  {upcomingLessons.map((lesson, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{lesson.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {lesson.date} at {lesson.time}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Instructor: {lesson.instructor}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Reschedule
                      </Button>
                    </div>
                  ))}
                </div>
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
                      <p className="text-xs text-muted-foreground">{feedback.date}</p>
                    </div>
                  ))}
                </div>
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
      
      <Footer />
    </div>
  );
};

export default StudentDashboard;