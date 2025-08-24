import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Eye
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const AdminDashboard = () => {
  // Mock data - replace with real data from Supabase
  const stats = {
    totalStudents: 45,
    activeInstructors: 8,
    pendingApplications: 7,
    totalRevenue: 15420,
    lessonsThisWeek: 67,
    completedLessons: 234
  };

  const pendingApplications = [
    {
      id: 1,
      name: "Alex Johnson",
      email: "alex.johnson@email.com",
      appliedDate: "2024-01-12",
      permit: "L987654321",
      profilePicture: "/placeholder.svg",
      paymentStatus: "Verified"
    },
    {
      id: 2,
      name: "Maria Garcia",
      email: "maria.garcia@email.com",
      appliedDate: "2024-01-11",
      permit: "L876543210",
      profilePicture: "/placeholder.svg",
      paymentStatus: "Pending"
    },
    {
      id: 3,
      name: "David Kim",
      email: "david.kim@email.com",
      appliedDate: "2024-01-10",
      permit: "L765432109",
      profilePicture: "/placeholder.svg",
      paymentStatus: "Verified"
    }
  ];

  const recentStudents = [
    { name: "John Smith", instructor: "Sarah Johnson", hoursCompleted: 12, status: "Active", avatar: "/placeholder.svg" },
    { name: "Emma Wilson", instructor: "Mike Chen", hoursCompleted: 18, status: "Ready for Test", avatar: "/placeholder.svg" },
    { name: "Mike Brown", instructor: "Sarah Johnson", hoursCompleted: 8, status: "Active", avatar: "/placeholder.svg" },
    { name: "Lisa Chen", instructor: "Maria Rodriguez", hoursCompleted: 15, status: "Active", avatar: "/placeholder.svg" }
  ];

  const instructorSchedule = [
    { instructor: "Sarah Johnson", student: "John Smith", time: "10:00 AM", date: "2024-01-15", type: "In-Car" },
    { instructor: "Mike Chen", student: "Emma Wilson", time: "2:00 PM", date: "2024-01-15", type: "Highway" },
    { instructor: "Maria Rodriguez", student: "Lisa Chen", time: "11:00 AM", date: "2024-01-16", type: "Parking" },
    { instructor: "Sarah Johnson", student: "Mike Brown", time: "3:00 PM", date: "2024-01-16", type: "City Driving" }
  ];

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
                  {pendingApplications.map((application) => (
                    <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={application.profilePicture} alt={application.name} />
                          <AvatarFallback>{application.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{application.name}</p>
                          <p className="text-sm text-muted-foreground">{application.email}</p>
                          <p className="text-xs text-muted-foreground">Permit: {application.permit}</p>
                          <Badge variant={application.paymentStatus === "Verified" ? "default" : "secondary"}>
                            {application.paymentStatus}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="default">
                          <UserCheck className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive">
                          <UserX className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
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
                  {recentStudents.map((student, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={student.avatar} alt={student.name} />
                          <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">Instructor: {student.instructor}</p>
                          <p className="text-xs text-muted-foreground">{student.hoursCompleted} hours completed</p>
                        </div>
                      </div>
                      <Badge variant={student.status === "Ready for Test" ? "default" : "secondary"}>
                        {student.status}
                      </Badge>
                    </div>
                  ))}
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
                {instructorSchedule.map((schedule, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium">{schedule.instructor}</p>
                          <p className="text-sm text-muted-foreground">Student: {schedule.student}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{schedule.date} at {schedule.time}</p>
                          <p className="text-xs text-muted-foreground">{schedule.type} Lesson</p>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Modify
                    </Button>
                  </div>
                ))}
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
                  <Input id="announcement-title" placeholder="Enter announcement title..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="announcement-audience">Send To</Label>
                  <select id="announcement-audience" className="w-full p-2 border rounded-md">
                    <option>All Users</option>
                    <option>Students Only</option>
                    <option>Instructors Only</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="announcement-message">Message</Label>
                <Textarea 
                  id="announcement-message"
                  placeholder="Enter your announcement message..."
                  className="min-h-[100px]"
                />
              </div>
              <Button>
                <Bell className="h-4 w-4 mr-2" />
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