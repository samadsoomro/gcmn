import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SplashScreen from "@/components/common/SplashScreen";
import ScrollToTop from "@/components/common/ScrollToTop";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Home from "@/pages/Home";
import Books from "@/pages/Books";
import Notes from "@/pages/Notes";
import RareBooks from "@/pages/RareBooks";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import LibraryCard from "@/pages/LibraryCard";
import Donate from "@/pages/Donate";
import AdminMessages from "@/pages/admin/Messages";
import BorrowedBooks from "@/pages/admin/BorrowedBooks";
import AdminLibraryCards from "@/pages/admin/LibraryCards";
import AdminDonations from "@/pages/admin/Donations";
import AdminRegisteredUsers from "@/pages/admin/RegisteredUsers";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/books" element={<Books />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/rare-books" element={<RareBooks />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/library-card" element={<LibraryCard />} />
          <Route path="/donate" element={<Donate />} />
          <Route
            path="/admin/messages"
            element={
              <ProtectedRoute requireAdmin>
                <AdminMessages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/books/borrow"
            element={
              <ProtectedRoute requireAdmin>
                <BorrowedBooks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/library-cards"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLibraryCards />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/donations"
            element={
              <ProtectedRoute requireAdmin>
                <AdminDonations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requireAdmin>
                <AdminRegisteredUsers />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange={false}
      storageKey="gcmn-theme"
    >
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppContent />
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
