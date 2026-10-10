export type Role = 'ADMIN' | 'STUDENT';

export type SensorStatus = 'ONLINE' | 'OFFLINE' | 'DEGRADED';
export type RiskLevel = 'NORMAL' | 'ELEVATED' | 'CRITICAL' | 'HIGH';

export interface Hostel {
  id: string;
  code: string;
  name: string;
  campus: string;
  type: 'BOYS' | 'GIRLS' | 'COED';
  blocks: string[];
  totalTanks: number;
}

export interface Tank {
  id: string;
  code: string;
  name: string;
  hostelId?: string;
  hostel: string;
  block: string;
  capacityLiters: number;
  waterLevelPercent: number;
  sensorStatus: SensorStatus;
  riskStatus: RiskLevel;
  riskScore: number;
  lastUpdated: string;
  lastServiceDate: string;
  nextServiceDate: string;
  maintenanceStatus: 'GOOD' | 'DUE_SOON' | 'OVERDUE';
  maintenanceType: string;
  aiMaintenanceRisk: number;
}

export interface SensorReading {
  tank_id: string;
  recorded_at: string;
  temperature: number;
  ph: number;
  tds: number;
  turbidity: number;
  water_level: number;
  flow_rate: number;
  risk_score: number;
  ai_risk_probability?: number;
}

export interface SensorMetricCardData {
  key: 'ph' | 'tds' | 'turbidity' | 'temperature' | 'water_level' | 'flow_rate';
  label: string;
  value: number;
  unit: string;
  previousValue: number;
  changePercent: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  optimalRange: string;
  lastUpdated: string;
}

export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'PREDICTIVE' | 'RESOLVED';
export type AlertStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED';

export interface AlertItem {
  id: string;
  severity: AlertSeverity;
  title: string;
  tankId: string;
  tankName: string;
  description: string;
  riskScore: number;
  timestamp: string;
  metricsSummary: {
    turbidity?: number;
    tds?: number;
    ph?: number;
  };
  status: AlertStatus;
  isPredictive: boolean;
  confidence?: number;
}

export interface AIPredictionData {
  tankId: string;
  currentRiskPercent: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  riskProbability?: number;
  predictionHorizonHours?: number;
  historyWindowHours?: number;
  historyPointsCount?: number;
  history24hSummary?: {
    span_hours?: number;
    sample_count?: number;
    turbidity?: {
      current: number;
      at_24h_ago: number;
      net_drift_24h: number;
      mean_24h: number;
      max_24h: number;
      min_24h: number;
    };
    tds?: {
      current: number;
      at_24h_ago: number;
      net_drift_24h: number;
      mean_24h: number;
      max_24h: number;
    };
    ph?: {
      current: number;
      at_24h_ago: number;
      net_drift_24h: number;
      min_24h: number;
      max_24h: number;
    };
    water_level?: {
      current: number;
      min_24h: number;
      max_24h: number;
      net_drop_24h: number;
    };
    cumulative_turbidity_load?: number;
  };
  history24hSnapshots?: {
    hour_offset: number;
    recorded_at: string;
    turbidity: number;
    tds: number;
    ph: number;
    water_level: number;
    flow_rate: number;
  }[];
  futureProjections: {
    timeOffset: string;
    riskPercent: number;
  }[];
  predictionSummary: string;
  rootCauses: {
    factor: string;
    trend: 'up' | 'down' | 'stable';
    detail: string;
    contribution?: number;
  }[];
  possibleCauses: {
    cause: string;
    confidencePercent: number;
    notes: string;
  }[];
  recommendedActions: string[];
  lastInferenceAt: string;
  modelVersion: string;
  anomalyDetected?: boolean;
  anomalyDetails?: {
    is_sensor_glitch?: boolean;
    message?: string;
    anomaly_probability?: number;
    anomaly_type?: string;
  };
  abnormalPatternDetected?: boolean;
  maintenancePrediction?: {
    maintenance_risk_percent?: number;
    maintenance_window?: string;
    recommendation?: string;
    days_since_last_service?: number;
  };
  leakagePrediction?: {
    detected?: boolean;
    confidence_percent?: number;
    recommendation?: string;
    estimated_hourly_drop_percent?: number;
  };
  complaintCorrelation?: {
    correlated?: boolean;
    complaint_count?: number;
    summary?: string;
  };
  safetyStatement?: string;
}

export interface Complaint {
  id: string;
  studentName: string;
  studentRoll: string;
  block: string;
  tankId: string;
  issues: string[];
  description: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
  submittedAt: string;
  clusterCount?: number;
  adminNotes?: string;
}

export interface WaterTestReport {
  id: string;
  tankId: string;
  testDate: string;
  laboratory: string;
  ph: number;
  tds: number;
  turbidity: number;
  eColi: 'NEGATIVE' | 'POSITIVE';
  coliform: 'NEGATIVE' | 'POSITIVE';
  certifiedBy: string;
  reportNumber: string;
  status: 'PASSED' | 'FAILED';
  notes: string;
}

export type IncidentStage = 'DETECTED' | 'INVESTIGATING' | 'ACTION_TAKEN' | 'TESTING' | 'RESOLVED';

export interface Incident {
  id: string;
  incidentNumber: number;
  tankId: string;
  tankName: string;
  title: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  currentStage: IncidentStage;
  detectedAt: string;
  resolvedAt?: string;
  timeline: {
    stage: IncidentStage;
    label: string;
    timestamp: string;
    note: string;
    actor: string;
  }[];
}

export interface UserSession {
  role: Role;
  name: string;
  email: string;
  block?: string;
  room?: string;
}
