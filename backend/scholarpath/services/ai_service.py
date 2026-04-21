import logging
import time
from django.conf import settings

logger = logging.getLogger(__name__)


def run_prompt(system_prompt: str, user_context: str, max_tokens: int = 1500) -> str:
    """Facade unique vers l'API Groq. Retourne la réponse texte du LLM."""
    api_key = settings.GROQ_API_KEY
    model = settings.GROQ_MODEL

    if not api_key:
        logger.warning("GROQ_API_KEY non configurée — retour d'une réponse de démonstration.")
        return _demo_response(user_context)

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
        logger.info("Groq call completed in %ss using model %s", elapsed, model)
        return completion.choices[0].message.content

    except Exception as exc:
        logger.error("Groq API error: %s", exc)
        return _demo_response(user_context)


def _demo_response(context: str) -> str:
    return (
        "Analyse non disponible (clé Groq manquante). "
        "Configurez GROQ_API_KEY dans votre fichier .env pour activer l'IA."
    )
