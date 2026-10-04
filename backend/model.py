import joblib
import pandas as pd
import os

# Get the project root directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Load trained model
MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "climate_risk_model.pkl"
)

FEATURES_PATH = os.path.join(
    BASE_DIR,
    "models",
    "risk_features.pkl"
)

model = joblib.load(MODEL_PATH)
risk_features = joblib.load(FEATURES_PATH)


RISK_LABELS = {
    0: "High",
    1: "Low",
    2: "Moderate",
    3: "Severe"
}


def prepare_input(data):
    """
    Convert climate input into the exact feature format
    expected by the trained model.
    """

    return pd.DataFrame(
        [data],
        columns=risk_features
    )


def predict_climate_risk(data):
    """
    Predict climate risk from input climate data.
    """

    input_data = prepare_input(data)

    prediction = model.predict(input_data)[0]

    return RISK_LABELS[int(prediction)]


def predict_climate_risk_details(data):
    """
    Return climate risk together with model confidence
    and probabilities for each risk category.
    """

    input_data = prepare_input(data)

    prediction = model.predict(input_data)[0]

    risk = RISK_LABELS[int(prediction)]

    probabilities = None

    # Models such as Random Forest and XGBoost
    # normally provide predict_proba().
    if hasattr(model, "predict_proba"):
        probabilities = model.predict_proba(input_data)[0]

    confidence = None

    if probabilities is not None:
        confidence = float(max(probabilities)) * 100

    return {
        "risk": risk,
        "confidence": round(confidence, 2) if confidence is not None else None
    }