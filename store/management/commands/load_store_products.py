from django.core.management.base import BaseCommand
from store.models import ProductCategory, Product

class Command(BaseCommand):
    help = 'Load ridiculous store products'
    
    def add_arguments(self, parser):
        parser.add_argument('--clear', action='store_true', help='Clear existing products first')
    
    def handle(self, *args, **options):
        if options['clear']:
            Product.objects.all().delete()
            ProductCategory.objects.all().delete()
            self.stdout.write('Cleared existing products')
        
        # Create categories
        categories = {
            'Useless Gadgets': 'Completely pointless electronic devices',
            'Fake Food': 'Inedible food-like substances', 
            'Broken Dreams': 'Shattered hopes and aspirations',
            'Digital Nonsense': 'Virtual items that do absolutely nothing',
            'Overpriced Junk': 'Expensive garbage for the discerning fool'
        }
        
        for name, desc in categories.items():
            cat, _ = ProductCategory.objects.get_or_create(name=name, defaults={'description': desc})
        
        # Ridiculous products
        products = [
            # Useless Gadgets
            ('Bluetooth-Enabled Rock', 'A rock that connects to WiFi but does nothing else', 150, 'Useless Gadgets', 'COMMON', 25),
            ('Solar-Powered Flashlight', 'Only works in daylight when you don\'t need it', 89, 'Useless Gadgets', 'RARE', 0),
            ('Waterproof Tea Bags', 'For when you want tea that tastes like nothing', 200, 'Useless Gadgets', 'EPIC', 50),
            
            # Fake Food  
            ('Dehydrated Water', 'Just add water to make water!', 75, 'Fake Food', 'COMMON', 10),
            ('Diet Air', 'Zero calories, zero nutrition, zero point', 300, 'Fake Food', 'LEGENDARY', 80),
            ('Gluten-Free Gluten', 'The contradiction you\'ve been waiting for', 125, 'Fake Food', 'RARE', 15),
            
            # Broken Dreams
            ('Your Childhood Ambitions', 'Remember when you wanted to be an astronaut?', 500, 'Broken Dreams', 'EPIC', 0),
            ('A Stable Job Market', 'Extinct since 2008', 999, 'Broken Dreams', 'LEGENDARY', 90),
            ('Work-Life Balance', 'Mythical creature, possibly fake', 750, 'Broken Dreams', 'EPIC', 60),
            
            # Digital Nonsense
            ('NFT of This Purchase', 'Proof you bought something worthless', 250, 'Digital Nonsense', 'RARE', 30),
            ('Cryptocurrency Mining Rig (Broken)', 'Generates heat and regret', 1200, 'Digital Nonsense', 'LEGENDARY', 0),
            ('Premium Subscription to Nothing', 'Monthly fee for absolutely nothing', 50, 'Digital Nonsense', 'COMMON', 20),
            
            # Overpriced Junk
            ('Designer Lint', 'From the pockets of fashion influencers', 800, 'Overpriced Junk', 'EPIC', 40),
            ('Artisanal Dust Bunny', 'Hand-crafted under-bed ecosystem', 600, 'Overpriced Junk', 'RARE', 25),
            ('Limited Edition Air Jordans (No Shoes)', 'Just the limited edition part', 1500, 'Overpriced Junk', 'LEGENDARY', 70),
        ]
        
        created_count = 0
        for name, desc, price, cat_name, rarity, discount in products:
            category = ProductCategory.objects.get(name=cat_name)
            product, created = Product.objects.get_or_create(
                name=name,
                defaults={
                    'description': desc,
                    'price_coins': price,
                    'category': category,
                    'rarity': rarity,
                    'fake_discount': discount
                }
            )
            if created:
                created_count += 1
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully loaded {created_count} ridiculous products!')
        )