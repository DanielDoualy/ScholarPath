from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email requis")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", User.Role.ADMIN)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        STUDENT = "STUDENT", "Élève / Étudiant"
        PARENT = "PARENT", "Parent / Tuteur"
        MENTOR = "MENTOR", "Enseignant / Conseiller"
        INSTITUTION = "INSTITUTION", "Établissement"
        ADMIN = "ADMIN", "Administrateur"

    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.STUDENT)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []
    objects = UserManager()

    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.email

    def __str__(self):
        return self.email


class Institution(models.Model):
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, default="France")

    class Meta:
        verbose_name = "Établissement"

    def __str__(self):
        return self.name


class StudentProfile(models.Model):
    class Level(models.TextChoices):
        SIXIEME = "6e", "6ème"
        CINQUIEME = "5e", "5ème"
        QUATRIEME = "4e", "4ème"
        TROISIEME = "3e", "3ème"
        SECONDE = "2nde", "Seconde"
        PREMIERE = "1ere", "Première"
        TERMINALE = "Term", "Terminale"
        BAC_PLUS_1 = "Bac+1", "Bac+1"
        BAC_PLUS_2 = "Bac+2", "Bac+2"
        BAC_PLUS_3 = "Bac+3", "Bac+3"
        BAC_PLUS_4 = "Bac+4", "Bac+4"
        BAC_PLUS_5 = "Bac+5", "Bac+5"

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    institution = models.ForeignKey(
        Institution, null=True, blank=True, on_delete=models.SET_NULL
    )
    level = models.CharField(max_length=10, choices=Level.choices, blank=True)
    bio = models.TextField(blank=True)
    languages = models.CharField(max_length=255, blank=True)
    completion_score = models.FloatField(default=0.0)
    reliability_score = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Profil élève"

    def __str__(self):
        return f"Profil de {self.user}"


class Subject(models.Model):
    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=100, blank=True)
    coefficient = models.FloatField(default=1.0)

    class Meta:
        verbose_name = "Matière"
        ordering = ["name"]

    def __str__(self):
        return self.name


