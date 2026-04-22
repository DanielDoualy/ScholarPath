import logging
import time
from django.conf import settings

logger = logging.getLogger(__name__)

# Modèles Groq actifs (avril 2025) — llama3-70b-8192 et llama3-8b-8192 désactivés
GROQ_VALID_MODELS = [
    "llama-3.3-70b-versatile",   # recommandé — remplace llama3-70b-8192
    "llama-3.1-70b-versatile",
    "llama-3.1-8b-instant",      # recommandé rapide — remplace llama3-8b-8192
    "llama-3.2-90b-vision-preview",
    "llama-3.2-11b-vision-preview",
    "gemma2-9b-it",
    "gemma-7b-it",
]
GROQ_DEFAULT_MODEL = "llama-3.3-70b-versatile"


def run_prompt(system_prompt: str, user_context: str, max_tokens: int = 1500) -> str:
    """
    Appelle l'API Groq et retourne le texte brut de la réponse.
    Lève une exception si la clé est absente ou si l'appel échoue.
    """
    api_key = getattr(settings, "GROQ_API_KEY", "").strip()
    model   = getattr(settings, "GROQ_MODEL", GROQ_DEFAULT_MODEL).strip()

    # ── Validation préventive ──────────────────────────────────────
    if not api_key:
        raise RuntimeError(
            "GROQ_API_KEY manquante — ajoutez-la dans backend/.env"
        )

    if model not in GROQ_VALID_MODELS:
        logger.warning(
            "Modèle '%s' inconnu ou désactivé sur Groq. Basculement vers %s.",
            model, GROQ_DEFAULT_MODEL,
        )
        model = GROQ_DEFAULT_MODEL

    # ── Appel Groq ─────────────────────────────────────────────────
    try:
        from groq import Groq

        client = Groq(api_key=api_key)
        start  = time.time()

        completion = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user",   "content": user_context},
            ],
            max_tokens=max_tokens,
            temperature=0.7,
        )

        elapsed = round(time.time() - start, 2)
        content = completion.choices[0].message.content
        logger.info(
            "Groq OK — model=%s, time=%ss, chars=%d", model, elapsed, len(content)
        )
        return content

    except Exception as exc:
        logger.error("Groq API error: %s", exc, exc_info=True)
        # On re-lève pour que la vue renvoie une vraie erreur 500
        # au lieu de données de démo trompeuses.
        raise RuntimeError(f"Groq API error: {exc}") from exc


def test_connection() -> dict:
    """
    Ping rapide pour vérifier que la clé + le modèle fonctionnent.
    Retourne {"ok": True/False, "model": ..., "error": ...}
    """
    try:
        result = run_prompt(
            system_prompt="Réponds uniquement avec le mot: OK",
            user_context="Test de connexion",
            max_tokens=10,
        )
        return {"ok": True, "model": getattr(settings, "GROQ_MODEL", ""), "response": result.strip()}
    except Exception as exc:
        return {"ok": False, "model": getattr(settings, "GROQ_MODEL", ""), "error": str(exc)}
