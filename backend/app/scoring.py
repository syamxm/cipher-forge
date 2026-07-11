"""Computes leaderboard score based on base score and the ratio of time limit to elapsed time."""

BASE = {"easy": 100, "medium": 200, "hard": 400}
TIME_LIMIT = {"easy": 300, "medium": 180, "hard": 120}

def compute_score(elapsed_sec: float, difficulty: str) -> int:
    """Higher score for faster and harder runs.
    Derives the time limit from difficulty internally (not a parameter) so a
    caller can never pass a wrong limit. Raises ValueError on unknown
    difficulty. Guards elapsed_sec with max(elapsed_sec, 1) to avoid div-by-0."""
    if difficulty not in BASE or difficulty not in TIME_LIMIT:
        raise ValueError(f"Unknown difficulty: '{difficulty}'")
        
    score = round(BASE[difficulty] * (TIME_LIMIT[difficulty] / max(elapsed_sec, 1)))
    return score
