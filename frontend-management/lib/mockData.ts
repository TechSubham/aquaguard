import {
  Tank,
  Hostel,
  SensorReading,
  AlertItem,
  AIPredictionData,
  Complaint,
  WaterTestReport,
  Incident,
  SensorMetricCardData,
} from './types';

/** Fixed anchor so SSR and client render identical mock telemetry timestamps. */
export const MOCK_TELEMETRY_ANCHOR_ISO = '2026-10-09T19:18:00.000Z';

export const INITIAL_HOSTELS: Hostel[] = [
  {
    id: 'hostel-ramanujan',
    code: 'RH-01',
    name: 'Ramanujan Hostel (Boys Hostel 1)',
    campus: 'NSUT Main Campus',
    type: 'BOYS',
    blocks: ['Block A'],
    totalTanks: 1,
  },
];

export const INITIAL_TANKS: Tank[] = [
  {
    id: 'A2-ROOF-01',
    code: 'A2-ROOF-01',
    name: 'Tank A2 (Roof Overhead)',
    hostelId: 'hostel-ramanujan',
    hostel: 'Ramanujan Hostel (Boys Hostel 1)',
    block: 'Block A',
    capacityLiters: 10000,
    waterLevelPercent: 79.9,
    sensorStatus: 'ONLINE',
    riskStatus: 'CRITICAL',
    riskScore: 90,
    lastUpdated: MOCK_TELEMETRY_ANCHOR_ISO,
    lastServiceDate: '12 Sep 2026',
    nextServiceDate: '12 Oct 2026',
    maintenanceStatus: 'DUE_SOON',
    maintenanceType: 'Carbon & Sediment Filter Replacement',
    aiMaintenanceRisk: 78,
  },
];

export const INITIAL_READING_A2: SensorReading = {
  tank_id: 'A2-ROOF-01',
  recorded_at: MOCK_TELEMETRY_ANCHOR_ISO,
  temperature: 26.29,
  ph: 6.39,
  tds: 486,
  turbidity: 6.88,
  water_level: 79.9,
  flow_rate: 3.5,
  risk_score: 90,
  ai_risk_probability: 0.84,
};

export const INITIAL_METRICS_A2: SensorMetricCardData[] = [
  {
    key: 'ph',
    label: 'pH Level',
    value: 6.39,
    unit: 'pH',
    previousValue: 6.95,
    changePercent: -8.1,
    trend: 'DOWN',
    status: 'WARNING',
    optimalRange: '6.5 – 8.5',
    lastUpdated: 'Just now',
  },
  {
    key: 'tds',
    label: 'Total Dissolved Solids (TDS)',
    value: 486,
    unit: 'ppm',
    previousValue: 410,
    changePercent: 18.5,
    trend: 'UP',
    status: 'CRITICAL',
    optimalRange: '< 300 ppm (Safe < 500)',
    lastUpdated: 'Just now',
  },
  {
    key: 'turbidity',
    label: 'Turbidity',
    value: 6.88,
    unit: 'NTU',
    previousValue: 5.81,
    changePercent: 18.4,
    trend: 'UP',
    status: 'CRITICAL',
    optimalRange: '< 1.0 NTU (Max 5.0)',
    lastUpdated: 'Just now',
  },
  {
    key: 'temperature',
    label: 'Water Temperature',
    value: 26.29,
    unit: '°C',
    previousValue: 25.8,
    changePercent: 1.9,
    trend: 'UP',
    status: 'NORMAL',
    optimalRange: '18 – 28 °C',
    lastUpdated: 'Just now',
  },
  {
    key: 'water_level',
    label: 'Tank Water Level',
    value: 79.9,
    unit: '%',
    previousValue: 82.0,
    changePercent: -2.5,
    trend: 'DOWN',
    status: 'NORMAL',
    optimalRange: '30 – 100 %',
    lastUpdated: 'Just now',
  },
  {
    key: 'flow_rate',
    label: 'Inlet Flow Rate',
    value: 3.5,
    unit: 'L/min',
    previousValue: 3.4,
    changePercent: 2.9,
    trend: 'STABLE',
    status: 'NORMAL',
    optimalRange: '2.0 – 6.0 L/min',
    lastUpdated: 'Just now',
  },
];

