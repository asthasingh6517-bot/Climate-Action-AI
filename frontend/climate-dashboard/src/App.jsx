import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./App.css";

const API_BASE = "http://127.0.0.1:8000";
const API_URL = `${API_BASE}/predict`;

const defaultData = {
  Temperature_Max: 32.5,
  Temperature_Min: 18.0,
  Temperature_Avg: 25.2,
  Humidity: 77.6,
  Rainfall: 0,
  Wind_Speed_kmh: 3.3,
  AQI: 259,
  Pressure_Avg: 1020.3,
  Cloud_Cover: 62.1,
};

const cities = ["Mumbai", "Delhi", "Bengaluru", "Chennai", "Kolkata"];

function App() {
  const [city, setCity] = useState("Mumbai");
  const [data, setData] = useState(defaultData);
  const [loadingCity, setLoadingCity] = useState(false);
  const [trendData, setTrendData] = useState([]);
  const [loadingTrends, setLoadingTrends] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCityChange = async (e) => {
    const selectedCity = e.target.value;

    setCity(selectedCity);
    setLoadingCity(true);
    setPrediction(null);

    try {
      const response = await fetch(
        `${API_BASE}/city-data/${encodeURIComponent(selectedCity)}`
      );

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      setData({
        Temperature_Max: Number(result.Temperature_Max),
        Temperature_Min: Number(result.Temperature_Min),
        Temperature_Avg: Number(result.Temperature_Avg),
        Humidity: Number(result.Humidity),
        Rainfall: Number(result.Rainfall),
        Wind_Speed_kmh: Number(result.Wind_Speed_kmh),
        AQI: Number(result.AQI),
        Pressure_Avg: Number(result.Pressure_Avg),
        Cloud_Cover: Number(result.Cloud_Cover),
      });
    } catch (error) {
      console.error("City data error:", error);
      alert(`Could not load data for ${selectedCity}.`);
    } finally {
      setLoadingCity(false);
    }
  };

  const handleChange = (e) => {
    setData((previous) => ({
      ...previous,
      [e.target.name]: Number(e.target.value),
    }));
  };

  const loadTrends = async (selectedCity) => {
  setLoadingTrends(true);

  try {
    const response = await fetch(
      `${API_BASE}/city-trends/${encodeURIComponent(selectedCity)}`
    );

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const result = await response.json();

    console.log("TREND API RESPONSE:", result);

    if (result.error) {
      throw new Error(result.error);
    }

    console.log("TREND API RESPONSE:", result);

    const formattedData = result.dates.map((date, index) => ({
      date: date.slice(5),
      temperature: Number(result.temperature[index]),
      aqi: Number(result.aqi[index]),
      rainfall: Number(result.rainfall[index]),
      humidity: Number(result.humidity[index]),
    }));

    console.log("FORMATTED TREND DATA:", formattedData);

    setTrendData(formattedData);
  } catch (error) {
    console.error("Trend data error:", error);
    setTrendData([]);
  } finally {
    setLoadingTrends(false);
  }
};

  const predictRisk = async () => {
    setLoading(true);

    const payload = {
      ...data,
      Temp_Avg_Lag1: data.Temperature_Avg,
      AQI_Lag1: data.AQI,
      Rainfall_Lag1: data.Rainfall,
      Humidity_Lag1: data.Humidity,
      Temp_3Day_Avg: data.Temperature_Avg,
      AQI_3Day_Avg: data.AQI,
      Rainfall_3Day_Total: data.Rainfall,
      Month: new Date().getMonth() + 1,
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Prediction request failed");
      }

      const result = await response.json();
      setPrediction(result);
    } catch (error) {
      console.error(error);
      alert(
        "Could not connect to the Climate AI backend. Make sure Uvicorn is running on port 8000."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrends(city);
  }, [city]);

  const risk = prediction?.climate_risk || "Not Predicted";

  const riskClass = useMemo(() => {
    if (risk === "Severe") return "severe";
    if (risk === "High") return "high";
    if (risk === "Moderate") return "moderate";
    if (risk === "Low") return "low";
    return "unknown";
  }, [risk]);

  const environmentalScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        100 -
          (data.AQI / 500) * 50 -
          Math.max(0, data.Temperature_Avg - 30) * 2 -
          Math.max(0, data.Humidity - 75) * 0.3
      )
    )
  );

  const aqiStatus =
    data.AQI > 200 ? "Poor" : data.AQI > 100 ? "Moderate" : "Good";

  const temperatureStatus =
    data.Temperature_Avg > 35
      ? "High"
      : data.Temperature_Avg < 10
      ? "Low"
      : "Normal";

  const humidityStatus = data.Humidity > 70 ? "High" : "Normal";

  const rainfallStatus = data.Rainfall > 50 ? "Heavy" : "Low";

  const cloudStatus = data.Cloud_Cover > 60 ? "High" : "Normal";

  const pressureStatus = "Normal";

  return (
    <div className="app">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div>
          <div className="brand">
            <div className="brand-icon">🌍</div>

            <div>
              <h2>ClimateAI</h2>
              <span>Climate Action Platform</span>
            </div>
          </div>

          <nav className="sidebar-nav">
            <a className="active">
              <span>📊</span>
              Dashboard
            </a>

            <a
  href="#climate-risk"
  onClick={(e) => {
    e.preventDefault();
    document.getElementById("climate-risk")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }}
>
  <span>🌡️</span>
  Climate Risk
</a>

            <a
  href="#air-quality"
  onClick={(e) => {
    e.preventDefault();
    document.getElementById("air-quality")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }}
>
  <span>🌫️</span>
  Air Quality
</a>

            <a
  href="#recommendations"
  onClick={(e) => {
    e.preventDefault();
    document.getElementById("recommendations")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }}
>
  <span>🌱</span>
  Recommendations
</a>

            <a
  href="#analytics"
  onClick={(e) => {
    e.preventDefault();
    document.getElementById("analytics")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }}
>
  <span>📈</span>
  Analytics
</a>
          </nav>
        </div>
**
        <div className="sidebar-bottom">
          <div className="ai-status">
            <span className="status-dot"></span>
            Applied AI Climate Prediction Model
          </div>


        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main">

        {/* HEADER */}
        <header className="header">

          <div className="header-spacer"></div>

          <div className="header-center">
            <p className="eyebrow">
              AI-POWERED CLIMATE INTELLIGENCE
            </p>

            <h1>Climate Action Dashboard</h1>

            <p className="subtitle">
              Monitor environmental conditions and predict climate risk using
              machine learning.
            </p>
          </div>

          <div className="location-box">
            <span>📍</span>

            <select
              value={city}
              onChange={handleCityChange}
              disabled={loadingCity}
            >
              {cities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <span className="select-arrow">⌄</span>
          </div>

        </header>

        {/* TOP KPI CARDS */}
        <section className="cards">

          <MetricCard
            icon="🌡️"
            title="Temperature"
            value={`${data.Temperature_Avg}°C`}
            subtitle="Average temperature"
            data={trendData}
            dataKey="temperature"
            tone="red"
          />

          <MetricCard
            icon="💧"
            title="Humidity"
            value={`${data.Humidity}%`}
            subtitle="Current humidity level"
            data={trendData}
            dataKey="humidity"
            tone="blue"
          />

          <MetricCard
            icon="🌫️"
            title="Air Quality"
            value={data.AQI}
            subtitle={
              data.AQI > 200
                ? "Poor air quality"
                : "Air quality monitored"
            }
            data={trendData}
            dataKey="aqi"
            tone="gold"
            alert={data.AQI > 200}
          />

          <MetricCard
            icon="🌧️"
            title="Rainfall"
            value={`${data.Rainfall} mm`}
            subtitle="Recorded rainfall"
            data={trendData}
            dataKey="rainfall"
            tone="purple"
          />

        </section>

        {/* THREE MAIN PANELS - ONE LINE */}
        <section className="main-panels">

          {/* ENVIRONMENTAL CONDITIONS */}
          <div className="panel input-panel">

            <div className="panel-header">

              <div>
                <p className="section-label">MODEL INPUT</p>
                <h2>Environmental Conditions</h2>
              </div>

              <span className="live-badge">
                ● LIVE INPUT
              </span>

            </div>

            <div className="input-grid">

              <Input
                label="Maximum Temperature"
                name="Temperature_Max"
                value={data.Temperature_Max}
                onChange={handleChange}
                unit="°C"
              />

              <Input
                label="Minimum Temperature"
                name="Temperature_Min"
                value={data.Temperature_Min}
                onChange={handleChange}
                unit="°C"
              />

              <Input
                label="Average Temperature"
                name="Temperature_Avg"
                value={data.Temperature_Avg}
                onChange={handleChange}
                unit="°C"
              />

              <Input
                label="Humidity"
                name="Humidity"
                value={data.Humidity}
                onChange={handleChange}
                unit="%"
              />

              <Input
                label="Rainfall"
                name="Rainfall"
                value={data.Rainfall}
                onChange={handleChange}
                unit="mm"
              />

              <Input
                label="Wind Speed"
                name="Wind_Speed_kmh"
                value={data.Wind_Speed_kmh}
                onChange={handleChange}
                unit="km/h"
              />

              <Input
                label="Air Quality Index"
                name="AQI"
                value={data.AQI}
                onChange={handleChange}
                unit="AQI"
              />

              <Input
                label="Cloud Cover"
                name="Cloud_Cover"
                value={data.Cloud_Cover}
                onChange={handleChange}
                unit="%"
              />

            </div>

            <button
              className="predict-btn"
              onClick={predictRisk}
              disabled={loading}
            >
              {loading
                ? "Analyzing..."
                : "⚡ Predict Climate Risk"}
            </button>

          </div>

          {/* AI PREDICTION */}
          <div className="panel risk-panel" id="climate-risk">

            <div className="panel-header">

              <div>
                <p className="section-label">AI PREDICTION</p>
                <h2>Climate Risk Assessment</h2>
              </div>

              {prediction && (
                <span className="live-badge">
                  ● AI ANALYSIS
                </span>
              )}

            </div>

            <div className={`risk-circle ${riskClass}`}>
              <span>CLIMATE RISK</span>
              <strong>{risk}</strong>
            </div>

            {prediction ? (
              <>
                <div className="confidence-box">

                  <div className="confidence-header">
                    <span>Model Confidence</span>

                    <strong>
                      {prediction.confidence !== null &&
                      prediction.confidence !== undefined
                        ? `${prediction.confidence}%`
                        : "N/A"}
                    </strong>
                  </div>

                  <div className="confidence-bar">
                    <div
                      className="confidence-fill"
                      style={{
                        width: `${prediction.confidence || 0}%`,
                      }}
                    ></div>
                  </div>

                </div>

                <div className="ai-explanation">

                  <span className="explanation-icon">
                    🤖
                  </span>

                  <div>
                    <h3>AI Assessment</h3>

                    <p>
                      {risk === "Severe"
                        ? "Severe environmental conditions detected. Immediate climate-risk mitigation measures are recommended."
                        : risk === "High"
                        ? "High-risk environmental conditions detected. Climate-action measures should be prioritized."
                        : risk === "Moderate"
                        ? "Moderate climate risk detected. Continued monitoring and preventive action are recommended."
                        : "Low climate risk detected. Continue monitoring environmental conditions and maintaining sustainable practices."}
                    </p>
                  </div>

                </div>
              </>
            ) : (
              <div className="empty-result">

                <div>🤖</div>

                <p>
                  Run the AI model to generate a
                  climate-risk assessment.
                </p>

              </div>
            )}

          </div>

          {/* RECOMMENDATIONS */}
          <aside className="panel recommendations-panel" id="recommendations">

            <div className="panel-header">

              <div>
                <p className="section-label">
                  CLIMATE ACTION
                </p>

                <h2>Recommended Actions</h2>
              </div>

            </div>

            {prediction?.recommendations?.length ? (
              prediction.recommendations.map((item, index) => (
                <div className="recommendation" key={index}>
                  <span className="check-icon">✓</span>
                  <p>{item}</p>
                </div>
              ))
            ) : (
              <>
                <Recommendation
                  text="Use public transport whenever possible."
                />

                <Recommendation
                  text="Reduce unnecessary electricity consumption."
                />

                <Recommendation
                  text="Avoid open burning and waste burning."
                />

                <Recommendation
                  text="Continue monitoring local climate conditions."
                />

                {data.AQI > 200 && (
                  <Recommendation
                    text="Air quality is poor; reduce exposure to polluted outdoor environments."
                  />
                )}
              </>
            )}

          </aside>

        </section>

        {/* ENVIRONMENTAL STATUS */}
        <section className="panel overview-panel" id="air-quality">

          <div className="overview-header">

            <div>
              <p className="section-label">
                CLIMATE OVERVIEW
              </p>

              <h2>Environmental Status</h2>
            </div>

            <span className="overview-score">
              <strong>{environmentalScore}</strong>
              /100
            </span>

          </div>

          <div className="overview-grid">

            <OverviewMetric
              icon="🌡️"
              title="Temperature"
              value={`${data.Temperature_Avg}°C`}
              status={temperatureStatus}
              statusClass={
                temperatureStatus === "Normal"
                  ? "good"
                  : "warning"
              }
              tone="red"
            />

            <OverviewMetric
              icon="🌫️"
              title="Air Quality"
              value={`${data.AQI} AQI`}
              status={aqiStatus}
              statusClass={
                aqiStatus === "Good"
                  ? "good"
                  : aqiStatus === "Moderate"
                  ? "warning"
                  : "danger"
              }
              tone="gray"
            />

            <OverviewMetric
              icon="💧"
              title="Humidity"
              value={`${data.Humidity}%`}
              status={humidityStatus}
              statusClass={
                humidityStatus === "Normal"
                  ? "good"
                  : "warning"
              }
              tone="blue"
            />

            <OverviewMetric
              icon="🌧️"
              title="Rainfall"
              value={`${data.Rainfall} mm`}
              status={rainfallStatus}
              statusClass={
                rainfallStatus === "Low"
                  ? "good"
                  : "warning"
              }
              tone="purple"
            />

            <OverviewMetric
              icon="💨"
              title="Wind Speed"
              value={`${data.Wind_Speed_kmh} km/h`}
              status="Current"
              statusClass="good"
              tone="teal"
            />

            <OverviewMetric
              icon="☁️"
              title="Cloud Cover"
              value={`${data.Cloud_Cover}%`}
              status={cloudStatus}
              statusClass={
                cloudStatus === "Normal"
                  ? "good"
                  : "warning"
              }
              tone="violet"
            />

            <OverviewMetric
              icon="⏱️"
              title="Pressure"
              value={`${data.Pressure_Avg} hPa`}
              status={pressureStatus}
              statusClass="good"
              tone="green"
            />

            <OverviewMetric
              icon="🌱"
              title="Environment Score"
              value={`${environmentalScore}/100`}
              status="AI score"
              statusClass="good"
              tone="green"
            />

          </div>

        </section>

        {/* 30 DAY ANALYTICS */}
        <section className="trend-section" id="analytics">

          <div className="section-heading">

            <div>
              <p className="section-label">
                30-DAY ANALYTICS
              </p>

              <h2>
                Climate Trends — {city}
              </h2>
            </div>

            {loadingTrends && (
              <span className="loading-label">
                Updating...
              </span>
            )}

          </div>

          <TrendPanel
  label="TEMPERATURE"
  title={`Temperature Trend — ${city}`}
  data={trendData}
  dataKey="temperature"
  unit="°C"
  chartColor="#ff5f7e"
/>

          <TrendPanel
            label="AIR QUALITY"
            title={`AQI Trend — ${city}`}
            data={trendData}
            dataKey="aqi"
            unit="AQI"
            chartColor="#e4b63d"
          />

          <TrendPanel
            label="PRECIPITATION"
            title={`Rainfall Trend — ${city}`}
            data={trendData}
            dataKey="rainfall"
            unit="mm"
            chartColor="#42a5f5"
          />

          <TrendPanel
            label="ATMOSPHERIC CONDITIONS"
            title={`Humidity Trend — ${city}`}
            data={trendData}
            dataKey="humidity"
            unit="%"
            chartColor="#b58cff"
          />

        </section>

        <footer>
         
        
        </footer>

      </main>
    </div>
  );
}


