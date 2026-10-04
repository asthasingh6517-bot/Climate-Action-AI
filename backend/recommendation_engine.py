def generate_recommendations(risk, aqi, temperature, rainfall):
    recommendations = []

    # Risk-based recommendations
    if risk == "Severe":
        recommendations.extend([
            "Activate immediate climate-risk monitoring.",
            "Avoid unnecessary outdoor activities.",
            "Reduce vehicle usage and prefer public transport.",
            "Avoid open burning and unnecessary emissions."
        ])

    elif risk == "High":
        recommendations.extend([
            "Reduce unnecessary vehicle usage.",
            "Avoid open burning and waste burning.",
            "Increase monitoring of air-quality conditions.",
            "Promote energy conservation."
        ])

    elif risk == "Moderate":
        recommendations.extend([
            "Use public transport whenever possible.",
            "Reduce unnecessary electricity consumption.",
            "Avoid burning waste.",
            "Continue monitoring local climate conditions."
        ])

    else:
        recommendations.extend([
            "Maintain sustainable transport practices.",
            "Continue waste segregation and recycling.",
            "Conserve electricity and water.",
            "Maintain green spaces."
        ])

    # AQI-specific recommendation
    if aqi >= 200:
        recommendations.append(
            "Air quality is poor; reduce exposure to polluted outdoor environments."
        )
    elif aqi >= 100:
        recommendations.append(
            "Air quality is moderate to poor; sensitive individuals should limit prolonged outdoor exposure."
        )

    # Temperature-specific recommendation
    if temperature >= 35:
        recommendations.append(
            "High temperature detected; conserve water and reduce unnecessary energy consumption."
        )

    # Rainfall-specific recommendation
    if rainfall >= 50:
        recommendations.append(
            "Heavy rainfall detected; monitor drainage and possible waterlogging."
        )

    return recommendations