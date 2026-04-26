from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from .models import Category, Product

User = get_user_model()


class ProductModelTest(TestCase):
    """Tests for Product model properties."""

    def setUp(self):
        self.category = Category.objects.create(name='Phones', slug='phones')
        self.product = Product.objects.create(
            name='Test Phone', slug='test-phone', category=self.category,
            price=Decimal('10000'), old_price=Decimal('20000'), stock=10,
        )

    def test_in_stock_true(self):
        self.assertTrue(self.product.in_stock)

    def test_in_stock_false(self):
        self.product.stock = 0
        self.assertFalse(self.product.in_stock)

    def test_discount_percentage(self):
        self.assertEqual(self.product.discount_percentage, 50)

    def test_savings(self):
        self.assertEqual(self.product.savings, Decimal('10000'))


class ProductAPITest(TestCase):
    """Tests for product API endpoints."""

    def setUp(self):
        self.client = APIClient()
        self.category = Category.objects.create(name='Electronics', slug='electronics')
        for i in range(15):
            Product.objects.create(
                name=f'Product {i}', slug=f'product-{i}', category=self.category,
                price=Decimal(str((i + 1) * 1000)), stock=10 + i,
            )

    def test_list_products(self):
        response = self.client.get('/api/products/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)  # Paginated
        self.assertEqual(len(response.data['results']), 12)  # PAGE_SIZE=12

    def test_product_detail(self):
        product = Product.objects.first()
        response = self.client.get(f'/api/products/{product.pk}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], product.name)

    def test_search_products(self):
        Product.objects.create(
            name='Galaxy S22', slug='galaxy-s22', category=self.category,
            price=Decimal('32999'), stock=5,
        )
        response = self.client.get('/api/products/?search=Galaxy')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(any('Galaxy' in p['name'] for p in response.data['results']))

    def test_filter_by_category(self):
        response = self.client.get('/api/products/?category__slug=electronics')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_sort_by_price(self):
        response = self.client.get('/api/products/?ordering=price')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        prices = [Decimal(str(p['price'])) for p in response.data['results']]
        self.assertEqual(prices, sorted(prices))

    def test_categories_list(self):
        response = self.client.get('/api/categories/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
