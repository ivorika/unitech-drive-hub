import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, User, FileText, CreditCard, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface ApplicationFormProps {
  isEditing?: boolean;
  existingData?: any;
  onBack?: () => void;
}

const ApplicationForm = ({ isEditing = false, existingData, onBack }: ApplicationFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const learnerPermitRef = useRef<HTMLInputElement>(null);
  const profilePictureRef = useRef<HTMLInputElement>(null);
  const paymentProofRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  // Populate form data when editing
  useEffect(() => {
    if (isEditing && existingData) {
      setFormData({
        firstName: existingData.first_name || "",
        lastName: existingData.last_name || "",
        email: existingData.email || "",
        phone: existingData.phone || "",
        dateOfBirth: existingData.date_of_birth || "",
        address: existingData.address || "",
        emergencyContact: existingData.emergency_contact || "",
        emergencyPhone: existingData.emergency_phone || "",
        learnerPermitNumber: existingData.learner_permit_number || "",
        registrationFee: existingData.registration_fee || "",
        lessonPackage: existingData.lesson_package || ""
      });
    }
  }, [isEditing, existingData]);

  const [files, setFiles] = useState({
    learnerPermit: null as File | null,
    profilePicture: null as File | null,
    paymentProof: null as File | null
  });

  const uploadFile = async (file: File, bucket: string, folder: string): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${folder}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) {
      throw error;
    }

    return data.path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate required files only for new applications
      if (!isEditing && (!files.learnerPermit || !files.profilePicture || !files.paymentProof)) {
        toast({
          title: "Missing Files",
          description: "Please upload all required documents before submitting.",
          variant: "destructive"
        });
        return;
      }

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign up and log in first to submit your application.",
          variant: "destructive"
        });
        navigate('/login');
        return;
      }

      // Upload files if provided
      let learnerPermitPath = existingData?.learner_permit_url;
      let profilePicturePath = existingData?.profile_picture_url;
      let paymentProofPath = existingData?.payment_proof_url;

      if (files.learnerPermit) {
        learnerPermitPath = await uploadFile(files.learnerPermit, 'documents', 'learner-permits');
      }
      if (files.profilePicture) {
        profilePicturePath = await uploadFile(files.profilePicture, 'profiles', 'profile-pictures');
      }
      if (files.paymentProof) {
        paymentProofPath = await uploadFile(files.paymentProof, 'documents', 'payment-proofs');
      }

      const baseData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        date_of_birth: formData.dateOfBirth,
        address: formData.address,
        emergency_contact: formData.emergencyContact,
        emergency_phone: formData.emergencyPhone,
        learner_permit_number: formData.learnerPermitNumber,
        learner_permit_url: learnerPermitPath,
        profile_picture_url: profilePicturePath,
        payment_proof_url: paymentProofPath,
        registration_fee: formData.registrationFee,
        lesson_package: formData.lessonPackage
      };

      // Insert or update student data
      let error;
      if (isEditing) {
        const { error: updateError } = await supabase
          .from('students')
          .update({
            ...baseData,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('students')
          .insert({
            ...baseData,
            user_id: user.id,
            status: 'pending'
          });
        error = insertError;
      }

      if (error) {
        throw error;
      }

      toast({
        title: isEditing ? "Application Updated" : "Application Submitted",
        description: isEditing 
          ? "Your application has been updated successfully."
          : "Your application has been submitted successfully. We'll review it shortly.",
      });
      
      if (isEditing && onBack) {
        onBack();
      } else {
        navigate('/student-portal');
      }
    } catch (error: any) {
      console.error('Submission error:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "There was an error submitting your application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
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
            {onBack && (
              <div className="flex items-center justify-start mb-4">
                <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Portal
                </Button>
              </div>
            )}
            <h1 className="text-3xl font-bold">
              {isEditing ? "Edit Application" : "New Student Application"}
            </h1>
            <p className="text-muted-foreground">
              {isEditing 
                ? "Update your application information below"
                : "Complete this form to apply for driving lessons at Unitech Driving School"}
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
                  <Label>Learner's Permit Scan/Photo {!isEditing && "*"}</Label>
                  <div 
                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => triggerFileInput(learnerPermitRef)}
                  >
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {files.learnerPermit 
                        ? files.learnerPermit.name 
                        : isEditing 
                          ? "Click to upload new file (optional)"
                          : "Click to upload or drag and drop"}<br />
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
                  <Label>Profile Picture {!isEditing && "*"}</Label>
                  <div 
                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => triggerFileInput(profilePictureRef)}
                  >
                    <User className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {files.profilePicture 
                        ? files.profilePicture.name 
                        : isEditing 
                          ? "Click to upload new picture (optional)"
                          : "Upload your profile picture"}<br />
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
                  <Label>Proof of Payment {!isEditing && "*"}</Label>
                  <div 
                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => triggerFileInput(paymentProofRef)}
                  >
                    <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {files.paymentProof 
                        ? files.paymentProof.name 
                        : isEditing 
                          ? "Click to upload new receipt (optional)"
                          : "Upload payment receipt or screenshot"}<br />
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
              <Button type="submit" size="lg" className="w-full max-w-md" disabled={isSubmitting}>
                {isSubmitting 
                  ? (isEditing ? "Updating..." : "Submitting...") 
                  : (isEditing ? "Update Application" : "Submit Application")}
              </Button>
            </div>
          </form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ApplicationForm;
