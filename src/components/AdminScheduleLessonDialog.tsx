import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CalendarPlus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Busy,
  DAY_NAMES,
  SESSION_MINUTES,
  buildSessionSlots,
  formatSessionRange,
  formatTimeLabel,
  toMinutes,
} from "@/lib/scheduling";

interface Person {
  id: string;
  first_name: string;
  last_name: string;
}

interface AdminScheduleLessonDialogProps {
  students: Person[];
  instructors: Person[];
  onScheduled: () => void;
}

const LESSON_TYPES = [
  "General Practice",
  "City Driving",
  "Highway Driving",
  "Parallel Parking",
  "Road Test Preparation",
];

const FALLBACK_WINDOW = { start: "08:00", end: "18:00" };


const AdminScheduleLessonDialog = ({
  students,
  instructors,
  onScheduled,
}: AdminScheduleLessonDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [instructorId, setInstructorId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [lessonType, setLessonType] = useState(LESSON_TYPES[0]);
  const [availability, setAvailability] = useState<
    { day_of_week: number; start_time: string; end_time: string; notes: string | null }[]
  >([]);
  const [dayLessons, setDayLessons] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const dayOfWeek = useMemo(
    () => (date ? new Date(`${date}T00:00:00`).getDay() : null),
    [date],
  );

  // Student's declared free windows
  useEffect(() => {
    const load = async () => {
      if (!studentId) {
        setAvailability([]);
        return;
      }
      const { data } = await supabase
        .from("student_availability")
        .select("day_of_week, start_time, end_time, notes")
        .eq("student_id", studentId)
        .order("start_time", { ascending: true });
      setAvailability(data ?? []);
    };
    load();
  }, [studentId]);

  // Everything already booked on the chosen date
  useEffect(() => {
    const load = async () => {
      if (!date) {
        setDayLessons([]);
        return;
      }
      setLoadingSlots(true);
      const { data } = await supabase
        .from("lessons")
        .select("id, student_id, instructor_id, lesson_time, duration_minutes, status")
        .eq("lesson_date", date)
        .neq("status", "cancelled");
      setDayLessons(data ?? []);
      setLoadingSlots(false);
    };
    load();
  }, [date]);

  const declaredWindows = useMemo(
    () => (dayOfWeek === null ? [] : availability.filter((a) => a.day_of_week === dayOfWeek)),
    [availability, dayOfWeek],
  );

  // If the student has not declared any free time for this day, fall back to
  // standard working hours so the admin is never blocked from booking.
  const usingFallback = declaredWindows.length === 0;
  const dayWindows = useMemo(
    () =>
      usingFallback
        ? [{ start_time: FALLBACK_WINDOW.start, end_time: FALLBACK_WINDOW.end }]
        : declaredWindows,
    [declaredWindows, usingFallback],
  );


  const busy: Busy[] = useMemo(
    () =>
      dayLessons
        .filter(
          (lesson) =>
            lesson.student_id === studentId || lesson.instructor_id === instructorId,
        )
        .map((lesson) => {
          const start = toMinutes(lesson.lesson_time);
          return { start, end: start + (lesson.duration_minutes || SESSION_MINUTES) };
        }),
    [dayLessons, studentId, instructorId],
  );

  const slots = useMemo(() => buildSessionSlots(dayWindows, busy), [dayWindows, busy]);

  useEffect(() => {
    if (time && !slots.includes(time)) setTime("");
  }, [slots, time]);

  const reset = () => {
    setStudentId("");
    setInstructorId("");
    setDate("");
    setTime("");
    setLessonType(LESSON_TYPES[0]);
  };

  const handleSchedule = async () => {
    if (!studentId || !instructorId || !date || !time) return;
    setSubmitting(true);

    // Re-check for clashes right before writing
    const { data: fresh } = await supabase
      .from("lessons")
      .select("student_id, instructor_id, lesson_time, duration_minutes")
      .eq("lesson_date", date)
      .neq("status", "cancelled");

    const start = toMinutes(time);
    const end = start + SESSION_MINUTES;
    const clash = (fresh ?? []).some((lesson) => {
      if (lesson.student_id !== studentId && lesson.instructor_id !== instructorId) return false;
      const bStart = toMinutes(lesson.lesson_time);
      const bEnd = bStart + (lesson.duration_minutes || SESSION_MINUTES);
      return start < bEnd && bStart < end;
    });

    if (clash) {
      setSubmitting(false);
      setDayLessons(fresh ?? []);
      toast({
        title: "Time no longer free",
        description: "That slot was just taken. Please pick another one.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("lessons").insert({
      student_id: studentId,
      instructor_id: instructorId,
      lesson_date: date,
      lesson_time: time,
      duration_minutes: SESSION_MINUTES,
      lesson_type: lessonType,
      status: "scheduled",
    });
    setSubmitting(false);

    if (error) {
      console.error("Admin scheduling error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({
      title: "Session scheduled",
      description: `${formatSessionRange(time)} on ${new Date(`${date}T00:00:00`).toLocaleDateString()}`,
    });
    reset();
    setOpen(false);
    onScheduled();
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <CalendarPlus className="h-4 w-4 mr-2" />
          Schedule Session
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule a Session</DialogTitle>
          <DialogDescription>
            Book a {SESSION_MINUTES / 60}-hour session for a student with an instructor. Only slots
            inside the student's free times that clash with nobody are offered.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Student *</Label>
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.first_name} {student.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Instructor *</Label>
              <Select value={instructorId} onValueChange={setInstructorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select instructor" />
                </SelectTrigger>
                <SelectContent>
                  {instructors.map((instructor) => (
                    <SelectItem key={instructor.id} value={instructor.id}>
                      {instructor.first_name} {instructor.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="session-date">Date *</Label>
              <Input
                id="session-date"
                type="date"
                min={today}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Lesson Type *</Label>
              <Select value={lessonType} onValueChange={setLessonType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LESSON_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {studentId && (
            <div className="rounded-lg border p-3 space-y-2">
              <p className="text-sm font-medium">Student's free times</p>
              {availability.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  This student has not indicated any free times yet — standard hours (
                  {formatTimeLabel(FALLBACK_WINDOW.start)}–{formatTimeLabel(FALLBACK_WINDOW.end)}) are
                  offered instead.
                </p>
              ) : (

                <div className="flex flex-wrap gap-2">
                  {availability.map((window, index) => (
                    <Badge
                      key={index}
                      variant={window.day_of_week === dayOfWeek ? "default" : "outline"}
                    >
                      {DAY_NAMES[window.day_of_week].slice(0, 3)} {formatTimeLabel(window.start_time)}–
                      {formatTimeLabel(window.end_time)}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>Available Session Times *</Label>
            {!studentId || !instructorId || !date ? (
              <p className="text-sm text-muted-foreground">
                Select a student, instructor and date to see open slots.
              </p>
            ) : loadingSlots ? (
              <p className="text-sm text-muted-foreground">Checking the schedule...</p>
            ) : slots.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No free {SESSION_MINUTES / 60}-hour slot on this date — every window is already taken
                for the student or the instructor.
              </p>

            ) : (
              <div className="flex flex-wrap gap-2">
                {slots.map((slot) => (
                  <Button
                    key={slot}
                    type="button"
                    size="sm"
                    variant={time === slot ? "default" : "outline"}
                    onClick={() => setTime(slot)}
                  >
                    {formatSessionRange(slot)}
                  </Button>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSchedule}
              disabled={submitting || !studentId || !instructorId || !date || !time}
            >
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Schedule Session
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminScheduleLessonDialog;
