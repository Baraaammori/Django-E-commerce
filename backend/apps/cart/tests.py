from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from apps.products.models import Category, Product
from .models import Cart, CartItem

User = get_user_model()


class CartAPITest(TestCase):
    """Tests for cart API endpoints."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser', email='test@example.com',
            password='StrongPass123!', first_name='Test', last_name='User'
        )
        self.client.force_authenticate(user=self.user)
        self.category = Category.objects.create(name='Phones', slug='phones')
        self.product = Product.objects.create(
            name='Test Phone', slug='test-phone', category=self.category,
            price=Decimal('10000'), stock=5,
        )

    def test_get_empty_cart(self):
        response = self.client.get('/api/cart/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['items']), 0)

    def test_add_to_cart(self):
        response = self.client.post('/api/cart/items/', {
            'product_id': self.product.pk,
            'quantity': 2,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(response.data['items']), 1)

    def test_add_over_stock(self):
        response = self.client.post('/api/cart/items/', {
            'product_id': self.product.pk,
            'quantity': 100,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_quantity(self):
        self.client.post('/api/cart/items/', {
            'product_id': self.product.pk, 'quantity': 1,
        }, format='json')
        cart_item = CartItem.objects.first()
        response = self.client.put(f'/api/cart/items/{cart_item.pk}/', {
            'quantity': 3,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_remove_item(self):
        self.client.post('/api/cart/items/', {
            'product_id': self.product.pk, 'quantity': 1,
        }, format='json')
        cart_item = CartItem.objects.first()
        response = self.client.delete(f'/api/cart/items/{cart_item.pk}/delete/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['items']), 0)

    def test_cart_requires_auth(self):
        self.client.force_authenticate(user=None)
        response = self.client.get('/api/cart/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
