"""
Management command to seed the database with sample data for development.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.products.models import Category, Product

User = get_user_model()


class Command(BaseCommand):
    help = 'Seeds the database with sample categories, products, and an admin user.'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database...')

        # Create superuser
        if not User.objects.filter(email='admin@megamart.com').exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@megamart.com',
                password='admin123',
                first_name='Admin',
                last_name='User',
            )
            self.stdout.write(self.style.SUCCESS('  Created admin user (admin@megamart.com / admin123)'))

        # Create categories
        categories_data = [
            {'name': 'Smartphones', 'slug': 'smartphones', 'description': 'Latest smartphones and mobile devices'},
            {'name': 'Electronics', 'slug': 'electronics', 'description': 'TVs, cameras, audio and more'},
            {'name': 'Groceries', 'slug': 'groceries', 'description': 'Fresh produce and daily essentials'},
            {'name': 'Fashion', 'slug': 'fashion', 'description': 'Clothing, shoes and accessories'},
            {'name': 'Home & Kitchen', 'slug': 'home-kitchen', 'description': 'Furniture, decor and kitchen appliances'},
            {'name': 'Beauty', 'slug': 'beauty', 'description': 'Cosmetics, skincare and personal care'},
            {'name': 'Watches', 'slug': 'watches', 'description': 'Smart watches and luxury timepieces'},
            {'name': 'Accessories', 'slug': 'accessories', 'description': 'Phone cases, chargers and more'},
        ]

        categories = {}
        for cat_data in categories_data:
            cat, created = Category.objects.get_or_create(
                slug=cat_data['slug'],
                defaults=cat_data
            )
            categories[cat.slug] = cat
            if created:
                self.stdout.write(f'  Created category: {cat.name}')

        # Create products
        products_data = [
            {'name': 'Galaxy S22 Ultra', 'slug': 'galaxy-s22-ultra', 'category': 'smartphones',
             'price': 32999, 'old_price': 74999, 'stock': 25, 'is_featured': True,
             'description': 'The Galaxy S22 Ultra features the power of Note with a built-in S Pen and pro-grade camera.'},
            {'name': 'Galaxy M13 (4GB | 64GB)', 'slug': 'galaxy-m13', 'category': 'smartphones',
             'price': 10499, 'old_price': 14999, 'stock': 50,
             'description': 'Samsung Galaxy M13 with 6000mAh battery and 50MP triple camera.'},
            {'name': 'Galaxy M33 (4GB | 64GB)', 'slug': 'galaxy-m33', 'category': 'smartphones',
             'price': 16999, 'old_price': 24999, 'stock': 40,
             'description': 'Galaxy M33 5G with Exynos 1280 processor and 120Hz display.'},
            {'name': 'Galaxy M53 (4GB | 64GB)', 'slug': 'galaxy-m53', 'category': 'smartphones',
             'price': 31999, 'old_price': 40999, 'stock': 30,
             'description': 'Galaxy M53 5G with 108MP camera and sAMOLED+ display.'},
            {'name': 'Apple iPhone 13 (128GB)', 'slug': 'apple-iphone-13', 'category': 'smartphones',
             'price': 52999, 'old_price': 69900, 'stock': 20, 'is_featured': True,
             'description': 'iPhone 13 with A15 Bionic chip, advanced dual-camera system, and Super Retina XDR display.'},
            {'name': 'Samsung 108cm (43 inches) Crystal 4K TV', 'slug': 'samsung-43-tv', 'category': 'electronics',
             'price': 29990, 'old_price': 47900, 'stock': 15, 'is_featured': True,
             'description': 'Samsung Crystal 4K UHD Smart TV with dynamic crystal color and HDR.'},
            {'name': 'Sony Alpha ILCE-6100Y Camera', 'slug': 'sony-alpha-6100', 'category': 'electronics',
             'price': 78990, 'old_price': 89990, 'stock': 10,
             'description': 'Sony Alpha a6100 mirrorless camera with fast autofocus and real-time eye tracking.'},
            {'name': 'Boat Airdopes 141 Bluetooth Earbuds', 'slug': 'boat-airdopes-141', 'category': 'accessories',
             'price': 1299, 'old_price': 4490, 'stock': 100,
             'description': 'Boat Airdopes 141 TWS earbuds with 42H playtime and ENx noise cancellation.'},
            {'name': 'Puma Men Running Shoes', 'slug': 'puma-running-shoes', 'category': 'fashion',
             'price': 2199, 'old_price': 4999, 'stock': 60,
             'description': 'Puma lightweight running shoes with SoftFoam+ cushioning technology.'},
            {'name': 'Fresh Organic Apples (1kg)', 'slug': 'organic-apples', 'category': 'groceries',
             'price': 299, 'old_price': 450, 'stock': 200,
             'description': 'Premium organic apples, fresh from the farm. Rich in fiber and antioxidants.'},
            {'name': 'Noise ColorFit Pro 4 Smartwatch', 'slug': 'noise-colorfit-pro4', 'category': 'watches',
             'price': 3499, 'old_price': 5999, 'stock': 45, 'is_featured': True,
             'description': 'Noise ColorFit Pro 4 with 1.72 inch TruView display and Bluetooth calling.'},
            {'name': 'Lakme Absolute Skin Dew Serum Foundation', 'slug': 'lakme-foundation', 'category': 'beauty',
             'price': 799, 'old_price': 1050, 'stock': 80,
             'description': 'Lakme Absolute Skin Dew Serum Foundation for a natural, dewy finish.'},
            {'name': 'Prestige Electric Kettle 1.5L', 'slug': 'prestige-kettle', 'category': 'home-kitchen',
             'price': 699, 'old_price': 1299, 'stock': 70,
             'description': 'Prestige 1.5L electric kettle with auto shut-off and stainless steel body.'},
            {'name': 'Xiaomi Redmi Note 12 Pro 5G', 'slug': 'redmi-note-12-pro', 'category': 'smartphones',
             'price': 24999, 'old_price': 29999, 'stock': 35,
             'description': 'Redmi Note 12 Pro 5G with 50MP IMX766 camera and 120Hz AMOLED display.'},
            {'name': 'JBL Flip 6 Portable Speaker', 'slug': 'jbl-flip-6', 'category': 'electronics',
             'price': 11999, 'old_price': 14999, 'stock': 25,
             'description': 'JBL Flip 6 portable Bluetooth speaker with powerful sound and IP67 waterproof rating.'},
        ]

        for prod_data in products_data:
            cat_slug = prod_data.pop('category')
            cat = categories.get(cat_slug)
            prod, created = Product.objects.get_or_create(
                slug=prod_data['slug'],
                defaults={**prod_data, 'category': cat}
            )
            if created:
                self.stdout.write(f'  Created product: {prod.name}')

        self.stdout.write(self.style.SUCCESS('\nDatabase seeded successfully!'))
        self.stdout.write(self.style.WARNING('\nAdmin login: admin@megamart.com / admin123'))