class AcademicRecord(models.Model):
    class VerificationStatus(models.TextChoices):
        DECLARED = "DECLARED", "Déclaré"
        DOCUMENTED = "DOCUMENTED", "Documenté"
        VERIFIED = "VERIFIED", "Vérifié"

    class Trimester(models.TextChoices):
        T1 = "T1", "Trimestre 1"
        T2 = "T2", "Trimestre 2"
        T3 = "T3", "Trimestre 3"
        S1 = "S1", "Semestre 1"
        S2 = "S2", "Semestre 2"
        ANNUEL = "AN", "Annuel"

    profile = models.ForeignKey(
        StudentProfile, on_delete=models.CASCADE, related_name="academic_records"
    )
    subject = models.ForeignKey(Subject, on_delete=models.PROTECT)
    school_year = models.CharField(max_length=9)  # ex: "2024-2025"
    trimester = models.CharField(max_length=3, choices=Trimester.choices)
    grade = models.FloatField()
    max_grade = models.FloatField(default=20.0)
    appreciation = models.TextField(blank=True)
    verification_status = models.CharField(
        max_length=12,
        choices=VerificationStatus.choices,
        default=VerificationStatus.DECLARED,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Bulletin / Note"
        ordering = ["-school_year", "trimester", "subject__name"]

    def __str__(self):
        return f"{self.subject} — {self.school_year} {self.trimester}: {self.grade}/{self.max_grade}"


class Interest(models.Model):
    profile = models.ForeignKey(
        StudentProfile, on_delete=models.CASCADE, related_name="interests"
    )
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Centre d'intérêt"

    def __str__(self):
        return self.name


class OrientationField(models.Model):
    name = models.CharField(max_length=200, unique=True)
    domain = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    required_subjects = models.ManyToManyField(Subject, blank=True)

    class Meta:
        verbose_name = "Filière / Domaine"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Goal(models.Model):
    profile = models.ForeignKey(
        StudentProfile, on_delete=models.CASCADE, related_name="goals"
    )
    orientation_field = models.ForeignKey(
        OrientationField, null=True, blank=True, on_delete=models.SET_NULL
    )
    description = models.CharField(max_length=500)
    target_year = models.PositiveIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Objectif"

    def __str__(self):
        return self.description


class Activity(models.Model):
    class ActivityType(models.TextChoices):
        ASSOCIATIF = "ASSOCIATIF", "Associatif"
        COMPETITION = "COMPETITION", "Compétition"
        STAGE = "STAGE", "Stage"
        PROJET = "PROJET", "Projet personnel"
        BENEVOLE = "BENEVOLE", "Bénévolat"
        CERTIFICATION = "CERTIFICATION", "Certification"
        AUTRE = "AUTRE", "Autre"

    profile = models.ForeignKey(
        StudentProfile, on_delete=models.CASCADE, related_name="activities"
    )
    title = models.CharField(max_length=255)
    activity_type = models.CharField(
        max_length=20, choices=ActivityType.choices, default=ActivityType.AUTRE
    )
    description = models.TextField(blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    verification_status = models.CharField(
        max_length=12,
        choices=AcademicRecord.VerificationStatus.choices,
        default=AcademicRecord.VerificationStatus.DECLARED,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Activité"
        ordering = ["-start_date"]

    def __str__(self):
        return self.title


class Document(models.Model):
    class DocType(models.TextChoices):
        BULLETIN = "BULLETIN", "Bulletin scolaire"
        DIPLOME = "DIPLOME", "Diplôme"
        ATTESTATION = "ATTESTATION", "Attestation"
        CERTIFICAT = "CERTIFICAT", "Certificat"
        AUTRE = "AUTRE", "Autre"

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="documents")
    doc_type = models.CharField(max_length=20, choices=DocType.choices, default=DocType.AUTRE)
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to="documents/%Y/%m/")
    file_size = models.PositiveIntegerField(default=0)
    verification_status = models.CharField(
        max_length=12,
        choices=AcademicRecord.VerificationStatus.choices,
        default=AcademicRecord.VerificationStatus.DECLARED,
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Document"
        ordering = ["-uploaded_at"]

    def __str__(self):
        return self.title


class Recommendation(models.Model):
    profile = models.ForeignKey(
        StudentProfile, on_delete=models.CASCADE, related_name="recommendations"
    )
    orientation_field = models.ForeignKey(
        OrientationField, on_delete=models.PROTECT
    )
    fit_score = models.FloatField()
    justification = models.TextField()
    rank = models.PositiveSmallIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Recommandation"
        ordering = ["rank"]

    def __str__(self):
        return f"{self.orientation_field} ({self.fit_score:.0f}%)"


class GapAnalysis(models.Model):
    profile = models.ForeignKey(
        StudentProfile, on_delete=models.CASCADE, related_name="gap_analyses"
    )
    orientation_field = models.ForeignKey(OrientationField, on_delete=models.PROTECT)
    summary = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Analyse d'écart"

    def __str__(self):
        return f"Écart vers {self.orientation_field}"


class ImprovementAction(models.Model):
    class Priority(models.TextChoices):
        HIGH = "HIGH", "Haute"
        MEDIUM = "MEDIUM", "Moyenne"
        LOW = "LOW", "Faible"

    gap_analysis = models.ForeignKey(
        GapAnalysis, on_delete=models.CASCADE, related_name="actions"
    )
    description = models.TextField()
    priority = models.CharField(max_length=10, choices=Priority.choices, default=Priority.MEDIUM)
    deadline_months = models.PositiveSmallIntegerField(default=3)
    is_done = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Action d'amélioration"
        ordering = ["priority", "deadline_months"]

    def __str__(self):
        return self.description[:80]


class ProgressLog(models.Model):
    profile = models.ForeignKey(
        StudentProfile, on_delete=models.CASCADE, related_name="progress_logs"
    )
    completion_score = models.FloatField()
    reliability_score = models.FloatField()
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Journal de progression"
        ordering = ["-recorded_at"]

    def __str__(self):
        return f"{self.profile} — {self.recorded_at.date()}"


class Notification(models.Model):
    class NotifType(models.TextChoices):
        ALERT = "ALERT", "Alerte"
        OPPORTUNITY = "OPPORTUNITY", "Opportunité"
        VERIFICATION = "VERIFICATION", "Vérification"
        INFO = "INFO", "Information"

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    notif_type = models.CharField(max_length=20, choices=NotifType.choices, default=NotifType.INFO)
    title = models.CharField(max_length=255)
    body = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Notification"
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class AdminLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="admin_logs")
    action = models.CharField(max_length=255)
    details = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Journal d'audit"
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if self.pk:
            raise ValueError("AdminLog entries are immutable.")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.action} — {self.created_at}"
