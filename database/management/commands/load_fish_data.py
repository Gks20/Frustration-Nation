import json
import os
from django.core.management.base import BaseCommand
from django.conf import settings
from database.models import FishReward

class Command(BaseCommand):
    """Load fish data from RewardFish.json into database."""
    help = 'Load fish reward data from RewardFish.json file'

    def add_arguments(self, parser):
        """Add --clear flag to remove existing data before loading."""
        parser.add_argument(
            '--clear',
            action='store_true',
            dest='clear',
            help='Clear existing fish reward data before loading new data'
        )

    def handle(self, *args, **options):
        """Load fish data from JSON file into database."""
        # Build path to JSON file
        json_file_path = os.path.join(settings.BASE_DIR, 'database', 'RewardFish.json')
        
        # Check file exists
        if not os.path.exists(json_file_path):
            self.stdout.write(
                self.style.ERROR(f'RewardFish.json file not found at: {json_file_path}')
            )
            return

        # Clear existing data if --clear flag used
        if options['clear']:
            deleted_count = FishReward.objects.count()
            FishReward.objects.all().delete()
            self.stdout.write(
                self.style.WARNING(f'Cleared {deleted_count} existing fish rewards')
            )

        # Load JSON data
        try:
            with open(json_file_path, 'r', encoding='utf-8') as file:
                fish_data = json.load(file)
        except json.JSONDecodeError as e:
            self.stdout.write(
                self.style.ERROR(f'Error parsing JSON file: {e}')
            )
            return
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error reading JSON file: {e}')
            )
            return

        # Track counts and errors
        text_fish_count = 0
        image_fish_count = 0
        gif_fish_count = 0
        errors = []

        # Process text fish data
        if 'text_fish' in fish_data:
            for fish in fish_data['text_fish']:
                try:
                    fish_reward, created = FishReward.objects.get_or_create(
                        fish_type='TEXT',
                        message=fish.get('text_fish_message', ''),
                        defaults={'media_url': None}
                    )
                    if created:
                        text_fish_count += 1
                        self.stdout.write(f'Created text fish: {fish.get("text_fish_id", "unknown")}')
                except Exception as e:
                    error_msg = f'Error creating text fish {fish.get("text_fish_id", "unknown")}: {e}'
                    errors.append(error_msg)

        # Process image fish data
        if 'img_fish' in fish_data:
            for fish in fish_data['img_fish']:
                try:
                    # Convert absolute path to relative static path
                    original_url = fish.get('img_fish_url', '')
                    relative_url = self._convert_to_relative_path(original_url)
                    
                    fish_reward, created = FishReward.objects.get_or_create(
                        fish_type='IMG',
                        media_url=relative_url,
                        defaults={'message': None}
                    )
                    if created:
                        image_fish_count += 1
                        self.stdout.write(f'Created image fish: {fish.get("img_fish_id", "unknown")}')
                except Exception as e:
                    error_msg = f'Error creating image fish {fish.get("img_fish_id", "unknown")}: {e}'
                    errors.append(error_msg)

        # Process GIF fish data
        if 'gif_fish' in fish_data:
            for fish in fish_data['gif_fish']:
                try:
                    # Convert absolute path to relative static path
                    original_url = fish.get('gif_fish_url', '')
                    relative_url = self._convert_to_relative_path(original_url)
                    
                    fish_reward, created = FishReward.objects.get_or_create(
                        fish_type='GIF',
                        media_url=relative_url,
                        defaults={'message': None}
                    )
                    if created:
                        gif_fish_count += 1
                        self.stdout.write(f'Created GIF fish: {fish.get("gif_fish_id", "unknown")}')
                except Exception as e:
                    error_msg = f'Error creating GIF fish {fish.get("gif_fish_id", "unknown")}: {e}'
                    errors.append(error_msg)

        # Show results
        self.stdout.write(self.style.SUCCESS('\n--- Loading Complete ---'))
        self.stdout.write(f'Text fish loaded: {text_fish_count}')
        self.stdout.write(f'Image fish loaded: {image_fish_count}')
        self.stdout.write(f'GIF fish loaded: {gif_fish_count}')
        self.stdout.write(f'Total fish rewards: {text_fish_count + image_fish_count + gif_fish_count}')
        
        # Show errors if any
        if errors:
            self.stdout.write(self.style.WARNING(f'\nErrors encountered: {len(errors)}'))
            for error in errors:
                self.stdout.write(self.style.ERROR(f'  - {error}'))
        else:
            self.stdout.write(self.style.SUCCESS('No errors encountered during loading'))

    def _convert_to_relative_path(self, absolute_path):
        """Convert absolute paths to Django static file paths."""
        if not absolute_path:
            return ''
        
        # Extract filename from absolute path
        filename = os.path.basename(absolute_path)
        
        # Create Django static path
        relative_path = f'database/rewards/{filename}'
        
        return relative_path