from rest_framework import serializers

from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for order items."""
    line_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'unit_price', 'line_total']
        read_only_fields = fields


class OrderListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for order listings."""
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ['id', 'status', 'total', 'item_count', 'created_at']

    def get_item_count(self, obj):
        return obj.items.count()


class OrderDetailSerializer(serializers.ModelSerializer):
    """Full serializer for order details."""
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'status', 'subtotal', 'tax', 'total', 'items',
                  'shipping_name', 'shipping_address', 'shipping_city',
                  'shipping_state', 'shipping_postal_code', 'shipping_country',
                  'created_at', 'updated_at']
        read_only_fields = fields


class CheckoutSerializer(serializers.Serializer):
    """Serializer for the checkout process."""
    address_id = serializers.IntegerField(required=True)
