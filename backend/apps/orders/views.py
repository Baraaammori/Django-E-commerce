from decimal import Decimal

from django.db import transaction
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Order, OrderItem
from .serializers import OrderListSerializer, OrderDetailSerializer, CheckoutSerializer
from apps.cart.models import Cart
from apps.users.models import Address


class CheckoutView(APIView):
    """POST /api/orders/checkout/ - Convert cart to order."""
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Get address
        try:
            address = Address.objects.get(
                pk=serializer.validated_data['address_id'],
                user=request.user
            )
        except Address.DoesNotExist:
            return Response(
                {'detail': 'Address not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get cart
        try:
            cart = Cart.objects.get(user=request.user)
        except Cart.DoesNotExist:
            return Response(
                {'detail': 'Your cart is empty.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        cart_items = cart.items.select_related('product').all()
        if not cart_items.exists():
            return Response(
                {'detail': 'Your cart is empty.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Stock validation
        for item in cart_items:
            if item.quantity > item.product.stock:
                return Response(
                    {'detail': f'"{item.product.name}" only has {item.product.stock} in stock.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Calculate totals
        subtotal = sum(item.product.price * item.quantity for item in cart_items)
        tax = subtotal * Decimal('0.18')  # 18% tax
        total = subtotal + tax

        # Create order with frozen address snapshot
        order = Order.objects.create(
            user=request.user,
            subtotal=subtotal,
            tax=tax,
            total=total,
            shipping_name=address.full_name,
            shipping_address=address.street_address,
            shipping_city=address.city,
            shipping_state=address.state,
            shipping_postal_code=address.postal_code,
            shipping_country=address.country,
        )

        # Create order items with frozen prices and decrement stock
        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                product_name=item.product.name,
                quantity=item.quantity,
                unit_price=item.product.price,
            )
            # Decrement stock
            item.product.stock -= item.quantity
            item.product.save()

        # Clear the cart
        cart_items.delete()

        return Response(
            OrderDetailSerializer(order).data,
            status=status.HTTP_201_CREATED
        )


class OrderListView(generics.ListAPIView):
    """GET /api/orders/ - List the current user's orders."""
    serializer_class = OrderListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


class OrderDetailView(generics.RetrieveAPIView):
    """GET /api/orders/{id}/ - Get full order details."""
    serializer_class = OrderDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)
