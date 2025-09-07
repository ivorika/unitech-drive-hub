import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle, Users, Award, Clock } from "lucide-react";
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
    <section className="relative overflow-hidden bg-gradient-to-br from-background to-muted">
      <div className="container py-20 lg:py-32">
        <div className="grid lg:grid-cols-1 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8 w-full">
            <div className="space-y-4 max-w-full">
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight">
                Welcome to{" "}
                <span className="text-primary">PNGUOT</span>{" "}
                Driving School
              </h1>
              <p className="text-2xl text-muted-foreground max-w-full">
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
            <p>
              <br />
              <br/>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-16">
              <Button variant="hero" size="lg" onClick={handleApplyClick}>
                Apply Now
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/instructions">View Requirements</Link>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              Managed by the Union Board • Serving the community since 2020
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
