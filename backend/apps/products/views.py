from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Category, Product, Review, Wishlist
from .serializers import (
    CategorySerializer, ProductListSerializer, 
    ProductDetailSerializer, ReviewSerializer, WishlistSerializer
)


class CategoryListView(generics.ListAPIView):
    """GET /api/categories/ - List all active categories."""
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None  # Return all categories without pagination


class ProductListView(generics.ListAPIView):
    """GET /api/products/ - List products with filtering, search, sorting, and pagination."""
    queryset = Product.objects.filter(is_active=True).select_related('category')
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = {
        'category__slug': ['exact'],
        'price': ['gte', 'lte'],
        'stock': ['gt'],
        'is_featured': ['exact'],
    }
    search_fields = ['name', 'description', 'category__name']
    ordering_fields = ['price', 'created_at', 'name']
    ordering = ['-created_at']


class ProductDetailView(generics.RetrieveAPIView):
    """GET /api/products/{id}/ - Get full product details."""
    queryset = Product.objects.filter(is_active=True).select_related('category')
    serializer_class = ProductDetailSerializer
    permission_classes = [permissions.AllowAny]


class ReviewCreateView(generics.CreateAPIView):
    """POST /api/products/reviews/ - Add a product review."""
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        product_id = self.request.data.get('product_id')
        serializer.save(user=self.request.user, product_id=product_id)


class WishlistListCreateView(generics.ListCreateAPIView):
    """GET /api/wishlist/ - List user wishlist. POST /api/wishlist/ - Add to wishlist."""
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user).select_related('product')


class WishlistDestroyView(generics.DestroyAPIView):
    """DELETE /api/wishlist/{id}/ - Remove from wishlist."""
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user)
