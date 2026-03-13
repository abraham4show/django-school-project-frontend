import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Edit, Trash2, BookOpen, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTeachers, useCreateTeacher, useUpdateTeacher, useDeleteTeacher } from "@/hooks/useTeachers";
import { useClasses } from "@/hooks/useStudents";
import { Teacher } from "@/types";
import { toast } from "sonner";

const gradientAvatars = [
  "bg-gradient-to-r from-purple-500 to-pink-500",
  "bg-gradient-to-r from-blue-500 to-cyan-500",
  "bg-gradient-to-r from-green-500 to-emerald-500",
  "bg-gradient-to-r from-orange-500 to-red-500",
];

export default function Teachers() {
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    qualification: "",
    classes: [] as number[],
    is_active: true,
  });

  // Fetch teachers with filters
  const { data: teachers, isLoading } = useTeachers({
    search: search || undefined,
    is_active: filterActive === "all" ? undefined : filterActive === "active",
  });

  // Fetch classes for dropdown
  const { data: classes } = useClasses();

  const createTeacher = useCreateTeacher();
  const updateTeacher = useUpdateTeacher();
  const deleteTeacher = useDeleteTeacher();

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      address: "",
      qualification: "",
      classes: [],
      is_active: true,
    });
    setEditingTeacher(null);
  };

  const openAdd = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      first_name: teacher.first_name,
      last_name: teacher.last_name,
      email: teacher.email,
      phone: teacher.phone || "",
      address: teacher.address || "",
      qualification: teacher.qualification || "",
      classes: teacher.classes || [],
      is_active: teacher.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.first_name || !formData.last_name || !formData.email) {
      toast.error("First name, last name, and email are required");
      return;
    }

    const data = { ...formData };
    if (editingTeacher) {
      updateTeacher.mutate({ id: editingTeacher.id, data });
    } else {
      createTeacher.mutate(data);
    }
    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      deleteTeacher.mutate(id);
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
          <h1 className="text-2xl font-bold text-foreground">Teachers</h1>
          <p className="text-muted-foreground">{teachers?.length || 0} teachers on staff</p>
        </div>
        <Button onClick={openAdd} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:opacity-90">
          <Plus className="mr-2 h-4 w-4" /> Add Teacher
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Select value={filterActive} onValueChange={setFilterActive}>
          <SelectTrigger className="w-full sm:w-40 bg-card">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Teacher Grid */}
      {!teachers || teachers.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No teachers found</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your search or add a new teacher</p>
          <Button onClick={openAdd} variant="outline">
            <Plus className="mr-2 h-4 w-4" /> Add Teacher
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teachers.map((teacher: Teacher, i: number) => (
            <motion.div
              key={teacher.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl bg-card p-5 shadow-card hover:shadow-card-hover transition-shadow duration-300"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${gradientAvatars[i % gradientAvatars.length]} text-sm font-bold text-white`}
                >
                  {teacher.first_name[0]}{teacher.last_name[0]}
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground">
                    {teacher.first_name} {teacher.last_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{teacher.employee_id}</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" /> {teacher.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="h-3.5 w-3.5" />{" "}
                  {teacher.class_names?.length > 0
                    ? teacher.class_names.join(", ")
                    : "No classes assigned"}
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {teacher.class_names?.map((cls) => (
                    <span
                      key={cls}
                      className="bg-primary/10 text-primary text-xs px-2 py-1 rounded"
                    >
                      {cls}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => openEdit(teacher)}
                  disabled={updateTeacher.isPending}
                >
                  <Edit className="mr-1 h-3.5 w-3.5" /> Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 hover:bg-red-500 hover:text-white"
                  onClick={() =>
                    handleDelete(teacher.id, `${teacher.first_name} ${teacher.last_name}`)
                  }
                  disabled={deleteTeacher.isPending}
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
            <DialogTitle>{editingTeacher ? "Edit Teacher" : "Add New Teacher"}</DialogTitle>
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

            <div>
              <Label>Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 234-567-8900"
              />
            </div>

            <div>
              <Label>Qualification</Label>
              <Input
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                placeholder="e.g., B.Ed, M.Sc"
              />
            </div>

            <div>
              <Label>Address</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 School St"
              />
            </div>

            <div>
              <Label>Assigned Classes</Label>
              <div className="space-y-2">
                <Select
                  onValueChange={(value) => {
                    const num = parseInt(value);
                    if (formData.classes.includes(num)) {
                      setFormData({
                        ...formData,
                        classes: formData.classes.filter((c) => c !== num),
                      });
                    } else {
                      setFormData({
                        ...formData,
                        classes: [...formData.classes, num],
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select classes" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes?.map((cls: any) => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-1">
                  {formData.classes.map((id) => {
                    const cls = classes?.find((c: any) => c.id === id);
                    return cls ? (
                      <span
                        key={id}
                        className="bg-primary/10 text-primary text-xs px-2 py-1 rounded flex items-center"
                      >
                        {cls.name}
                        <button
                          onClick={() =>
                            setFormData({
                              ...formData,
                              classes: formData.classes.filter((c) => c !== id),
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

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="is_active">Active</Label>
            </div>

            <Button
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:opacity-90"
              onClick={handleSave}
              disabled={createTeacher.isPending || updateTeacher.isPending}
            >
              {(createTeacher.isPending || updateTeacher.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editingTeacher ? "Update Teacher" : "Add Teacher"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}