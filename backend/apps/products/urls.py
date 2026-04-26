from django.urls import path

from .views import (
    CategoryListView, ProductListView, ProductDetailView,
    ReviewCreateView, WishlistListCreateView, WishlistDestroyView
)

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('products/', ProductListView.as_view(), name='product-list'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('products/reviews/', ReviewCreateView.as_view(), name='review-create'),
    path('wishlist/', WishlistListCreateView.as_view(), name='wishlist-list-create'),
    path('wishlist/<int:pk>/', WishlistDestroyView.as_view(), name='wishlist-delete'),
]
