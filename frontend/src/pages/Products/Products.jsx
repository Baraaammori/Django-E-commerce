import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { Filter, ChevronDown } from 'lucide-react';
import { productsService } from '../../services/api';
import './Products.css';

export const Products = () => {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || '');
  const [searchQuery, setSearchQuery] = useState(searchParam || '');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Sync state with URL param
  useEffect(() => {
    if (categoryParam !== null) {
      setSelectedCategory(categoryParam);
      setPage(1);
    }
  }, [categoryParam]);

  useEffect(() => {
    if (searchParam !== null) {
      setSearchQuery(searchParam);
      setPage(1);
    } else {
      setSearchQuery('');
    }
  }, [searchParam]);

  useEffect(() => {
    fetchProducts();
    window.scrollTo(0, 0);
  }, [selectedCategory, searchQuery, sort, page]);

  const fetchCategories = async () => {
    try {
      const res = await productsService.getCategories();
      setCategories(res.data);
    } catch (error) {
      console.error("Failed to load categories", error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { page };
      if (selectedCategory) params.category__slug = selectedCategory;
      if (searchQuery) params.search = searchQuery;
      if (sort) params.ordering = sort;
      if (priceRange.min) params.price__gte = priceRange.min;
      if (priceRange.max) params.price__lte = priceRange.max;

      const res = await productsService.getAll(params);
      setProducts(res.data.results);
      setTotalItems(res.data.count);
      setTotalPages(Math.ceil(res.data.count / 12));
    } catch (error) {
      console.error("Failed to load products", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPriceFilter = () => {
    setPage(1);
    fetchProducts();
  };

  return (
    <div className="products-page">
      {/* Breadcrumb Header */}
      <div className="page-header">
        <div className="container">
          <h1>All Products</h1>
          <div className="breadcrumb">
            <span>Home</span> / <span>Products</span>
          </div>
        </div>
      </div>

      <div className="container products-layout">
        {/* Sidebar Filters */}
        <aside className={`products-sidebar ${isMobileFilterOpen ? 'open' : ''}`}>
          <div className="sidebar-header mobile-only">
            <h3>Filters</h3>
            <button onClick={() => setIsMobileFilterOpen(false)}>×</button>
          </div>

          <div className="filter-group">
            <h3>Categories</h3>
            <div className="filter-options">
              <label className="checkbox-label">
                <input 
                  type="radio" 
                  name="category" 
                  checked={selectedCategory === ''} 
                  onChange={() => { setSelectedCategory(''); setPage(1); }} 
                />
                <span className="checkmark radio-mark"></span>
                All Categories
              </label>
              {categories.map(cat => (
                <label key={cat.id} className="checkbox-label">
                  <input 
                    type="radio" 
                    name="category"
                    checked={selectedCategory === cat.slug}
                    onChange={() => { setSelectedCategory(cat.slug); setPage(1); }}
                  />
                  <span className="checkmark radio-mark"></span>
                  {cat.name} ({cat.product_count})
                </label>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h3>Price Range</h3>
            <div className="price-inputs">
              <input 
                type="number" 
                placeholder="Min $" 
                value={priceRange.min}
                onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
              />
              <span>-</span>
              <input 
                type="number" 
                placeholder="Max $" 
                value={priceRange.max}
                onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
              />
            </div>
            <button className="apply-btn mt-3" onClick={handleApplyPriceFilter}>Apply</button>
          </div>

          <div className="filter-group">
            <h3>Availability</h3>
            <div className="filter-options">
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked />
                <span className="checkmark"></span>
                In Stock
              </label>
              <label className="checkbox-label">
                <input type="checkbox" />
                <span className="checkmark"></span>
                Out of Stock
              </label>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="products-main">
          {/* Toolbar */}
          <div className="products-toolbar">
            <button 
              className="mobile-filter-btn"
              onClick={() => setIsMobileFilterOpen(true)}
            >
              <Filter size={18} /> Filters
            </button>
            
            <p className="results-count">Showing {products.length > 0 ? (page - 1) * 12 + 1 : 0}–{Math.min(page * 12, totalItems)} of {totalItems} results</p>
            
            <div className="sort-dropdown">
              <span>Sort by:</span>
              <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}>
                <option value="-created_at">Newest Arrivals</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          <div className="products-grid">
            {loading ? (
              <p>Loading products...</p>
            ) : products.length === 0 ? (
              <p>No products found.</p>
            ) : (
              products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="page-btn" 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                ← Prev
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button 
                  key={p} 
                  className={`page-btn ${page === p ? 'active' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              
              <button 
                className="page-btn next"
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                Next →
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
