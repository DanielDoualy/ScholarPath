from django.core.management.base import BaseCommand
from scholarpath.models import OrientationField

FIELDS = [
    ("Informatique / Numérique", "Technologie", "Développement logiciel, intelligence artificielle, cybersécurité, data science."),
    ("Médecine et Santé", "Santé", "Médecine, pharmacie, soins infirmiers, kinésithérapie, odontologie."),
    ("Droit et Sciences politiques", "Sciences sociales", "Droit privé, droit public, sciences politiques, relations internationales."),
    ("Commerce et Gestion", "Économie", "Commerce, marketing, gestion d'entreprise, finance, comptabilité."),
    ("Sciences fondamentales", "Sciences", "Mathématiques pures, physique, chimie, biologie."),
    ("Ingénierie et Génie civil", "Sciences appliquées", "Génie mécanique, électronique, civil, aérospatial."),
    ("Lettres et Langues", "Lettres", "Littérature, linguistique, traduction, lettres modernes."),
    ("Sciences humaines et sociales", "Sciences humaines", "Sociologie, psychologie, anthropologie, histoire, géographie."),
    ("Arts et Design", "Arts", "Beaux-arts, design graphique, architecture, cinéma, musique."),
    ("Communication et Journalisme", "Communication", "Journalisme, communication d'entreprise, relations publiques, médias."),
    ("Éducation et Formation", "Éducation", "Sciences de l'éducation, enseignement, formation professionnelle."),
    ("Économie et Finance", "Économie", "Économie appliquée, finance de marché, actuariat, économétrie."),
    ("Agriculture et Environnement", "Sciences de la nature", "Agronomie, biologie environnementale, développement durable."),
    ("Architecture et Urbanisme", "Arts appliqués", "Architecture, urbanisme, paysagisme, design d'espace."),
    ("Mathématiques et Statistiques", "Sciences", "Mathématiques appliquées, statistiques, actuariat, recherche opérationnelle."),
]


class Command(BaseCommand):
    help = "Initialise le référentiel de filières d'orientation"

    def handle(self, *args, **options):
        created = 0
        for name, domain, desc in FIELDS:
            _, new = OrientationField.objects.get_or_create(
                name=name, defaults={"domain": domain, "description": desc}
            )
            if new:
                created += 1
        self.stdout.write(self.style.SUCCESS(f"{created} filières créées, référentiel à jour."))
