from rest_framework import serializers

from .models import Category, Product, Review, Wishlist


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for product categories."""
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image', 'product_count']

    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()


class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for product reviews."""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user_name', 'rating', 'comment', 'created_at']


class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for product listings."""
    category_name = serializers.CharField(source='category.name', read_only=True, default=None)
    in_stock = serializers.BooleanField(read_only=True)
    discount_percentage = serializers.IntegerField(read_only=True)
    savings = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'price', 'old_price', 'image',
                  'category_name', 'in_stock', 'discount_percentage', 'savings',
                  'stock', 'is_featured', 'average_rating', 'created_at']

    def get_average_rating(self, obj):
        reviews = obj.reviews.all()
        if not reviews:
            return 5.0
        return sum([r.rating for r in reviews]) / len(reviews)


class ProductDetailSerializer(serializers.ModelSerializer):
    """Full serializer for product details page."""
    category = CategorySerializer(read_only=True)
    in_stock = serializers.BooleanField(read_only=True)
    discount_percentage = serializers.IntegerField(read_only=True)
    savings = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'description', 'price', 'old_price',
                  'stock', 'image', 'category', 'in_stock', 'discount_percentage',
                  'savings', 'is_featured', 'reviews', 'average_rating', 
                  'created_at', 'updated_at']

    def get_average_rating(self, obj):
        reviews = obj.reviews.all()
        if not reviews:
            return 5.0
        return sum([r.rating for r in reviews]) / len(reviews)


class WishlistSerializer(serializers.ModelSerializer):
    """Serializer for user wishlist."""
    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Wishlist
        fields = ['id', 'product', 'product_id', 'added_at']

    def create(self, validated_data):
        user = self.context['request'].user
        product_id = validated_data.pop('product_id')
        wishlist_item, created = Wishlist.objects.get_or_create(user=user, product_id=product_id)
        return wishlist_item
