from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from .models import (
    User,
    StudentProfile,
    Institution,
    Subject,
    AcademicRecord,
    Interest,
    OrientationField,
    Goal,
    Activity,
    Document,
    Recommendation,
    GapAnalysis,
    ImprovementAction,
    ProgressLog,
    Notification,
)


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("email", "first_name", "last_name", "role", "password", "password2")

    def validate(self, data):
        if data["password"] != data["password2"]:
            raise serializers.ValidationError({"password": "Les mots de passe ne correspondent pas."})
        return data

    def create(self, validated_data):
        validated_data.pop("password2")
        user = User.objects.create_user(**validated_data)
        if user.role == User.Role.STUDENT:
            StudentProfile.objects.create(user=user)
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "first_name", "last_name", "role", "date_joined")
        read_only_fields = ("id", "date_joined")


class InstitutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institution
        fields = "__all__"


class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    institution_detail = InstitutionSerializer(source="institution", read_only=True)

    class Meta:
        model = StudentProfile
        fields = (
            "id",
            "user",
            "institution",
            "institution_detail",
            "level",
            "bio",
            "languages",
            "completion_score",
            "reliability_score",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "completion_score", "reliability_score", "created_at", "updated_at")


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = "__all__"


class AcademicRecordSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source="subject.name", read_only=True)

    class Meta:
        model = AcademicRecord
        fields = (
            "id",
            "subject",
            "subject_name",
            "school_year",
            "trimester",
            "grade",
            "max_grade",
            "appreciation",
            "verification_status",
            "created_at",
        )
        read_only_fields = ("id", "created_at", "verification_status")


class InterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interest
        fields = ("id", "name", "description", "created_at")
        read_only_fields = ("id", "created_at")


class OrientationFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrientationField
        fields = ("id", "name", "domain", "description")


class GoalSerializer(serializers.ModelSerializer):
    orientation_field_name = serializers.CharField(
        source="orientation_field.name", read_only=True
    )

    class Meta:
        model = Goal
        fields = ("id", "orientation_field", "orientation_field_name", "description", "target_year", "created_at")
        read_only_fields = ("id", "created_at")


class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = (
            "id",
            "title",
            "activity_type",
            "description",
            "start_date",
            "end_date",
            "verification_status",
            "created_at",
        )
        read_only_fields = ("id", "verification_status", "created_at")


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = (
            "id",
            "doc_type",
            "title",
            "file",
            "file_size",
            "verification_status",
            "uploaded_at",
        )
        read_only_fields = ("id", "file_size", "verification_status", "uploaded_at")

    def create(self, validated_data):
        file = validated_data.get("file")
        if file:
            validated_data["file_size"] = file.size
        return super().create(validated_data)

    def validate_file(self, value):
        allowed_types = ["application/pdf", "image/jpeg", "image/png"]
        if hasattr(value, "content_type") and value.content_type not in allowed_types:
            raise serializers.ValidationError("Seuls les fichiers PDF, JPEG et PNG sont acceptés.")
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("La taille maximale est de 10 Mo.")
        return value


class ImprovementActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImprovementAction
        fields = ("id", "description", "priority", "deadline_months", "is_done")


class GapAnalysisSerializer(serializers.ModelSerializer):
    actions = ImprovementActionSerializer(many=True, read_only=True)
    orientation_field_name = serializers.CharField(source="orientation_field.name", read_only=True)

    class Meta:
        model = GapAnalysis
        fields = ("id", "orientation_field", "orientation_field_name", "summary", "actions", "created_at")
        read_only_fields = ("id", "created_at")


class RecommendationSerializer(serializers.ModelSerializer):
    orientation_field_name = serializers.CharField(source="orientation_field.name", read_only=True)
    orientation_field_domain = serializers.CharField(source="orientation_field.domain", read_only=True)

    class Meta:
        model = Recommendation
        fields = (
            "id",
            "orientation_field",
            "orientation_field_name",
            "orientation_field_domain",
            "fit_score",
            "justification",
            "rank",
            "created_at",
        )
        read_only_fields = ("id", "created_at")


class ProgressLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgressLog
        fields = ("id", "completion_score", "reliability_score", "recorded_at")
        read_only_fields = ("id", "recorded_at")


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ("id", "notif_type", "title", "body", "is_read", "created_at")
        read_only_fields = ("id", "created_at")
