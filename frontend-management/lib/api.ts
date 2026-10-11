import {
  SensorReading,
  Tank,
  AlertItem,
  Complaint,
  Incident,
  IncidentStage,
  UserSession,
  Hostel,
  AIPredictionData
} from './types';
import {
  INITIAL_READING_A2,
  INITIAL_TANKS,
  INITIAL_HOSTELS,
  INITIAL_ALERTS,
  INITIAL_AI_PREDICTION,
  INITIAL_COMPLAINTS,
  INITIAL_INCIDENT,
  generateHistoricalReadings,
} from './mockData';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_FALLBACK_BASE = process.env.NEXT_PUBLIC_API_FALLBACK_URL || 'http://localhost:8001';
const API_BASE_CANDIDATES = Array.from(new Set([API_BASE, API_FALLBACK_BASE].filter(Boolean)));

function getAdminToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('aquaguard_admin_token') || localStorage.getItem('aquaguard_token') || '';
}

type BackendTank = {
  tank_code: string;
  hostel_id?: number | string | null;
  block_name?: string | null;
  hostel_name?: string | null;
  capacity_liters?: number | string | null;
};

type TankStatusResponse = {
  sensor_online?: boolean;
  water_level?: number | string | null;
  risk_score?: number | string | null;
  last_reading?: string | null;
};

type LivePredictionResponse = {
  tank_id?: string;
  ready?: boolean;
  status?: string;
  readings_collected?: number;
  readings_required?: number;
  baseline_readings_required?: number;
  risk?: {
    '2h'?: { probability?: number; percentage?: number; warning?: boolean };
    '4h'?: { probability?: number; percentage?: number; warning?: boolean };
  };
  sensor_health?: {
    anomaly?: boolean;
    anomaly_probability?: number;
  };
  explanation?: string[];
  inference_backend?: string;
  models_loaded?: string[];
  safety_statement?: string;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

function asRecordArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value)
    ? value.filter((item) => item && typeof item === 'object').map((item) => item as Record<string, unknown>)
    : [];
}

function asLivePrediction(value: unknown): LivePredictionResponse | null {
  return value && typeof value === 'object' ? value as LivePredictionResponse : null;
}

async function fetchJsonFromCandidates(path: string, init?: RequestInit): Promise<unknown | null> {
  for (const base of API_BASE_CANDIDATES) {
    try {
      const res = await fetch(`${base}${path}`, init);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Try the next configured backend URL.
    }
  }
  return null;
}

function riskStatusFromScore(score: number): Tank['riskStatus'] {
  if (score >= 80) return 'CRITICAL';
  if (score >= 50) return 'HIGH';
  if (score >= 30) return 'ELEVATED';
  return 'NORMAL';
}

function mapLiveReading(item: unknown, tankCode: string): SensorReading {
  const record = asRecord(item);
  const recordedAt = typeof record.timestamp === 'string'
    ? record.timestamp
    : typeof record.recorded_at === 'string'
    ? record.recorded_at
    : new Date().toISOString();

  return {
    tank_id: typeof record.tank_id === 'string' ? record.tank_id : tankCode,
    recorded_at: recordedAt,
    temperature: Number(record.temperature ?? 25),
    ph: Number(record.ph ?? 7.0),
    tds: Number(record.tds ?? 300),
    turbidity: Number(record.turbidity ?? 1.0),
    water_level: Number(record.water_level ?? 80),
    flow_rate: Number(record.flow_rate ?? 3.5),
    risk_score: Number(record.risk_score ?? 20),
    ai_risk_probability: Number(record.ai_risk_probability ?? 0.15),
  };
}

function normalizeRiskLevel(status: string | undefined, fallbackPercent: number): AIPredictionData['riskLevel'] {
  if (status === 'SENSOR_FAULT') return 'HIGH';
  if (status === 'HIGH' || status === 'MODERATE' || status === 'LOW' || status === 'CRITICAL') {
    return status;
  }
  if (fallbackPercent >= 80) return 'CRITICAL';
  if (fallbackPercent >= 50) return 'HIGH';
  if (fallbackPercent >= 30) return 'MODERATE';
  return 'LOW';
}