/* ---------- TOP KPI CARD ---------- */

function MetricCard({
  icon,
  title,
  value,
  subtitle,
  data,
  dataKey,
  tone,
  alert,
}) {
  return (
    <div className="card">

      <div className="card-top">

        <span className={`card-icon ${tone}`}>
          {icon}
        </span>

        <small>{title}</small>

      </div>

      <strong>{value}</strong>

      <p className={alert ? "danger-text" : ""}>
        {subtitle}
      </p>

      <div className="mini-chart">

        {data.length > 0 && (
          <ResponsiveContainer
            width="100%"
            height={270}
            minWidth={0}
          >
            <LineChart data={data}>
              <Line
                type="monotone"
                dataKey={dataKey}
                strokeWidth={2}
                dot={false}
                stroke="currentColor"
                isAnimationActive
              />
            </LineChart>
          </ResponsiveContainer>
        )}

      </div>

    </div>
  );
}


/* ---------- ENVIRONMENTAL STATUS CARD ---------- */

function OverviewMetric({
  icon,
  title,
  value,
  status,
  statusClass,
  tone,
}) {
  return (
    <div className="metric-card">

      <div className={`metric-icon ${tone}`}>
        {icon}
      </div>

      <div className="metric-content">

        <span className="metric-title">
          {title}
        </span>

        <strong className="metric-value">
          {value}
        </strong>

        <span className={`metric-status ${statusClass}`}>
          {status}
        </span>

      </div>

    </div>
  );
}


