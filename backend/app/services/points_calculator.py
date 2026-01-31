"""
Points Calculator Service

Calcula puntos para predicciones según el sistema de diferencia de goles:
- 5 puntos: Resultado exacto (ej: 2-1 = 2-1)
- 4 puntos: Ganador + diferencia de goles correcta (ej: predicción 2-0, real 3-1)
- 3 puntos: Solo ganador correcto
- 1 punto: Acierta goles de uno de los equipos
- 0 puntos: No acierta nada
"""

from typing import Tuple


def calculate_points(
    pred_home: int, pred_away: int, real_home: int, real_away: int
) -> Tuple[int, str]:
    """
    Calcula puntos según sistema de diferencia de goles.

    Args:
        pred_home: Goles predichos del equipo local
        pred_away: Goles predichos del equipo visitante
        real_home: Goles reales del equipo local
        real_away: Goles reales del equipo visitante

    Returns:
        Tuple[int, str]: (puntos, breakdown)
        - puntos: Cantidad de puntos obtenidos (0-5)
        - breakdown: Código que explica por qué obtuvo esos puntos

    Ejemplos:
        >>> calculate_points(2, 1, 2, 1)
        (5, 'exact_result')

        >>> calculate_points(2, 0, 3, 1)
        (4, 'winner_and_goal_diff')

        >>> calculate_points(2, 0, 1, 0)
        (3, 'winner_only')

        >>> calculate_points(2, 2, 3, 2)
        (1, 'one_score_match')

        >>> calculate_points(0, 1, 2, 0)
        (0, 'no_match')
    """

    # 1. Resultado exacto (5 puntos)
    if pred_home == real_home and pred_away == real_away:
        return (5, "exact_result")

    # Determinar ganador predicho
    if pred_home > pred_away:
        pred_winner = "home"
    elif pred_away > pred_home:
        pred_winner = "away"
    else:
        pred_winner = "draw"

    # Determinar ganador real
    if real_home > real_away:
        real_winner = "home"
    elif real_away > real_home:
        real_winner = "away"
    else:
        real_winner = "draw"

    # Calcular diferencia de goles
    pred_diff = abs(pred_home - pred_away)
    real_diff = abs(real_home - real_away)

    # 2. Ganador + diferencia de goles (4 puntos)
    if pred_winner == real_winner and pred_diff == real_diff:
        return (4, "winner_and_goal_diff")

    # 3. Solo ganador (3 puntos)
    if pred_winner == real_winner:
        return (3, "winner_only")

    # 4. Acierta goles de uno de los equipos (1 punto)
    if pred_home == real_home or pred_away == real_away:
        return (1, "one_score_match")

    # 5. No acierta nada (0 puntos)
    return (0, "no_match")


def get_points_message(points: int, breakdown: str) -> str:
    """
    Retorna un mensaje amigable para mostrar al usuario.

    Args:
        points: Puntos obtenidos
        breakdown: Código del breakdown

    Returns:
        str: Mensaje descriptivo en español
    """
    messages = {
        "exact_result": "¡Resultado exacto! 🎯",
        "winner_and_goal_diff": "¡Ganador y diferencia correctos! 🎉",
        "winner_only": "¡Acertaste el ganador! ✅",
        "one_score_match": "Acertaste un resultado",
        "no_match": "Mejor suerte la próxima",
    }

    return messages.get(breakdown, f"{points} puntos")


# Tests básicos en docstring
if __name__ == "__main__":
    import doctest

    doctest.testmod()

    # Tests adicionales
    print("🧪 Tests de cases específicos:")

    test_cases = [
        # (pred_home, pred_away, real_home, real_away, expected_points, expected_breakdown)
        # 5 puntos - Resultado exacto
        (2, 1, 2, 1, 5, "exact_result"),
        (3, 1, 3, 1, 5, "exact_result"),
        (0, 0, 0, 0, 5, "exact_result"),
        # 4 puntos - Ganador + diferencia de goles correcta
        (2, 0, 3, 1, 4, "winner_and_goal_diff"),  # Local por 2
        (1, 0, 2, 1, 4, "winner_and_goal_diff"),  # Local por 1
        (3, 1, 4, 2, 4, "winner_and_goal_diff"),  # Local por 2
        (1, 1, 2, 2, 4, "winner_and_goal_diff"),  # Empate (diff = 0)
        (1, 0, 3, 2, 4, "winner_and_goal_diff"),  # Local por 1
        (1, 1, 0, 0, 4, "winner_and_goal_diff"),  # Ambos empatan (diff = 0)
        # 3 puntos - Solo ganador correcto
        (2, 0, 1, 0, 3, "winner_only"),  # Local gana pero diff diferente
        (3, 0, 2, 1, 3, "winner_only"),  # Local gana pero diff diferente (3 vs 1)
        # 1 punto - Acierta goles de un equipo (pero NO el ganador)
        (2, 2, 3, 2, 1, "one_score_match"),  # Empata pero real gana local
        (1, 0, 1, 2, 1, "one_score_match"),  # Predice local gana, pero gana visitante
        (0, 1, 3, 1, 1, "one_score_match"),  # Acierta 1 del away, ganador incorrecto
        # 0 puntos - No acierta nada
        (0, 1, 2, 0, 0, "no_match"),
        (2, 1, 0, 3, 0, "no_match"),
    ]

    passed = 0
    failed = 0

    for pred_h, pred_a, real_h, real_a, exp_pts, exp_bd in test_cases:
        pts, bd = calculate_points(pred_h, pred_a, real_h, real_a)
        if pts == exp_pts and bd == exp_bd:
            passed += 1
            print(f"✅ ({pred_h}-{pred_a}) vs ({real_h}-{real_a}) = {pts}pts ({bd})")
        else:
            failed += 1
            print(
                f"❌ ({pred_h}-{pred_a}) vs ({real_h}-{real_a}) = {pts}pts ({bd}) | Expected: {exp_pts}pts ({exp_bd})"
            )

    print(f"\n📊 Results: {passed} passed, {failed} failed")