export const generateHistoricalReadings = (
  baseReading: SensorReading,
  count: number = 24,
  anchorMs: number = Date.parse(MOCK_TELEMETRY_ANCHOR_ISO),
): SensorReading[] => {
  const readings: SensorReading[] = [];
  const now = anchorMs;
  const stepMs = 3600 * 1000; // 1 hour step

  for (let i = count - 1; i >= 0; i--) {
    const timestamp = new Date(now - i * stepMs).toISOString();
    // Simulate trend rising towards high turbidity and TDS near the end
    const progress = (count - i) / count;
    const turbVariation = Math.sin(i / 3) * 0.4 + (progress > 0.6 ? (progress - 0.6) * 12 : 0);
    const tdsVariation = Math.cos(i / 4) * 15 + (progress > 0.6 ? (progress - 0.6) * 200 : 0);
    const phDrop = progress > 0.5 ? (progress - 0.5) * 1.2 : 0;

    readings.push({
      tank_id: baseReading.tank_id,
      recorded_at: timestamp,
      temperature: Number((24.5 + Math.sin(i / 5) * 1.8).toFixed(2)),
      ph: Number(Math.max(6.1, 7.3 - phDrop + (Math.random() * 0.1 - 0.05)).toFixed(2)),
      tds: Math.round(280 + tdsVariation),
      turbidity: Number(Math.max(0.8, 1.2 + turbVariation).toFixed(2)),
      water_level: Number((75 + Math.sin(i / 2) * 10).toFixed(1)),
      flow_rate: Number((3.5 + Math.cos(i / 3) * 0.8).toFixed(1)),
      risk_score: Math.min(100, Math.round(15 + (progress > 0.6 ? (progress - 0.6) * 190 : Math.random() * 8))),
      ai_risk_probability: Number((progress > 0.6 ? 0.3 + (progress - 0.6) * 1.35 : 0.12).toFixed(2)),
    });
  }

  // Ensure last reading matches current values
  if (readings.length > 0) {
    readings[readings.length - 1] = { ...baseReading };
  }

  return readings;
};

export const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'ALT-1092',
    severity: 'CRITICAL',
    title: 'High Water-Quality Risk Detected',
    tankId: 'A2-ROOF-01',
    tankName: 'Block A / Tank A2',
    description: 'Turbidity spiked to 6.88 NTU (safe limit < 5.0) and TDS elevated to 486 ppm. Potential filter failure or sediment breakthrough.',
    riskScore: 90,
    timestamp: '10:41 PM',
    metricsSummary: { turbidity: 6.88, tds: 486, ph: 6.39 },
    status: 'OPEN',
    isPredictive: false,
  },
  {
    id: 'ALT-1091',
    severity: 'WARNING',
    title: 'TDS Rate-of-Rise Above Baseline',
    tankId: 'A2-ROOF-01',
    tankName: 'Block A / Tank A2',
    description: 'TDS increased by 18.5% over the last 30 minutes, exceeding standard intake variation tolerance.',
    riskScore: 68,
    timestamp: '10:15 PM',
    metricsSummary: { tds: 486 },
    status: 'INVESTIGATING',
    isPredictive: false,
  },
  {
    id: 'ALT-1089',
    severity: 'PREDICTIVE',
    title: 'AI Forecast: Water Quality Deterioration in 4–6 Hours',
    tankId: 'A2-ROOF-01',
    tankName: 'Block A / Tank A2',
    description: 'Time-series model forecasts 94% risk probability by +6 hours due to accelerated filter membrane degradation.',
    riskScore: 84,
    timestamp: '09:50 PM',
    metricsSummary: { turbidity: 6.88, tds: 486 },
    status: 'OPEN',
    isPredictive: true,
    confidence: 74,
  },
];

