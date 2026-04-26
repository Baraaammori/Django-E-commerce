"""
Management command to seed the database with huge data and photos from DummyJSON API.
"""
import os
import requests
from io import BytesIO
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.utils.text import slugify
from apps.products.models import Category, Product

class Command(BaseCommand):
    help = 'Seeds the database with huge amounts of products and photos from DummyJSON.'

    def handle(self, *args, **options):
        self.stdout.write('Fetching products from DummyJSON API...')
        
        try:
            response = requests.get('https://dummyjson.com/products?limit=150')
            response.raise_for_status()
            data = response.json()
            products_data = data.get('products', [])
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Failed to fetch data: {e}'))
            return

        self.stdout.write(f'Found {len(products_data)} products. Processing...')

        # Process each product
        for item in products_data:
            # 1. Create or get Category
            category_name = item.get('category', 'Uncategorized').replace('-', ' ').title()
            category_slug = slugify(category_name)
            
            category, created = Category.objects.get_or_create(
                slug=category_slug,
                defaults={'name': category_name, 'description': f'{category_name} category'}
            )
            if created:
                self.stdout.write(f'Created category: {category.name}')

            # 2. Product Name and Slug
            title = item.get('title', 'Unknown Product')
            base_slug = slugify(title)
            slug = base_slug
            counter = 1
            while Product.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1

            # 3. Prices
            # DummyJSON returns price in dollars, let's use it or scale it up to match rupees like before
            # Let's scale it by 80 to make it realistic for INR or just use the raw value
            price_val = Decimal(str(item.get('price', 10))) * Decimal('80')
            discount_pct = Decimal(str(item.get('discountPercentage', 0)))
            
            # calculate old price based on discount
            if discount_pct > 0:
                old_price_val = price_val / (Decimal('1') - (discount_pct / Decimal('100')))
            else:
                old_price_val = price_val

            # 4. Stock
            stock = item.get('stock', 10)

            # 5. Image Download
            image_url = item.get('thumbnail')
            image_content = None
            image_name = ''
            if image_url:
                try:
                    img_response = requests.get(image_url, timeout=10)
                    if img_response.status_code == 200:
                        image_name = f"{slug}.jpg"
                        image_content = ContentFile(img_response.content)
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f'Could not download image for {title}: {e}'))

            # 6. Create Product
            product, p_created = Product.objects.get_or_create(
                slug=slug,
                defaults={
                    'name': title,
                    'category': category,
                    'description': item.get('description', ''),
                    'price': round(price_val, 2),
                    'old_price': round(old_price_val, 2),
                    'stock': stock,
                    'is_featured': item.get('rating', 0) > 4.5
                }
            )

            if p_created:
                if image_content:
                    product.image.save(image_name, image_content, save=True)
                self.stdout.write(f'Created product: {product.name}')
            else:
                self.stdout.write(f'Product already exists: {product.name}')

        self.stdout.write(self.style.SUCCESS('\nHuge database seeding completed successfully!'))
