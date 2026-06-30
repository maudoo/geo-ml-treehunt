# 8-level curve, increasing XP gap per level (one quest = 100 XP).
# ponytail: even/round numbers, not tuned against real play data — adjust if leveling feels too fast/slow.
LEVEL_THRESHOLDS = [0, 300, 600, 1000, 1500, 2100, 2800, 3600]
MAX_LEVEL = len(LEVEL_THRESHOLDS)


def get_level_info(xp: int) -> dict:
    level = 1
    for i in range(len(LEVEL_THRESHOLDS) - 1, -1, -1):
        if xp >= LEVEL_THRESHOLDS[i]:
            level = i + 1
            break

    is_max_level = level == MAX_LEVEL
    current_threshold = LEVEL_THRESHOLDS[level - 1]
    next_threshold = current_threshold if is_max_level else LEVEL_THRESHOLDS[level]
    xp_into_level = xp - current_threshold
    xp_for_level = 0 if is_max_level else next_threshold - current_threshold
    progress = 1.0 if is_max_level else xp_into_level / xp_for_level

    return {
        "level": level,
        "is_max_level": is_max_level,
        "xp_into_level": xp_into_level,
        "xp_for_level": xp_for_level,
        "progress": progress,
    }