export const INITIAL_AI_PREDICTION: AIPredictionData = {
  tankId: 'A2-ROOF-01',
  currentRiskPercent: 84,
  riskLevel: 'HIGH',
  historyWindowHours: 24,
  historyPointsCount: 25,
  history24hSummary: {
    span_hours: 24,
    sample_count: 288,
    turbidity: { current: 6.88, at_24h_ago: 0.88, net_drift_24h: 6.0, mean_24h: 2.2, max_24h: 6.88, min_24h: 0.88 },
    tds: { current: 486.0, at_24h_ago: 272.0, net_drift_24h: 214.0, mean_24h: 338.7, max_24h: 486.0 },
    ph: { current: 6.39, at_24h_ago: 7.28, net_drift_24h: -0.89, min_24h: 6.39, max_24h: 7.28 },
    water_level: { current: 79.9, min_24h: 79.9, max_24h: 86.0, net_drop_24h: 6.1 },
    cumulative_turbidity_load: 188.9,
  },
  futureProjections: [
    { timeOffset: 'Now', riskPercent: 84 },
    { timeOffset: '+2 hrs', riskPercent: 87 },
    { timeOffset: '+4 hrs', riskPercent: 91 },
    { timeOffset: '+6 hrs', riskPercent: 94 },
  ],
  predictionSummary: 'Water-quality deterioration likely within 4–6 hours. Microbial or particulate contamination risk exceeding safety thresholds.',
  rootCauses: [
    { factor: 'Turbidity Surge', trend: 'up', detail: 'Rapid rise from 1.1 NTU to 6.88 NTU in past 4 hours (+18.4% last hour).' },
    { factor: 'TDS Elevated', trend: 'up', detail: '486 ppm (significantly above 285 ppm tank seasonal baseline).' },
    { factor: 'pH Drift', trend: 'down', detail: 'Downward shift from 7.20 to 6.39 indicating slight acidification.' },
  ],
  possibleCauses: [
    { cause: 'Sediment Filter Membrane Degradation', confidencePercent: 74, notes: 'Pressure drop & particulate spike matches filter breakthrough pattern.' },
    { cause: 'Municipal Feeder Line Silt Contamination', confidencePercent: 62, notes: 'Correlation with campus main inlet pipe maintenance earlier today.' },
    { cause: 'Internal Tank Biofilm Sloughing', confidencePercent: 38, notes: 'Less probable given recent chemical wash on 12 Sep.' },
  ],
  recommendedActions: [
    '1. Inspect primary & secondary filtration system in Block A overhead unit',
    '2. Temporarily switch Block A drinking taps to secondary bypass reservoir',
    '3. Collect certified laboratory water sample for E. coli & Coliform screening',
    '4. Issue cautionary student advisory banner for Block A residents',
  ],
  lastInferenceAt: 'Just now (Model v2.4-LSTM-WaterGuard)',
  modelVersion: 'v2.4-LSTM-WaterGuard (Trained on 48,000 telemetry cycles)',
};

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: '#102',
    studentName: 'Aarav Patel',
    studentRoll: '2023CSB1042',
    block: 'Block A',
    tankId: 'A2-ROOF-01',
    issues: ['Bad smell', 'Visible particles', 'Discoloration'],
    description: 'Water coming from 2nd floor cooler has a distinct earthy/sulfur smell and light yellowish tint since 8 PM today.',
    status: 'INVESTIGATING',
    submittedAt: 'Today, 08:30 PM',
    clusterCount: 12,
    adminNotes: 'Field technician dispatched to roof tank valve at 09:15 PM.',
  },
  {
    id: '#104',
    studentName: 'Rohan Mehra',
    studentRoll: '2024ECE1099',
    block: 'Block A',
    tankId: 'A2-ROOF-01',
    issues: ['Bad taste', 'Low water pressure'],
    description: 'Drinking water tastes stale and metallic on 3rd floor washroom taps.',
    status: 'INVESTIGATING',
    submittedAt: 'Today, 09:14 PM',
    clusterCount: 4,
  },
];

export const INITIAL_WATER_TESTS: WaterTestReport[] = [
  {
    id: 'LAB-2026-881',
    tankId: 'A2-ROOF-01',
    testDate: '06 Oct 2026',
    laboratory: 'NSUT Environmental Engineering Laboratory',
    ph: 7.1,
    tds: 285,
    turbidity: 1.1,
    eColi: 'NEGATIVE',
    coliform: 'NEGATIVE',
    certifiedBy: 'Dr. V. Sharma, Lead Chemist',
    reportNumber: 'AQUA-CERT-NSUT-2026-0881',
    status: 'PASSED',
    notes: 'Microbiological culture showed zero CFU/100ml. Physical parameters within potable standards as of Oct 6.',
  },
];

export const INITIAL_INCIDENT: Incident = {
  id: 'INC-42',
  incidentNumber: 42,
  tankId: 'A2-ROOF-01',
  tankName: 'Block A / Tank A2',
  title: 'Turbidity Spike & Multi-Student Odor Complaint Outbreak',
  severity: 'HIGH',
  currentStage: 'INVESTIGATING',
  detectedAt: 'Today, 08:30 PM',
  timeline: [
    {
      stage: 'DETECTED',
      label: 'Incident Detected',
      timestamp: 'Today, 08:30 PM',
      note: 'IoT sensor crossed 5.0 NTU critical threshold. Concurrently 12 student complaints logged for Block A.',
      actor: 'System / IoT Trigger',
    },
    {
      stage: 'INVESTIGATING',
      label: 'Investigation In Progress',
      timestamp: 'Today, 08:45 PM',
      note: 'Admin assigned technician. Root cause preliminary attributed to carbon filter breakdown.',
      actor: 'Admin (R. K. Verma)',
    },
    {
      stage: 'ACTION_TAKEN',
      label: 'Remediation Action',
      timestamp: 'Pending (Scheduled 10:45 PM)',
      note: 'Isolation of main intake valve and deployment of secondary replacement cartridge.',
      actor: 'Maintenance Crew',
    },
    {
      stage: 'TESTING',
      label: 'Post-Remediation Verification',
      timestamp: 'Pending',
      note: 'Telemetry stabilization for 30 minutes followed by portable turbidity verification.',
      actor: 'Quality Assurance',
    },
    {
      stage: 'RESOLVED',
      label: 'Incident Closeout',
      timestamp: 'Pending',
      note: 'Student advisory lifted after water certification.',
      actor: 'System Admin',
    },
  ],
};
