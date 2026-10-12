import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { BookOpen, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PASS_MARK, TRAFFIC_MODULES, TrafficModule } from "@/lib/trafficRules";

interface ProgressRow {
  module_id: string;
  completed: boolean;
  quiz_score: number | null;
  quiz_total: number | null;
}

const db = supabase as any;

const ModuleQuiz = ({ module, onSubmit }: { module: TrafficModule; onSubmit: (score: number) => Promise<void> }) => {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const allAnswered = module.quiz.every((_, i) => answers[i] !== undefined);

  const submit = async () => {
    const score = module.quiz.reduce((s, q, i) => s + (answers[i] === q.answer ? 1 : 0), 0);
    setResult(score);
    setSaving(true);
    await onSubmit(score);
    setSaving(false);
  };

  return (
    <div className="space-y-4 pt-2">
      <h4 className="font-semibold">Quick quiz</h4>
      {module.quiz.map((q, i) => (
        <div key={i} className="space-y-2">
          <p className="text-sm font-medium">{i + 1}. {q.question}</p>
          <RadioGroup
            value={answers[i]?.toString()}
            onValueChange={(v) => { setAnswers({ ...answers, [i]: Number(v) }); setResult(null); }}
          >
            {q.options.map((opt, j) => {
              const id = `${module.id}-${i}-${j}`;
              const showCorrect = result !== null && j === q.answer;
              const showWrong = result !== null && answers[i] === j && j !== q.answer;
              return (
                <div key={j} className="flex items-center gap-2">
                  <RadioGroupItem value={j.toString()} id={id} />
                  <Label htmlFor={id} className={showCorrect ? "text-primary font-medium" : showWrong ? "text-destructive" : ""}>
                    {opt}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </div>
      ))}
      <div className="flex items-center gap-3">
        <Button size="sm" onClick={submit} disabled={!allAnswered || saving}>
          {saving ? "Saving..." : "Submit answers"}
        </Button>
        {result !== null && (
          <span className="text-sm">
            Score: {result}/{module.quiz.length}{" "}
            {result / module.quiz.length >= PASS_MARK ? "— Passed!" : "— Review the rules and try again."}
          </span>
        )}
      </div>
    </div>
  );
};

const TrafficRulesCard = ({ studentId }: { studentId: string }) => {
  const { toast } = useToast();
  const [progress, setProgress] = useState<Record<string, ProgressRow>>({});

  const load = async () => {
    const { data } = await db
      .from("traffic_rule_progress")
      .select("module_id, completed, quiz_score, quiz_total")
      .eq("student_id", studentId);
    const map: Record<string, ProgressRow> = {};
    (data || []).forEach((r: ProgressRow) => (map[r.module_id] = r));
    setProgress(map);
  };

  useEffect(() => { if (studentId) load(); }, [studentId]);

  const saveScore = async (module: TrafficModule, score: number) => {
    const total = module.quiz.length;
    const passed = score / total >= PASS_MARK;
    const prev = progress[module.id];
    const best = Math.max(score, prev?.quiz_score ?? 0);
    const { error } = await db.from("traffic_rule_progress").upsert(
      {
        student_id: studentId,
        module_id: module.id,
        quiz_score: best,
        quiz_total: total,
        completed: prev?.completed || passed,
        completed_at: passed || prev?.completed ? new Date().toISOString() : null,
      },
      { onConflict: "student_id,module_id" }
    );
    if (error) {
      toast({ title: "Could not save progress", description: error.message, variant: "destructive" });
      return;
    }
    if (passed) toast({ title: "Module completed", description: module.title });
    load();
  };

  const completedCount = TRAFFIC_MODULES.filter((m) => progress[m.id]?.completed).length;
  const pct = Math.round((completedCount / TRAFFIC_MODULES.length) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Traffic Rules
        </CardTitle>
        <CardDescription>
          Learn the basic road rules, then pass each quiz ({Math.round(PASS_MARK * 100)}% or more) to complete the module.
        </CardDescription>
        <div className="space-y-1 pt-2">
          <div className="flex justify-between text-sm">
            <span>{completedCount} of {TRAFFIC_MODULES.length} modules completed</span>
            <span>{pct}%</span>
          </div>
          <Progress value={pct} />
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible>
          {TRAFFIC_MODULES.map((m) => {
            const p = progress[m.id];
            return (
              <AccordionItem key={m.id} value={m.id}>
                <AccordionTrigger>
                  <span className="flex items-center gap-2 text-left">
                    {p?.completed && <CheckCircle className="h-4 w-4 text-primary" />}
                    {m.title}
                    {p?.quiz_score != null && (
                      <Badge variant="secondary">Best: {p.quiz_score}/{p.quiz_total}</Badge>
                    )}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{m.summary}</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {m.points.map((pt, i) => <li key={i}>{pt}</li>)}
                  </ul>
                  <ModuleQuiz module={m} onSubmit={(s) => saveScore(m, s)} />
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default TrafficRulesCard;
