import logging
import time
from django.conf import settings

logger = logging.getLogger(__name__)


def run_prompt(system_prompt: str, user_context: str, max_tokens: int = 1500) -> str:
    """Facade unique vers l'API Groq. Retourne la réponse texte du LLM."""
    api_key = settings.GROQ_API_KEY
    model = getattr(settings, "GROQ_MODEL", "llama-3.1-8b-instant")

    if not api_key:
        logger.warning("GROQ_API_KEY non configurée — mode démo activé.")
        return _demo_json()

    try:
        from groq import Groq

        client = Groq(api_key=api_key)
        start = time.time()

        completion = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_context},
            ],
            max_tokens=max_tokens,
            temperature=0.7,
        )
        elapsed = round(time.time() - start, 2)
        content = completion.choices[0].message.content
        logger.info("Groq OK — model=%s, time=%ss, chars=%d", model, elapsed, len(content))
        return content

    except Exception as exc:
        logger.error("Groq API error: %s", exc, exc_info=True)
        return _demo_json()


def _demo_json() -> str:
    """Réponse de démonstration structurée en JSON quand Groq n'est pas disponible."""
    return """{
  "aptitudes_dominantes": ["Analyse critique", "Curiosité intellectuelle", "Rigueur"],
  "forces": ["Profil en cours de construction", "Démarche proactive"],
  "faiblesses": ["Données insuffisantes pour une analyse complète"],
  "coherence": "Ajoutez vos notes, activités et centres d'intérêt pour obtenir une analyse personnalisée.",
  "signaux": ["Enrichissez votre profil pour activer l'IA complète"],
  "resume": "Mode démonstration — configurez GROQ_API_KEY dans backend/.env pour activer l'IA. Votre profil sera analysé dès que des données seront disponibles."
}"""
