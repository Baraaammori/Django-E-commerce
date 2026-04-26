from django.db.models import Sum, Count, F
from django.db.models.functions import TruncMonth
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.orders.models import Order, OrderItem


class AnalyticsSummaryView(APIView):
    """GET /api/analytics/summary/ - Admin analytics dashboard data."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        orders = Order.objects.exclude(status='cancelled')

        total_orders = orders.count()
        total_revenue = orders.aggregate(total=Sum('total'))['total'] or 0

        # Revenue by month (last 12 months)
        revenue_over_time = (
            orders
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(revenue=Sum('total'), count=Count('id'))
            .order_by('-month')[:12]
        )

        # Top selling products
        top_products = (
            OrderItem.objects
            .filter(order__in=orders)
            .values('product_name')
            .annotate(
                total_quantity=Sum('quantity'),
                total_revenue=Sum(F('unit_price') * F('quantity'))
            )
            .order_by('-total_quantity')[:10]
        )

        return Response({
            'total_orders': total_orders,
            'total_revenue': float(total_revenue),
            'revenue_over_time': list(revenue_over_time),
            'top_products': list(top_products),
        })
