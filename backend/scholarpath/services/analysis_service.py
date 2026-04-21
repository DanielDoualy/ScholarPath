import json
import logging
from ..models import StudentProfile, AcademicRecord
from .ai_service import run_prompt
from .prompts.profile_analysis import SYSTEM_PROMPT, USER_TEMPLATE

logger = logging.getLogger(__name__)


def _build_subject_summary(profile: StudentProfile):
    records = profile.academic_records.select_related("subject")
    subject_map = {}
    for r in records:
        pct = (r.grade / r.max_grade * 20) if r.max_grade else r.grade
        if r.subject.name not in subject_map:
            subject_map[r.subject.name] = []
        subject_map[r.subject.name].append(pct)

    averages = {s: round(sum(v) / len(v), 1) for s, v in subject_map.items()}
    strong = [s for s, a in averages.items() if a >= 14]
    weak = [s for s, a in averages.items() if a < 10]
    return averages, strong, weak


def analyze_profile(profile: StudentProfile) -> dict:
    averages, strong, weak = _build_subject_summary(profile)
    interests = list(profile.interests.values_list("name", flat=True))
    goals = list(profile.goals.values_list("description", flat=True))
    activities = list(profile.activities.values_list("title", flat=True))

    context = USER_TEMPLATE.format(
        level=profile.level or "Non renseigné",
        strong_subjects=", ".join(strong) or "Aucune",
        weak_subjects=", ".join(weak) or "Aucune",
        subject_averages=str(averages),
        interests=", ".join(interests) or "Aucun",
        goals=", ".join(goals) or "Aucun",
        activities=", ".join(activities) or "Aucune",
    )

    raw = run_prompt(SYSTEM_PROMPT, context)

    try:
        # Extract JSON block if wrapped in markdown
        if "```" in raw:
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        return json.loads(raw.strip())
    except (json.JSONDecodeError, IndexError):
        logger.warning("Failed to parse AI response as JSON: %s", raw[:200])
        return {
            "aptitudes_dominantes": [],
            "forces": strong[:3],
            "faiblesses": weak[:3],
            "coherence": "Analyse disponible après enrichissement du profil.",
            "signaux": [],
            "resume": raw[:500],
        }
