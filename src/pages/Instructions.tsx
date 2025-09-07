import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileText, CreditCard, Clock, CheckCircle, AlertCircle, Info } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Instructions = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Application Instructions</h1>
            <p className="text-muted-foreground">
              Everything you need to know before applying to PNGUOT Driving School
            </p>
          </div>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Application Requirements
              </CardTitle>
              <CardDescription>
                Please ensure you have all required documents before starting your application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Valid Learner's Permit</h4>
                    <p className="text-sm text-muted-foreground">
                      Current learner's permit with permit number and photo
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Proof of Payment</h4>
                    <p className="text-sm text-muted-foreground">
                      Receipt or confirmation for registration fee and lesson package payment
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Profile Picture</h4>
                    <p className="text-sm text-muted-foreground">
                      Recent photo for identification (JPG/PNG, max 2MB)
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rates & Fees */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Rates & Fees
              </CardTitle>
              <CardDescription>
                Current pricing structure for new students
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Registration Fee</span>
                    <Badge variant="secondary">K15.00</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    One-time application processing fee
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Per Lesson Rate</span>
                    <Badge variant="secondary">K20.00/hour</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Standard rate for in-car driving lessons
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Popular Packages</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>9-Hour Package</span>
                    <span className="font-medium">K180.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>15-Hour Package</span>
                    <span className="font-medium">K300.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>18-Hour Package (Full)</span>
                    <span className="font-medium">K360.00</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lesson Hours Policy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Lesson Hours & Road Test Policy
              </CardTitle>
              <CardDescription>
                Important information about lesson limits and road test preparation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Maximum 18 Hours Before Road Test</h4>
                  <p className="text-sm text-muted-foreground">
                    Students can complete a maximum of 18 driving lesson hours before taking their road test. 
                    This ensures adequate preparation while maintaining provincial standards.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Progress Tracking</h4>
                  <p className="text-sm text-muted-foreground">
                    Your progress will be tracked through your student dashboard, including hours completed 
                    and instructor feedback for each lesson.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Policies & Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Policies & Guidelines
              </CardTitle>
              <CardDescription>
                Important policies to review before applying
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <h4 className="font-medium mb-2">Application Review Process</h4>
                  <p className="text-sm text-muted-foreground">
                    All applications are reviewed by our administrative team within 2-3 business days. 
                    You will receive an email notification regarding your application status.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Scheduling Policy</h4>
                  <p className="text-sm text-muted-foreground">
                    Lessons must be scheduled at least 48 hours in advance. Cancellations with less than 
                    24 hours notice may incur a fee.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Payment Terms</h4>
                  <p className="text-sm text-muted-foreground">
                    Registration fee and lesson package payment must be completed before your first lesson. 
                    Additional hours can be purchased as needed.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Safety Requirements</h4>
                  <p className="text-sm text-muted-foreground">
                    Students must bring their learner's permit to every lesson. Lessons may be cancelled 
                    due to severe weather conditions for safety reasons.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button asChild size="lg">
              <Link to="/signup">
                Ready to Apply? Start Your Application
              </Link>
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Instructions;