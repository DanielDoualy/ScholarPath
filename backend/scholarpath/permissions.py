from rest_framework.permissions import BasePermission
from .models import User


class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == User.Role.STUDENT


class IsMentor(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in (
            User.Role.MENTOR,
            User.Role.ADMIN,
        )


class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == User.Role.ADMIN


class IsOwnerOrMentor(BasePermission):
    """Allows access to the owner (student) or a mentor/admin."""

    def has_object_permission(self, request, view, obj):
        if request.user.role in (User.Role.MENTOR, User.Role.ADMIN):
            return True
        # obj can be a StudentProfile, AcademicRecord, etc.
        if hasattr(obj, "user"):
            return obj.user == request.user
        if hasattr(obj, "profile"):
            return obj.profile.user == request.user
        return False


class IsOwner(BasePermission):
    """Allows access only to the resource owner."""

    def has_object_permission(self, request, view, obj):
        if hasattr(obj, "user"):
            return obj.user == request.user
        if hasattr(obj, "profile"):
            return obj.profile.user == request.user
        return False
