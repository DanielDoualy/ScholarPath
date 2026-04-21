import json
import logging
from ..models import StudentProfile, OrientationField, Recommendation
from .ai_service import run_prompt
from .prompts.recommendation import SYSTEM_PROMPT, USER_TEMPLATE
from .analysis_service import _build_subject_summary

logger = logging.getLogger(__name__)


def recommend_fields(profile: StudentProfile) -> dict:
    averages, strong, weak = _build_subject_summary(profile)
    interests = list(profile.interests.values_list("name", flat=True))
    goals = list(profile.goals.values_list("description", flat=True))
    activities = list(profile.activities.values_list("title", flat=True))

    fields = OrientationField.objects.all()
    fields_list = "\n".join(f"- {f.name} ({f.domain}): {f.description[:100]}" for f in fields)

    if not fields_list:
        fields_list = "- Informatique (Technologie)\n- Médecine (Santé)\n- Droit (Sciences sociales)\n- Commerce (Économie)\n- Sciences (Sciences fondamentales)"

    context = USER_TEMPLATE.format(
        level=profile.level or "Non renseigné",
        strong_subjects=", ".join(strong) or "Aucune",
        weak_subjects=", ".join(weak) or "Aucune",
        interests=", ".join(interests) or "Aucun",
        goals=", ".join(goals) or "Aucun",
        activities=", ".join(activities) or "Aucune",
        available_fields=fields_list,
    )

    raw = run_prompt(SYSTEM_PROMPT, context)

    try:
        if "```" in raw:
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        data = json.loads(raw.strip())
        recommendations = data.get("recommendations", [])
    except (json.JSONDecodeError, IndexError):
        logger.warning("Failed to parse recommendation response: %s", raw[:200])
        recommendations = []

    # Persist recommendations
    Recommendation.objects.filter(profile=profile).delete()
    saved = []
    for rank, rec in enumerate(recommendations[:5], start=1):
        field_name = rec.get("field_name", "")
        field = OrientationField.objects.filter(name__icontains=field_name).first()
        if not field and field_name:
            field, _ = OrientationField.objects.get_or_create(
                name=field_name,
                defaults={"domain": "Autre", "description": ""},
            )
        if field:
            r = Recommendation.objects.create(
                profile=profile,
                orientation_field=field,
                fit_score=float(rec.get("fit_score", 70)),
                justification=rec.get("justification", ""),
                rank=rank,
            )
            saved.append({
                "rank": rank,
                "field": field_name,
                "fit_score": r.fit_score,
                "justification": r.justification,
            })

    return {"recommendations": saved}
