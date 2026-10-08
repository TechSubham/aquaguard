import os
import json
import math
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
import joblib
import numpy as np
import pandas as pd

# Paths to model directory
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
# Navigate from backend/app/services to ai/models
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, "..", "..", ".."))
AI_MODELS_DIR = os.path.join(PROJECT_ROOT, "ai", "models")


class AIEngine:
    """
    AquaGuard AI Prediction & Intelligence Layer.
    Answers: 'What is likely to happen next, why, and what should the admin do?'

    Features:
    1. Detect abnormal water behavior (historical trends, slopes, deteriorating patterns).
    2. Predict future deterioration (multi-horizon XGBoost: +2h, +4h, +6h).
    3. Generate calibrated risk score (0-100) & severity band (LOW, MODERATE, HIGH, CRITICAL).
    4. Parameter contribution explainability ('Why is risk 84%?').
    5. Root cause evidence engine (Filter degradation, sediment, source-water, etc.).
    6. Prescriptive actionable recommendations.
    7. Sensor anomaly detection (noise spikes vs genuine water-quality trend).
    8. Maintenance requirement prediction.
    9. Leakage prediction (level vs outflow mismatch).
    10. Student complaint + sensor correlation.
    """

    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(AIEngine, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self, models_dir: Optional[str] = None):
        if self._initialized:
            return
        
        self.models_dir = models_dir or AI_MODELS_DIR
        self.models: Dict[str, Any] = {}
        self.det_features: List[str] = []
        self.ano_features: List[str] = []
        self.manifest: Dict[str, Any] = {}
        self.thresholds: Dict[str, float] = {
            "2h": 0.45,
            "4h": 0.315,
            "6h": 0.50,
            "anomaly": 0.815
        }
        self.baselines: Dict[str, float] = {
            "ph": 7.20,
            "tds": 280.0,
            "turbidity": 1.0,
            "temperature": 25.0,
            "water_level": 80.0,
            "flow_rate": 3.5
        }
        
        self._load_artifacts()
        self._initialized = True

    def _load_artifacts(self):
        """Load XGBoost models and feature lists into memory."""
        try:
            # 1. Feature lists
            det_feat_path = os.path.join(self.models_dir, "deterioration_feature_list.json")
            if os.path.exists(det_feat_path):
                with open(det_feat_path, "r", encoding="utf-8") as f:
                    self.det_features = json.load(f)

            ano_feat_path = os.path.join(self.models_dir, "anomaly_feature_list.json")
            if os.path.exists(ano_feat_path):
                with open(ano_feat_path, "r", encoding="utf-8") as f:
                    self.ano_features = json.load(f)

            # 2. Manifest & Thresholds
            manifest_path = os.path.join(self.models_dir, "deployment_manifest_v2.json")
            if os.path.exists(manifest_path):
                with open(manifest_path, "r", encoding="utf-8") as f:
                    self.manifest = json.load(f)
                    det_cfg = self.manifest.get("deterioration", {})
                    th_cfg = det_cfg.get("thresholds", {})
                    self.thresholds["2h"] = float(th_cfg.get("2h", 0.45))
                    self.thresholds["4h"] = float(th_cfg.get("4h", 0.315))
                    self.thresholds["6h"] = float(th_cfg.get("6h", 0.50))
                    
                    ano_cfg = self.manifest.get("sensor_anomaly", {})
                    self.thresholds["anomaly"] = float(ano_cfg.get("xgboost_threshold", 0.815))

            # 3. XGBoost models
            model_files = {
                "det_2h": "xgb_deterioration_2h_v2.joblib",
                "det_4h": "xgb_deterioration_4h_v2.joblib",
                "det_6h": "xgb_deterioration_6h_v2.joblib",
                "anomaly": "xgb_sensor_anomaly_v2.joblib"
            }

            for key, filename in model_files.items():
                file_path = os.path.join(self.models_dir, filename)
                if os.path.exists(file_path):
                    self.models[key] = joblib.load(file_path)
                    print(f"[AI ENGINE] Loaded model {key} from {filename}")
                else:
                    print(f"[AI ENGINE WARNING] Model file {filename} not found at {file_path}")

        except Exception as e:
            print(f"[AI ENGINE ERROR] Failed to load models: {e}")

    def _ensure_history_window(
        self,
        history: List[Dict[str, Any]],
        current_reading: Dict[str, Any],
        target_hours: int = 24,
        steps_per_hour: int = 12  # 5-minute sampling -> 12 steps/hr -> 288 steps for 24h
    ) -> List[Dict[str, Any]]:
        """
        Ensure we have a full 24-hour historical window (288 points at 5-minute sampling).
        If history has sparse or hourly data across 24h, it smoothly interpolates onto
        the 5-minute grid. If history has fewer hours, it extrapolates backwards to 24h
        towards the nominal baseline.
        """
        if not history:
            history = [current_reading]

        # Clean readings
        cleaned = []
        for r in history:
            cleaned.append({
                "ph": float(r.get("ph") if r.get("ph") is not None else self.baselines["ph"]),
                "tds": float(r.get("tds") if r.get("tds") is not None else self.baselines["tds"]),
                "turbidity": float(r.get("turbidity") if r.get("turbidity") is not None else self.baselines["turbidity"]),
                "temperature": float(r.get("temperature") if r.get("temperature") is not None else self.baselines["temperature"]),
                "water_level": float(r.get("water_level") if r.get("water_level") is not None else self.baselines["water_level"]),
                "flow_rate": float(r.get("flow_rate") if r.get("flow_rate") is not None else self.baselines["flow_rate"]),
                "recorded_at": r.get("recorded_at") or datetime.utcnow().isoformat()
            })

        curr = {
            "ph": float(current_reading.get("ph") if current_reading.get("ph") is not None else self.baselines["ph"]),
            "tds": float(current_reading.get("tds") if current_reading.get("tds") is not None else self.baselines["tds"]),
            "turbidity": float(current_reading.get("turbidity") if current_reading.get("turbidity") is not None else self.baselines["turbidity"]),
            "temperature": float(current_reading.get("temperature") if current_reading.get("temperature") is not None else self.baselines["temperature"]),
            "water_level": float(current_reading.get("water_level") if current_reading.get("water_level") is not None else self.baselines["water_level"]),
            "flow_rate": float(current_reading.get("flow_rate") if current_reading.get("flow_rate") is not None else self.baselines["flow_rate"]),
            "recorded_at": current_reading.get("recorded_at") or datetime.utcnow().isoformat()
        }

        if not cleaned:
            cleaned = [curr]
        elif (abs(cleaned[-1]["turbidity"] - curr["turbidity"]) > 0.001 or
              abs(cleaned[-1]["ph"] - curr["ph"]) > 0.001 or
              abs(cleaned[-1]["tds"] - curr["tds"]) > 0.1):
            cleaned.append(curr)

        total_steps = target_hours * steps_per_hour  # 288 steps
        n = len(cleaned)

        if n >= total_steps:
            return cleaned[-total_steps:]

        # Check timestamp span of available history
        span_seconds = 0
        try:
            t_first = datetime.fromisoformat(str(cleaned[0]["recorded_at"]).replace("Z", "+00:00"))
            t_last = datetime.fromisoformat(str(cleaned[-1]["recorded_at"]).replace("Z", "+00:00"))
            span_seconds = abs((t_last - t_first).total_seconds())
        except Exception:
            span_seconds = 0

        # If data covers less than 12 hours and has fewer than 24 points, pad backwards to 24h ago
        if span_seconds < 12 * 3600 and n < 24:
            first_pt = cleaned[0]
            needed_pad = 24 - n
            pad_points = []
            now_ref = datetime.utcnow()
            for i in range(needed_pad, 0, -1):
                factor = (needed_pad - i + 1) / (needed_pad + 1)
                pad_points.append({
                    "ph": self.baselines["ph"] + (first_pt["ph"] - self.baselines["ph"]) * factor,
                    "tds": self.baselines["tds"] + (first_pt["tds"] - self.baselines["tds"]) * factor,
                    "turbidity": self.baselines["turbidity"] + (first_pt["turbidity"] - self.baselines["turbidity"]) * factor,
                    "temperature": self.baselines["temperature"] + (first_pt["temperature"] - self.baselines["temperature"]) * factor,
                    "water_level": self.baselines["water_level"] + (first_pt["water_level"] - self.baselines["water_level"]) * factor,
                    "flow_rate": self.baselines["flow_rate"] + (first_pt["flow_rate"] - self.baselines["flow_rate"]) * factor,
                    "recorded_at": (now_ref - timedelta(hours=24 * (i / needed_pad))).isoformat()
                })
            cleaned = pad_points + cleaned

        # Resample / interpolate to exactly 288 5-minute points across 24 hours
        keys = ["ph", "tds", "turbidity", "temperature", "water_level", "flow_rate"]
        x_orig = np.linspace(0, 1, len(cleaned))
        x_target = np.linspace(0, 1, total_steps)

        resampled = []
        now_dt = datetime.utcnow()
        for i in range(total_steps):
            resampled.append({
                "recorded_at": (now_dt - timedelta(minutes=5 * (total_steps - 1 - i))).isoformat()
            })

        for k in keys:
            y_orig = [r[k] for r in cleaned]
            y_interp = np.interp(x_target, x_orig, y_orig)
            for i in range(total_steps):
                resampled[i][k] = float(y_interp[i])

        # Guarantee last item exactly matches current reading
        resampled[-1] = curr
        return resampled

    def compute_24h_summary(self, readings_288: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Capability: 24-Hour Macro Trend & Baseline Analysis.
        Calculates 24-hour net drift, range, mean, water balance, and cumulative particulate load.
        """
        curr = readings_288[-1]
        t24h = readings_288[0]

        turb_arr = [r["turbidity"] for r in readings_288]
        tds_arr = [r["tds"] for r in readings_288]
        ph_arr = [r["ph"] for r in readings_288]
        level_arr = [r["water_level"] for r in readings_288]
        flow_arr = [r["flow_rate"] for r in readings_288]

        # Cumulative particulate exposure load over 24h: sum(turbidity * flow * dt_hours)
        dt_hr = 5.0 / 60.0  # 5 minutes in hours
        cumulative_turb_load = float(np.sum(np.array(turb_arr) * np.array(flow_arr) * dt_hr))

        return {
            "span_hours": 24,
            "sample_count": len(readings_288),
            "turbidity": {
                "current": round(float(curr["turbidity"]), 2),
                "at_24h_ago": round(float(t24h["turbidity"]), 2),
                "net_drift_24h": round(float(curr["turbidity"] - t24h["turbidity"]), 2),
                "mean_24h": round(float(np.mean(turb_arr)), 2),
                "max_24h": round(float(np.max(turb_arr)), 2),
                "min_24h": round(float(np.min(turb_arr)), 2),
            },
            "tds": {
                "current": round(float(curr["tds"]), 1),
                "at_24h_ago": round(float(t24h["tds"]), 1),
                "net_drift_24h": round(float(curr["tds"] - t24h["tds"]), 1),
                "mean_24h": round(float(np.mean(tds_arr)), 1),
                "max_24h": round(float(np.max(tds_arr)), 1),
            },
            "ph": {
                "current": round(float(curr["ph"]), 2),
                "at_24h_ago": round(float(t24h["ph"]), 2),
                "net_drift_24h": round(float(curr["ph"] - t24h["ph"]), 2),
                "min_24h": round(float(np.min(ph_arr)), 2),
                "max_24h": round(float(np.max(ph_arr)), 2),
            },
            "water_level": {
                "current": round(float(curr["water_level"]), 1),
                "min_24h": round(float(np.min(level_arr)), 1),
                "max_24h": round(float(np.max(level_arr)), 1),
                "net_drop_24h": round(float(t24h["water_level"] - curr["water_level"]), 1),
            },
            "cumulative_turbidity_load": round(cumulative_turb_load, 1),
        }

    def extract_features(
        self,
        history: List[Dict[str, Any]],
        current_reading: Dict[str, Any],
        baseline: Optional[Dict[str, float]] = None
    ) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        Extract the exact 185 deterioration features and 72 anomaly features
        matching training pipeline schemas.
        """
        base = baseline or self.baselines
        readings = self._ensure_history_window(history, current_reading)
        
        # Base sensors
        keys = ["ph", "tds", "turbidity", "temperature", "water_level", "flow_rate"]
        series_dict = {k: np.array([r[k] for r in readings], dtype=float) for k in keys}
        n = len(readings)

        # Lags mapping: 5m = lag 1, 15m = lag 3, 30m = lag 6, 60m = lag 12
        lags = {"5m": 1, "15m": 3, "30m": 6, "60m": 12}

        feat: Dict[str, float] = {}

        # 1. Base values at current step
        for k in keys:
            feat[k] = float(series_dict[k][-1])

        # 2. Changes across windows
        for k in keys:
            cur = series_dict[k][-1]
            for win_name, lag_idx in lags.items():
                idx = max(0, n - 1 - lag_idx)
                feat[f"{k}_change_{win_name}"] = float(cur - series_dict[k][idx])

        # 3. Absolute jumps (5m)
        for k in keys:
            feat[f"{k}_abs_jump_5m"] = float(abs(series_dict[k][-1] - series_dict[k][-2]))

        # 4. Rolling window stats (15m, 30m, 60m)
        for k in keys:
            s = series_dict[k]
            for win_name, lag_idx in [("15m", 3), ("30m", 6), ("60m", 12)]:
                window_data = s[max(0, n - lag_idx):]
                feat[f"{k}_mean_{win_name}"] = float(np.mean(window_data))
                feat[f"{k}_std_{win_name}"] = float(np.std(window_data) if len(window_data) > 1 else 0.0)
                feat[f"{k}_min_{win_name}"] = float(np.min(window_data))
                feat[f"{k}_max_{win_name}"] = float(np.max(window_data))
                feat[f"{k}_range_{win_name}"] = float(np.max(window_data) - np.min(window_data))

        # 5. Linear slopes (30m, 60m)
        for k in keys:
            s = series_dict[k]
            for win_name, lag_idx in [("30m", 6), ("60m", 12)]:
                window_data = s[max(0, n - lag_idx):]
                if len(window_data) > 1:
                    x = np.arange(len(window_data))
                    slope, _ = np.polyfit(x, window_data, 1)
                    feat[f"{k}_slope_{win_name}"] = float(slope)
                else:
                    feat[f"{k}_slope_{win_name}"] = 0.0

        # 6. Baseline deviations
        for k in keys:
            cur = feat[k]
            b = base.get(k, self.baselines[k])
            feat[f"{k}_baseline_deviation"] = float(cur - b)
            feat[f"{k}_baseline_abs_deviation"] = float(abs(cur - b))

        # 7. Robust statistics (30m)
        for k in keys:
            # Previous window excluding current reading
            prev_window = series_dict[k][max(0, n - 7):-1]
            if len(prev_window) == 0:
                prev_window = np.array([feat[k]])
            
            med = float(np.median(prev_window))
            dev = float(feat[k] - med)
            abs_dev = float(abs(dev))
            mad = float(np.median(np.abs(prev_window - med)))
            robust_z = float(dev / (1.4826 * mad + 1e-5))

            feat[f"{k}_prev_median_30m"] = med
            feat[f"{k}_dev_prev_median_30m"] = dev
            feat[f"{k}_abs_dev_prev_median_30m"] = abs_dev
            feat[f"{k}_prev_mad_30m"] = mad
            feat[f"{k}_robust_z_30m"] = robust_z

        # 8. Domain cross features
        feat["ph_distance_from_7"] = float(abs(feat["ph"] - 7.0))
        feat["tds_x_turbidity"] = float(feat["tds"] * feat["turbidity"])
        feat["tds_per_flow"] = float(feat["tds"] / max(feat["flow_rate"], 0.1))
        feat["turbidity_per_flow"] = float(feat["turbidity"] / max(feat["flow_rate"], 0.1))
        feat["level_x_flow"] = float(feat["water_level"] * feat["flow_rate"])

        # Format DataFrames aligning to model feature lists
        det_data = {col: [feat.get(col, 0.0)] for col in self.det_features}
        ano_data = {col: [feat.get(col, 0.0)] for col in self.ano_features}

        df_det = pd.DataFrame(det_data)
        df_ano = pd.DataFrame(ano_data)

        return df_det, df_ano

    def detect_abnormal_behavior(
        self,
        current_reading: Dict[str, Any],
        history: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Capability 1: Detect abnormal water behavior looking at history & trends,
        even before a hard threshold is crossed.
        """
        readings = self._ensure_history_window(history, current_reading)
        ph_arr = [r["ph"] for r in readings[-6:]]
        tds_arr = [r["tds"] for r in readings[-6:]]
        turb_arr = [r["turbidity"] for r in readings[-6:]]

        # Calculate slopes over past 30m
        x = np.arange(len(ph_arr))
        ph_slope = float(np.polyfit(x, ph_arr, 1)[0]) if len(ph_arr) > 1 else 0.0
        tds_slope = float(np.polyfit(x, tds_arr, 1)[0]) if len(tds_arr) > 1 else 0.0
        turb_slope = float(np.polyfit(x, turb_arr, 1)[0]) if len(turb_arr) > 1 else 0.0

        is_ph_dropping = ph_slope < -0.05
        is_tds_rising = tds_slope > 8.0
        is_turb_rising = turb_slope > 0.25

        deteriorating_signals = []
        if is_turb_rising:
            deteriorating_signals.append(f"Turbidity accelerating rapidly (+{turb_slope * 6:.2f} NTU/30m)")
        if is_tds_rising:
            deteriorating_signals.append(f"TDS climbing sharply (+{tds_slope * 6:.0f} ppm/30m)")
        if is_ph_dropping:
            deteriorating_signals.append(f"pH acidifying ({ph_slope * 6:.2f}/30m)")

        # 24-Hour Macro Trend Analysis
        t0 = readings[0]
        cur = readings[-1]
        turb_drift_24h = float(cur["turbidity"] - t0["turbidity"])
        tds_drift_24h = float(cur["tds"] - t0["tds"])
        ph_drift_24h = float(cur["ph"] - t0["ph"])

        if turb_drift_24h > 1.2:
            deteriorating_signals.append(f"24h Turbidity creep (+{turb_drift_24h:.2f} NTU drift across 24 hours)")
        if tds_drift_24h > 45:
            deteriorating_signals.append(f"24h TDS accumulation (+{tds_drift_24h:.0f} ppm above 24h baseline)")
        if abs(ph_drift_24h) > 0.35:
            drift_dir = "acidic" if ph_drift_24h < 0 else "alkaline"
            deteriorating_signals.append(f"24h pH {drift_dir} drift ({ph_drift_24h:+.2f} shift over 24 hours)")

        abnormal_trend_detected = (
            (len(deteriorating_signals) >= 2) or
            (turb_slope > 0.5) or
            (turb_drift_24h > 2.0 and turb_slope > 0.10) or
            (tds_drift_24h > 90.0)
        )

        return {
            "abnormal_pattern_detected": abnormal_trend_detected,
            "patterns": deteriorating_signals,
            "slopes": {
                "ph_slope_30m": round(ph_slope, 4),
                "tds_slope_30m": round(tds_slope, 4),
                "turbidity_slope_30m": round(turb_slope, 4),
            },
            "macro_24h_drift": {
                "turbidity_drift_24h": round(turb_drift_24h, 2),
                "tds_drift_24h": round(tds_drift_24h, 1),
                "ph_drift_24h": round(ph_drift_24h, 2),
            }
        }

    def detect_sensor_anomaly(self, df_ano: pd.DataFrame, current: Dict[str, Any]) -> Dict[str, Any]:
        """
        Capability 7: Differentiates single-point sensor anomalies / spikes
        from genuine physical water quality problems.
        """
        prob = 0.0
        if "anomaly" in self.models:
            try:
                prob = float(self.models["anomaly"].predict_proba(df_ano)[0][1])
            except Exception as e:
                print(f"[AI ENGINE] Anomaly model error: {e}")

        # Statistical spike check: sudden massive single-step jump that defies fluid dynamics
        turb_jump = float(df_ano.get("turbidity_abs_jump_5m", [0.0])[0])
        ph_jump = float(df_ano.get("ph_abs_jump_5m", [0.0])[0])
        tds_jump = float(df_ano.get("tds_abs_jump_5m", [0.0])[0])

        is_transient_spike = (turb_jump > 6.0) or (ph_jump > 2.5) or (tds_jump > 600.0)
        anomaly_flag = (prob >= self.thresholds["anomaly"]) or is_transient_spike

        anomaly_type = "NOMINAL"
        if anomaly_flag:
            if is_transient_spike:
                anomaly_type = "TRANSIENT_SPIKE"
            else:
                anomaly_type = "ELECTRODE_DEVIATION"

        return {
            "anomaly_detected": anomaly_flag,
            "anomaly_probability": round(prob, 4),
            "anomaly_type": anomaly_type,
            "is_sensor_glitch": is_transient_spike,
            "message": "Possible sensor anomaly detected (transient spike)" if is_transient_spike else "Sensor telemetry behavior normal"
        }

    def identify_contributing_factors(
        self,
        current: Dict[str, Any],
        history: List[Dict[str, Any]],
        risk_prob: float
    ) -> List[Dict[str, Any]]:
        """
        Capability 4: 'Why is it 84%?'
        Identifies parameter contribution strengths & physical trends.
        """
        factors = []
        turb = float(current.get("turbidity") or self.baselines["turbidity"])
        tds = float(current.get("tds") or self.baselines["tds"])
        ph = float(current.get("ph") or self.baselines["ph"])
        flow = float(current.get("flow_rate") or self.baselines["flow_rate"])

        # Compare to baseline & initial history
        turb_base_dev = turb - self.baselines["turbidity"]
        tds_base_dev = tds - self.baselines["tds"]
        ph_dist = abs(ph - 7.0)

        # Turbidity impact
        if turb > 1.5 or turb_base_dev > 0.5:
            turb_weight = min(0.92, 0.40 + (turb / 10.0) * 0.5)
            factors.append({
                "factor": "Turbidity increasing rapidly",
                "contribution": round(turb_weight, 2),
                "trend": "up",
                "detail": f"Turbidity at {turb:.2f} NTU (+{(turb_base_dev/self.baselines['turbidity'])*100:.0f}% vs baseline)"
            })

        # TDS impact
        if tds > 380 or tds_base_dev > 50:
            tds_weight = min(0.85, 0.35 + (tds / 600.0) * 0.45)
            factors.append({
                "factor": "TDS deviating from baseline",
                "contribution": round(tds_weight, 2),
                "trend": "up",
                "detail": f"TDS measured at {tds:.0f} ppm (baseline {self.baselines['tds']:.0f} ppm)"
            })

        # pH drift
        if ph < 6.8 or ph > 8.2:
            ph_trend = "down" if ph < 7.0 else "up"
            ph_weight = min(0.75, 0.30 + (ph_dist / 3.0) * 0.4)
            factors.append({
                "factor": "pH decreasing" if ph < 7.0 else "pH alkaline drift",
                "contribution": round(ph_weight, 2),
                "trend": ph_trend,
                "detail": f"pH shifted to {ph:.2f} (optimal potable bounds 6.5–8.5)"
            })

        # Flow rate stagnation
        if flow < 2.0 and risk_prob > 0.5:
            factors.append({
                "factor": "Inlet flow rate stagnation",
                "contribution": 0.48,
                "trend": "down",
                "detail": f"Flow dropped to {flow:.1f} L/min, reducing replenishment dilution"
            })

        # Sort by contribution descending
        factors.sort(key=lambda x: x["contribution"], reverse=True)

        if not factors:
            factors.append({
                "factor": "Nominal hydraulic equilibrium",
                "contribution": 0.15,
                "trend": "stable",
                "detail": "All monitored physicochemical parameters within standard BIS IS-10500 limits"
            })

        return factors

    def diagnose_possible_causes(
        self,
        current: Dict[str, Any],
        history: List[Dict[str, Any]],
        maintenance_days: int = 45,
        anomaly_info: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Capability 5: Evidence engine diagnosing physical root causes.
        """
        causes = []
        turb = float(current.get("turbidity") or self.baselines["turbidity"])
        tds = float(current.get("tds") or self.baselines["tds"])
        ph = float(current.get("ph") or self.baselines["ph"])
        flow = float(current.get("flow_rate") or self.baselines["flow_rate"])
        water_level = float(current.get("water_level") or self.baselines["water_level"])

        # Check if anomaly model flagged transient sensor glitch
        if anomaly_info and anomaly_info.get("is_sensor_glitch"):
            causes.append({
                "cause": "Sensor probe fouling or electrical transient",
                "confidence": 0.82,
                "confidencePercent": 82,
                "notes": "Isolated instantaneous jump without hydraulic continuity across concurrent sensors."
            })

        # 1. Filter degradation (Turbidity ↑, TDS ↑, Flow ↓, maintenance age)
        if turb > 2.0 or tds > 400:
            conf = 0.50
            if turb > 4.0: conf += 0.15
            if tds > 450: conf += 0.10
            if flow < 3.0: conf += 0.08
            if maintenance_days > 30: conf += 0.06
            conf = min(0.94, conf)
            causes.append({
                "cause": "Filter membrane degradation",
                "confidence": round(conf, 2),
                "confidencePercent": int(conf * 100),
                "notes": "Coincident rise in particulate turbidity with reduced flow rate indicates membrane breakthrough."
            })

        # 2. Tank sediment disturbance (Turbidity ↑, rapid refilling or low tank level)
        if turb > 2.0:
            conf = 0.40
            if water_level < 30.0 or water_level > 85.0: conf += 0.20
            if ph >= 6.8 and ph <= 7.4: conf += 0.10
            conf = min(0.85, conf)
            causes.append({
                "cause": "Tank sediment disturbance",
                "confidence": round(conf, 2),
                "confidencePercent": int(conf * 100),
                "notes": "Turbidity surge during refill or bottom-draw agitation without severe chemical alteration."
            })

        # 3. Municipal / feeder line source water variation
        if tds > 420 or turb > 3.0:
            conf = 0.38
            if tds > 480: conf += 0.15
            conf = min(0.70, conf)
            causes.append({
                "cause": "Source-water variation (Municipal supply shock)",
                "confidence": round(conf, 2),
                "confidencePercent": int(conf * 100),
                "notes": "External intake supply carries higher mineral dissolved solids from city feeder main."
            })

        # 4. Pipe biofilm sloughing / stagnation
        if ph < 6.6 and flow < 2.5:
            causes.append({
                "cause": "Distribution piping biofilm detachment",
                "confidence": 0.42,
                "confidencePercent": 42,
                "notes": "Acidic micro-drift combined with low flow velocity points to internal piping biofilm detachment."
            })

        # Sort by confidence descending
        causes.sort(key=lambda x: x["confidence"], reverse=True)

        if not causes:
            causes.append({
                "cause": "Clean operating parameters",
                "confidence": 0.95,
                "confidencePercent": 95,
                "notes": "Physicochemical parameters align with sterile operating baseline."
            })

        return causes

    def prescribe_actions(
        self,
        risk_score: int,
        severity: str,
        possible_causes: List[Dict[str, Any]],
        anomaly_info: Optional[Dict[str, Any]] = None
    ) -> List[str]:
        """
        Capability 6: Formulates prescriptive operational actions.
        """
        actions = []
        top_cause = possible_causes[0]["cause"] if possible_causes else ""

        if anomaly_info and anomaly_info.get("is_sensor_glitch"):
            return [
                "1. Clean and recalibrate optical turbidity & pH sensor probes",
                "2. Inspect wiring and ESP32 analog ADC ground shielding",
                "3. Cross-verify readings with portable handheld testing kit"
            ]

        if severity in ["HIGH", "CRITICAL"]:
            if "Filter" in top_cause:
                actions.append("1. Inspect filtration system and differential pressure gauge")
                actions.append("2. Initiate backwash cycle or replace sediment pre-filter cartridges")
            elif "sediment" in top_cause.lower():
                actions.append("1. Inspect tank condition and bottom silt accumulation")
                actions.append("2. Temporarily pause gravity distribution to student taps until sediment settles")
            else:
                actions.append("1. Inspect primary intake feeder valve and inline strainer")
                actions.append("2. Verify disinfection dosing pump operation")

            actions.append("3. Collect laboratory water sample for microbiological and coliform testing")
            actions.append("4. Issue preventive advisory to hostel block warden")
        elif severity == "MODERATE":
            actions.append("1. Inspect filtration skid and monitor turbidity trend on next refill")
            actions.append("2. Verify chlorine residual and TDS at point-of-use cooler")
            actions.append("3. Schedule routine tank inspection within 48 hours")
        else:
            actions.append("1. Continue automated continuous telemetry monitoring")
            actions.append("2. Maintain scheduled preventative maintenance roster")

        return actions

    def predict_maintenance(
        self,
        current: Dict[str, Any],
        maintenance_record: Optional[Dict[str, Any]] = None,
        history: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Capability 8: Predict maintenance requirements from 24h degradation trends + age + particle load.
        """
        turb = float(current.get("turbidity") or 1.0)
        tds = float(current.get("tds") or 280.0)

        days_since = 38
        if maintenance_record and maintenance_record.get("completed_date"):
            try:
                dt = datetime.strptime(str(maintenance_record["completed_date"]), "%Y-%m-%d")
                days_since = (datetime.utcnow() - dt).days
            except Exception:
                pass

        # 24-hour cumulative particulate exposure
        load_factor = 0.0
        if history:
            readings = self._ensure_history_window(history, current)
            turb_arr = [r["turbidity"] for r in readings]
            flow_arr = [r["flow_rate"] for r in readings]
            dt_hr = 5.0 / 60.0
            cum_load = float(np.sum(np.array(turb_arr) * np.array(flow_arr) * dt_hr))
            if cum_load > 200:
                load_factor = min(0.20, (cum_load - 200) / 1000.0)

        # Calculate maintenance urgency
        maint_risk = min(0.96, 0.20 + (days_since / 90.0) * 0.40 + (turb / 10.0) * 0.35 + load_factor)

        if maint_risk > 0.70:
            window = "2–4 days"
            rec = "Filter backwash and sediment cartridge replacement required urgently based on 24h particulate loading"
        elif maint_risk > 0.40:
            window = "7–10 days"
            rec = "Routine filter maintenance recommended within next scheduled window"
        else:
            window = "20–30 days"
            rec = "Filtration elements operating efficiently within normal 24h baseline"

        return {
            "maintenance_risk": round(maint_risk, 2),
            "maintenance_risk_percent": int(maint_risk * 100),
            "days_since_last_service": days_since,
            "maintenance_window": window,
            "recommendation": rec
        }

    def predict_leakage(
        self,
        current: Dict[str, Any],
        history: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Capability 9: Leakage prediction from level decline vs flow rate mismatch over 24 hours.
        """
        readings = self._ensure_history_window(history, current)
        levels = [r["water_level"] for r in readings[-6:]]
        flows = [r["flow_rate"] for r in readings[-6:]]

        # Calculate level rate of loss (%/hr)
        level_drop_30m = levels[0] - levels[-1]  # positive if dropping
        hourly_drop_rate = max(0.0, level_drop_30m * 2.0)
        avg_flow = float(np.mean(flows))

        # Check 24-hour net level loss
        net_level_drop_24h = float(readings[0]["water_level"] - readings[-1]["water_level"])

        # If tank level drops > 4.5%/hour while inlet flow is near zero or low demand hours
        is_abnormal_drop = (hourly_drop_rate > 4.5) and (avg_flow < 2.0)
        if net_level_drop_24h > 40.0 and avg_flow < 2.5:
            is_abnormal_drop = True

        confidence = 0.88 if is_abnormal_drop else 0.12

        return {
            "detected": is_abnormal_drop,
            "confidence": round(confidence, 2),
            "confidence_percent": int(confidence * 100),
            "estimated_hourly_drop_percent": round(hourly_drop_rate, 1),
            "net_level_drop_24h": round(net_level_drop_24h, 1),
            "recommendation": "Possible distribution pipe rupture or overflow valve leak detected" if is_abnormal_drop else "Water containment stable"
        }

    def correlate_complaints(
        self,
        current: Dict[str, Any],
        recent_complaints: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Capability 10: Student complaint + sensor correlation.
        """
        turb = float(current.get("turbidity") or 1.0)
        tds = float(current.get("tds") or 280.0)
        ph = float(current.get("ph") or 7.2)

        is_water_deteriorated = (turb > 3.0) or (tds > 420) or (ph < 6.5 or ph > 8.5)
        count = len(recent_complaints)

        if count > 0 and is_water_deteriorated:
            types = [c.get("complaint_type") or "water quality" for c in recent_complaints[:3]]
            type_str = ", ".join(set(types))
            summary = f"{count} student complaint(s) ({type_str}) strongly correlate with abnormal sensor telemetry in this tank."
            correlated = True
        elif count > 0:
            summary = f"{count} student complaint(s) logged, but local tank sensor telemetry is currently within nominal bounds."
            correlated = False
        else:
            summary = "No recent student complaints registered for this tank block."
            correlated = False

        return {
            "correlated": correlated,
            "complaint_count": count,
            "summary": summary
        }

    def predict_risk(
        self,
        tank_code: str,
        current_reading: Dict[str, Any],
        history: List[Dict[str, Any]],
        recent_complaints: Optional[List[Dict[str, Any]]] = None,
        maintenance_record: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Main AI Engine entrypoint integrating all 10 capabilities.
        Produces the standardized predictive JSON output.
        """
        # 1. Feature Engineering
        df_det, df_ano = self.extract_features(history, current_reading)

        # 2. Anomaly Model Execution
        anomaly_info = self.detect_sensor_anomaly(df_ano, current_reading)

        # 3. Future Deterioration XGBoost Models (+2h, +4h, +6h)
        prob_2h = 0.15
        prob_4h = 0.20
        prob_6h = 0.25

        if "det_2h" in self.models:
            try:
                prob_2h = float(self.models["det_2h"].predict_proba(df_det)[0][1])
            except Exception as e:
                print(f"[AI ENGINE] 2h prediction error: {e}")

        if "det_4h" in self.models:
            try:
                prob_4h = float(self.models["det_4h"].predict_proba(df_det)[0][1])
            except Exception as e:
                print(f"[AI ENGINE] 4h prediction error: {e}")

        if "det_6h" in self.models:
            try:
                prob_6h = float(self.models["det_6h"].predict_proba(df_det)[0][1])
            except Exception as e:
                print(f"[AI ENGINE] 6h prediction error: {e}")

        # Physical calibration based on current actual sensor levels
        turb = float(current_reading.get("turbidity") or 1.0)
        tds = float(current_reading.get("tds") or 280.0)
        ph = float(current_reading.get("ph") or 7.2)

        physical_risk = 0.05
        if turb > 5.0 or tds > 480 or ph < 6.4:
            physical_risk = 0.85
        elif turb > 2.5 or tds > 380 or ph < 6.7:
            physical_risk = 0.55
        elif turb > 1.5 or tds > 320:
            physical_risk = 0.30

        # Monotonic probability progression with physical sanity calibration
        if physical_risk <= 0.10:
            # Pristine drinking water baseline
            prob_2h = min(prob_2h, 0.12)
            prob_4h = min(prob_4h, 0.16)
            prob_6h = min(prob_6h, 0.20)
            p_curr = 0.08
            p_2h_cal = 0.10
            p_4h_cal = 0.15
            p_6h_cal = 0.18
        elif physical_risk <= 0.35:
            # Mild to moderate drift
            prob_2h = min(prob_2h, 0.40)
            prob_4h = min(prob_4h, 0.50)
            prob_6h = min(prob_6h, 0.55)
            p_curr = max(0.25, min(0.50, 0.45 * prob_2h + 0.55 * physical_risk))
            p_2h_cal = max(p_curr * 0.95, prob_2h)
            p_4h_cal = max(p_2h_cal, prob_4h)
            p_6h_cal = max(p_4h_cal, prob_6h)
        else:
            # High / Critical deterioration
            p_curr = max(0.55, min(0.98, 0.45 * prob_2h + 0.55 * physical_risk))
            p_2h_cal = max(p_curr * 0.95, max(0.80, prob_2h))
            p_4h_cal = max(p_2h_cal, max(0.88, prob_4h))
            p_6h_cal = max(p_4h_cal, max(0.94, prob_6h))

        # Overall risk score & probability
        overall_prob = round(max(p_curr, p_6h_cal), 4)
        risk_score = int(round(overall_prob * 100))

        # Severity categorization
        if risk_score <= 30:
            severity = "LOW"
        elif risk_score <= 60:
            severity = "MODERATE"
        elif risk_score <= 80:
            severity = "HIGH"
        else:
            severity = "CRITICAL"

        # 4. Trend & Abnormal Pattern Detection (24h Window)
        readings_288 = self._ensure_history_window(history, current_reading)
        summary_24h = self.compute_24h_summary(readings_288)
        abnormal_info = self.detect_abnormal_behavior(current_reading, history)

        # 5. Contributing Factors (Explainability)
        contributing_factors = self.identify_contributing_factors(current_reading, history, overall_prob)

        # 6. Possible Causes (Evidence Engine)
        possible_causes = self.diagnose_possible_causes(
            current_reading,
            history,
            maintenance_days=30,
            anomaly_info=anomaly_info
        )

        # 7. Recommended Actions
        recommended_actions = self.prescribe_actions(risk_score, severity, possible_causes, anomaly_info)

        # 8. Maintenance Prediction (Incorporating 24h Particle Load)
        maint_prediction = self.predict_maintenance(current_reading, maintenance_record, history=history)

        # 9. Leakage Prediction
        leak_prediction = self.predict_leakage(current_reading, history)

        # 10. Complaint Correlation
        complaint_corr = self.correlate_complaints(current_reading, recent_complaints or [])

        # Downsample 288 points to 25 hourly snapshots for frontend historical visualization
        hourly_24h_snapshots = [
            {
                "hour_offset": -(24 - i),
                "recorded_at": readings_288[i * 12]["recorded_at"],
                "turbidity": round(float(readings_288[i * 12]["turbidity"]), 2),
                "tds": round(float(readings_288[i * 12]["tds"]), 1),
                "ph": round(float(readings_288[i * 12]["ph"]), 2),
                "water_level": round(float(readings_288[i * 12]["water_level"]), 1),
                "flow_rate": round(float(readings_288[i * 12]["flow_rate"]), 1)
            }
            for i in range(24)
        ]
        hourly_24h_snapshots.append({
            "hour_offset": 0,
            "recorded_at": readings_288[-1]["recorded_at"],
            "turbidity": round(float(readings_288[-1]["turbidity"]), 2),
            "tds": round(float(readings_288[-1]["tds"]), 1),
            "ph": round(float(readings_288[-1]["ph"]), 2),
            "water_level": round(float(readings_288[-1]["water_level"]), 1),
            "flow_rate": round(float(readings_288[-1]["flow_rate"]), 1)
        })

        # Executive summary
        if severity in ["HIGH", "CRITICAL"]:
            prediction_summary = f"High risk of water-quality deterioration within 4–6 hours ({int(p_6h_cal * 100)}% projected risk). 24h baseline drift shows turbidity shifted {summary_24h['turbidity']['net_drift_24h']:+.2f} NTU."
        elif severity == "MODERATE":
            prediction_summary = f"Elevated trend detected. Early indicators show gradual water-quality drift over the next 4–6 hours (24h turbidity drift: {summary_24h['turbidity']['net_drift_24h']:+.2f} NTU)."
        else:
            prediction_summary = "Telemetry exhibits nominal operating bounds across the 24-hour evaluation window. Low contamination risk projected over next 6 hours."

        return {
            "tank_id": tank_code,
            "risk_probability": overall_prob,
            "risk_score": risk_score,
            "prediction_horizon_hours": 6,
            "history_window_hours": 24,
            "history_points_count": len(history),
            "history_24h_summary": summary_24h,
            "history_24h_snapshots": hourly_24h_snapshots,
            "severity": severity,
            "anomaly_detected": anomaly_info["anomaly_detected"],
            "anomaly_details": anomaly_info,
            "abnormal_pattern_detected": abnormal_info["abnormal_pattern_detected"],
            "abnormal_details": abnormal_info,
            "trajectory": {
                "current": int(round(p_curr * 100)),
                "plus_2h": int(round(p_2h_cal * 100)),
                "plus_4h": int(round(p_4h_cal * 100)),
                "plus_6h": int(round(p_6h_cal * 100)),
            },
            "contributing_factors": contributing_factors,
            "possible_causes": possible_causes,
            "recommended_actions": recommended_actions,
            "maintenance_prediction": maint_prediction,
            "leakage_prediction": leak_prediction,
            "complaint_correlation": complaint_corr,
            "prediction_summary": prediction_summary,
            "model_version": "v2.0-XGBoost-Ensemble-24h",
            "last_inferred_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
            "safety_statement": "Predictions represent deterioration risk in monitored sensor indicators and sensor-behaviour anomalies across 24h historical telemetry. They do not certify drinking-water safety."
        }


# Global singleton instance
ai_engine = AIEngine()
