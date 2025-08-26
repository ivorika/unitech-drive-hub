import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Car, Mail, Phone, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Footer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleApplyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
    } else {
      navigate("/application");
    }
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Car className="h-8 w-8" />
              <div>
                <div className="font-bold text-lg">DrDriver</div>
                <div className="text-sm opacity-80">Unitech Driving School</div>
              </div>
            </div>
            <p className="text-sm opacity-80 max-w-sm">
              Professional driving instruction managed by the Union Board. 
              Building safe and confident drivers since 2020.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Quick Links</h3>
            <div className="space-y-2 text-sm">
              <Link to="/instructions" className="block opacity-80 hover:opacity-100 transition-opacity">
                Application Instructions
              </Link>
              <Link to="/about" className="block opacity-80 hover:opacity-100 transition-opacity">
                About Us
              </Link>
              <Link to="/contact" className="block opacity-80 hover:opacity-100 transition-opacity">
                Contact Support
              </Link>
              <a href="#" onClick={handleApplyClick} className="block opacity-80 hover:opacity-100 transition-opacity cursor-pointer">
                Apply Now
              </a>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="font-semibold">Services</h3>
            <div className="space-y-2 text-sm opacity-80">
              <div>Beginner Driving Lessons</div>
              <div>Road Test Preparation</div>
              <div>Defensive Driving</div>
              <div>Progress Tracking</div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold">Contact Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2 opacity-80">
                <Phone className="h-4 w-4" />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2 opacity-80">
                <Mail className="h-4 w-4" />
                <span>info@unitechdrive.com</span>
              </div>
              <div className="flex items-center space-x-2 opacity-80">
                <MapPin className="h-4 w-4" />
                <span>123 Union St, Your City</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm opacity-80">
          <p>&copy; 2024 Unitech Driving School. Managed by the Union Board. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;