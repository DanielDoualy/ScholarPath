import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from scholarpath.models import User


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def student_user(db):
    return User.objects.create_user(
        email="student@test.com",
        password="Test1234!",
        first_name="Alice",
        last_name="Dupont",
        role=User.Role.STUDENT,
    )


@pytest.mark.django_db
def test_register(client):
    url = reverse("register")
    payload = {
        "email": "new@test.com",
        "first_name": "Bob",
        "last_name": "Martin",
        "role": "STUDENT",
        "password": "Test1234!",
        "password2": "Test1234!",
    }
    response = client.post(url, payload, format="json")
    assert response.status_code == 201
    assert User.objects.filter(email="new@test.com").exists()


@pytest.mark.django_db
def test_register_password_mismatch(client):
    url = reverse("register")
    payload = {
        "email": "bad@test.com",
        "first_name": "X",
        "last_name": "Y",
        "role": "STUDENT",
        "password": "Test1234!",
        "password2": "WrongPassword",
    }
    response = client.post(url, payload, format="json")
    assert response.status_code == 400


@pytest.mark.django_db
def test_login(client, student_user):
    url = reverse("token_obtain_pair")
    response = client.post(url, {"email": "student@test.com", "password": "Test1234!"}, format="json")
    assert response.status_code == 200
    assert "access" in response.data
    assert "refresh" in response.data


@pytest.mark.django_db
def test_protected_route_requires_auth(client):
    url = reverse("current-user")
    response = client.get(url)
    assert response.status_code == 401


@pytest.mark.django_db
def test_current_user(client, student_user):
    url = reverse("token_obtain_pair")
    token_res = client.post(url, {"email": "student@test.com", "password": "Test1234!"}, format="json")
    access = token_res.data["access"]

    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
    profile_url = reverse("current-user")
    response = client.get(profile_url)
    assert response.status_code == 200
    assert response.data["email"] == "student@test.com"
