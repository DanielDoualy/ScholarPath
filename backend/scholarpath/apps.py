from django.apps import AppConfig


class ScholarpathConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "scholarpath"
    verbose_name = "ScholarPath"

    def ready(self):
        """Auto-seed subjects and orientation fields on first startup."""
        try:
            from .models import Subject, OrientationField
            if not Subject.objects.exists():
                self._seed_subjects()
            if not OrientationField.objects.exists():
                self._seed_fields()
        except Exception:
            pass  # DB not ready yet (first migrate)

    @staticmethod
    def _seed_subjects():
        from .models import Subject
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
            ("Biologie", "Sciences", 3.0),
            ("Chimie", "Sciences", 2.5),
        ]
        for name, cat, coeff in SUBJECTS:
            Subject.objects.get_or_create(name=name, defaults={"category": cat, "coefficient": coeff})

    @staticmethod
    def _seed_fields():
        from .models import OrientationField
        FIELDS = [
            ("Informatique / Numérique", "Technologie", "Développement logiciel, IA, cybersécurité, data science."),
            ("Médecine et Santé", "Santé", "Médecine, pharmacie, soins infirmiers, kinésithérapie."),
            ("Droit et Sciences politiques", "Sciences sociales", "Droit, sciences politiques, relations internationales."),
            ("Commerce et Gestion", "Économie", "Commerce, marketing, gestion, finance, comptabilité."),
            ("Sciences fondamentales", "Sciences", "Mathématiques, physique, chimie, biologie."),
            ("Ingénierie", "Sciences appliquées", "Génie mécanique, électronique, civil, aérospatial."),
            ("Lettres et Langues", "Lettres", "Littérature, linguistique, traduction."),
            ("Sciences humaines et sociales", "Sciences humaines", "Sociologie, psychologie, histoire, géographie."),
            ("Arts et Design", "Arts", "Beaux-arts, design, architecture, cinéma, musique."),
            ("Communication", "Communication", "Journalisme, communication, relations publiques, médias."),
            ("Éducation et Formation", "Éducation", "Sciences de l'éducation, enseignement."),
            ("Économie et Finance", "Économie", "Économie, finance de marché, actuariat."),
            ("Agriculture et Environnement", "Sciences de la nature", "Agronomie, environnement, développement durable."),
            ("Architecture et Urbanisme", "Arts appliqués", "Architecture, urbanisme, paysagisme."),
            ("Mathématiques et Statistiques", "Sciences", "Mathématiques appliquées, statistiques, actuariat."),
        ]
        for name, domain, desc in FIELDS:
            OrientationField.objects.get_or_create(name=name, defaults={"domain": domain, "description": desc})
