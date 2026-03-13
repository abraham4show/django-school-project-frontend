export interface Teacher {
  id: number;
  user?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  qualification: string;
  employee_id: string;
  date_joined: string;
  is_active: boolean;
  classes: number[];
  class_names: string[];
}

// Add these to your existing types file

export interface Question {
  id?: number;                // optional for new questions
  text: string;
  type: 'mcq' | 'essay' | 'truefalse';
  points: number;
  options?: string[];         // for MCQ
  correct_answer?: string;    // for MCQ and truefalse
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
  subject: number;       // ID
  class_group: number;   // ID
  date: string;
  duration: string;
  questions: Question[];
}



export interface Question {
  id?: number;
  text: string;
  type: 'mcq' | 'essay' | 'truefalse';
  points: number;
  options?: string[];
  correctAnswer?: string; // camelCase
}


export interface ExamFormData {
  title: string;
  subject: number;
  class_group: number;
  date: string;
  duration: string;
  questions: Question[];
  status?: 'draft' | 'published' | 'completed';  // <-- add optional status
}





