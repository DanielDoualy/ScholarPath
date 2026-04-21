from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenBlacklistView,
)
from . import views

router = DefaultRouter()
router.register(r"subjects", views.SubjectViewSet, basename="subject")
router.register(r"academic-records", views.AcademicRecordViewSet, basename="academic-record")
router.register(r"interests", views.InterestViewSet, basename="interest")
router.register(r"goals", views.GoalViewSet, basename="goal")
router.register(r"activities", views.ActivityViewSet, basename="activity")
router.register(r"orientation-fields", views.OrientationFieldViewSet, basename="orientation-field")
router.register(r"documents", views.DocumentViewSet, basename="document")
router.register(r"recommendations", views.RecommendationViewSet, basename="recommendation")
router.register(r"gap-analyses", views.GapAnalysisViewSet, basename="gap-analysis")
router.register(r"progress", views.ProgressLogViewSet, basename="progress")
router.register(r"notifications", views.NotificationViewSet, basename="notification")

urlpatterns = [
    # Auth
    path("register/", views.RegisterView.as_view(), name="register"),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("token/blacklist/", TokenBlacklistView.as_view(), name="token_blacklist"),
    # User
    path("profile/", views.CurrentUserView.as_view(), name="current-user"),
    path("students/me/", views.StudentProfileView.as_view(), name="student-profile"),
    # Dashboard
    path("dashboard/", views.DashboardView.as_view(), name="dashboard"),
    # AI
    path("ai/analyze-profile/", views.AnalyzeProfileView.as_view(), name="ai-analyze"),
    path("ai/recommend/", views.RecommendView.as_view(), name="ai-recommend"),
    # Router
    path("", include(router.urls)),
]