function mapLiveAIPrediction(data: LivePredictionResponse, tankCode: string): AIPredictionData {
  if (data.status === 'NO_DATA') {
    return {
      status: 'offline',
      message: 'No live AI readings have been received for this tank yet.',
      tankId: tankCode,
      currentRiskPercent: 0,
      riskLevel: 'LOW',
      futureProjections: [],
      predictionSummary: 'Waiting for Wokwi or IoT telemetry.',
      rootCauses: [],
      possibleCauses: [],
      recommendedActions: ['Start Wokwi telemetry or post readings to /sensor-reading.'],
      lastInferenceAt: 'No live inference yet',
      modelVersion: 'v2.0-XGBoost Live',
    };
  }

  if (!data.ready) {
    const collected = Number(data.readings_collected ?? 0);
    const required = Number(data.readings_required ?? 13);
    return {
      status: 'online',
      tankId: data.tank_id || tankCode,
      currentRiskPercent: 0,
      riskLevel: 'LOW',
      riskProbability: 0,
      predictionHorizonHours: 4,
      historyWindowHours: 1,
      historyPointsCount: collected,
      futureProjections: [
        { timeOffset: 'Now', riskPercent: 0 },
        { timeOffset: '+2 hrs', riskPercent: 0 },
        { timeOffset: '+4 hrs', riskPercent: 0 },
      ],
      predictionSummary: `AI calibration in progress: ${collected}/${required} five-minute readings collected.`,
      rootCauses: [
        {
          factor: 'Baseline calibration',
          trend: 'stable',
          detail: 'The first 12 readings establish this tank baseline before XGBoost inference starts.',
          contribution: 0,
        },
      ],
      possibleCauses: [],
      recommendedActions: ['Continue collecting simulated five-minute readings until calibration completes.'],
      lastInferenceAt: 'Calibrating',
      modelVersion: 'v2.0-XGBoost Live',
      anomalyDetected: false,
      safetyStatement: data.safety_statement,
    };
  }

  const risk2h = Number(data.risk?.['2h']?.percentage ?? 0);
  const risk4h = Number(data.risk?.['4h']?.percentage ?? risk2h);
  const currentRiskPercent = Math.round(Math.max(risk2h, risk4h));
  const explanation = data.explanation?.length ? data.explanation : ['No major adverse trend detected.'];

  return {
    status: 'online',
    tankId: data.tank_id || tankCode,
    currentRiskPercent,
    riskLevel: normalizeRiskLevel(data.status, currentRiskPercent),
    riskProbability: Number((Math.max(risk2h, risk4h) / 100).toFixed(4)),
    predictionHorizonHours: 4,
    historyWindowHours: 1,
    futureProjections: [
      { timeOffset: 'Now', riskPercent: Math.round(risk2h) },
      { timeOffset: '+2 hrs', riskPercent: Math.round(risk2h) },
      { timeOffset: '+4 hrs', riskPercent: Math.round(risk4h) },
      { timeOffset: '+6 hrs', riskPercent: Math.round(risk4h) },
    ],
    predictionSummary: data.status === 'SENSOR_FAULT'
      ? 'Live model detected sensor-behaviour anomaly. Verify probes before acting on water-quality trends.'
      : `Live XGBoost inference reports ${data.status || 'LOW'} deterioration risk from recent telemetry.`,
    rootCauses: explanation.map((detail, index) => ({
      factor: index === 0 ? 'Live telemetry trend' : 'Supporting signal',
      trend: detail.toLowerCase().includes('decreasing') ? 'down' : detail.toLowerCase().includes('no major') ? 'stable' : 'up',
      detail,
      contribution: index === 0 ? 0.7 : 0.4,
    })),
    possibleCauses: explanation.map((detail) => ({
      cause: detail.replace(/\.$/, ''),
      confidencePercent: data.status === 'LOW' ? 35 : 70,
      notes: 'Generated from the live V2 feature-engineering explanation layer.',
    })),
    recommendedActions: data.status === 'LOW'
      ? ['1. Continue automated telemetry monitoring', '2. Keep collecting five-minute AI snapshots']
      : ['1. Inspect current tank telemetry trend', '2. Cross-check sensor probes', '3. Collect a manual water-quality sample if trend persists'],
    lastInferenceAt: 'Just now',
    modelVersion: `v2.0-XGBoost Live (${data.inference_backend || 'xgboost_artifacts'})`,
    anomalyDetected: Boolean(data.sensor_health?.anomaly),
    anomalyDetails: {
      anomaly_probability: Number(data.sensor_health?.anomaly_probability ?? 0),
      anomaly_type: data.sensor_health?.anomaly ? 'SENSOR_FAULT' : 'NOMINAL',
      message: data.sensor_health?.anomaly ? 'Sensor anomaly threshold crossed.' : 'Sensor telemetry behavior normal',
    },
    abnormalPatternDetected: data.status === 'HIGH' || data.status === 'MODERATE',
    safetyStatement: data.safety_statement,
  };
}

