import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, BookOpen } from 'lucide-react';
import BookCard from '@/components/books/BookCard';
import { BOOK_CATEGORIES, SAMPLE_BOOKS, type Book } from '@/utils/constants';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Books: React.FC = () => {
  const [books, setBooks] = useState<Book[]>(SAMPLE_BOOKS);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let result = books;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (book) =>
          book.title.toLowerCase().includes(term) ||
          book.author.toLowerCase().includes(term) ||
          book.isbn?.toLowerCase().includes(term)
      );
    }

    if (selectedCategory) {
      result = result.filter((book) => book.category === selectedCategory);
    }

    setFilteredBooks(result);
  }, [books, searchTerm, selectedCategory]);

  const handleBorrow = (book: Book) => {
    toast({
      title: 'Book Added to Cart',
      description: `"${book.title}" has been added to your borrowing cart.`,
    });
  };

  const handleViewDetails = (book: Book) => {
    toast({
      title: book.title,
      description: book.description || 'No description available.',
    });
  };

  return (
    <motion.div
      className="min-h-screen pt-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="py-12 lg:py-16 bg-gradient-to-br from-secondary to-background text-center">
        <div className="container">
          <motion.h1
            className="text-3xl lg:text-4xl font-bold text-foreground mb-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Book Collection
          </motion.h1>
          <motion.p
            className="text-lg text-muted-foreground max-w-xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Browse our extensive collection of academic books and resources
          </motion.p>
        </div>
      </div>

      {/* Content */}
      <div className="py-12 lg:py-16">
        <div className="container">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                type="text"
                placeholder="Search by title, author, or ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-muted-foreground" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All Categories</option>
                {BOOK_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="loading-spinner" />
            </div>
          ) : filteredBooks.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                Showing {filteredBooks.length} of {books.length} books
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredBooks.map((book, index) => (
                  <motion.div
                    key={book.book_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <BookCard
                      book={book}
                      onBorrow={handleBorrow}
                      onViewDetails={handleViewDetails}
                    />
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <BookOpen size={64} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Books Found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filter criteria
              </p>
              <Button variant="outline" onClick={() => { setSearchTerm(''); setSelectedCategory(''); }}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Books;
