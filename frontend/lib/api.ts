import {
  SensorReading,
  Tank,
  AlertItem,
  Complaint,
  WaterTestReport,
  Incident,
  IncidentStage,
  UserSession,
  Hostel
} from './types';
import {
  INITIAL_READING_A2,
  INITIAL_TANKS,
  INITIAL_HOSTELS,
  INITIAL_ALERTS,
  INITIAL_COMPLAINTS,
  INITIAL_WATER_TESTS,
  INITIAL_INCIDENT,
  generateHistoricalReadings,
} from './mockData';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ----------------------------------------------------
// 1. Telemetry Readings
// ----------------------------------------------------
export async function fetchLatestReading(tankCode: string): Promise<SensorReading> {
  try {
    const res = await fetch(`${API_BASE}/readings/latest/${tankCode}`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
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
        return data.map((t: any) => {
          const matchMock = INITIAL_TANKS.find((m) => m.code === t.tank_code || m.id === t.tank_code);
          return {
            id: t.tank_code,
            code: t.tank_code,
            name: matchMock?.name ?? `${t.block_name || 'Block A'} Main Header`,
            hostelId: matchMock?.hostelId ?? 'hostel-ramanujan',
            hostel: matchMock?.hostel ?? t.hostel_name ?? 'Ramanujan Hostel (Boys Hostel 1)',
            block: t.block_name || matchMock?.block || 'Block A',
            capacityLiters: Number(t.capacity_liters || matchMock?.capacityLiters || 10000),
            waterLevelPercent: matchMock?.waterLevelPercent ?? 79.9,
            sensorStatus: matchMock?.sensorStatus ?? 'ONLINE',
            riskStatus: matchMock?.riskStatus ?? 'NORMAL',
            riskScore: matchMock?.riskScore ?? 18,
            lastUpdated: 'Just now',
            lastServiceDate: matchMock?.lastServiceDate ?? '12 Sep 2026',
            nextServiceDate: matchMock?.nextServiceDate ?? '12 Oct 2026',
            maintenanceStatus: matchMock?.maintenanceStatus ?? 'GOOD',
            maintenanceType: matchMock?.maintenanceType ?? 'Standard Inspection',
            aiMaintenanceRisk: matchMock?.aiMaintenanceRisk ?? 25,
          };
        });
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
          const matchMock = INITIAL_HOSTELS.find((m) => m.name.toLowerCase().includes(h.name.toLowerCase()));
          return {
            id: matchMock?.id ?? `hostel-${h.id}`,
            code: matchMock?.code ?? `H-${h.id}`,
            name: h.name,
            campus: h.location || matchMock?.campus || 'NSUT Main Campus',
            type: (matchMock?.type ?? ((h.name.toLowerCase().includes('girl') || h.name.toLowerCase().includes('sarojini') || h.name.toLowerCase().includes('kalpana')) ? 'GIRLS' : 'BOYS')),
            blocks: h.blocks?.map((b: any) => b.name) || matchMock?.blocks || ['Block A'],
            totalTanks: matchMock?.totalTanks ?? 2,
          };
        });
      }
    }
  } catch {
    // Offline fallback
  }
  return INITIAL_HOSTELS;
}

export async function fetchTankStatus(tankCode: string): Promise<any> {
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
  try {
    const res = await fetch(`${API_BASE}/alerts`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((a: any) => ({
          id: `ALT-${a.id}`,
          severity: a.severity === 'CRITICAL' ? 'CRITICAL' : a.severity === 'WARNING' ? 'WARNING' : 'PREDICTIVE',
          title: a.title,
          tankId: a.tank_code,
          tankName: `${a.tank_code} Main`,
          description: a.message,
          riskScore: a.severity === 'CRITICAL' ? 90 : 65,
          timestamp: a.created_at ? new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:41 PM',
          metricsSummary: { turbidity: 6.88, tds: 486, ph: 6.39 },
          status: a.status === 'RESOLVED' ? 'RESOLVED' : a.status === 'INVESTIGATING' ? 'INVESTIGATING' : 'OPEN',
          isPredictive: a.type === 'PREDICTIVE',
        }));
      }
    }
  } catch {
    // Offline fallback
  }
  return INITIAL_ALERTS;
}

export async function updateAlertStatusApi(alertIdNum: number, status: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/alerts/${alertIdNum}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ----------------------------------------------------
// 4. Complaints API
// ----------------------------------------------------
export async function fetchComplaintsApi(): Promise<Complaint[]> {
  try {
    const res = await fetch(`${API_BASE}/complaints`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
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
    const res = await fetch(`${API_BASE}/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function updateComplaintStatusApi(complaintId: number, status: string, adminNotes?: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/complaints/${complaintId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, admin_notes: adminNotes }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ----------------------------------------------------
// 5. Maintenance API
// ----------------------------------------------------
export async function fetchMaintenanceApi(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/maintenance`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Offline fallback
  }
  return [];
}

// ----------------------------------------------------
// 6. Water Tests API
// ----------------------------------------------------
export async function fetchWaterTestsApi(): Promise<WaterTestReport[]> {
  try {
    const res = await fetch(`${API_BASE}/water-tests`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((t: any) => ({
          id: `LAB-2026-${t.id}`,
          tankId: t.tank_code || 'A2-ROOF-01',
          testDate: t.tested_at ? new Date(t.tested_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '06 Oct 2026',
          laboratory: 'Central Public Health Engineering Lab',
          ph: Number(t.ph ?? 7.1),
          tds: Number(t.tds ?? 285),
          turbidity: Number(t.turbidity ?? 1.1),
          eColi: t.ecoli_result === 'POSITIVE' ? 'POSITIVE' : 'NEGATIVE',
          coliform: t.coliform_result === 'POSITIVE' ? 'POSITIVE' : 'NEGATIVE',
          certifiedBy: t.tested_by || 'Dr. S. K. Raman',
          reportNumber: `AQUA-CERT-NSUT-2026-${t.id + 100}`,
          status: t.ecoli_result === 'NEGATIVE' && t.coliform_result === 'NEGATIVE' ? 'PASSED' : 'FAILED',
          notes: t.notes || 'Water sample compliant with IS 10500:2012 specifications.',
        }));
      }
    }
  } catch {
    // Offline fallback
  }
  return INITIAL_WATER_TESTS;
}

export async function createWaterTestApi(payload: any): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/water-tests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ----------------------------------------------------
// 7. Incidents API
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
  } catch {
    // Offline fallback
  }
  return null;
}