/* ---------- RECOMMENDATION ---------- */

function Recommendation({ text }) {
  return (
    <div className="recommendation">

      <span className="check-icon">
        ✓
      </span>

      <p>{text}</p>

    </div>
  );
}


//* ---------- TREND CHART ---------- */

function TrendPanel({
  label,
  title,
  data,
  dataKey,
  unit,
  chartColor,
}) {
  const chartData = Array.isArray(data)
    ? data
        .map((item) => ({
          date: item.date,
          value: Number(item[dataKey]),
        }))
        .filter(
          (item) =>
            item.date &&
            Number.isFinite(item.value)
        )
    : [];

  return (
    <div className="panel trend-panel">

      <div className="trend-title-row">

        <div>
          <p className="section-label">
            {label}
          </p>

          <h3>{title}</h3>
        </div>

        <span className="trend-unit">
          {unit}
        </span>

      </div>

      <div className="chart-container">

        {chartData.length > 0 ? (

          <LineChart
            width={620}
            height={280}
            data={chartData}
            margin={{
              top: 15,
              right: 20,
              left: 10,
              bottom: 25,
            }}
          >

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#285047"
              opacity={0.6}
            />

            <XAxis
              dataKey="date"
              stroke="#8aa49d"
              tick={{
                fill: "#8aa49d",
                fontSize: 10,
              }}
              tickMargin={10}
              interval={4}
            />

            <YAxis
              stroke="#8aa49d"
              tick={{
                fill: "#8aa49d",
                fontSize: 10,
              }}
              width={45}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#06251f",
                border: "1px solid #176050",
                borderRadius: "8px",
                color: "#ffffff",
              }}
              labelStyle={{
                color: "#ffffff",
              }}
              formatter={(value) => [
                `${value} ${unit}`,
                label,
              ]}
            />

            <Line
              type="monotone"
              dataKey="value"
              stroke={chartColor}
              strokeWidth={3}
              dot={false}
              activeDot={{
                r: 6,
                strokeWidth: 2,
              }}
              connectNulls
              isAnimationActive={true}
              animationDuration={800}
            />

          </LineChart>

        ) : (

          <div className="chart-empty">
            No trend data available
          </div>

        )}

      </div>

    </div>
  );
}
/* ---------- INPUT ---------- */

function Input({
  label,
  name,
  value,
  onChange,
  unit,
}) {
  return (
    <div className="input-wrapper">

      <label>{label}</label>

      <div className="input-box">

        <input
          type="number"
          step="0.1"
          name={name}
          value={value}
          onChange={onChange}
        />

        <span>{unit}</span>

      </div>

    </div>
  );
}

export default App;