from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User
from core.models import UserProfile


class Command(BaseCommand):
    help = "Create an admin user for the College Complaint System"

    def add_arguments(self, parser):
        parser.add_argument("--username", required=True, help="Admin username")
        parser.add_argument("--password", required=True, help="Admin password")
        parser.add_argument("--email", required=True, help="Admin email")

    def handle(self, *args, **options):
        username = options["username"].strip()
        password = options["password"].strip()
        email = options["email"].strip()

        if not username or not password:
            raise CommandError("Username and password cannot be empty.")

        if len(password) < 6:
            raise CommandError("Password must be at least 6 characters.")

        if not email:
            raise CommandError("Email is required for admin accounts.")

        if User.objects.filter(email__iexact=email).exists():
            raise CommandError(f"An account with email '{email}' already exists.")

        if User.objects.filter(username=username).exists():
            raise CommandError(f"User '{username}' already exists.")

        user = User.objects.create_user(
            username=username,
            password=password,
            email=email,
            is_staff=True,
        )
        UserProfile.objects.create(user=user, role="admin")

        self.stdout.write(self.style.SUCCESS(
            f"Admin '{username}' created successfully."
        ))
