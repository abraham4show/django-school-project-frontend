import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { examService } from '@/services/examService';
import { useStartExam, useSubmitExam } from '@/hooks/useExamAttempt';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Helper to parse duration string like "90 min" to minutes
function parseDuration(durationStr: string): number {
  const match = durationStr.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

export default function TakeExam() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();

  // Fetch exam details
  const { data: exam, isLoading: examLoading } = useQuery({
    queryKey: ['exam', examId],
    queryFn: () => examService.getOne(Number(examId)),
    enabled: !!examId,
  });

  const startExam = useStartExam();
  const submitExam = useSubmitExam();

  useEffect(() => {
    if (examId && !attemptId && exam) {
      startExam.mutate(Number(examId), {
        onSuccess: (data) => {
          setAttemptId(data.id);
          // Calculate end time based on started_at and exam duration
          const startedAt = new Date(data.started_at).getTime();
          const durationMinutes = parseDuration(exam.duration);
          const endTime = startedAt + durationMinutes * 60000;
          const remaining = Math.max(0, endTime - Date.now());
          setTimeRemaining(remaining);
        },
        onError: (error: any) => {
          if (error.response?.data?.error === 'You have already taken this exam.') {
            toast.error('You have already completed this exam.');
            navigate('/student-dashboard');
          } else {
            toast.error('Failed to start exam');
          }
        },
      });
    }
  }, [examId, exam]);

  // Timer effect
  useEffect(() => {
    if (timeRemaining === null) return;
    if (timeRemaining <= 0) {
      // Auto-submit when time expires
      handleSubmit(true);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 0) {
          clearInterval(timerRef.current);
          return 0;
        }
        const newRemaining = prev - 1000;
        if (newRemaining <= 0) {
          handleSubmit(true);
        }
        return newRemaining;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timeRemaining]);

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = (auto = false) => {
    if (isSubmitting) return;
    if (!attemptId) {
      toast.error('No active exam attempt');
      return;
    }
    setIsSubmitting(true);
    const formattedAnswers = Object.entries(answers).map(([qId, value]) => ({
      question: Number(qId),
      answer_text: value,
    }));
    submitExam.mutate(
      { attemptId, answers: formattedAnswers },
      {
        onSuccess: () => {
          toast.success(auto ? 'Time expired! Exam submitted.' : 'Exam submitted successfully!');
          navigate('/student-dashboard');
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.error || 'Failed to submit exam');
          setIsSubmitting(false);
        },
      }
    );
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (examLoading || startExam.isPending) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!exam) {
    return <div>Exam not found</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{exam.title}</h1>
        {timeRemaining !== null && (
          <div className="text-lg font-mono bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded">
            Time left: {formatTime(timeRemaining)}
          </div>
        )}
      </div>
      <p className="text-muted-foreground">
        {exam.subject_name} · {exam.duration} · Total Marks: {exam.total_marks}
      </p>

      <div className="space-y-6">
        {exam.questions?.map((q: any, idx: number) => (
          <div key={q.id} className="border p-4 rounded-lg space-y-3">
            <p className="font-medium">
              {idx + 1}. {q.text} <span className="text-sm text-muted-foreground">({q.points} pts)</span>
            </p>
            {q.type === 'mcq' && (
              <RadioGroup
                value={answers[q.id] || ''}
                onValueChange={(v) => handleAnswerChange(q.id, v)}
              >
                {q.options?.map((opt: string, i: number) => (
                  <div key={i} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt} id={`q${q.id}-opt${i}`} />
                    <Label htmlFor={`q${q.id}-opt${i}`}>{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}
            {q.type === 'truefalse' && (
              <RadioGroup
                value={answers[q.id] || ''}
                onValueChange={(v) => handleAnswerChange(q.id, v)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="True" id={`q${q.id}-true`} />
                  <Label htmlFor={`q${q.id}-true`}>True</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="False" id={`q${q.id}-false`} />
                  <Label htmlFor={`q${q.id}-false`}>False</Label>
                </div>
              </RadioGroup>
            )}
            {q.type === 'essay' && (
              <Textarea
                value={answers[q.id] || ''}
                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                placeholder="Write your answer here..."
              />
            )}
          </div>
        ))}
      </div>

      <Button
        onClick={() => handleSubmit(false)}
        disabled={submitExam.isPending || isSubmitting || timeRemaining === 0}
        className="w-full gradient-primary"
      >
        {submitExam.isPending ? 'Submitting...' : 'Submit Exam'}
      </Button>
    </div>
  );
}