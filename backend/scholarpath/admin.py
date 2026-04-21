from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    User,
    Institution,
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
    ImprovementAction,
    ProgressLog,
    Notification,
    AdminLog,
)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("email", "first_name", "last_name", "role", "is_active", "date_joined")
    list_filter = ("role", "is_active", "is_staff")
    search_fields = ("email", "first_name", "last_name")
    ordering = ("-date_joined",)
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Informations", {"fields": ("first_name", "last_name", "role")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "first_name", "last_name", "role", "password1", "password2"),
        }),
    )


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "level", "institution", "completion_score", "reliability_score")
    list_filter = ("level",)
    search_fields = ("user__email", "user__first_name", "user__last_name")


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "coefficient")
    search_fields = ("name",)


@admin.register(AcademicRecord)
class AcademicRecordAdmin(admin.ModelAdmin):
    list_display = ("profile", "subject", "school_year", "trimester", "grade", "verification_status")
    list_filter = ("school_year", "trimester", "verification_status")


@admin.register(OrientationField)
class OrientationFieldAdmin(admin.ModelAdmin):
    list_display = ("name", "domain")
    search_fields = ("name", "domain")


@admin.register(Recommendation)
class RecommendationAdmin(admin.ModelAdmin):
    list_display = ("profile", "orientation_field", "fit_score", "rank", "created_at")
    list_filter = ("rank",)


admin.site.register(Institution)
admin.site.register(Interest)
admin.site.register(Goal)
admin.site.register(Activity)
admin.site.register(Document)
admin.site.register(GapAnalysis)
admin.site.register(ImprovementAction)
admin.site.register(ProgressLog)
admin.site.register(Notification)
admin.site.register(AdminLog)