// ----------------------------------------------------
// 1. Telemetry Readings
// ----------------------------------------------------
export async function fetchLatestReading(tankCode: string): Promise<SensorReading> {
  const liveHistory = asRecordArray(await fetchJsonFromCandidates(`/history/${tankCode}`, {
    cache: 'no-store',
    headers: { 'Accept': 'application/json' },
  }));
  if (Array.isArray(liveHistory) && liveHistory.length > 0) {
    return mapLiveReading(liveHistory[liveHistory.length - 1], tankCode);
  }

  try {
    const res = await fetch(`${API_BASE}/readings/latest/${tankCode}`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.has_data !== false) {
        return {
          tank_id: data.tank_id || tankCode,
          recorded_at: data.recorded_at || new Date().toISOString(),
          temperature: Number(data.temperature ?? 26.29),
          ph: Number(data.ph ?? 6.39),
          tds: Number(data.tds ?? 486),
          turbidity: Number(data.turbidity ?? 6.88),
          water_level: Number(data.water_level ?? 79.9),
          flow_rate: Number(data.flow_rate ?? 3.5),
          risk_score: Number(data.risk_score ?? 90),
          ai_risk_probability: Number(data.ai_risk_probability ?? 0.84),
        };
      }
    }
  } catch {
    // Offline fallback
  }

  if (tankCode === 'A2-ROOF-01') {
    return { ...INITIAL_READING_A2, recorded_at: new Date().toISOString() };
  }

  return {
    tank_id: tankCode,
    recorded_at: new Date().toISOString(),
    temperature: 24.8,
    ph: 7.2,
    tds: 210,
    turbidity: 0.9,
    water_level: 88.0,
    flow_rate: 4.2,
    risk_score: 16,
    ai_risk_probability: 0.12,
  };
}

export async function fetchReadingHistory(tankCode: string, limit: number = 24): Promise<SensorReading[]> {
  const liveHistory = asRecordArray(await fetchJsonFromCandidates(`/history/${tankCode}`, {
    cache: 'no-store',
    headers: { 'Accept': 'application/json' },
  }));
  if (Array.isArray(liveHistory) && liveHistory.length > 0) {
    return liveHistory.slice(-limit).map((item) => mapLiveReading(item, tankCode));
  }

  try {
    const res = await fetch(`${API_BASE}/readings/history/${tankCode}?limit=${limit}`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item: any) => ({
          tank_id: tankCode,
          recorded_at: item.recorded_at || new Date().toISOString(),
          temperature: Number(item.temperature ?? 25),
          ph: Number(item.ph ?? 7.0),
          tds: Number(item.tds ?? 300),
          turbidity: Number(item.turbidity ?? 1.0),
          water_level: Number(item.water_level ?? 80),
          flow_rate: Number(item.flow_rate ?? 3.5),
          risk_score: Number(item.risk_score ?? 20),
          ai_risk_probability: Number(item.ai_risk_probability ?? 0.15),
        }));
      }
    }
  } catch {
    // Offline fallback
  }

  const latest = await fetchLatestReading(tankCode);
  return generateHistoricalReadings(latest, limit);
}

