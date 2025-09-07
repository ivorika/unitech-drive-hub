import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Instructor {
  id: string;
  first_name: string;
  last_name: string;
  hourly_rate: number;
}

interface QuickLessonBookingProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const QuickLessonBooking = ({ isOpen, onClose, onSuccess }: QuickLessonBookingProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [studentId, setStudentId] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    instructorId: "",
    lessonType: "General Practice",
    time: "",
    duration: "60"
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Get current student's ID
        const { data: studentData } = await supabase
          .from('students')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (studentData) {
          setStudentId(studentData.id);
        }

        // Get available instructors
        const { data: instructorsData } = await supabase
          .from('instructors')
          .select('id, first_name, last_name, hourly_rate')
          .eq('status', 'active');

        if (instructorsData) {
          setInstructors(instructorsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [user, isOpen]);

  // Fetch available time slots when instructor and date change
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!formData.instructorId || !selectedDate) {
        setAvailableSlots([]);
        return;
      }

      try {
        const dayOfWeek = selectedDate.getDay();
        const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');

        // Get instructor's available hours for the selected day
        const { data: availability } = await supabase
          .from('schedule_availability')
          .select('start_time, end_time')
          .eq('instructor_id', formData.instructorId)
          .eq('day_of_week', dayOfWeek)
          .eq('is_available', true);

        // Get already booked lessons for this instructor on this date
        const { data: bookedLessons } = await supabase
          .from('lessons')
          .select('lesson_time')
          .eq('instructor_id', formData.instructorId)
          .eq('lesson_date', selectedDateStr)
          .in('status', ['scheduled', 'confirmed']);

        if (availability && availability.length > 0) {
          // Generate available time slots based on instructor's schedule
          const startTime = availability[0].start_time;
          const endTime = availability[0].end_time;
          const slots = generateTimeSlots(startTime, endTime);
          
          // Filter out booked slots
          const booked = bookedLessons?.map(lesson => lesson.lesson_time) || [];
          const available = slots.filter(slot => !booked.includes(slot));
          
          setAvailableSlots(available);
        } else {
          setAvailableSlots([]);
        }
      } catch (error) {
        console.error('Error fetching available slots:', error);
        setAvailableSlots([]);
      }
    };

    fetchAvailableSlots();
  }, [formData.instructorId, selectedDate]);

  const generateTimeSlots = (startTime: string, endTime: string) => {
    const slots = [];
    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);
    
    while (start < end) {
      slots.push(start.toTimeString().slice(0, 5));
      start.setHours(start.getHours() + 1);
    }
    
    return slots;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!selectedDate || !studentId) {
      toast({
        title: "Missing Information",
        description: "Please select a date and ensure you're logged in as a student.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('lessons')
        .insert({
          student_id: studentId,
          instructor_id: formData.instructorId,
          lesson_date: format(selectedDate, 'yyyy-MM-dd'),
          lesson_time: formData.time,
          lesson_type: formData.lessonType,
          duration_minutes: parseInt(formData.duration),
          status: 'scheduled'
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Lesson Scheduled",
        description: "Your lesson has been scheduled successfully!",
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Scheduling error:', error);
      toast({
        title: "Scheduling Failed",
        description: error.message || "There was an error scheduling your lesson.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quick Lesson Booking</DialogTitle>
          <DialogDescription>
            Schedule a lesson with available instructors
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instructor">Select Instructor *</Label>
              <Select 
                value={formData.instructorId} 
                onValueChange={(value) => handleInputChange('instructorId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose instructor" />
                </SelectTrigger>
                <SelectContent>
                  {instructors.map((instructor) => (
                    <SelectItem key={instructor.id} value={instructor.id}>
                      {instructor.first_name} {instructor.last_name} - K{instructor.hourly_rate}/hr
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lessonType">Lesson Type *</Label>
              <Select 
                value={formData.lessonType} 
                onValueChange={(value) => handleInputChange('lessonType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General Practice">General Practice</SelectItem>
                  <SelectItem value="City Driving">City Driving</SelectItem>
                  <SelectItem value="Highway Driving">Highway Driving</SelectItem>
                  <SelectItem value="Parallel Parking">Parallel Parking</SelectItem>
                  <SelectItem value="Road Test Preparation">Road Test Preparation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Select Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time">Available Time Slots *</Label>
              {!formData.instructorId || !selectedDate ? (
                <p className="text-sm text-muted-foreground">
                  Select instructor and date first
                </p>
              ) : availableSlots.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No available slots for this date
                </p>
              ) : (
                <Select 
                  value={formData.time} 
                  onValueChange={(value) => handleInputChange('time', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration *</Label>
              <Select 
                value={formData.duration} 
                onValueChange={(value) => handleInputChange('duration', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                  <SelectItem value="120">120 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => {
                onClose();
                window.location.href = '/schedule-lesson';
              }}
            >
              More Options
            </Button>
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={isSubmitting || !selectedDate || !formData.instructorId || !formData.time || availableSlots.length === 0}
            >
              {isSubmitting ? "Booking..." : "Book Lesson"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuickLessonBooking;