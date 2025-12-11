import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Users, RefreshCw, Search, GraduationCap, Briefcase, Trash2 } from "lucide-react";

interface Student {
  id: string;
  user_id: string;
  card_id: string;
  name: string;
  class: string | null;
  field: string | null;
  roll_no: string | null;
  created_at: string;
}

interface NonStudent {
  id: string;
  user_id: string;
  name: string;
  role: string;
  phone: string | null;
  created_at: string;
}

const RegisteredUsers = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [nonStudents, setNonStudents] = useState<NonStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("students");
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [studentsRes, nonStudentsRes] = await Promise.all([
        supabase.from("students").select("*").order("created_at", { ascending: false }),
        supabase.from("non_students").select("*").order("created_at", { ascending: false }),
      ]);

      if (studentsRes.error) throw studentsRes.error;
      if (nonStudentsRes.error) throw nonStudentsRes.error;

      setStudents(studentsRes.data || []);
      setNonStudents(nonStudentsRes.data || []);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    // Subscribe to realtime updates
    const studentsChannel = supabase
      .channel("students_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "students" },
        () => fetchUsers()
      )
      .subscribe();

    const nonStudentsChannel = supabase
      .channel("non_students_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "non_students" },
        () => fetchUsers()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(studentsChannel);
      supabase.removeChannel(nonStudentsChannel);
    };
  }, []);

  const deleteStudent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;

    try {
      const { error } = await supabase.from("students").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Deleted", description: "Student record deleted." });
    } catch (error: any) {
      console.error("Error deleting student:", error);
      toast({
        title: "Error",
        description: "Failed to delete student.",
        variant: "destructive",
      });
    }
  };

  const deleteNonStudent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const { error } = await supabase.from("non_students").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Deleted", description: "User record deleted." });
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user.",
        variant: "destructive",
      });
    }
  };

  const filteredStudents = students.filter((s) => {
    const search = searchQuery.toLowerCase();
    return (
      s.card_id.toLowerCase().includes(search) ||
      s.name.toLowerCase().includes(search) ||
      (s.roll_no?.toLowerCase().includes(search) || false)
    );
  });

  const filteredNonStudents = nonStudents.filter((ns) => {
    const search = searchQuery.toLowerCase();
    return (
      ns.name.toLowerCase().includes(search) ||
      ns.role.toLowerCase().includes(search)
    );
  });

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Registered Users</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" onClick={fetchUsers} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="students" className="gap-2">
                <GraduationCap className="w-4 h-4" />
                Students ({students.length})
              </TabsTrigger>
              <TabsTrigger value="non-students" className="gap-2">
                <Briefcase className="w-4 h-4" />
                Staff/Visitors ({nonStudents.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="students">
              <Card>
                <CardHeader>
                  <CardTitle>Registered Students</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading...</div>
                  ) : filteredStudents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No students found.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Library Card ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead>Field</TableHead>
                            <TableHead>Roll No</TableHead>
                            <TableHead>Registered</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredStudents.map((student) => (
                            <TableRow key={student.id}>
                              <TableCell className="font-mono text-sm text-primary font-medium">
                                {student.card_id}
                              </TableCell>
                              <TableCell>{student.name}</TableCell>
                              <TableCell>{student.class || "-"}</TableCell>
                              <TableCell>{student.field || "-"}</TableCell>
                              <TableCell>{student.roll_no || "-"}</TableCell>
                              <TableCell>
                                {new Date(student.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => deleteStudent(student.id)}
                                  className="text-destructive hover:text-destructive"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="non-students">
              <Card>
                <CardHeader>
                  <CardTitle>Staff & Visitors</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading...</div>
                  ) : filteredNonStudents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No users found.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Registered</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredNonStudents.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>{user.name}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{user.role}</Badge>
                              </TableCell>
                              <TableCell>{user.phone || "-"}</TableCell>
                              <TableCell>
                                {new Date(user.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => deleteNonStudent(user.id)}
                                  className="text-destructive hover:text-destructive"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisteredUsers;