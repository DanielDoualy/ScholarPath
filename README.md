# ScholarPath

Plateforme intelligente d'accompagnement scolaire et universitaire.

**Backend** → Django 5 + DRF + PostgreSQL + Groq AI  
**Frontend** → React 18 + Vite  
**Déploiement** → Render (back) + Vercel (front)

## Démarrage rapide

```bash
# Backend
cd backend
cp .env.example .env   # remplir les variables
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_subjects
python manage.py seed_fields
python manage.py runserver

# Frontend
cd frontend/scholarpath
cp .env.example .env
npm install
npm run dev
```

## Variables d'environnement

Voir `backend/.env.example` et `frontend/scholarpath/.env.example`.

## Documentation API

Accessible sur `/api/schema/swagger/` une fois le backend lancé.
