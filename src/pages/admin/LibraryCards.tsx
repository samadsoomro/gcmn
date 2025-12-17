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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Download, CreditCard, RefreshCw, Search, Edit2 } from "lucide-react";
import { jsPDF } from "jspdf";
import collegeLogo from "@/assets/images/college-logo.png";

// Helper function to generate QR code URL
const getQRCodeUrl = (text: string, size: number = 100) => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
};

interface LibraryCardApplication {
  id: string;
  first_name: string;
  last_name: string;
  father_name: string | null;
  dob: string | null;
  class: string;
  field: string | null;
  roll_no: string;
  email: string;
  phone: string;
  address_street: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  status: string;
  card_number: string;
  student_id: string | null;
  issue_date: string | null;
  valid_through: string | null;
  created_at: string;
}

const LibraryCards = () => {
  const [applications, setApplications] = useState<LibraryCardApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("library_card_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications((data as LibraryCardApplication[]) || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast({
        title: "Error",
        description: "Failed to fetch applications.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("library_card_applications_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "library_card_applications" },
        () => {
          fetchApplications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("library_card_applications")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Application status changed to ${status}.`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive",
      });
    }
  };

  const deleteApplication = async (id: string) => {
    if (!confirm("Are you sure you want to delete this application?")) return;

    try {
      const { error } = await supabase
        .from("library_card_applications")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: "Application has been deleted.",
      });
    } catch (error) {
      console.error("Error deleting application:", error);
      toast({
        title: "Error",
        description: "Failed to delete application.",
        variant: "destructive",
      });
    }
  };

  const generatePDF = async (app: LibraryCardApplication) => {
    const doc = new jsPDF();
    
    // Fetch QR Code as image
    const qrCodeUrl = getQRCodeUrl(app.card_number, 100);
    const response = await fetch(qrCodeUrl);
    const blob = await response.blob();
    const qrCodeDataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });

    // Load logo
    const logoImg = new Image();
    logoImg.crossOrigin = "anonymous";
    logoImg.src = collegeLogo;
    
    await new Promise((resolve) => {
      logoImg.onload = resolve;
    });

    // Create canvas for logo
    const canvas = document.createElement('canvas');
    canvas.width = logoImg.width;
    canvas.height = logoImg.height;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(logoImg, 0, 0);
    const logoDataUrl = canvas.toDataURL('image/png');

    // ============ FRONT SIDE ============
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(22, 78, 59);
    doc.setLineWidth(2);
    doc.roundedRect(15, 15, 180, 120, 5, 5, "FD");

    // Header section - Green band
    doc.setFillColor(22, 78, 59);
    doc.rect(15, 15, 180, 35, "F");

    // Add logo - Top Left
    doc.addImage(logoDataUrl, "PNG", 20, 17, 30, 30);

    // Government text - positioned to the right of logo
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Government of Sindh", 125, 22, { align: "center" });
    doc.text("College Education Department", 125, 27, { align: "center" });

    // College name
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("GOVT COLLEGE FOR MEN NAZIMABAD", 125, 37, { align: "center" });

    // Library Card title
    doc.setFontSize(10);
    doc.setTextColor(22, 78, 59);
    doc.text("LIBRARY CARD", 105, 57, { align: "center" });

    // Divider line
    doc.setDrawColor(22, 78, 59);
    doc.setLineWidth(0.5);
    doc.line(25, 60, 185, 60);

    // Student details - Left side
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "normal");

    const leftX = 25;
    let y = 68;
    const lineHeight = 7;

    doc.setFont("helvetica", "bold");
    doc.text("Name:", leftX, y);
    doc.setFont("helvetica", "normal");
    doc.text(`${app.first_name} ${app.last_name}`, leftX + 25, y);
    y += lineHeight;

    if (app.father_name) {
      doc.setFont("helvetica", "bold");
      doc.text("Father Name:", leftX, y);
      doc.setFont("helvetica", "normal");
      doc.text(app.father_name, leftX + 32, y);
      y += lineHeight;
    }

    if (app.dob) {
      doc.setFont("helvetica", "bold");
      doc.text("Date of Birth:", leftX, y);
      doc.setFont("helvetica", "normal");
      doc.text(new Date(app.dob).toLocaleDateString('en-GB'), leftX + 32, y);
      y += lineHeight;
    }

    doc.setFont("helvetica", "bold");
    doc.text("Class:", leftX, y);
    doc.setFont("helvetica", "normal");
    doc.text(app.class, leftX + 18, y);
    y += lineHeight;

    if (app.field) {
      doc.setFont("helvetica", "bold");
      doc.text("Field/Group:", leftX, y);
      doc.setFont("helvetica", "normal");
      doc.text(app.field, leftX + 28, y);
      y += lineHeight;
    }

    doc.setFont("helvetica", "bold");
    doc.text("Roll Number:", leftX, y);
    doc.setFont("helvetica", "normal");
    doc.text(app.roll_no, leftX + 28, y);

    // Right side details
    const rightX = 115;
    y = 68;

    doc.setFont("helvetica", "bold");
    doc.text("Library Card ID:", rightX, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(22, 78, 59);
    doc.text(app.card_number, rightX + 35, y);
    doc.setTextColor(60, 60, 60);
    y += lineHeight;

    if (app.student_id) {
      doc.setFont("helvetica", "bold");
      doc.text("Student ID:", rightX, y);
      doc.setFont("helvetica", "normal");
      doc.text(app.student_id, rightX + 25, y);
      y += lineHeight;
    }

    if (app.issue_date) {
      doc.setFont("helvetica", "bold");
      doc.text("Issue Date:", rightX, y);
      doc.setFont("helvetica", "normal");
      doc.text(new Date(app.issue_date).toLocaleDateString('en-GB'), rightX + 25, y);
      y += lineHeight;
    }

    if (app.valid_through) {
      doc.setFont("helvetica", "bold");
      doc.text("Valid Through:", rightX, y);
      doc.setFont("helvetica", "normal");
      doc.text(new Date(app.valid_through).toLocaleDateString('en-GB'), rightX + 30, y);
    }

    // QR Code
    doc.addImage(qrCodeDataUrl, "PNG", 150, 92, 30, 30);

    // Principal signature line
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.3);
    doc.line(25, 125, 70, 125);
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text("Principal's Signature", 47.5, 130, { align: "center" });

    // ============ BACK SIDE ============
    doc.setFillColor(245, 245, 245);
    doc.setDrawColor(22, 78, 59);
    doc.setLineWidth(2);
    doc.roundedRect(15, 150, 180, 80, 5, 5, "FD");

    // Header
    doc.setFillColor(22, 78, 59);
    doc.rect(15, 150, 180, 15, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("TERMS & CONDITIONS", 105, 159, { align: "center" });

    // Disclaimer text
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");

    const disclaimerY = 172;
    const disclaimerLines = [
      "• This card is NOT TRANSFERABLE.",
      "• If lost, stolen, or damaged, report immediately to the GCMN Library.",
      "• The college is not responsible for misuse.",
      "• If found, please return to Government College for Men Nazimabad.",
      "",
      "Contact: Library, GCMN, Nazimabad, Karachi",
      "Email: library@gcmn.edu.pk"
    ];

    disclaimerLines.forEach((line, index) => {
      doc.text(line, 25, disclaimerY + (index * 7));
    });

    doc.save(`library-card-${app.card_number}.pdf`);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const filteredApplications = applications.filter(app => {
    const search = searchQuery.toLowerCase();
    return (
      app.card_number.toLowerCase().includes(search) ||
      app.first_name.toLowerCase().includes(search) ||
      app.last_name.toLowerCase().includes(search) ||
      app.roll_no.toLowerCase().includes(search) ||
      app.email.toLowerCase().includes(search)
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
              <CreditCard className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Library Card Applications</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, card ID, roll no..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" onClick={fetchApplications} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Applications ({filteredApplications.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : filteredApplications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No applications found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Card ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Field</TableHead>
                        <TableHead>Roll No</TableHead>
                        <TableHead>Student ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell className="font-mono text-sm text-primary font-medium">
                            {app.card_number}
                          </TableCell>
                          <TableCell>
                            {app.first_name} {app.last_name}
                          </TableCell>
                          <TableCell>{app.class}</TableCell>
                          <TableCell>{app.field || '-'}</TableCell>
                          <TableCell>{app.roll_no}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {app.student_id || '-'}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={app.status}
                              onValueChange={(value) => updateStatus(app.id, value)}
                            >
                              <SelectTrigger className="w-28">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            {new Date(app.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => generatePDF(app)}
                                title="Download PDF"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => deleteApplication(app.id)}
                                className="text-destructive hover:text-destructive"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default LibraryCards;