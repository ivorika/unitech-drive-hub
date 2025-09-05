import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, X, Plus, Upload, User } from "lucide-react";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userType: 'student' | 'instructor' | 'admin';
  userData: any;
  onProfileUpdate: () => void;
}

export const EditProfileDialog = ({
  open,
  onOpenChange,
  userType,
  userData,
  onProfileUpdate
}: EditProfileDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [newSpecialty, setNewSpecialty] = useState("");
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const profilePictureRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userData && open) {
      setFormData({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        ...(userType === 'student' && {
          address: userData.address || '',
          emergency_contact: userData.emergency_contact || '',
          emergency_phone: userData.emergency_phone || '',
          learner_permit_number: userData.learner_permit_number || '',
        }),
        ...(userType === 'instructor' && {
          bio: userData.bio || '',
          license_number: userData.license_number || '',
          license_expiry_date: userData.license_expiry_date || '',
          hourly_rate: userData.hourly_rate || '',
          years_of_experience: userData.years_of_experience || '',
        }),
      });

      if (userType === 'instructor' && userData.specializations) {
        setSpecialties(userData.specializations || []);
      }
    }
  }, [userData, open, userType]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !specialties.includes(newSpecialty.trim())) {
      setSpecialties([...specialties, newSpecialty.trim()]);
      setNewSpecialty("");
    }
  };

  const removeSpecialty = (index: number) => {
    setSpecialties(specialties.filter((_, i) => i !== index));
  };

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

    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrl;
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (JPG, PNG, etc.).",
          variant: "destructive"
        });
        return;
      }

      setProfilePictureFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicturePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      toast({
        title: "File selected",
        description: `${file.name} has been selected.`,
      });
    }
  };

  const triggerFileInput = () => {
    profilePictureRef.current?.click();
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const table = userType === 'student' ? 'students' :
                   userType === 'instructor' ? 'instructors' : 'admins';

      let profilePicturePath = userData.profile_picture_url;

      // Upload profile picture if a new file was selected
      if (profilePictureFile) {
        profilePicturePath = await uploadFile(profilePictureFile, 'profiles', 'profile-pictures');
      }

      const updateData = {
        ...formData,
        profile_picture_url: profilePicturePath,
        ...(userType === 'instructor' && { specializations: specialties }),
      };

      const { error } = await supabase
        .from(table)
        .update(updateData)
        .eq('id', userData.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });

      onProfileUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStudentFields = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            value={formData.address || ''}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Enter your address"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="learner_permit_number">Learner's Permit Number</Label>
          <Input
            id="learner_permit_number"
            value={formData.learner_permit_number || ''}
            onChange={(e) => handleInputChange('learner_permit_number', e.target.value)}
            placeholder="Enter permit number"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="emergency_contact">Emergency Contact Name</Label>
          <Input
            id="emergency_contact"
            value={formData.emergency_contact || ''}
            onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
            placeholder="Emergency contact name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emergency_phone">Emergency Contact Phone</Label>
          <Input
            id="emergency_phone"
            value={formData.emergency_phone || ''}
            onChange={(e) => handleInputChange('emergency_phone', e.target.value)}
            placeholder="Emergency contact phone"
          />
        </div>
      </div>
    </>
  );

  const renderInstructorFields = () => (
    <>
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={formData.bio || ''}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          placeholder="Tell us about yourself"
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="license_number">License Number</Label>
          <Input
            id="license_number"
            value={formData.license_number || ''}
            onChange={(e) => handleInputChange('license_number', e.target.value)}
            placeholder="License number"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="license_expiry_date">License Expiry Date</Label>
          <Input
            id="license_expiry_date"
            type="date"
            value={formData.license_expiry_date || ''}
            onChange={(e) => handleInputChange('license_expiry_date', e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
          <Input
            id="hourly_rate"
            type="number"
            value={formData.hourly_rate || ''}
            onChange={(e) => handleInputChange('hourly_rate', e.target.value)}
            placeholder="Enter hourly rate"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="years_of_experience">Years of Experience</Label>
          <Input
            id="years_of_experience"
            type="number"
            value={formData.years_of_experience || ''}
            onChange={(e) => handleInputChange('years_of_experience', e.target.value)}
            placeholder="Years of experience"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Specializations</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {specialties.map((specialty, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {specialty}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeSpecialty(index)}
              />
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newSpecialty}
            onChange={(e) => setNewSpecialty(e.target.value)}
            placeholder="Add specialization"
            onKeyPress={(e) => e.key === 'Enter' && addSpecialty()}
          />
          <Button type="button" variant="outline" size="sm" onClick={addSpecialty}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );

  if (!userData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Profile Picture Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={profilePicturePreview || userData.profile_picture_url || "/placeholder.svg"}
                    alt={`${userData.first_name} ${userData.last_name}`}
                  />
                  <AvatarFallback className="text-lg">
                    {userData.first_name?.[0]}{userData.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={triggerFileInput}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1">
                <Label className="font-medium">Profile Picture</Label>
                <p className="text-sm text-muted-foreground">
                  {profilePictureFile
                    ? `Selected: ${profilePictureFile.name}`
                    : "Click the plus icon to upload a new profile picture"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG (max 2MB)
                </p>
              </div>
            </div>

            <Input
              ref={profilePictureRef}
              type="file"
              className="hidden"
              accept=".jpg,.jpeg,.png"
              onChange={handleProfilePictureChange}
            />
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={formData.first_name || ''}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                placeholder="First name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name || ''}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                placeholder="Last name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Phone number"
              />
            </div>
          </div>

          {/* Role-specific fields */}
          {userType === 'student' && renderStudentFields()}
          {userType === 'instructor' && renderInstructorFields()}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