// ----------------------------------------------------
// 2. Tanks Fleet & Status API
// ----------------------------------------------------
export async function fetchTanks(): Promise<Tank[]> {
  try {
    const res = await fetch(`${API_BASE}/tanks`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return Promise.all((data as BackendTank[]).map(async (t) => {
          const matchMock = INITIAL_TANKS.find((m) => m.code === t.tank_code || m.id === t.tank_code);
          const status = await fetchTankStatus(t.tank_code);
          const riskScore = Number(status?.risk_score ?? matchMock?.riskScore ?? 18);
          const lastReading = status?.last_reading ? new Date(status.last_reading) : null;
          return {
            id: t.tank_code,
            code: t.tank_code,
            name: matchMock?.name ?? `${t.block_name || 'Block A'} Main Header`,
            hostelId: t.hostel_id ? `hostel-${t.hostel_id}` : matchMock?.hostelId ?? 'hostel-ramanujan',
            hostel: t.hostel_name ?? matchMock?.hostel ?? 'Ramanujan Hostel (Boys Hostel 1)',
            block: t.block_name || matchMock?.block || 'Block A',
            capacityLiters: Number(t.capacity_liters || matchMock?.capacityLiters || 10000),
            waterLevelPercent: Number(status?.water_level ?? matchMock?.waterLevelPercent ?? 79.9),
            sensorStatus: status?.sensor_online === false ? 'OFFLINE' : 'ONLINE',
            riskStatus: riskStatusFromScore(riskScore),
            riskScore,
            lastUpdated: lastReading ? lastReading.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'No readings',
            lastServiceDate: matchMock?.lastServiceDate ?? '12 Sep 2026',
            nextServiceDate: matchMock?.nextServiceDate ?? '12 Oct 2026',
          };
        }));
      }
    }
  } catch {
    // Offline fallback
  }
  return INITIAL_TANKS;
}

export async function fetchHostelsApi(): Promise<Hostel[]> {
  try {
    const res = await fetch(`${API_BASE}/hostels`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((h: any) => {
          const matchMock = INITIAL_HOSTELS.find((m) => m.name.toLowerCase() === h.name.toLowerCase());
          return {
            id: `hostel-${h.id}`,
            code: matchMock?.code ?? `H-${h.id}`,
            name: h.name,
            campus: h.location || matchMock?.campus || 'NSUT Main Campus',
            type: (matchMock?.type ?? ((h.name.toLowerCase().includes('girl') || h.name.toLowerCase().includes('sarojini') || h.name.toLowerCase().includes('kalpana')) ? 'GIRLS' : 'BOYS')),
            blocks: h.blocks?.map((b: any) => b.name) || matchMock?.blocks || ['Block A'],
            totalTanks: matchMock?.totalTanks ?? 1,
          };
        });
      }
    }
  } catch {
    // Offline fallback
  }
  return INITIAL_HOSTELS;
}

export async function fetchTankStatus(tankCode: string): Promise<TankStatusResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/tanks/${tankCode}/status`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Offline fallback
  }
  return null;
}

// ----------------------------------------------------
// 3. Alerts API
// ----------------------------------------------------
export async function fetchAlertsApi(): Promise<AlertItem[]> {
  for (const base of API_BASE_CANDIDATES) {
    try {
      const res = await fetch(`${base}/alerts`, {
        cache: 'no-store',
        headers: { 'Accept': 'application/json' },
      });
      if (!res.ok) continue;

      const data = await res.json();
      if (!Array.isArray(data)) continue;

      return data.map((item: unknown) => {
        const a = asRecord(item);
        const severity = String(a.severity ?? '');
        const status = String(a.status ?? '');
        const tankCode = String(a.tank_code ?? 'A2-ROOF-01');

        return {
          id: `ALT-${a.id}`,
          severity: severity === 'CRITICAL' ? 'CRITICAL' : severity === 'WARNING' ? 'WARNING' : 'PREDICTIVE',
          title: String(a.title ?? 'Water Quality Event'),
          tankId: tankCode,
          tankName: `${tankCode} Main`,
          description: String(a.message ?? ''),
          riskScore: severity === 'CRITICAL' ? 90 : 65,
          timestamp: typeof a.created_at === 'string'
            ? new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '10:41 PM',
          metricsSummary: { turbidity: 6.88, tds: 486, ph: 6.39 },
          status: status === 'RESOLVED' ? 'RESOLVED' : status === 'INVESTIGATING' ? 'INVESTIGATING' : 'OPEN',
          isPredictive: a.type === 'PREDICTIVE',
        };
      });
    } catch {
      // Try the next configured backend URL.
    }
  }

  return INITIAL_ALERTS;
}

export async function updateAlertStatusApi(alertIdNum: number, status: string): Promise<boolean> {
  const token = getAdminToken();

  for (const base of API_BASE_CANDIDATES) {
    try {
      const res = await fetch(`${base}/alerts/${alertIdNum}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-User-Role': 'admin',
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) return true;
    } catch {
      // Try the next configured backend URL.
    }
  }

  return false;
}

// ----------------------------------------------------
// 4. Complaints API
// ----------------------------------------------------
export async function fetchComplaintsApi(): Promise<Complaint[]> {
  try {
    const token = getAdminToken();
    const res = await fetch(`${API_BASE}/complaints`, {
      cache: 'no-store',
      headers: { 
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data.map((c: any) => ({
          id: c.ticket_code || `#${c.id}`,
          studentName: c.student_name || 'Aarav Patel',
          studentRoll: '2023UCO1542',
          block: c.block || 'Block A',
          tankId: c.tank_code || 'A2-ROOF-01',
          issues: [c.category?.replace('_', ' ').toLowerCase() || 'bad smell'],
          description: c.description,
          status: c.status === 'RESOLVED' ? 'RESOLVED' : c.status === 'INVESTIGATING' ? 'INVESTIGATING' : 'OPEN',
          submittedAt: c.created_at ? new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '07 Oct 2026',
          clusterCount: 12,
          adminNotes: c.admin_notes,
        }));
      }
    }
  } catch {
    // Offline fallback
  }
  return INITIAL_COMPLAINTS;
}

export async function createComplaintApi(payload: { tank_code?: string; category: string; description: string }): Promise<boolean> {
  try {
    const token = getAdminToken();
    const res = await fetch(`${API_BASE}/complaints`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function updateComplaintStatusApi(complaintId: number, status: string, adminNotes?: string): Promise<boolean> {
  try {
    const token = getAdminToken();
    const res = await fetch(`${API_BASE}/complaints/${complaintId}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-User-Role': 'admin',
      },
      body: JSON.stringify({ status, admin_notes: adminNotes }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ----------------------------------------------------
// 5. Incidents API
// ----------------------------------------------------
export async function fetchIncidentsApi(): Promise<Incident | null> {
  try {
    const res = await fetch(`${API_BASE}/incidents`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        return {
          id: `INC-2026-${item.incident_number}`,
          incidentNumber: item.incident_number,
          tankId: item.tank_code || 'A2-ROOF-01',
          tankName: `${item.tank_code || 'A2-ROOF-01'} Roof Header`,
          title: item.title,
          severity: item.severity || 'HIGH',
          currentStage: item.current_stage as IncidentStage,
          detectedAt: item.detected_at || '07 Oct 2026, 09:14 PM',
          timeline: item.timeline || INITIAL_INCIDENT.timeline,
        };
      }
    }
  } catch {
    // Offline fallback
  }
  return INITIAL_INCIDENT;
}

export async function updateIncidentStageApi(incidentIdNum: number, stage: IncidentStage, note: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/incidents/${incidentIdNum}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_stage: stage, note }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ----------------------------------------------------
// 8. Authentication API
// ----------------------------------------------------
export async function loginUserApi(email: string, password: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      return await res.json();
    }
    const err = await res.json();
    throw new Error(err.detail || 'Login failed');
  } catch (error) {
    throw error;
  }
}

export async function registerUserApi(payload: { name: string; email: string; password: string; role: string }): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
    const err = await res.json();
    throw new Error(err.detail || 'Registration failed');
  } catch (error) {
    throw error;
  }
}

// ----------------------------------------------------
// 9. AI Prediction & Intelligence API
// ----------------------------------------------------
function mapBackendAIPrediction(data: any): AIPredictionData {
  if (data.status === 'offline') {
    return {
      status: 'offline',
      message: data.message || 'Sensors are offline.',
      tankId: data.tank_id || '',
      currentRiskPercent: 0,
      riskLevel: 'LOW',
    } as AIPredictionData;
  }
  const trajectory = data.trajectory || {};
  return {
    status: 'online',
    tankId: data.tank_id || 'A2-ROOF-01',
    currentRiskPercent: Number(trajectory.current ?? data.risk_score ?? 84),
    riskLevel: data.severity || (data.risk_score > 70 ? 'HIGH' : data.risk_score > 40 ? 'MODERATE' : 'LOW'),
    riskProbability: Number(data.risk_probability ?? 0.84),
    predictionHorizonHours: Number(data.prediction_horizon_hours ?? 6),
    historyWindowHours: Number(data.history_window_hours ?? 24),
    historyPointsCount: Number(data.history_points_count ?? 25),
    history24hSummary: data.history_24h_summary,
    history24hSnapshots: data.history_24h_snapshots,
    futureProjections: [
      { timeOffset: 'Now', riskPercent: Number(trajectory.current ?? data.risk_score ?? 84) },
      { timeOffset: '+2 hrs', riskPercent: Number(trajectory.plus_2h ?? Math.min(100, (data.risk_score || 84) + 3)) },
      { timeOffset: '+4 hrs', riskPercent: Number(trajectory.plus_4h ?? Math.min(100, (data.risk_score || 84) + 7)) },
      { timeOffset: '+6 hrs', riskPercent: Number(trajectory.plus_6h ?? Math.min(100, (data.risk_score || 84) + 10)) },
    ],
    predictionSummary: data.prediction_summary || 'Water-quality deterioration likely within 4–6 hours.',
    rootCauses: (data.contributing_factors || []).map((f: any) => ({
      factor: f.factor || 'Turbidity acceleration',
      trend: f.trend || 'up',
      detail: f.detail || '',
      contribution: f.contribution || 0.5,
    })),
    possibleCauses: (data.possible_causes || []).map((c: any) => ({
      cause: c.cause || 'Filter membrane degradation',
      confidencePercent: Number(c.confidencePercent ?? Math.round((c.confidence || 0.74) * 100)),
      notes: c.notes || '',
    })),
    recommendedActions: data.recommended_actions || [
      '1. Inspect filtration system',
      '2. Inspect tank condition',
      '3. Collect laboratory water sample'
    ],
    lastInferenceAt: data.last_inferred_at || 'Just now (Model v2.0-XGBoost)',
    modelVersion: data.model_version || 'v2.0-XGBoost-Ensemble',
    anomalyDetected: Boolean(data.anomaly_detected),
    anomalyDetails: data.anomaly_details,
    abnormalPatternDetected: Boolean(data.abnormal_pattern_detected),
    leakagePrediction: data.leakage_prediction,
    complaintCorrelation: data.complaint_correlation,
    safetyStatement: data.safety_statement,
  };
}

export async function fetchAIPrediction(tankCode: string): Promise<AIPredictionData> {
  const livePrediction = asLivePrediction(await fetchJsonFromCandidates(`/prediction/${tankCode}`, {
    cache: 'no-store',
    headers: { 'Accept': 'application/json' },
  }));
  if (livePrediction && livePrediction.status !== 'NO_DATA') {
    return mapLiveAIPrediction(livePrediction, tankCode);
  }

  try {
    const data = await fetchJsonFromCandidates(`/ai/predict-risk/${tankCode}`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' },
    });
    if (data) {
      return mapBackendAIPrediction(data);
    }
  } catch (e) {
    console.warn('Backend AI fetch failed, using resilient local fallback:', e);
  }
  return INITIAL_AI_PREDICTION;
}

export async function triggerAIInference(tankCode: string, payload?: any): Promise<AIPredictionData> {
  if (!payload) {
    const livePrediction = asLivePrediction(await fetchJsonFromCandidates(`/prediction/${tankCode}`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' },
    }));
    if (livePrediction && livePrediction.status !== 'NO_DATA') {
      return mapLiveAIPrediction(livePrediction, tankCode);
    }
  }

  try {
    const data = await fetchJsonFromCandidates(`/ai/predict-risk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload || { tank_id: tankCode }),
    });
    if (data) {
      return mapBackendAIPrediction(data);
    }
  } catch (e) {
    console.warn('Backend AI inference trigger failed:', e);
  }
  return fetchAIPrediction(tankCode);
}

export async function fetchFleetAIPredictions(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/ai/fleet-predictions`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Backend Fleet AI fetch failed:', e);
  }
  return null;
}

