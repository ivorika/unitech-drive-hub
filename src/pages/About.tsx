import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Users, Award, Shield, Clock, MapPin } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">About Unitech Driving School</h1>
            <p className="text-muted-foreground">
              Excellence in driver education, managed by the Union Board
            </p>
          </div>

          {/* Main About Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Our Story
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                PNGUOT Driving School has been serving the community for over 10 years, providing 
                comprehensive driver education and training programs. Managed by the Union Board, 
                we maintain the highest standards of safety, professionalism, and educational excellence.
              </p>
              <p className="text-muted-foreground">
                Our commitment to quality driver education has helped thousands of students become 
                safe, confident drivers. We combine traditional teaching methods with modern technology 
                to create an effective learning environment for all our students.
              </p>
            </CardContent>
          </Card>

          {/* Mission & Values */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  To provide exceptional driver education that prioritizes safety, builds confidence, 
                  and creates responsible drivers who contribute to safer roads for everyone.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Our Values
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Safety first in all aspects of training</li>
                  <li>• Professional and certified instruction</li>
                  <li>• Personalized learning approaches</li>
                  <li>• Community-focused education</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Union Board Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Union Board Management
              </CardTitle>
              <CardDescription>
                Oversight and governance ensuring quality standards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                The Union Board provides strategic oversight and ensures that Unitech Driving School 
                maintains the highest standards of driver education. Board members bring decades of 
                experience in education, safety, and community service.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Quality Assurance</Badge>
                <Badge variant="secondary">Safety Standards</Badge>
                <Badge variant="secondary">Community Oversight</Badge>
                <Badge variant="secondary">Educational Excellence</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Key Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Why Choose Unitech?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">Certified Instructors</h4>
                      <p className="text-sm text-muted-foreground">
                        All instructors are fully certified and regularly trained on the latest safety protocols
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">Flexible Scheduling</h4>
                      <p className="text-sm text-muted-foreground">
                        Convenient lesson times that work with your schedule
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">Small Class Sizes</h4>
                      <p className="text-sm text-muted-foreground">
                        Personalized attention with low student-to-instructor ratios
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">High Success Rate</h4>
                      <p className="text-sm text-muted-foreground">
                        Over 95% of our students pass their road test on the first attempt
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location & Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location & Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Address</h4>
                  <p className="text-muted-foreground">
                    Student & Staff Facility Center <br/>
                    Lae, 411 Independence Drive<br />
                    East Taraka Campus, Morobe<br />
                    Papua New Guinea
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Operating Hours</h4>
                  <div className="space-y-1 text-muted-foreground">
                    <p>Monday - Friday: 8:00 AM - 4:06 PM</p>
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

export default About;