import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, UserPlus } from "lucide-react";

interface AddInstructorDialogProps {
  onCreated?: () => void;
}

const emptyForm = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  phone: "",
  license_number: "",
  years_of_experience: "",
  hourly_rate: "",
};

export const AddInstructorDialog = ({ onCreated }: AddInstructorDialogProps) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const update = (key: keyof typeof emptyForm, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-instructor", {
        body: form,
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: "Instructor created",
        description: `${form.first_name} ${form.last_name} can now log in with these credentials.`,
      });
      setForm(emptyForm);
      setOpen(false);
      onCreated?.();
    } catch (err) {
      console.error("Error creating instructor:", err);
      toast({
        title: "Could not create instructor",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Instructor
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Instructor</DialogTitle>
          <DialogDescription>
            Create login credentials for a new instructor. They can sign in right away from the
            Instructor tab.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="first_name">First name *</Label>
              <Input
                id="first_name"
                value={form.first_name}
                onChange={(e) => update("first_name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last name *</Label>
              <Input
                id="last_name"
                value={form.last_name}
                onChange={(e) => update("last_name", e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Temporary password *</Label>
            <Input
              id="password"
              type="text"
              minLength={6}
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              placeholder="At least 6 characters"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="license_number">License number</Label>
              <Input
                id="license_number"
                value={form.license_number}
                onChange={(e) => update("license_number", e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="years_of_experience">Years of experience</Label>
              <Input
                id="years_of_experience"
                type="number"
                min="0"
                value={form.years_of_experience}
                onChange={(e) => update("years_of_experience", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hourly_rate">Hourly rate</Label>
              <Input
                id="hourly_rate"
                type="number"
                min="0"
                step="0.01"
                value={form.hourly_rate}
                onChange={(e) => update("hourly_rate", e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Instructor
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
