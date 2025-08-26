import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, User, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Login = () => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("student");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userType } = useParams();

  useEffect(() => {
    if (userType && ["student", "instructor", "admin"].includes(userType)) {
      setActiveTab(userType);
    }
  }, [userType]);

  const handleSubmit = async (e: React.FormEvent, userType: string) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        // Check user role and redirect accordingly
        const { data: profileData, error: profileError } = await checkUserRole(data.user.id, userType);
        
        if (profileError || !profileData) {
          toast({
            title: "Access denied",
            description: `You don't have ${userType} access to this system.`,
            variant: "destructive",
          });
          await supabase.auth.signOut();
          return;
        }

        toast({
          title: "Login successful",
          description: `Welcome back!`,
        });

        // Redirect based on role
        switch (userType) {
          case "student":
            navigate("/student-dashboard");
            break;
          case "instructor":
            navigate("/instructor-dashboard");
            break;
          case "admin":
            navigate("/admin-dashboard");
            break;
          default:
            navigate("/");
        }
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkUserRole = async (userId: string, expectedRole: string) => {
    switch (expectedRole) {
      case "student":
        return await supabase
          .from("students")
          .select("*")
          .eq("user_id", userId)
          .single();
      case "instructor":
        return await supabase
          .from("instructors")
          .select("*")
          .eq("user_id", userId)
          .single();
      case "admin":
        return await supabase
          .from("admins")
          .select("*")
          .eq("user_id", userId)
          .single();
      default:
        return { data: null, error: new Error("Invalid role") };
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-12">
        <div className="max-w-md mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Login to DrDriver</h1>
            <p className="text-muted-foreground">
              Access your account based on your role
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="student" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Student
              </TabsTrigger>
              <TabsTrigger value="instructor" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Instructor
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Admin
              </TabsTrigger>
            </TabsList>

            <TabsContent value="student">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Student Login
                  </CardTitle>
                  <CardDescription>
                    Access your learning dashboard and progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => handleSubmit(e, "student")} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="student-email">Email</Label>
                      <Input
                        id="student-email"
                        name="email"
                        type="email"
                        value={loginData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="student-password">Password</Label>
                      <Input
                        id="student-password"
                        name="password"
                        type="password"
                        value={loginData.password}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Logging in..." : "Login as Student"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="instructor">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Instructor Login
                  </CardTitle>
                  <CardDescription>
                    Manage your students and provide feedback
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => handleSubmit(e, "instructor")} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="instructor-email">Email</Label>
                      <Input
                        id="instructor-email"
                        name="email"
                        type="email"
                        value={loginData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instructor-password">Password</Label>
                      <Input
                        id="instructor-password"
                        name="password"
                        type="password"
                        value={loginData.password}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Logging in..." : "Login as Instructor"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="admin">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Admin Login
                  </CardTitle>
                  <CardDescription>
                    Full system management and oversight
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => handleSubmit(e, "admin")} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-email">Email</Label>
                      <Input
                        id="admin-email"
                        name="email"
                        type="email"
                        value={loginData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-password">Password</Label>
                      <Input
                        id="admin-password"
                        name="password"
                        type="password"
                        value={loginData.password}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Logging in..." : "Login as Admin"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              New student?{" "}
              <a href="/signup" className="text-primary hover:underline">
                Sign Up
              </a>
            </p>
            <p className="text-sm text-muted-foreground">
              <a href="/forgot-password" className="text-primary hover:underline">
                Forgot your password?
              </a>
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Login;