import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, User, FileText, CreditCard, Phone, Mail, Calendar, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Signup = () => {
  const { toast } = useToast();
  const learnerPermitRef = useRef<HTMLInputElement>(null);
  const profilePictureRef = useRef<HTMLInputElement>(null);
  const paymentProofRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    learnerPermitNumber: "",
    registrationFee: "",
    lessonPackage: ""
  });

  const [files, setFiles] = useState({
    learnerPermit: null as File | null,
    profilePicture: null as File | null,
    paymentProof: null as File | null
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required files
    if (!files.learnerPermit || !files.profilePicture || !files.paymentProof) {
      toast({
        title: "Missing Files",
        description: "Please upload all required documents before submitting.",
        variant: "destructive"
      });
      return;
    }

    // Here you would typically upload files and submit form data
    console.log("Application submitted:", { formData, files });
    
    toast({
      title: "Application Submitted",
      description: "Your application has been submitted successfully. We'll review it shortly.",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (type: 'learnerPermit' | 'profilePicture' | 'paymentProof') => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: "Please select a file smaller than 2MB.",
            variant: "destructive"
          });
          return;
        }
        
        setFiles(prev => ({
          ...prev,
          [type]: file
        }));
        
        toast({
          title: "File uploaded",
          description: `${file.name} has been selected.`,
        });
      }
    };

  const triggerFileInput = (ref: React.RefObject<HTMLInputElement>) => {
    ref.current?.click();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">New Student Application</h1>
            <p className="text-muted-foreground">
              Complete this form to apply for driving lessons at Unitech Driving School
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Details
                </CardTitle>
                <CardDescription>
                  Please provide your basic information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Street address, city, province, postal code"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input
                      id="emergencyContact"
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleInputChange}
                      placeholder="Full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                    <Input
                      id="emergencyPhone"
                      name="emergencyPhone"
                      value={formData.emergencyPhone}
                      onChange={handleInputChange}
                      placeholder="Phone number"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Required Documents
                </CardTitle>
                <CardDescription>
                  Upload your learner's permit and proof of payment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="learnerPermitNumber">Learner's Permit Number *</Label>
                  <Input
                    id="learnerPermitNumber"
                    name="learnerPermitNumber"
                    value={formData.learnerPermitNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Learner's Permit Scan/Photo *</Label>
                  <div 
                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => triggerFileInput(learnerPermitRef)}
                  >
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {files.learnerPermit ? files.learnerPermit.name : "Click to upload or drag and drop"}<br />
                      JPG, PNG (max 2MB)
                    </p>
                    <Input 
                      ref={learnerPermitRef}
                      type="file" 
                      className="hidden" 
                      accept=".jpg,.jpeg,.png"
                      onChange={handleFileChange('learnerPermit')}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Profile Picture *</Label>
                  <div 
                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => triggerFileInput(profilePictureRef)}
                  >
                    <User className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {files.profilePicture ? files.profilePicture.name : "Upload your profile picture"}<br />
                      JPG, PNG (max 2MB)
                    </p>
                    <Input 
                      ref={profilePictureRef}
                      type="file" 
                      className="hidden" 
                      accept=".jpg,.jpeg,.png"
                      onChange={handleFileChange('profilePicture')}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
                <CardDescription>
                  Confirm your payment details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="registrationFee">Registration Fee Payment Confirmation *</Label>
                  <Input
                    id="registrationFee"
                    name="registrationFee"
                    value={formData.registrationFee}
                    onChange={handleInputChange}
                    placeholder="Transaction ID or receipt number"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lessonPackage">Lesson Package Payment *</Label>
                  <Input
                    id="lessonPackage"
                    name="lessonPackage"
                    value={formData.lessonPackage}
                    onChange={handleInputChange}
                    placeholder="Transaction ID or receipt number"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Proof of Payment *</Label>
                  <div 
                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => triggerFileInput(paymentProofRef)}
                  >
                    <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {files.paymentProof ? files.paymentProof.name : "Upload payment receipt or screenshot"}<br />
                      JPG, PNG, PDF (max 2MB)
                    </p>
                    <Input 
                      ref={paymentProofRef}
                      type="file" 
                      className="hidden" 
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileChange('paymentProof')}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <Button type="submit" size="lg" className="w-full max-w-md">
                Submit Application
              </Button>
            </div>
          </form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Signup;