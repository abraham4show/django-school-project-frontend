export interface Question {
  id?: number;           // optional for new questions
  text: string;
  type: 'mcq' | 'essay' | 'truefalse';
  points: number;
  options?: string[];    // for MCQ
  correct_answer?: string; // for MCQ and truefalse
}

export interface Exam {
  id: number;
  title: string;
  subject: number;
  subject_name: string;
  class_group: number;
  class_name: string;
  date: string;
  duration: string;
  total_marks: number;
  status: 'draft' | 'published' | 'completed';
  questions: Question[];
  created_at: string;
  updated_at: string;
}

export interface ExamFormData {
  title: string;
  subject: number;
  class_group: number;
  date: string;
  duration: string;
  questions: Question[];
}