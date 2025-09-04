import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, FileText, User, AlertCircle, Edit, Phone, MapPin, Calendar, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ApplicationForm from "@/pages/ApplicationForm";

interface StudentApplication {
  id: string;
  status: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  address: string;
  emergency_contact: string;
  emergency_phone: string;
  learner_permit_number: string;
  registration_fee: string;
  lesson_package: string;
  created_at: string;
  updated_at: string;
}

const StudentPortal = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [application, setApplication] = useState<StudentApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchApplication();
  }, [user]);

  const fetchApplication = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching application:', error);
        toast({
          title: "Error",
          description: "Failed to load your application status.",
          variant: "destructive"
        });
      } else {
        setApplication(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReapply = () => {
    setShowApplicationForm(true);
  };

  const handleEditApplication = () => {
    setIsEditing(true);
    setShowApplicationForm(true);
  };

  const handleProceedToLogin = () => {
    toast({
      title: "Welcome!",
      description: "You can now log in as an approved student.",
    });
    navigate('/login');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-6 w-6 text-red-500" />;
      case 'pending':
      default:
        return <Clock className="h-6 w-6 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500 text-white">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
      default:
        return <Badge variant="secondary">Pending Review</Badge>;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'approved':
        return "Congratulations! Your application has been approved. You can now proceed to log in and access your student dashboard.";
      case 'rejected':
        return "Unfortunately, your application was not approved at this time. You may reapply with updated information.";
      case 'pending':
      default:
        return "Your application is currently under review. We'll notify you once a decision has been made.";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12">
          <div className="max-w-2xl mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading your application status...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (showApplicationForm) {
    return <ApplicationForm isEditing={isEditing} existingData={application} onBack={() => {
      setShowApplicationForm(false);
      setIsEditing(false);
      fetchApplication();
    }} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Student Portal</h1>
            <p className="text-muted-foreground">
              Welcome to Unitech Driving School's student application portal
            </p>
          </div>

          {!application ? (
            // No application found - show new application option
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <FileText className="h-6 w-6" />
                  New Student Application
                </CardTitle>
                <CardDescription>
                  Get started by submitting your driving school application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="bg-muted rounded-lg p-6">
                    <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Ready to Start Learning?</h3>
                    <p className="text-sm text-muted-foreground">
                      Complete your application to begin your journey with Unitech Driving School.
                      Our team will review your application and get back to you soon.
                    </p>
                  </div>
                  
                  <Button 
                    onClick={() => setShowApplicationForm(true)}
                    size="lg"
                    className="w-full"
                  >
                    Start Your Application
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Application exists - show status
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {getStatusIcon(application.status)}
                    Application Status
                  </span>
                  {getStatusBadge(application.status)}
                </CardTitle>
                <CardDescription>
                  Application submitted on {new Date(application.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <span className="font-medium">Name:</span>
                          <p className="text-muted-foreground">{application.first_name} {application.last_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <span className="font-medium">Phone:</span>
                          <p className="text-muted-foreground">{application.phone || 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <span className="font-medium">Date of Birth:</span>
                          <p className="text-muted-foreground">
                            {application.date_of_birth ? new Date(application.date_of_birth).toLocaleDateString() : 'Not provided'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <span className="font-medium">Email:</span>
                          <p className="text-muted-foreground">{application.email}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <span className="font-medium">Permit #:</span>
                          <p className="text-muted-foreground">{application.learner_permit_number || 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <span className="font-medium">Registration:</span>
                          <p className="text-muted-foreground">{application.registration_fee || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-muted rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium mb-1">Status Update</p>
                        <p className="text-sm text-muted-foreground">
                          {getStatusMessage(application.status)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {application.status === 'approved' && (
                    <Button 
                      onClick={handleProceedToLogin}
                      size="lg"
                      className="w-full"
                    >
                      Continue to Login
                    </Button>
                  )}
                  
                  {application.status === 'rejected' && (
                    <Button 
                      onClick={handleReapply}
                      size="lg"
                      className="w-full"
                    >
                      Submit New Application
                    </Button>
                  )}
                  
                  {application.status === 'pending' && (
                    <div className="space-y-3">
                      <Button 
                        onClick={handleEditApplication}
                        variant="outline"
                        size="lg"
                        className="w-full"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Application
                      </Button>
                      <div className="text-center text-sm text-muted-foreground">
                        <p>We'll email you once your application has been reviewed.</p>
                        <p className="mt-1">
                          Last updated: {new Date(application.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>What happens next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</div>
                  <div>
                    <p className="font-medium">Submit Application</p>
                    <p className="text-muted-foreground">Complete the application form with all required documents</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</div>
                  <div>
                    <p className="font-medium">Application Review</p>
                    <p className="text-muted-foreground">Our team reviews your application and documents</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</div>
                  <div>
                    <p className="font-medium">Get Started</p>
                    <p className="text-muted-foreground">Once approved, log in to access your student dashboard and schedule lessons</p>
                  </div>
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

export default StudentPortal;