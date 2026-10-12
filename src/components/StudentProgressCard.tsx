import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TRAFFIC_MODULES } from "@/lib/trafficRules";

interface StudentLite {
  id: string;
  first_name: string;
  last_name: string;
}

interface Props {
  students: StudentLite[];
  /** When set, only lessons with this instructor are counted */
  instructorId?: string;
  title?: string;
}

interface Row {
  lessonsDone: number;
  lessonsTotal: number;
  lastRating: string | null;
  roadTestReady: boolean;
  modulesDone: number;
  quizPct: number | null;
}

const db = supabase as any;

const StudentProgressCard = ({ students, instructorId, title = "Student Progress" }: Props) => {
  const [rows, setRows] = useState<Record<string, Row>>({});
  const [loading, setLoading] = useState(true);
  const ids = students.map((s) => s.id).sort().join(",");

  useEffect(() => {
    const load = async () => {
      if (!students.length) { setRows({}); setLoading(false); return; }
      setLoading(true);
      const studentIds = students.map((s) => s.id);

      let lq = db.from("lessons").select("student_id, status").in("student_id", studentIds);
      if (instructorId) lq = lq.eq("instructor_id", instructorId);
      let fq = db
        .from("lesson_feedback")
        .select("student_id, performance_rating, ready_for_road_test, created_at")
        .in("student_id", studentIds)
        .order("created_at", { ascending: false });
      if (instructorId) fq = fq.eq("instructor_id", instructorId);

      const [{ data: lessons }, { data: feedback }, { data: traffic }] = await Promise.all([
        lq,
        fq,
        db.from("traffic_rule_progress").select("student_id, completed, quiz_score, quiz_total").in("student_id", studentIds),
      ]);

      const result: Record<string, Row> = {};
      studentIds.forEach((id) => {
        const ls = (lessons || []).filter((l: any) => l.student_id === id && l.status !== "cancelled");
        const fb = (feedback || []).filter((f: any) => f.student_id === id);
        const tr = (traffic || []).filter((t: any) => t.student_id === id);
        const scored = tr.filter((t: any) => t.quiz_total);
        const totalScore = scored.reduce((s: number, t: any) => s + t.quiz_score, 0);
        const totalMax = scored.reduce((s: number, t: any) => s + t.quiz_total, 0);
        result[id] = {
          lessonsDone: ls.filter((l: any) => l.status === "completed").length,
          lessonsTotal: ls.length,
          lastRating: fb[0]?.performance_rating ?? null,
          roadTestReady: fb.some((f: any) => f.ready_for_road_test),
          modulesDone: tr.filter((t: any) => t.completed).length,
          quizPct: totalMax ? Math.round((totalScore / totalMax) * 100) : null,
        };
      });
      setRows(result);
      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids, instructorId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>Driving lessons and traffic rules progress for each student.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading progress...</p>
        ) : students.length === 0 ? (
          <p className="text-sm text-muted-foreground">No students to show yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead className="min-w-[160px]">Driving lessons</TableHead>
                  <TableHead>Last rating</TableHead>
                  <TableHead className="min-w-[160px]">Traffic rules</TableHead>
                  <TableHead>Quiz avg</TableHead>
                  <TableHead>Road test</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((s) => {
                  const r = rows[s.id];
                  if (!r) return null;
                  const lessonPct = r.lessonsTotal ? Math.round((r.lessonsDone / r.lessonsTotal) * 100) : 0;
                  const rulesPct = Math.round((r.modulesDone / TRAFFIC_MODULES.length) * 100);
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.first_name} {s.last_name}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <span className="text-xs">{r.lessonsDone}/{r.lessonsTotal} completed</span>
                          <Progress value={lessonPct} />
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{r.lastRating || "—"}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <span className="text-xs">{r.modulesDone}/{TRAFFIC_MODULES.length} modules</span>
                          <Progress value={rulesPct} />
                        </div>
                      </TableCell>
                      <TableCell>{r.quizPct != null ? `${r.quizPct}%` : "—"}</TableCell>
                      <TableCell>
                        {r.roadTestReady ? <Badge>Ready</Badge> : <Badge variant="secondary">Not yet</Badge>}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentProgressCard;
