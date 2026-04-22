from rest_framework import viewsets, generics, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from .models import (
    User,
    StudentProfile,
    Subject,
    AcademicRecord,
    Interest,
    OrientationField,
    Goal,
    Activity,
    Document,
    Recommendation,
    GapAnalysis,
    ProgressLog,
    Notification,
)
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    StudentProfileSerializer,
    SubjectSerializer,
    AcademicRecordSerializer,
    InterestSerializer,
    OrientationFieldSerializer,
    GoalSerializer,
    ActivitySerializer,
    DocumentSerializer,
    RecommendationSerializer,
    GapAnalysisSerializer,
    ProgressLogSerializer,
    NotificationSerializer,
)
from .permissions import IsOwner, IsOwnerOrMentor
from .services.analysis_service import analyze_profile
from .services.orientation_service import recommend_fields


# Auth

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class CurrentUserView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


# Profile

class StudentProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = StudentProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        profile, _ = StudentProfile.objects.get_or_create(user=self.request.user)
        return profile


# Subjects

class SubjectViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]




class AcademicRecordViewSet(viewsets.ModelViewSet):
    serializer_class = AcademicRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        profile, _ = StudentProfile.objects.get_or_create(user=self.request.user)
        qs = profile.academic_records.select_related("subject")
        year = self.request.query_params.get("year")
        if year:
            qs = qs.filter(school_year=year)
        return qs

    def perform_create(self, serializer):
        profile, _ = StudentProfile.objects.get_or_create(user=self.request.user)
        serializer.save(profile=profile)




class InterestViewSet(viewsets.ModelViewSet):
    serializer_class = InterestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        profile, _ = StudentProfile.objects.get_or_create(user=self.request.user)
        return profile.interests.all()

    def perform_create(self, serializer):
        profile, _ = StudentProfile.objects.get_or_create(user=self.request.user)
        serializer.save(profile=profile)




class GoalViewSet(viewsets.ModelViewSet):
    serializer_class = GoalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        profile, _ = StudentProfile.objects.get_or_create(user=self.request.user)
        return profile.goals.select_related("orientation_field")

    def perform_create(self, serializer):
        profile, _ = StudentProfile.objects.get_or_create(user=self.request.user)
        serializer.save(profile=profile)


# Activities

class ActivityViewSet(viewsets.ModelViewSet):
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        profile, _ = StudentProfile.objects.get_or_create(user=self.request.user)
        return profile.activities.all()

    def perform_create(self, serializer):
        profile, _ = StudentProfile.objects.get_or_create(user=self.request.user)
        serializer.save(profile=profile)


# Orientation fields

class OrientationFieldViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = OrientationField.objects.all()
    serializer_class = OrientationFieldSerializer
    permission_classes = [IsAuthenticated]


#  Documents

class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Document.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# Recommendations

class RecommendationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = RecommendationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        profile, _ = StudentProfile.objects.get_or_create(user=self.request.user)
        return profile.recommendations.select_related("orientation_field")


# Gap analysis

class GapAnalysisViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = GapAnalysisSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        profile, _ = StudentProfile.objects.get_or_create(user=self.request.user)
        return profile.gap_analyses.select_related("orientation_field").prefetch_related("actions")


# Progress

class ProgressLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ProgressLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        profile, _ = StudentProfile.objects.get_or_create(user=self.request.user)
        return profile.progress_logs.all()


# Notifications

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "patch", "head", "options"]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=True, methods=["patch"])
    def read(self, request, pk=None):
        notif = self.get_object()
        notif.is_read = True
        notif.save(update_fields=["is_read"])
        return Response({"status": "read"})


# AI endpoints

class AnalyzeProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile, _ = StudentProfile.objects.get_or_create(user=request.user)
        try:
            result = analyze_profile(profile)
            return Response(result)
        except RuntimeError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as exc:
            return Response({"error": f"Erreur interne : {exc}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RecommendView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile, _ = StudentProfile.objects.get_or_create(user=request.user)
        try:
            recs = recommend_fields(profile)
            return Response(recs)
        except RuntimeError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as exc:
            return Response({"error": f"Erreur interne : {exc}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AITestView(APIView):
    """Endpoint de diagnostic — vérifie que Groq répond correctement."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from .services.ai_service import test_connection
        result = test_connection()
        http_status = status.HTTP_200_OK if result["ok"] else status.HTTP_503_SERVICE_UNAVAILABLE
        return Response(result, status=http_status)


#  Dashboard

class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile, _ = StudentProfile.objects.get_or_create(user=user)

        records = profile.academic_records.select_related("subject")
        total = records.count()
        verified = records.filter(
            verification_status=AcademicRecord.VerificationStatus.VERIFIED
        ).count()

        grades = list(records.values_list("grade", "max_grade", "subject__name"))
        subject_avg = {}
        for g, max_g, subj in grades:
            pct = (g / max_g * 20) if max_g else g
            if subj not in subject_avg:
                subject_avg[subj] = []
            subject_avg[subj].append(pct)

        strong = []
        weak = []
        for subj, vals in subject_avg.items():
            avg = sum(vals) / len(vals)
            if avg >= 14:
                strong.append({"subject": subj, "avg": round(avg, 1)})
            elif avg < 10:
                weak.append({"subject": subj, "avg": round(avg, 1)})

        latest_recs = profile.recommendations.select_related("orientation_field").order_by("rank")[:3]
        unread_notifications = user.notifications.filter(is_read=False).count()

        return Response({
            "user": UserSerializer(user).data,
            "profile": {
                "level": profile.level,
                "completion_score": profile.completion_score,
                "reliability_score": profile.reliability_score,
            },
            "academic": {
                "total_records": total,
                "verified_records": verified,
                "strong_subjects": sorted(strong, key=lambda x: -x["avg"])[:3],
                "weak_subjects": sorted(weak, key=lambda x: x["avg"])[:3],
            },
            "recommendations": RecommendationSerializer(latest_recs, many=True).data,
            "unread_notifications": unread_notifications,
        })
