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

        # Reward assets live under: frontend/static/frontend/rewards
        static_rewards_fs_dir = Path(settings.BASE_DIR) / 'frontend' / 'static' / 'frontend' / 'rewards'
        static_rewards_url_base = f"{settings.STATIC_URL.rstrip('/')}/frontend/rewards/"

        def normalize_media_url(raw_value: str):
            """
            Convert a Windows path or bare filename into a STATIC_URL-based web path.
            Leaves http(s) URLs and already-static URLs as-is.
            Returns (url, expected_fs_path_or_None).
            """
            if not raw_value:
                return None, None

            raw_posix = raw_value.replace('\', '/')

            # Already a web URL
            if raw_posix.startswith('http://') or raw_posix.startswith('https://'):
                return raw_posix, None

            # Already static-relative
            if raw_posix.startswith(settings.STATIC_URL):
                return raw_posix, None

            # Treat as local path or filename
            basename = os.path.basename(raw_posix)
            url = static_rewards_url_base + basename
            expected_fs_path = static_rewards_fs_dir / basename
            return url, expected_fs_path

        created = 0
        skipped = 0

        # Text rewards (unchanged)
        for item in rewards_data.get('text_fish', []):
            message = item.get('text_fish_message')
            if not message:
                self.stdout.write(self.style.WARNING('Skipping text_fish entry with no message'))
                skipped += 1
                continue

            _, was_created = FishReward.objects.get_or_create(
                message=message,
                defaults={'fish_type': 'TEXT', 'media_url': None},
            )
            created += 1 if was_created else 0

        # Image rewards
        for item in rewards_data.get('img_fish', []):
            raw_media = item.get('img_fish_url') or item.get('img_fish_file')  # support either key
            media_url, expected_fs_path = normalize_media_url(raw_media)

            if not media_url:
                self.stdout.write(self.style.WARNING('Skipping img_fish entry with no media value'))
                skipped += 1
                continue

            if expected_fs_path and not expected_fs_path.exists():
                self.stdout.write(self.style.WARNING(f'Image not found in static dir: {expected_fs_path}'))

            _, was_created = FishReward.objects.get_or_create(
                media_url=media_url,
                defaults={'fish_type': 'IMG', 'message': None},
            )
            created += 1 if was_created else 0

        # GIF rewards
        for item in rewards_data.get('gif_fish', []):
            raw_media = item.get('gif_fish_url') or item.get('gif_fish_file')
            media_url, expected_fs_path = normalize_media_url(raw_media)

            if not media_url:
                self.stdout.write(self.style.WARNING('Skipping gif_fish entry with no media value'))
                skipped += 1
                continue

            if expected_fs_path and not expected_fs_path.exists():
                self.stdout.write(self.style.WARNING(f'GIF not found in static dir: {expected_fs_path}'))

            _, was_created = FishReward.objects.get_or_create(
                media_url=media_url,
                defaults={'fish_type': 'GIF', 'message': None},
            )
            created += 1 if was_created else 0

        self.stdout.write(self.style.SUCCESS(f'Successfully processed rewards. Created: {created}, Skipped: {skipped}'))
