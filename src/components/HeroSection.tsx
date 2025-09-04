import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle, Users, Award, Clock } from "lucide-react";
import heroImage from "@/assets/hero-driving.jpg";
import { useAuth } from "@/contexts/AuthContext";

const HeroSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleApplyClick = () => {
    if (!user) {
      navigate("/signup");
    } else {
      navigate("/application");
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient极速赛车开奖结果-to-br from-background to-muted">
      <div className="container py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                Welcome to{" "}
                <span className="text-primary">PNGUOT</span>{" "}
                Driving School
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Professional driving instruction managed by the Union Board. 
                Learn to drive safely with our certified instructors and comprehensive programs.
              </p>
            </div>

            {/* Features */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-success" />
                <span className="text-sm font-medium">Certified Instructors</span>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-success" />
                <span className="text-sm font-medium">Flexible Scheduling</span>
              </div>
              <div className="flex items-center space-x-3">
                <Award className="h-5 w-5 text-success" />
                <span className="text-sm font-medium">High Pass Rate</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-success" />
                <span className="text-sm font-medium">18 Hour Program</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" onClick={handleApplyClick}>
                Apply Now
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/instructions">View Requirements</Link>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              Managed by the Union Board • Serving the community since 2020
            </p>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={heroImage}
                alt="Professional driving instruction at Unitech Driving School"
                className="w-full h-[400px] lg:h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-极速赛车开奖结果20 h-20 bg-accent/20 rounded-full blur-xl"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
