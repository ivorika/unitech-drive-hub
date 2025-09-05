import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Instructor {
  id: string;
  first_name: string;
  last_name: string;
  specializations: string[];
  hourly_rate: number;
}

const ScheduleLesson = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [studentId, setStudentId] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    instructorId: "",
    lessonType: "",
    time: "",
    duration: "60",
    notes: ""
  });

  const lessonTypes = [
    "Initial Assessment",
    "City Driving",
    "Highway Driving", 
    "Parallel Parking",
    "Three-Point Turn",
    "Defensive Driving",
    "Road Test Preparation",
    "General Practice"
  ];

  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", 
    "13:00", "14:00", "15:00", "16:00", "17:00"
  ];

  // Fetch available time slots when instructor and date change
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!formData.instructorId || !selectedDate) {
        setAvailableSlots([]);
        setBookedSlots([]);
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
          .select('lesson_time, duration_minutes')
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
          setBookedSlots(booked);
        } else {
          setAvailableSlots([]);
          setBookedSlots([]);
        }
      } catch (error) {
        console.error('Error fetching available slots:', error);
        setAvailableSlots([]);
        setBookedSlots([]);
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
          .select('id, first_name, last_name, specializations, hourly_rate')
          .eq('status', 'active');

        if (instructorsData) {
          setInstructors(instructorsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load scheduling data. Please try again.",
          variant: "destructive"
        });
      }
    };

    fetchData();
  }, [user]);

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
          notes: formData.notes,
          status: 'scheduled'
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Lesson Scheduled",
        description: "Your lesson has been scheduled successfully. You'll receive a confirmation shortly.",
      });

      navigate('/student-dashboard');
    } catch (error: any) {
      console.error('Scheduling error:', error);
      toast({
        title: "Scheduling Failed",
        description: error.message || "There was an error scheduling your lesson. Please try again.",
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
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Schedule a Lesson</h1>
            <p className="text-muted-foreground">
              Book your next driving lesson with one of our certified instructors
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Instructor Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Instructor & Lesson Details
                </CardTitle>
                <CardDescription>
                  Choose your preferred instructor and lesson type
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="instructor">Select Instructor *</Label>
                  <Select 
                    value={formData.instructorId} 
                    onValueChange={(value) => handleInputChange('instructorId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an instructor" />
                    </SelectTrigger>
                    <SelectContent>
                      {instructors.map((instructor) => (
                        <SelectItem key={instructor.id} value={instructor.id}>
                          {instructor.first_name} {instructor.last_name} - ${instructor.hourly_rate}/hr
                          {instructor.specializations && instructor.specializations.length > 0 && (
                            <span className="text-sm text-muted-foreground ml-2">
                              ({instructor.specializations.join(', ')})
                            </span>
                          )}
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
                      <SelectValue placeholder="Select lesson type" />
                    </SelectTrigger>
                    <SelectContent>
                      {lessonTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes) *</Label>
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

                  <div className="space-y-2">
                    <Label htmlFor="time">Available Time Slots *</Label>
                    {!formData.instructorId || !selectedDate ? (
                      <p className="text-sm text-muted-foreground">
                        Please select an instructor and date first
                      </p>
                    ) : availableSlots.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No available time slots for this instructor on the selected date
                      </p>
                    ) : (
                      <Select 
                        value={formData.time} 
                        onValueChange={(value) => handleInputChange('time', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select available time" />
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
                    {bookedSlots.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Unavailable times: {bookedSlots.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Date Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
                <CardDescription>
                  Choose your preferred lesson date
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Lesson Date *</Label>
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
              </CardContent>
            </Card>

            {/* Additional Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
                <CardDescription>
                  Any specific requests or notes for your instructor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Any specific areas you'd like to focus on, concerns, or special requests..."
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate('/student-dashboard')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={isSubmitting || !selectedDate || !formData.instructorId || !formData.lessonType || !formData.time || availableSlots.length === 0}
              >
                {isSubmitting ? "Scheduling..." : "Schedule Lesson"}
              </Button>
            </div>
          </form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ScheduleLesson;