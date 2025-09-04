import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { UserCheck, GraduationCap, Users, Shield } from "lucide-react";
import instructorIcon from "@/assets/instructor-icon.jpg";
import studentIcon from "@/assets/student-icon.jpg";

const LoginOptions = () => {
  const loginTypes = [
    {
      title: "Admin",
      description: "Full system management and oversight",
      icon: Shield,
      color: "text-primary",
      bgColor: "bg-primary/10",
      href: "/login/admin"
    },
    {
      title: "Instructor",
      description: "Manage students and provide feedback",
      icon: GraduationCap,
      color: "text-accent",
      bgColor: "bg-accent/10",
      href: "/login/instructor",
      image: instructorIcon
    },
    {
      title: "Existing Student",
      description: "Access your learning dashboard",
      icon: UserCheck,
      color: "text-success",
      bgColor: "bg-success/10",
      href: "/login/student",
      image: studentIcon
    },
    {
      title: "New Student",
      description: "First-time applicant registration",
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
      href: "/signup"
    }
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Choose Your Access Type</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Select the appropriate option based on your role at PNGUOT Driving School
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loginTypes.map((type) => (
            <Card key={type.title} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 mx-auto rounded-full ${type.bgColor} flex items-center justify-center mb-4`}>
                  {type.image ? (
                    <img 
                      src={type.image} 
                      alt={`${type.title} icon`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <type.icon className={`h-8 w-8 ${type.color}`} />
                  )}
                </div>
                <CardTitle className="text-lg">{type.title}</CardTitle>
                <CardDescription className="text-sm">
                  {type.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  variant={type.title === "New Student" ? "hero" : "outline"} 
                  className="w-full" 
                  asChild
                >
                  <Link to={type.href}>
                    {type.title === "New Student" ? "Apply Now" : "Sign In"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LoginOptions;