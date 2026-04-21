dev:
	docker compose up -d

backend:
	cd backend && python manage.py runserver

frontend:
	cd frontend/scholarpath && npm run dev

migrate:
	cd backend && python manage.py migrate

seed:
	cd backend && python manage.py seed_subjects && python manage.py seed_fields

test:
	cd backend && pytest
	cd frontend/scholarpath && npm test

lint:
	cd backend && flake8 . && black --check .
	cd frontend/scholarpath && npm run lint

install:
	cd backend && pip install -r requirements.txt
	cd frontend/scholarpath && npm install

.PHONY: dev backend frontend migrate seed test lint install
