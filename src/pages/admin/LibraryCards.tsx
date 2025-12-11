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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Download, CreditCard, RefreshCw } from "lucide-react";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";

interface LibraryCardApplication {
  id: string;
  first_name: string;
  last_name: string;
  class: string;
  roll_no: string;
  email: string;
  phone: string;
  address_street: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  status: string;
  card_number: string;
  created_at: string;
}

const LibraryCards = () => {
  const [applications, setApplications] = useState<LibraryCardApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("library_card_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error: any) {
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
    } catch (error: any) {
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
    } catch (error: any) {
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
    const qrCodeDataUrl = await QRCode.toDataURL(app.card_number, { width: 100, margin: 1 });

    // Card background
    doc.setFillColor(22, 78, 59);
    doc.roundedRect(20, 20, 170, 100, 5, 5, "F");

    // Header
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("GC Men Nazimabad Library", 105, 38, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("LIBRARY CARD", 105, 48, { align: "center" });

    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);
    doc.line(30, 55, 180, 55);

    doc.setFontSize(11);
    doc.text(`Name: ${app.first_name} ${app.last_name}`, 30, 68);
    doc.text(`Class: ${app.class}`, 30, 78);
    doc.text(`Roll No: ${app.roll_no}`, 30, 88);
    doc.text(`Card ID: ${app.card_number}`, 30, 98);
    doc.text(`Issue Date: ${new Date(app.created_at).toLocaleDateString()}`, 30, 108);

    doc.addImage(qrCodeDataUrl, "PNG", 145, 60, 35, 35);

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("This card is the property of GC Men Nazimabad Library.", 105, 135, { align: "center" });

    doc.setFontSize(14);
    doc.setTextColor(22, 78, 59);
    doc.setFont("helvetica", "bold");
    doc.text("Student Information", 20, 165);

    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "normal");
    doc.text(`Email: ${app.email}`, 20, 178);
    doc.text(`Phone: ${app.phone}`, 20, 188);
    doc.text(`Address: ${app.address_street}`, 20, 198);
    doc.text(`${app.address_city}, ${app.address_state} ${app.address_zip}`, 20, 208);

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

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Library Card Applications</h1>
            </div>
            <Button variant="outline" onClick={fetchApplications} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Applications ({applications.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : applications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No applications found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Card Number</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Roll No</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell className="font-mono text-sm">
                            {app.card_number}
                          </TableCell>
                          <TableCell>
                            {app.first_name} {app.last_name}
                          </TableCell>
                          <TableCell>{app.class}</TableCell>
                          <TableCell>{app.roll_no}</TableCell>
                          <TableCell>{app.email}</TableCell>
                          <TableCell>{app.phone}</TableCell>
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
