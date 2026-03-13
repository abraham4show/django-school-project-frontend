import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, Eye, FileQuestion, Search, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useExams, useCreateExam, useUpdateExam, useDeleteExam } from "@/hooks/useExams";
import { useSubjects } from "@/hooks/useSubjects";        // create this hook if not exists
import { useClasses } from "@/hooks/useClasses";          // adjust path
import { Exam, Question } from "@/types";
import { toast } from "sonner";

type QuestionType = "mcq" | "essay" | "truefalse";

// Helper to map backend question to frontend question (if needed)
const mapBackendQuestion = (q: any): Question => ({
  id: q.id,
  text: q.text,
  type: q.type,
  points: q.points,
  options: q.options,
  correctAnswer: q.correct_answer,
});

// Helper to map frontend question to backend format
const mapFrontendQuestion = (q: Question): any => ({
  id: q.id,                      // include id for updates
  text: q.text,
  type: q.type,
  points: q.points,
  options: q.type === "mcq" ? q.options : undefined,
  correct_answer: q.type !== "essay" ? q.correctAnswer : "",
});

const statusStyles: Record<string, string> = {
  draft: "bg-warning/10 text-warning",
  published: "bg-success/10 text-success",
  completed: "bg-muted text-muted-foreground",
};

const typeLabels: Record<QuestionType, string> = {
  mcq: "Multiple Choice",
  essay: "Essay",
  truefalse: "True / False",
};

export default function Exams() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [previewExam, setPreviewExam] = useState<Exam | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    class_group: "",
    date: "",
    duration: "",
  });
  const [questions, setQuestions] = useState<Question[]>([]);

  // Fetch real data
  const { data: exams, isLoading, error, refetch } = useExams({
    status: statusFilter !== "all" ? statusFilter : undefined,
  });
  const { data: subjects, isLoading: subjectsLoading } = useSubjects();
  const { data: classes, isLoading: classesLoading } = useClasses();
  const subjectList = Array.isArray(subjects) ? subjects : [];

  const createExam = useCreateExam();
  const updateExam = useUpdateExam();
  const deleteExam = useDeleteExam();

  // Filter exams by search (client-side after fetch)
  // Ensure exams is an array
