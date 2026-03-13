import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Edit, Trash2, Phone, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStudents, useClasses } from "@/hooks/useStudents";
import { StudentDisplay, StudentFormData } from "@/services/studentService";
import { toast } from "sonner";

const gradientAvatars = [
  "bg-gradient-to-r from-purple-500 to-pink-500",
  "bg-gradient-to-r from-blue-500 to-cyan-500",
  "bg-gradient-to-r from-green-500 to-emerald-500",
  "bg-gradient-to-r from-orange-500 to-red-500",
];

export default function Students() {
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentDisplay | null>(null);
  
  // Form state with proper typing - FIXED: changed student_class to current_class
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    date_of_birth: "",
    current_class: "", // Changed from student_class to current_class
    enrollment_date: "",
    parent_name: "",
    parent_phone: "",
    address: "",
    status: "active" as "active" | "inactive" | "graduated",
  });

  // Get students data with filters
  const { 
    students, 
    isLoading, 
    deleteStudent, 
    createStudent, 
    updateStudent,
    isDeleting,
    isCreating,
    isUpdating 
  } = useStudents({
    search: search || undefined,
    current_class: filterClass !== "all" ? parseInt(filterClass) : undefined,
  });

  // Get classes for dropdown
  const { data: classes, isLoading: classesLoading } = useClasses();

  // Reset form when dialog closes
  useEffect(() => {
    if (!dialogOpen) {
      setEditingStudent(null);
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        date_of_birth: "",
        current_class: "", // Changed from student_class to current_class
        enrollment_date: "",
        parent_name: "",
        parent_phone: "",
        address: "",
        status: "active",
      });
    }
  }, [dialogOpen]);

  const openAdd = () => {
    setEditingStudent(null);
    setDialogOpen(true);
  };

  const openEdit = (student: StudentDisplay) => {
    setEditingStudent(student);
    
    const nameParts = student.name.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";
    
    // Extract class number (remove "Class " prefix)
    const classNumber = student.class.replace("Class ", "");
    
    setFormData({
      first_name: firstName,
      last_name: lastName,
      email: student.email,
      date_of_birth: "",
      current_class: classNumber, // FIXED: changed from 'number' to classNumber
      enrollment_date: "",
      parent_name: "",
      parent_phone: student.parentContact === "No contact" ? "" : student.parentContact,
      address: "",
      status: student.status, // This works because 'active'|'inactive' is compatible
    });
    
    setDialogOpen(true);
  };

  const handleSave = async () => {
    // Validate required fields - FIXED: changed student_class to current_class
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.current_class) {
      toast.error("Please fill in all required fields");
      return;
    }
     const cleanPhone = formData.parent_phone.replace(/[^\d+]/g, '');

    const studentData: StudentFormData = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      date_of_birth: formData.date_of_birth || new Date().toISOString().split('T')[0],
      current_class: parseInt(formData.current_class), // FIXED: changed from student_class to current_class
      parent_name: formData.parent_name,
      parent_phone: cleanPhone,
      address: formData.address,
      is_active: formData.status === 'active', // Convert status to boolean
    };

    if (editingStudent) {
      updateStudent({ id: editingStudent.id, data: studentData });
    } else {
      createStudent(studentData);
    }
    
    setDialogOpen(false);
  };

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      deleteStudent(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Students</h1>
          <p className="text-muted-foreground">{students.length} students enrolled</p>
        </div>
        <Button onClick={openAdd} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:opacity-90">
          <Plus className="mr-2 h-4 w-4" /> Add Student
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Select value={filterClass} onValueChange={setFilterClass}>
          <SelectTrigger className="w-full sm:w-40 bg-card">
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes?.map((cls: any) => (
              <SelectItem key={cls.id} value={cls.id.toString()}>
                Class {cls.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Student Cards */}
      {students.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No students found</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your search or add a new student</p>
          <Button onClick={openAdd} variant="outline">
            <Plus className="mr-2 h-4 w-4" /> Add Student
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {students.map((student, i) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl bg-card p-5 shadow-card hover:shadow-card-hover transition-shadow duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-full ${gradientAvatars[i % gradientAvatars.length]} text-sm font-bold text-white`}>
                    {student.avatar}
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground">{student.name}</h3>
                    <p className="text-xs text-muted-foreground">{student.class}</p>
                  </div>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  student.status === "active" 
                    ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" 
                    : "bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400"
                }`}>
                  {student.status}
                </span>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" /> {student.parentContact}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" /> {student.email}
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => openEdit(student)}
                  disabled={isUpdating}
                >
                  <Edit className="mr-1 h-3.5 w-3.5" /> Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-500 hover:bg-red-500 hover:text-white"
                  onClick={() => handleDelete(student.id, student.name)}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingStudent ? "Edit Student" : "Add New Student"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name *</Label>
                <Input 
                  value={formData.first_name} 
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} 
                  placeholder="John"
                />
              </div>
              <div>
                <Label>Last Name *</Label>
                <Input 
                  value={formData.last_name} 
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} 
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <Label>Email *</Label>
              <Input 
                type="email"
                value={formData.email} 
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                placeholder="john.doe@school.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Class *</Label>
                <Select 
                  value={formData.current_class} // FIXED: changed from student_class to current_class
                  onValueChange={(v) => setFormData({ ...formData, current_class: v })} // FIXED: changed from student_class to current_class
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classesLoading ? (
                      <SelectItem value="loading" disabled>Loading...</SelectItem>
                    ) : (
                      classes?.map((cls: any) => (
                        <SelectItem key={cls.id} value={cls.id.toString()}>
                          Class {cls.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date of Birth</Label>
                <Input 
                  type="date"
                  value={formData.date_of_birth} 
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })} 
                />
              </div>
            </div>

            <div>
              <Label>Parent Name</Label>
              <Input 
                value={formData.parent_name} 
                onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })} 
                placeholder="Jane Doe"
              />
            </div>

            <div>
              <Label>Parent Phone</Label>
              <Input 
                value={formData.parent_phone} 
                onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })} 
                placeholder="+1 234-567-8900"
              />
            </div>

            <div>
              <Label>Address</Label>
              <Input 
                value={formData.address} 
                onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
                placeholder="123 School St, City"
              />
            </div>

            <div>
              <Label>Enrollment Date</Label>
              <Input 
                type="date"
                value={formData.enrollment_date} 
                onChange={(e) => setFormData({ ...formData, enrollment_date: e.target.value })} 
              />
            </div>

            <div>
              <Label>Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(v: "active" | "inactive" | "graduated") => 
                  setFormData({ ...formData, status: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="graduated">Graduated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:opacity-90"
              onClick={handleSave}
              disabled={isCreating || isUpdating}
            >
              {(isCreating || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingStudent ? "Update Student" : "Add Student"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}