import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarClock, Loader2, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DAY_NAMES, SESSION_MINUTES, formatTimeLabel, toMinutes } from "@/lib/scheduling";

interface AvailabilityRow {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  notes: string | null;
}

interface StudentAvailabilityCardProps {
  studentId: string;
}

const StudentAvailabilityCard = ({ studentId }: StudentAvailabilityCardProps) => {
  const { toast } = useToast();
  const [slots, setSlots] = useState<AvailabilityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [day, setDay] = useState("1");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("13:00");
  const [notes, setNotes] = useState("");

  const fetchSlots = async () => {
    const { data, error } = await supabase
      .from("student_availability")
      .select("id, day_of_week, start_time, end_time, notes")
      .eq("student_id", studentId)
      .order("day_of_week", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      console.error("Error loading availability:", error);
    } else {
      setSlots(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    fetchSlots();
  }, [studentId]);

  const handleAdd = async () => {
    const start = toMinutes(startTime);
    const end = toMinutes(endTime);

    if (end - start < SESSION_MINUTES) {
      toast({
        title: "Window too short",
        description: `Sessions are ${SESSION_MINUTES / 60} hours long, so pick a window of at least ${SESSION_MINUTES / 60} hours.`,
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("student_availability").insert({
      student_id: studentId,
      day_of_week: parseInt(day, 10),
      start_time: startTime,
      end_time: endTime,
      notes: notes.trim() || null,
    });
    setSaving(false);

    if (error) {
      console.error("Error saving availability:", error);
      toast({ title: "Error", description: "Could not save your free time.", variant: "destructive" });
      return;
    }

    setNotes("");
    toast({ title: "Free time added", description: "The admin can now schedule you in this window." });
    fetchSlots();
  };

  const handleRemove = async (id: string) => {
    setRemovingId(id);
    const { error } = await supabase.from("student_availability").delete().eq("id", id);
    setRemovingId(null);

    if (error) {
      toast({ title: "Error", description: "Could not remove this free time.", variant: "destructive" });
      return;
    }
    setSlots((prev) => prev.filter((slot) => slot.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5" />
          My Free Times
        </CardTitle>
        <CardDescription>
          Tell us when you are free each week. The admin books your {SESSION_MINUTES / 60}-hour
          sessions inside these windows so they never clash with other students.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="space-y-2">
            <Label>Day</Label>
            <Select value={day} onValueChange={setDay}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAY_NAMES.map((name, index) => (
                  <SelectItem key={name} value={String(index)}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="availability-start">From</Label>
            <Input
              id="availability-start"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="availability-end">To</Label>
            <Input
              id="availability-end"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="availability-notes">Note (optional)</Label>
            <Input
              id="availability-notes"
              placeholder="e.g. after classes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <Button onClick={handleAdd} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
          Add Free Time
        </Button>

        <div className="space-y-3">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading your free times...</p>
          ) : slots.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No free times added yet. Add at least one window so you can be scheduled.
            </p>
          ) : (
            slots.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{DAY_NAMES[slot.day_of_week]}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatTimeLabel(slot.start_time)} – {formatTimeLabel(slot.end_time)}
                  </p>
                  {slot.notes && <Badge variant="outline" className="mt-2 text-xs">{slot.notes}</Badge>}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(slot.id)}
                  disabled={removingId === slot.id}
                >
                  {removingId === slot.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentAvailabilityCard;
