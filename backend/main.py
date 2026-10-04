from pathlib import Path
import pandas as pd

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.model import predict_climate_risk, predict_climate_risk_details
from backend.recommendation_engine import generate_recommendations

app = FastAPI(
    title="Climate Action AI API",
    description="AI-powered climate risk prediction API",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_PATH = (
    Path(__file__).resolve().parent.parent
    / "data"
    / "processed"
    / "climate_processed.csv"
)


@app.get("/city-data/{city}")
def get_city_data(city: str):
    df = pd.read_csv(DATA_PATH)

    city_data = df[
        df["City"].astype(str).str.lower() == city.lower()
    ]

    if city_data.empty:
        return {"error": "City not found"}

    # Use the latest available record for that city
    row = city_data.iloc[-1]

    return {
        "City": row["City"],
        "Temperature_Max": float(row["Temperature_Max"]),
        "Temperature_Min": float(row["Temperature_Min"]),
        "Temperature_Avg": float(row["Temperature_Avg"]),
        "Humidity": float(row["Humidity"]),
        "Rainfall": float(row["Rainfall"]),
        "Wind_Speed_kmh": float(row["Wind_Speed (km/h)"]),
        "AQI": float(row["AQI"]),
        "Pressure_Avg": float(row["Pressure_Avg"]),
        "Cloud_Cover": float(row["Cloud_Cover"]),
    }


@app.get("/city-trends/{city}")
def get_city_trends(city: str):
    df = pd.read_csv(DATA_PATH)

    city_data = df[
        df["City"].astype(str).str.lower() == city.lower()
    ].copy()

    if city_data.empty:
        return {"error": "City not found"}

    city_data["Date"] = pd.to_datetime(city_data["Date"])
    city_data = city_data.sort_values("Date").tail(30)

    return {
        "City": city,
        "dates": city_data["Date"].dt.strftime("%Y-%m-%d").tolist(),
        "temperature": city_data["Temperature_Avg"].round(2).tolist(),
        "aqi": city_data["AQI"].round(2).tolist(),
        "rainfall": city_data["Rainfall"].round(2).tolist(),
        "humidity": city_data["Humidity"].round(2).tolist(),
    }

class ClimateData(BaseModel):
    Temperature_Max: float
    Temperature_Min: float
    Temperature_Avg: float
    Humidity: float
    Rainfall: float
    Wind_Speed_kmh: float
    AQI: float
    Pressure_Avg: float
    Cloud_Cover: float
    Temp_Avg_Lag1: float
    AQI_Lag1: float
    Rainfall_Lag1: float
    Humidity_Lag1: float
    Temp_3Day_Avg: float
    AQI_3Day_Avg: float
    Rainfall_3Day_Total: float
    Month: int


@app.get("/")
def home():
    return {
        "message": "Climate Action AI API is running",
        "status": "success"
    }


@app.post("/predict")
def predict(data: ClimateData):

    input_data = {
        "Temperature_Max": data.Temperature_Max,
        "Temperature_Min": data.Temperature_Min,
        "Temperature_Avg": data.Temperature_Avg,
        "Humidity": data.Humidity,
        "Rainfall": data.Rainfall,
        "Wind_Speed (km/h)": data.Wind_Speed_kmh,
        "AQI": data.AQI,
        "Pressure_Avg": data.Pressure_Avg,
        "Cloud_Cover": data.Cloud_Cover,
        "Temp_Avg_Lag1": data.Temp_Avg_Lag1,
        "AQI_Lag1": data.AQI_Lag1,
        "Rainfall_Lag1": data.Rainfall_Lag1,
        "Humidity_Lag1": data.Humidity_Lag1,
        "Temp_3Day_Avg": data.Temp_3Day_Avg,
        "AQI_3Day_Avg": data.AQI_3Day_Avg,
        "Rainfall_3Day_Total": data.Rainfall_3Day_Total,
        "Month": data.Month
    }

    prediction = predict_climate_risk_details(input_data)

    risk = prediction["risk"]
    confidence = prediction["confidence"]

    recommendations = generate_recommendations(
        risk=risk,
        aqi=data.AQI,
        temperature=data.Temperature_Avg,
        rainfall=data.Rainfall
    )

    return {
        "climate_risk": risk,
        "confidence": confidence,
        "recommendations": recommendations
    }
    risk = predict_climate_risk(input_data)

    recommendations = generate_recommendations(
    risk=risk,
    aqi=data.AQI,
    temperature=data.Temperature_Avg,
    rainfall=data.Rainfall
)


    return {
    "climate_risk": risk,
    "recommendations": recommendations
}