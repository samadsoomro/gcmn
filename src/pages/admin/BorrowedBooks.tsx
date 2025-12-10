import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Book, Calendar, User, Trash2, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface BorrowRecord {
  id: string;
  user_id: string;
  book_id: string;
  book_title: string;
  borrow_date: string;
  return_date: string | null;
  due_date: string;
  status: string;
  created_at: string;
  profile?: {
    full_name: string;
    department: string | null;
    roll_number: string | null;
    phone: string | null;
  };
  user_email?: string;
}

const BorrowedBooks: React.FC = () => {
  const [borrows, setBorrows] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBorrows = async () => {
    try {
      const { data: borrowsData, error } = await supabase
        .from('book_borrows')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles for each borrow
      const borrowsWithProfiles = await Promise.all(
        (borrowsData || []).map(async (borrow) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, department, roll_number, phone')
            .eq('user_id', borrow.user_id)
            .maybeSingle();

          return {
            ...borrow,
            profile: profileData || undefined,
          };
        })
      );

      setBorrows(borrowsWithProfiles);
    } catch (error) {
      console.error('Error fetching borrows:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch borrow records',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrows();

    // Set up real-time subscription
    const channel = supabase
      .channel('book_borrows_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'book_borrows' },
        () => {
          fetchBorrows();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleMarkReturned = async (id: string) => {
    try {
      const { error } = await supabase
        .from('book_borrows')
        .update({ 
          status: 'returned', 
          return_date: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Book marked as returned',
      });
      fetchBorrows();
    } catch (error) {
      console.error('Error updating borrow:', error);
      toast({
        title: 'Error',
        description: 'Failed to update record',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
      const { error } = await supabase
        .from('book_borrows')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Deleted',
        description: 'Borrow record deleted successfully',
      });
      fetchBorrows();
    } catch (error) {
      console.error('Error deleting borrow:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete record',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      borrowed: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      returned: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      overdue: 'bg-destructive/10 text-destructive border-destructive/20',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusStyles[status as keyof typeof statusStyles] || statusStyles.borrowed}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen pt-20 pb-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Book className="text-primary" />
                Borrowed Books
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage all book borrowing records
              </p>
            </div>
            <Button variant="outline" onClick={fetchBorrows} className="gap-2">
              <RefreshCw size={16} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card p-4 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <Clock className="text-amber-500" size={24} />
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {borrows.filter(b => b.status === 'borrowed').length}
                </p>
                <p className="text-sm text-muted-foreground">Currently Borrowed</p>
              </div>
            </div>
          </div>
          <div className="bg-card p-4 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-emerald-500" size={24} />
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {borrows.filter(b => b.status === 'returned').length}
                </p>
                <p className="text-sm text-muted-foreground">Returned</p>
              </div>
            </div>
          </div>
          <div className="bg-card p-4 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <Book className="text-primary" size={24} />
              <div>
                <p className="text-2xl font-bold text-foreground">{borrows.length}</p>
                <p className="text-sm text-muted-foreground">Total Records</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        {borrows.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-lg border border-border">
            <Book size={64} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Borrow Records</h3>
            <p className="text-muted-foreground">
              Borrow records will appear here when students borrow books.
            </p>
          </div>
        ) : (
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium text-foreground">Student</th>
                    <th className="text-left p-4 font-medium text-foreground">Book</th>
                    <th className="text-left p-4 font-medium text-foreground">Borrow Date</th>
                    <th className="text-left p-4 font-medium text-foreground">Due Date</th>
                    <th className="text-left p-4 font-medium text-foreground">Status</th>
                    <th className="text-left p-4 font-medium text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {borrows.map((borrow) => (
                    <tr key={borrow.id} className="border-t border-border hover:bg-muted/30">
                      <td className="p-4">
                        <div className="flex items-start gap-3">
                          <User className="text-muted-foreground mt-1" size={18} />
                          <div>
                            <p className="font-medium text-foreground">
                              {borrow.profile?.full_name || 'Unknown User'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {borrow.profile?.department || 'No department'}
                            </p>
                            {borrow.profile?.roll_number && (
                              <p className="text-xs text-muted-foreground">
                                Roll: {borrow.profile.roll_number}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-foreground">{borrow.book_title}</p>
                        <p className="text-xs text-muted-foreground">ID: {borrow.book_id}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar size={14} />
                          {format(new Date(borrow.borrow_date), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar size={14} />
                          {format(new Date(borrow.due_date), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(borrow.status)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {borrow.status === 'borrowed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkReturned(borrow.id)}
                              className="gap-1"
                            >
                              <CheckCircle size={14} />
                              Return
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(borrow.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default BorrowedBooks;
