from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from apps.products.models import Category, Product
from apps.cart.models import Cart, CartItem
from apps.users.models import Address
from .models import Order

User = get_user_model()


class OrderAPITest(TestCase):
    """Tests for order/checkout API endpoints."""

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
        self.address = Address.objects.create(
            user=self.user, label='Home', full_name='Test User',
            street_address='123 Test St', city='Test City',
            state='TS', postal_code='12345', country='US',
        )

        # Add item to cart
        self.cart = Cart.objects.create(user=self.user)
        CartItem.objects.create(cart=self.cart, product=self.product, quantity=2)

    def test_checkout_success(self):
        response = self.client.post('/api/orders/checkout/', {
            'address_id': self.address.pk,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'pending')

        # Verify stock was decremented
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 3)

        # Verify cart is empty
        self.assertEqual(self.cart.items.count(), 0)

    def test_checkout_empty_cart(self):
        self.cart.items.all().delete()
        response = self.client.post('/api/orders/checkout/', {
            'address_id': self.address.pk,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_checkout_over_stock(self):
        cart_item = self.cart.items.first()
        cart_item.quantity = 100
        cart_item.save()
        response = self.client.post('/api/orders/checkout/', {
            'address_id': self.address.pk,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_checkout_price_frozen(self):
        self.client.post('/api/orders/checkout/', {
            'address_id': self.address.pk,
        }, format='json')
        order = Order.objects.first()
        order_item = order.items.first()
        # Price is frozen at purchase time
        self.assertEqual(order_item.unit_price, Decimal('10000'))

        # Even if product price changes later
        self.product.price = Decimal('50000')
        self.product.save()
        order_item.refresh_from_db()
        self.assertEqual(order_item.unit_price, Decimal('10000'))

    def test_list_orders(self):
        self.client.post('/api/orders/checkout/', {
            'address_id': self.address.pk,
        }, format='json')
        response = self.client.get('/api/orders/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_order_detail(self):
        checkout_response = self.client.post('/api/orders/checkout/', {
            'address_id': self.address.pk,
        }, format='json')
        order_id = checkout_response.data['id']
        response = self.client.get(f'/api/orders/{order_id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['items']), 1)

    def test_checkout_requires_auth(self):
        self.client.force_authenticate(user=None)
        response = self.client.post('/api/orders/checkout/', {
            'address_id': self.address.pk,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