const examsArray = Array.isArray(exams) ? exams : [];
const filtered = examsArray.filter((exam) => {
  const matchSearch = exam.title.toLowerCase().includes(search.toLowerCase()) ||
                      exam.subject_name?.toLowerCase().includes(search.toLowerCase());
  return matchSearch;
});

  const openAdd = () => {
    setEditingExam(null);
    setFormData({ title: "", subject: "", class_group: "", date: "", duration: "" });
    setQuestions([]);
    setDialogOpen(true);
  };

  const openEdit = (exam: Exam) => {
    setEditingExam(exam);
    setFormData({
      title: exam.title,
      subject: exam.subject.toString(),
      class_group: exam.class_group.toString(),
      date: exam.date,
      duration: exam.duration,
    });
    setQuestions(exam.questions.map(mapBackendQuestion));
    setDialogOpen(true);
  };

  const addQuestion = (type: QuestionType) => {
    const newQ: Question = {
      id: Date.now(), // temporary id; backend will replace
      text: "",
      type,
      points: 5,
      ...(type === "mcq" ? { options: ["", "", "", ""], correctAnswer: "" } : {}),
      ...(type === "truefalse" ? { correctAnswer: "True" } : {}),
    };
    setQuestions((prev) => [...prev, newQ]);
  };

  const updateQuestion = (id: number, updates: Partial<Question>) => {
    setQuestions((prev) => prev.map((q) => q.id === id ? { ...q, ...updates } : q));
  };

  const updateOption = (qId: number, optIndex: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? { ...q, options: q.options?.map((o, i) => (i === optIndex ? value : o)) }
          : q
      )
    );
  };

  const removeQuestion = (id: number) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleSave = () => {
    if (!formData.title || !formData.subject || !formData.class_group || !formData.date || !formData.duration) {
      toast.error("Please fill all required fields");
      return;
    }

    const payload = {
      title: formData.title,
      subject: parseInt(formData.subject),
      class_group: parseInt(formData.class_group),
      date: formData.date,
      duration: formData.duration,
      questions: questions.map(mapFrontendQuestion),
    };

    if (editingExam) {
      updateExam.mutate(
        { id: editingExam.id, data: payload },
        {
          onSuccess: () => {
            setDialogOpen(false);
            refetch();
          },
        }
      );
    } else {
      createExam.mutate(payload, {
        onSuccess: () => {
          setDialogOpen(false);
          refetch();
        },
      });
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this exam?")) {
      deleteExam.mutate(id, {
        onSuccess: () => refetch(),
      });
    }
  };

  const togglePublish = (exam: Exam) => {
    const newStatus = exam.status === "draft" ? "published" : "draft";
    updateExam.mutate(
      { id: exam.id, data: { status: newStatus } },
      { onSuccess: () => refetch() }
    );
  };

  if (isLoading || subjectsLoading || classesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        Error loading exams: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Exam Management</h1>
          <p className="text-muted-foreground">{filtered.length} exams found</p>
        </div>
        <Button onClick={openAdd} className="gradient-primary text-primary-foreground border-0 hover:opacity-90">
          <Plus className="mr-2 h-4 w-4" /> Create Exam
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search exams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-card">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Exam List */}
      <div className="space-y-4">
        {filtered.map((exam, i) => (
          <motion.div
            key={exam.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl bg-card p-5 shadow-card hover:shadow-card-hover transition-shadow duration-300"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-xl gradient-accent">
                  <FileQuestion className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground">{exam.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {exam.subject_name} · Class {exam.class_name} · {exam.date} · {exam.duration}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-medium text-card-foreground">{exam.total_marks} marks</span>
                <span className="text-sm text-muted-foreground">{exam.questions?.length || 0} questions</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusStyles[exam.status]}`}>
                  {exam.status}
                </span>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => openEdit(exam)}>
                <Edit className="mr-1 h-3.5 w-3.5" /> Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPreviewExam(exam)}>
                <Eye className="mr-1 h-3.5 w-3.5" /> Preview
              </Button>
              <Button variant="outline" size="sm" onClick={() => togglePublish(exam)}>
                <CheckCircle className="mr-1 h-3.5 w-3.5" />
                {exam.status === "published" ? "Unpublish" : "Publish"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => handleDelete(exam.id)}
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
              </Button>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-xl bg-card p-12 text-center shadow-card">
            <FileQuestion className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No exams found. Create your first exam!</p>
          </div>
        )}
      </div>

      {/* Create/Edit Exam Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingExam ? "Edit Exam" : "Create New Exam"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-2">
            {/* Exam Details */}
            <div className="space-y-4">
              <div>
                <Label>Exam Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Mid-Term Mathematics"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Subject *</Label>
                  <Select
                    value={formData.subject}
                    onValueChange={(v) => setFormData({ ...formData, subject: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjectList?.map((sub: any) => (
                        <SelectItem key={sub.id} value={sub.id.toString()}>
                          {sub.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Class *</Label>
                  <Select
                    value={formData.class_group}
                    onValueChange={(v) => setFormData({ ...formData, class_group: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes?.map((cls: any) => (
                        <SelectItem key={cls.id} value={cls.id.toString()}>
                          {cls.name} ({cls.section})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date *</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Duration *</Label>
                  <Input
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g. 90 min"
                  />
                </div>
              </div>
            </div>

            {/* Questions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base">Questions ({questions.length})</Label>
                <span className="text-sm text-muted-foreground">
                  Total: {questions.reduce((s, q) => s + q.points, 0)} marks
                </span>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {questions.map((q, idx) => (
                    <motion.div
                      key={q.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="rounded-lg border border-border p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-medium text-muted-foreground uppercase">
                          {idx + 1}. {typeLabels[q.type]}
                        </span>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={q.points}
                            onChange={(e) => updateQuestion(q.id, { points: parseInt(e.target.value) || 0 })}
                            className="w-20 h-7 text-xs"
                            placeholder="Points"
                          />
                          <span className="text-xs text-muted-foreground">pts</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-destructive"
                            onClick={() => removeQuestion(q.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <Textarea
                        value={q.text}
                        onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                        placeholder="Enter your question..."
                        className="min-h-[60px]"
                      />
                      {q.type === "mcq" && (
                        <div className="space-y-2">
                          {q.options?.map((opt, oi) => (
                            <div key={oi} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`correct-${q.id}`}
                                checked={q.correctAnswer === opt && opt !== ""}
                                onChange={() => updateQuestion(q.id, { correctAnswer: opt })}
                                className="accent-primary"
                              />
                              <Input
                                value={opt}
                                onChange={(e) => updateOption(q.id, oi, e.target.value)}
                                placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                                className="h-8 text-sm"
                              />
                            </div>
                          ))}
                          <p className="text-xs text-muted-foreground">
                            Select the radio button next to the correct answer
                          </p>
                        </div>
                      )}
                      {q.type === "truefalse" && (
                        <Select
                          value={q.correctAnswer}
                          onValueChange={(v) => updateQuestion(q.id, { correctAnswer: v })}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="True">True</SelectItem>
                            <SelectItem value="False">False</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Add question buttons */}
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => addQuestion("mcq")}>
                  <Plus className="mr-1 h-3.5 w-3.5" /> Multiple Choice
                </Button>
                <Button variant="outline" size="sm" onClick={() => addQuestion("essay")}>
                  <Plus className="mr-1 h-3.5 w-3.5" /> Essay
                </Button>
                <Button variant="outline" size="sm" onClick={() => addQuestion("truefalse")}>
                  <Plus className="mr-1 h-3.5 w-3.5" /> True/False
                </Button>
              </div>
            </div>

            <Button
              className="w-full gradient-primary text-primary-foreground border-0 hover:opacity-90"
              onClick={handleSave}
              disabled={createExam.isPending || updateExam.isPending}
            >
              {(createExam.isPending || updateExam.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editingExam ? "Update Exam" : "Create Exam"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewExam} onOpenChange={() => setPreviewExam(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewExam?.title}</DialogTitle>
          </DialogHeader>
          {previewExam && (
            <div className="space-y-4 pt-2">
              <div className="rounded-lg border border-border p-4 bg-muted/30">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">Subject:</span>{" "}
                    <span className="font-medium text-foreground">{previewExam.subject_name}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Class:</span>{" "}
                    <span className="font-medium text-foreground">{previewExam.class_name}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Duration:</span>{" "}
                    <span className="font-medium text-foreground">{previewExam.duration}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Total Marks:</span>{" "}
                    <span className="font-medium text-foreground">{previewExam.total_marks}</span>
                  </p>
                </div>
              </div>
              {previewExam.questions?.map((q, i) => (
                <div key={q.id} className="rounded-lg border border-border p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-card-foreground">
                      Q{i + 1}. {q.text}
                    </p>
                    <span className="shrink-0 text-xs text-muted-foreground">{q.points} pts</span>
                  </div>
                  {q.type === "mcq" && (
                    <div className="space-y-1 ml-4">
                      {q.options?.map((opt, oi) => (
                        <p
                          key={oi}
                          className={`text-sm ${
                            opt === q.correctAnswer
                              ? "font-semibold text-success"
                              : "text-muted-foreground"
                          }`}
                        >
                          {String.fromCharCode(65 + oi)}. {opt} {opt === q.correctAnswer && " ✓"}
                        </p>
                      ))}
                    </div>
                  )}
                  {q.type === "truefalse" && (
                    <p className="ml-4 text-sm text-success font-medium">Answer: {q.correctAnswer}</p>
                  )}
                  {q.type === "essay" && (
                    <p className="ml-4 text-sm text-muted-foreground italic">Essay answer expected</p>
                  )}
                </div>
              ))}
              {previewExam.questions?.length === 0 && (
                <p className="text-center text-muted-foreground py-6">No questions added yet.</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}