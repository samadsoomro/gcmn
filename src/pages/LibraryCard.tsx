import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  BookOpen,
  Wifi,
  Users,
  Computer,
  Library,
  Percent,
  Check,
  ArrowRight,
  ArrowLeft,
  Download,
  CreditCard,
} from "lucide-react";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";

const benefits = [
  { icon: BookOpen, title: "Borrow books, DVDs, and audiobooks" },
  { icon: Wifi, title: "Access digital resources from anywhere" },
  { icon: Users, title: "Reserve meeting rooms" },
  { icon: Computer, title: "Free computer and WiFi access" },
  { icon: Library, title: "Interlibrary loan services" },
  { icon: Percent, title: "Discounts at local partners" },
];

const classes = ["Class 11", "Class 12", "ADA I", "ADA II", "BSC I", "BSC II"];

interface FormData {
  firstName: string;
  lastName: string;
  studentClass: string;
  rollNo: string;
  email: string;
  phone: string;
  addressStreet: string;
  addressCity: string;
  addressState: string;
  addressZip: string;
}

interface SubmissionResult {
  cardNumber: string;
  formData: FormData;
}

const LibraryCard = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    studentClass: "",
    rollNo: "",
    email: "",
    phone: "",
    addressStreet: "",
    addressCity: "",
    addressState: "",
    addressZip: "",
  });
  const { toast } = useToast();
  const { user } = useAuth();

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    if (!formData.firstName || !formData.lastName || !formData.studentClass || !formData.rollNo) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.email || !formData.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!formData.addressStreet || !formData.addressCity || !formData.addressState || !formData.addressZip) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("library_card_applications")
        .insert({
          user_id: user?.id || null,
          first_name: formData.firstName,
          last_name: formData.lastName,
          class: formData.studentClass,
          roll_no: formData.rollNo,
          email: formData.email,
          phone: formData.phone,
          address_street: formData.addressStreet,
          address_city: formData.addressCity,
          address_state: formData.addressState,
          address_zip: formData.addressZip,
        })
        .select("card_number")
        .single();

      if (error) throw error;

      setSubmissionResult({
        cardNumber: data.card_number,
        formData,
      });

      toast({
        title: "Application Submitted!",
        description: "Your library card application has been submitted successfully.",
      });
    } catch (error: any) {
      console.error("Error submitting application:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generatePDF = async () => {
    if (!submissionResult) return;

    const doc = new jsPDF();
    const { cardNumber, formData } = submissionResult;

    // Generate QR Code
    const qrCodeDataUrl = await QRCode.toDataURL(cardNumber, { width: 100, margin: 1 });

    // Card background
    doc.setFillColor(22, 78, 59); // Primary green
    doc.roundedRect(20, 20, 170, 100, 5, 5, "F");

    // Header
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("GC Men Nazimabad Library", 105, 38, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("LIBRARY CARD", 105, 48, { align: "center" });

    // Divider
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);
    doc.line(30, 55, 180, 55);

    // Student details
    doc.setFontSize(11);
    doc.text(`Name: ${formData.firstName} ${formData.lastName}`, 30, 68);
    doc.text(`Class: ${formData.studentClass}`, 30, 78);
    doc.text(`Roll No: ${formData.rollNo}`, 30, 88);
    doc.text(`Card ID: ${cardNumber}`, 30, 98);
    doc.text(`Issue Date: ${new Date().toLocaleDateString()}`, 30, 108);

    // QR Code
    doc.addImage(qrCodeDataUrl, "PNG", 145, 60, 35, 35);

    // Footer text
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("This card is the property of GC Men Nazimabad Library.", 105, 135, { align: "center" });
    doc.text("Please present this card when borrowing books.", 105, 142, { align: "center" });

    // Student info section
    doc.setFontSize(14);
    doc.setTextColor(22, 78, 59);
    doc.setFont("helvetica", "bold");
    doc.text("Student Information", 20, 165);

    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "normal");
    doc.text(`Email: ${formData.email}`, 20, 178);
    doc.text(`Phone: ${formData.phone}`, 20, 188);
    doc.text(`Address: ${formData.addressStreet}`, 20, 198);
    doc.text(`${formData.addressCity}, ${formData.addressState} ${formData.addressZip}`, 20, 208);

    doc.save(`library-card-${cardNumber}.pdf`);
  };

  if (submissionResult) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Application Submitted Successfully!
            </h1>
            <p className="text-muted-foreground mb-8">
              Your library card PDF is ready for download.
            </p>

            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <CreditCard className="w-8 h-8 text-primary" />
                  <span className="text-xl font-mono font-bold text-foreground">
                    {submissionResult.cardNumber}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Save this card number for your records
                </p>
              </CardContent>
            </Card>

            <Button onClick={generatePDF} size="lg" className="gap-2">
              <Download className="w-5 h-5" />
              Download Library Card PDF
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Get Your Library Card
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A library card is your key to unlimited learning. Apply online and start exploring today.
          </p>
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-foreground text-center mb-2">Card Benefits</h2>
          <p className="text-muted-foreground text-center mb-8">
            Everything included with your free library card:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-6 h-6 text-primary" />
                    </div>
                    <span className="font-medium text-foreground">{benefit.title}</span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Application Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                    s <= step
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 transition-colors ${
                      s < step ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                Application Form – Step {step} of 3
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          placeholder="Enter first name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          placeholder="Enter last name"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="class">Class *</Label>
                      <Select
                        value={formData.studentClass}
                        onValueChange={(value) => handleInputChange("studentClass", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rollNo">Roll Number *</Label>
                      <Input
                        id="rollNo"
                        value={formData.rollNo}
                        onChange={(e) => handleInputChange("rollNo", e.target.value)}
                        placeholder="e.g., E-125"
                      />
                    </div>
                    <div className="flex justify-end pt-4">
                      <Button onClick={handleNext} className="gap-2">
                        Continue <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="flex justify-between pt-4">
                      <Button variant="outline" onClick={handleBack} className="gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back
                      </Button>
                      <Button onClick={handleNext} className="gap-2">
                        Continue <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="addressStreet">Street Address *</Label>
                      <Input
                        id="addressStreet"
                        value={formData.addressStreet}
                        onChange={(e) => handleInputChange("addressStreet", e.target.value)}
                        placeholder="Enter street address"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="addressCity">City *</Label>
                        <Input
                          id="addressCity"
                          value={formData.addressCity}
                          onChange={(e) => handleInputChange("addressCity", e.target.value)}
                          placeholder="Enter city"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="addressState">State / Province *</Label>
                        <Input
                          id="addressState"
                          value={formData.addressState}
                          onChange={(e) => handleInputChange("addressState", e.target.value)}
                          placeholder="Enter state"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="addressZip">ZIP / Postal Code *</Label>
                      <Input
                        id="addressZip"
                        value={formData.addressZip}
                        onChange={(e) => handleInputChange("addressZip", e.target.value)}
                        placeholder="Enter ZIP code"
                      />
                    </div>
                    <div className="flex justify-between pt-4">
                      <Button variant="outline" onClick={handleBack} className="gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back
                      </Button>
                      <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
                        {isSubmitting ? "Submitting..." : "Submit Application"}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default LibraryCard;
