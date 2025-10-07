from django.core.management.base import BaseCommand
from events.models import EventType, PopupEvent, FakeSystemAlert

class Command(BaseCommand):
    help = 'Load annoying events and popups'
    
    def add_arguments(self, parser):
        parser.add_argument('--clear', action='store_true', help='Clear existing events first')
    
    def handle(self, *args, **options):
        if options['clear']:
            PopupEvent.objects.all().delete()
            EventType.objects.all().delete()
            FakeSystemAlert.objects.all().delete()
            self.stdout.write('Cleared existing events')
        
        # Create event types - RE-ENABLED
        event_types = [
            ('Random Interruptions', 'Popups that appear at the worst possible moments', 0.12),
            ('Fake Urgency', 'Events that pretend to be important', 0.08),
            ('Useless Notifications', 'Notifications about nothing important', 0.15),
            ('Annoying Offers', 'Terrible deals you dont want', 0.10),
            ('System Annoyances', 'Fake system warnings and alerts', 0.06)
        ]
        
        for name, desc, prob in event_types:
            event_type, _ = EventType.objects.get_or_create(
                name=name, 
                defaults={'description': desc, 'trigger_probability': prob, 'is_active': True}
            )
        
        # Create annoying popups
        popups = [
            ('URGENT: You Won Something!', 'Congratulations! You won absolutely nothing! Click here to claim your void!', 'AD', 'HIGH', 'Random Interruptions', True, None, True),
            ('Hot Singles in Your Database!', '3 records are waiting to connect with you! They have foreign keys!', 'AD', 'MEDIUM', 'Annoying Offers', True, None, False),
            ('Upgrade to Premium Nothing!', 'Get 50% more nothing with our premium void subscription! Only $29.99/month!', 'AD', 'MEDIUM', 'Annoying Offers', True, None, False),
            ('Quick 47-Question Survey!', 'Help us improve by answering 47 questions about your experience with this interruption!', 'SURVEY', 'LOW', 'Useless Notifications', True, None, False),
            ('Rate This Popup!', 'On a scale of 1-10, how much do you hate this popup? Your answer does not matter', 'SURVEY', 'MEDIUM', 'Useless Notifications', True, 30, False),
            ('Your Fish Are Lonely!', 'Your virtual fish miss you! They are probably fine though.', 'NOTIFICATION', 'LOW', 'Useless Notifications', False, 15, False),
            ('Breaking: Nothing Happened!', 'We are excited to inform you that absolutely nothing has changed!', 'NOTIFICATION', 'MEDIUM', 'Useless Notifications', False, 10, True),
            ('Memory Usage at 42%!', 'Your memory is being used! This is totally normal but we wanted to bother you about it.', 'NOTIFICATION', 'HIGH', 'System Annoyances', True, None, True),
            ('CRITICAL: Browser Needs Attention!', 'Your browser has been working too hard! Give it a break by closing this tab!', 'WARNING', 'CRITICAL', 'Fake Urgency', True, None, True),
            ('Storage Almost Full!', 'Your device storage is at 67% capacity! This means you have 33% left, which is fine.', 'WARNING', 'HIGH', 'System Annoyances', True, None, True),
            ('Need Help? No You Do Not', 'Our chatbot is here to provide unhelpful assistance you never asked for!', 'CHATBOT', 'MEDIUM', 'Random Interruptions', True, None, False),
            ('Customer Support is Offline!', 'Good news! There was never any customer support to begin with!', 'CHATBOT', 'LOW', 'Useless Notifications', False, 20, False),
            ('Limited Time: Buy Our Regret!', 'For a limited time, experience instant buyer remorse! Act now!', 'OFFER', 'HIGH', 'Annoying Offers', True, None, True),
            ('Subscribe to Disappointment!', 'Get daily disappointments delivered straight to your screen! Free trial!', 'OFFER', 'MEDIUM', 'Annoying Offers', True, None, False)
        ]
        
        popup_count = 0
        for title, content, popup_type, priority, event_type_name, requires_interaction, auto_close, fake_urgency in popups:
            event_type = EventType.objects.get(name=event_type_name)
            popup, created = PopupEvent.objects.get_or_create(
                title=title,
                defaults={
                    'content': content,
                    'popup_type': popup_type,
                    'priority': priority,
                    'event_type': event_type,
                    'requires_interaction': requires_interaction,
                    'auto_close_seconds': auto_close,
                    'fake_urgency': fake_urgency
                }
            )
            if created:
                popup_count += 1
        
        # Create fake system alerts
        alerts = [
            ('VIRUS', 'URGENT: Virus Detected!', 'Your computer may have a virus! Or not. We honestly do not know.', 9, True),
            ('UPDATE', 'Critical Update Available!', 'Update your browser to the same version you already have!', 7, True),
            ('STORAGE', 'Storage Space Low!', 'You used 60% of your storage! That means 40% is still free!', 6, False), 
            ('SECURITY', 'Security Breach Detected!', 'Someone may have looked at your screen! Secure yourself immediately!', 10, True),
            ('PERFORMANCE', 'Performance Issues Found!', 'Your computer is running at normal speed, which is apparently concerning!', 5, False)
        ]
        
        alert_count = 0
        for alert_type, title, message, urgency, immediate in alerts:
            alert, created = FakeSystemAlert.objects.get_or_create(
                title=title,
                defaults={
                    'alert_type': alert_type,
                    'message': message,
                    'fake_urgency_level': urgency,
                    'requires_immediate_action': immediate
                }
            )
            if created:
                alert_count += 1
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully loaded {popup_count} annoying popups and {alert_count} fake alerts!')
        )