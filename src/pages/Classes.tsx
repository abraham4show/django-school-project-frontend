import { motion } from "framer-motion";
import { BookOpen, Users, User, Plus, Edit, Trash2, Search, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClasses, useSubjects } from "@/hooks/useClasses"; // adjust import path if needed
import { useTeachers } from "@/hooks/useTeachers";
import { Class } from "../services/classServices";
import { toast } from "sonner";

const sectionOptions = [
  "Kindergarten",
  "Nursery",
  "Primary",
];

export default function Classes() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    section: "",
    academic_year: new Date().getFullYear() + "/" + (new Date().getFullYear() + 1),
    teacher: undefined as number | undefined,
    subjects: [] as number[],
  });

  // Fetch data
  const { data: classes, isLoading: classesLoading, error: classesError } = useClasses();
  const { data: subjects, isLoading: subjectsLoading, error: subjectsError } = useSubjects();
  const { data: teachers } = useTeachers({ is_active: true });
  
  // Placeholder for mutations – replace with your actual mutation hooks
  const createClass = { mutate: (data: any) => console.log("create", data), isPending: false };
  const updateClass = { mutate: (data: any) => console.log("update", data), isPending: false };
  const deleteClass = { mutate: (id: number) => console.log("delete", id), isPending: false };

  const resetForm = () => {
    setFormData({
      name: "",
      section: "",
      academic_year: new Date().getFullYear() + "/" + (new Date().getFullYear() + 1),
      teacher: undefined,
      subjects: [],
    });
    setEditingClass(null);
  };

  const openAdd = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (cls: Class) => {
    setEditingClass(cls);
    setFormData({
      name: cls.name,
      section: cls.section || "",
      academic_year: cls.academic_year || "",
      teacher: cls.teacher,
      subjects: cls.subjects || [],
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.section) {
      toast.error("Class name and section are required");
      return;
    }

    const data = { ...formData };
    if (editingClass) {
      updateClass.mutate({ id: editingClass.id, data });
    } else {
      createClass.mutate(data);
    }
    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      deleteClass.mutate(id);
    }
  };

  // Filter classes based on search
  const filteredClasses = Array.isArray(classes)
    ? classes.filter((cls: Class) =>
        cls.name.toLowerCase().includes(search.toLowerCase()) ||
        cls.section?.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  // Ensure subjects is an array for safe mapping
  const subjectList = Array.isArray(subjects) ? subjects : [];

  if (classesLoading || subjectsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (classesError || subjectsError) {
    return (
      <div className="text-center py-12 text-red-500">
        Error loading data. Please refresh or check the console.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Classes</h1>
          <p className="text-muted-foreground">{filteredClasses.length} classes</p>
        </div>
        <Button onClick={openAdd} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:opacity-90">
          <Plus className="mr-2 h-4 w-4" /> Add Class
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search classes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Class Grid */}
      {filteredClasses.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No classes found</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your search or add a new class</p>
          <Button onClick={openAdd} variant="outline">
            <Plus className="mr-2 h-4 w-4" /> Add Class
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredClasses.map((cls: Class, i: number) => (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl bg-card shadow-card hover:shadow-card-hover transition-shadow duration-300 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
                <h3 className="text-lg font-bold text-white">{cls.name}</h3>
                <p className="text-sm text-white/80">{cls.section} Section</p>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-2 text-sm text-card-foreground">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Class Teacher: {cls.teacher_name || "Not assigned"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-card-foreground">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Students: (coming soon)</span>
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Subjects</p>
                  <div className="flex flex-wrap gap-1.5">
                    {cls.subject_names?.length ? (
                      cls.subject_names.map((sub: string) => (
                        <span
                          key={sub}
                          className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary"
                        >
                          {sub}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">No subjects</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEdit(cls)}
                  >
                    <Edit className="mr-1 h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:bg-red-500 hover:text-white"
                    onClick={() => handleDelete(cls.id, cls.name)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingClass ? "Edit Class" : "Add New Class"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Class Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., kg 2, pry 4"
              />
            </div>

            <div>
              <Label>Section *</Label>
              <Select
                value={formData.section}
                onValueChange={(v) => setFormData({ ...formData, section: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {sectionOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Academic Year</Label>
              <Input
                value={formData.academic_year}
                onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                placeholder="2025/2026"
              />
            </div>

            <div>
              <Label>Class Teacher</Label>
              <Select
                value={formData.teacher?.toString() || ""}
                onValueChange={(v) => setFormData({ ...formData, teacher: v ? parseInt(v) : undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers?.map((teacher: any) => (
                    <SelectItem key={teacher.id} value={teacher.id.toString()}>
                      {teacher.first_name} {teacher.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Subjects</Label>
              <div className="space-y-2">
                <Select
                  onValueChange={(value) => {
                    const num = parseInt(value);
                    if (formData.subjects.includes(num)) {
                      setFormData({
                        ...formData,
                        subjects: formData.subjects.filter((s) => s !== num),
                      });
                    } else {
                      setFormData({
                        ...formData,
                        subjects: [...formData.subjects, num],
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjectList.map((sub: any) => (
                      <SelectItem key={sub.id} value={sub.id.toString()}>
                        {sub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-1">
                  {formData.subjects.map((id) => {
                    const sub = subjectList.find((s: any) => s.id === id);
                    return sub ? (
                      <span
                        key={id}
                        className="bg-primary/10 text-primary text-xs px-2 py-1 rounded flex items-center"
                      >
                        {sub.name}
                        <button
                          onClick={() =>
                            setFormData({
                              ...formData,
                              subjects: formData.subjects.filter((s) => s !== id),
                            })
                          }
                          className="ml-1 text-primary hover:text-primary/80"
                        >
                          ×
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            </div>

            <Button
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:opacity-90"
              onClick={handleSave}
              disabled={createClass.isPending || updateClass.isPending}
            >
              {(createClass.isPending || updateClass.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editingClass ? "Update Class" : "Add Class"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}