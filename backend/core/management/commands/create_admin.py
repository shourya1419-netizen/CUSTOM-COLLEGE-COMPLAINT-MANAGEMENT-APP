from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from core.models import UserProfile

ADMIN_USERNAME = "vishal"
ADMIN_EMAIL = "vishal@gmail.com"
ADMIN_PASSWORD = "123456"


class Command(BaseCommand):
    help = "Create the default superuser account if it does not already exist"

    def handle(self, *args, **options):
        if User.objects.filter(username=ADMIN_USERNAME).exists():
            self.stdout.write(
                self.style.WARNING(
                    f"Admin user '{ADMIN_USERNAME}' already exists — skipping creation."
                )
            )
            return

        user = User.objects.create_superuser(
            username=ADMIN_USERNAME,
            email=ADMIN_EMAIL,
            password=ADMIN_PASSWORD,
        )

        # Create the UserProfile with admin role if it doesn't exist yet
        UserProfile.objects.get_or_create(user=user, defaults={"role": "admin"})

        self.stdout.write(
            self.style.SUCCESS(
                f"Superuser '{ADMIN_USERNAME}' ({ADMIN_EMAIL}) created successfully."
            )
        )
