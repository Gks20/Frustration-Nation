import json
import os
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.conf import settings

from database.models import FishReward


class Command(BaseCommand):
    help = 'Loads fish rewards from RewardFish.json into the database.'

    def handle(self, *args, **options):
        json_file_path = Path(settings.BASE_DIR) / 'database' / 'RewardFish.json'

        if not json_file_path.exists():
            raise CommandError(f'File not found at {json_file_path}')

        try:
            with open(json_file_path, 'r', encoding='utf-8') as file:
                rewards_data = json.load(file)
        except json.JSONDecodeError as exc:
            raise CommandError(f'Invalid JSON in file at {json_file_path}: {exc}')

        if not isinstance(rewards_data, dict):
            raise CommandError('Expected JSON to be an object with keys: text_fish, img_fish, gif_fish')

        created = 0
        skipped = 0

        # Process text rewards
        for item in rewards_data.get('text_fish', []):
            message = item.get('text_fish_message')
            if not message:
                self.stdout.write(self.style.WARNING('Skipping text_fish entry with no message'))
                skipped += 1
                continue

            obj, was_created = FishReward.objects.get_or_create(
                message=message,
                defaults={'fish_type': 'TEXT', 'media_url': None},
            )
            created += 1 if was_created else 0

        # Process image rewards
        for item in rewards_data.get('img_fish', []):
            media_url = item.get('img_fish_url')
            if not media_url:
                self.stdout.write(self.style.WARNING('Skipping img_fish entry with no img_fish_url'))
                skipped += 1
                continue

            obj, was_created = FishReward.objects.get_or_create(
                media_url=media_url,
                defaults={'fish_type': 'IMG', 'message': None},
            )
            created += 1 if was_created else 0

        # Process gif rewards
        for item in rewards_data.get('gif_fish', []):
            media_url = item.get('gif_fish_url')
            if not media_url:
                self.stdout.write(self.style.WARNING('Skipping gif_fish entry with no gif_fish_url'))
                skipped += 1
                continue

            obj, was_created = FishReward.objects.get_or_create(
                media_url=media_url,
                defaults={'fish_type': 'GIF', 'message': None},
            )
            created += 1 if was_created else 0

        self.stdout.write(self.style.SUCCESS(f'Successfully processed rewards. Created: {created}, Skipped: {skipped}'))
