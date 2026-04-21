from django.core.management.base import BaseCommand
from scholarpath.models import Subject

SUBJECTS = [
    ("Mathématiques", "Sciences", 4.0),
    ("Physique-Chimie", "Sciences", 3.0),
    ("Sciences de la vie et de la Terre", "Sciences", 2.5),
    ("Français", "Lettres", 4.0),
    ("Philosophie", "Lettres", 3.0),
    ("Histoire-Géographie", "Sciences humaines", 3.0),
    ("Anglais (LV1)", "Langues", 3.0),
    ("Espagnol (LV2)", "Langues", 2.0),
    ("Éducation physique et sportive", "Sport", 1.0),
    ("Sciences économiques et sociales", "Sciences humaines", 3.0),
    ("Informatique (NSI)", "Numérique", 3.0),
    ("Arts plastiques", "Arts", 1.5),
    ("Musique", "Arts", 1.5),
    ("Technologie", "Sciences appliquées", 2.0),
    ("Latin", "Lettres classiques", 1.0),
    ("Géographie", "Sciences humaines", 2.0),
    ("Biologie", "Sciences", 3.0),
    ("Chimie", "Sciences", 2.5),
    ("Statistiques", "Mathématiques appliquées", 2.0),
]


class Command(BaseCommand):
    help = "Initialise le référentiel de matières"

    def handle(self, *args, **options):
        created = 0
        for name, cat, coeff in SUBJECTS:
            _, new = Subject.objects.get_or_create(
                name=name, defaults={"category": cat, "coefficient": coeff}
            )
            if new:
                created += 1
        self.stdout.write(self.style.SUCCESS(f"{created} matières créées, référentiel à jour."))
