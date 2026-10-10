'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  Role,
  Tank,
  Hostel,
  SensorReading,
  AlertItem,
  AIPredictionData,
  Complaint,
  WaterTestReport,
  Incident,
  IncidentStage,
  UserSession,
} from './types';
import {
  INITIAL_TANKS,
  INITIAL_HOSTELS,
  INITIAL_READING_A2,
  INITIAL_ALERTS,
  INITIAL_AI_PREDICTION,
  INITIAL_COMPLAINTS,
  INITIAL_WATER_TESTS,
  INITIAL_INCIDENT,
  generateHistoricalReadings,
  MOCK_TELEMETRY_ANCHOR_ISO,
} from './mockData';
import {
  fetchLatestReading,
  fetchReadingHistory,
  fetchTanks,
  fetchHostelsApi,
  fetchAlertsApi,
  fetchComplaintsApi,
  createComplaintApi,
  updateComplaintStatusApi,
  fetchWaterTestsApi,
  createWaterTestApi,
  fetchIncidentsApi,
  updateIncidentStageApi,
  updateAlertStatusApi,
  fetchAIPrediction,
  triggerAIInference
} from './api';

interface AquaGuardContextType {
  role: Role;
  setRole: (role: Role) => void;
  session: UserSession;
  setSession: (session: UserSession) => void;
  hostels: Hostel[];
  selectedHostelId: string;
  setSelectedHostelId: (id: string) => void;
  selectedHostel: Hostel;
  selectedTankId: string;
  setSelectedTankId: (id: string) => void;
  selectedTank: Tank;
  tanks: Tank[];
  currentReading: SensorReading;
  historyReadings: SensorReading[];
  alerts: AlertItem[];
  aiPrediction: AIPredictionData;
  complaints: Complaint[];
  waterTests: WaterTestReport[];
  incident: Incident;
  isLiveUpdating: boolean;
  setIsLiveUpdating: (val: boolean) => void;
  lastRefreshTime: Date;
  refreshData: () => Promise<void>;
  runAIInference: () => Promise<AIPredictionData>;
  resolveAlert: (id: string) => void;
  investigateAlert: (id: string) => void;
  addComplaint: (complaint: Omit<Complaint, 'id' | 'submittedAt' | 'status'>) => void;
  updateComplaintStatus: (id: string, status: Complaint['status'], adminNotes?: string) => void;
  addWaterTest: (test: Omit<WaterTestReport, 'id' | 'reportNumber'>) => void;
  markMaintenanceComplete: (tankId: string) => void;
  advanceIncidentStage: (stage: IncidentStage, note: string) => void;
}

const AquaGuardContext = createContext<AquaGuardContextType | undefined>(undefined);

export function AquaGuardProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>('ADMIN');
  const [session, setSession] = useState<UserSession>({
    role: 'ADMIN',
    name: 'Chief Facilities Officer',
    email: 'admin.aquaguard@nsut.ac.in',
    block: 'Facilities HQ',
    room: 'Admin Suite 101',
  });

  const [hostels, setHostels] = useState<Hostel[]>(INITIAL_HOSTELS);
  const [selectedHostelId, setSelectedHostelIdState] = useState<string>('hostel-ramanujan');
  const [tanks, setTanks] = useState<Tank[]>(INITIAL_TANKS);
  const [selectedTankIdState, setSelectedTankIdState] = useState<string>('A2-ROOF-01');
  const [currentReading, setCurrentReading] = useState<SensorReading>(INITIAL_READING_A2);
  const [historyReadings, setHistoryReadings] = useState<SensorReading[]>(() =>
    generateHistoricalReadings(INITIAL_READING_A2, 24)
  );
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [aiPrediction, setAiPrediction] = useState<AIPredictionData>(INITIAL_AI_PREDICTION);
  const [complaints, setComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS);
  const [waterTests, setWaterTests] = useState<WaterTestReport[]>(INITIAL_WATER_TESTS);
  const [incident, setIncident] = useState<Incident>(INITIAL_INCIDENT);
  const [isLiveUpdating, setIsLiveUpdating] = useState<boolean>(true);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(
    () => new Date(MOCK_TELEMETRY_ANCHOR_ISO),
  );

  const selectedTank = tanks.find((t) => t.id === selectedTankIdState) || tanks[0];
  const selectedHostel = hostels.find((h) => h.id === selectedHostelId) || hostels[0];

  const setSelectedHostelId = useCallback((hostelId: string) => {
    setSelectedHostelIdState(hostelId);
    const hostelTanks = tanks.filter((t) => t.hostelId === hostelId);
    if (hostelTanks.length > 0 && !hostelTanks.some((t) => t.id === selectedTankIdState)) {
      setSelectedTankIdState(hostelTanks[0].id);
    }
  }, [tanks, selectedTankIdState]);

  const setSelectedTankId = useCallback((tankId: string) => {
    setSelectedTankIdState(tankId);
    const targetTank = tanks.find((t) => t.id === tankId);
    if (targetTank?.hostelId) {
      setSelectedHostelIdState(targetTank.hostelId);
    }
  }, [tanks]);

  const setRole = useCallback((newRole: Role) => {
    setRoleState(newRole);
    if (newRole === 'ADMIN') {
      setSession({
        role: 'ADMIN',
        name: 'Chief Facilities Officer',
        email: 'admin.aquaguard@nsut.ac.in',
        block: 'Facilities HQ',
        room: 'Admin Suite 101',
      });
    } else {
      setSession({
        role: 'STUDENT',
        name: 'Rohan Sharma',
        email: 'rohan.sharma.ug23@nsut.ac.in',
        block: 'Block A',
        room: 'Room 214, Block A',
      });
    }
  }, []);

  const refreshData = useCallback(async () => {
    try {
      const reading = await fetchLatestReading(selectedTankIdState);

      setCurrentReading(reading);
      setTanks((prev) =>
        prev.map((tank) =>
          tank.id === selectedTankIdState
            ? {
                ...tank,
                waterLevelPercent: reading.water_level,
                riskScore: reading.risk_score,
                riskStatus:
                  reading.risk_score >= 80
                    ? 'CRITICAL'
                    : reading.risk_score >= 50
                    ? 'HIGH'
                    : reading.risk_score >= 30
                    ? 'ELEVATED'
                    : 'NORMAL',
                sensorStatus: 'ONLINE',
                lastUpdated: reading.recorded_at,
              }
            : tank
        )
      );
      const history = await fetchReadingHistory(selectedTankIdState, 24);
      setHistoryReadings(history);
      setLastRefreshTime(reading.recorded_at ? new Date(reading.recorded_at) : new Date());
    } catch (e) {
      console.warn('Failed to refresh data', e);
    }
  }, [selectedTankIdState]);

  // Polling loop
  useEffect(() => {
    refreshData();
    if (!isLiveUpdating) return;

    const interval = setInterval(() => {
      refreshData();
    }, 60000);

    return () => clearInterval(interval);
  }, [isLiveUpdating, refreshData]);

  const runAIInference = useCallback(async (): Promise<AIPredictionData> => {
    try {
      const result = await triggerAIInference(selectedTankIdState);
      setAiPrediction(result);
      return result;
    } catch (e) {
      console.warn('Inference execution failed:', e);
      return aiPrediction;
    }
  }, [selectedTankIdState, aiPrediction]);

  // When selectedTankId changes, fetch live AI prediction from FastAPI backend
  useEffect(() => {
    let isMounted = true;
    async function loadTankPrediction() {
      try {
        const pred = await fetchAIPrediction(selectedTankIdState);
        if (isMounted && pred) {
          setAiPrediction(pred);
        }
      } catch (err) {
        console.warn('Failed to load live AI prediction, fallback to initial:', err);
      }
    }
    loadTankPrediction();
    return () => {
      isMounted = false;
    };
  }, [selectedTankIdState]);

  // Initial Backend Data Fetch
  useEffect(() => {
    async function loadBackendData() {
      try {
        const [backendTanks, backendHostels, backendAlerts, backendComplaints, backendWaterTests, backendIncident] = await Promise.all([
          fetchTanks(),
          fetchHostelsApi(),
          fetchAlertsApi(),
          fetchComplaintsApi(),
          fetchWaterTestsApi(),
          fetchIncidentsApi(),
        ]);
        if (backendTanks && backendTanks.length > 0) setTanks(backendTanks);
        if (backendHostels && backendHostels.length > 0) setHostels(backendHostels);
        if (backendAlerts && backendAlerts.length > 0) setAlerts(backendAlerts);
        if (backendComplaints && backendComplaints.length > 0) setComplaints(backendComplaints);
        if (backendWaterTests && backendWaterTests.length > 0) setWaterTests(backendWaterTests);
        if (backendIncident) setIncident(backendIncident);
      } catch (err) {
        console.warn('Initial backend sync failed, running on resilient local cache:', err);
      }
    }
    loadBackendData();
  }, []);

  const resolveAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'RESOLVED', severity: 'RESOLVED' } : a))
    );
    const numId = parseInt(id.replace('ALT-', ''), 10);
    if (!isNaN(numId)) {
      updateAlertStatusApi(numId, 'RESOLVED');
    }
  };

  const investigateAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'INVESTIGATING' } : a))
    );
    const numId = parseInt(id.replace('ALT-', ''), 10);
    if (!isNaN(numId)) {
      updateAlertStatusApi(numId, 'INVESTIGATING');
    }
  };

  const addComplaint = (newComp: Omit<Complaint, 'id' | 'submittedAt' | 'status'>) => {
    const id = `#${105 + complaints.length}`;
    const complaint: Complaint = {
      ...newComp,
      id,
      status: 'OPEN',
      submittedAt: 'Just now',
    };
    setComplaints((prev) => [complaint, ...prev]);

    createComplaintApi({
      tank_code: newComp.tankId,
      category: (newComp.issues[0] || 'OTHER').toUpperCase().replace(/\s+/g, '_'),
      description: newComp.description,
    });
  };

  const updateComplaintStatus = (id: string, status: Complaint['status'], adminNotes?: string) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status, adminNotes: adminNotes ?? c.adminNotes } : c))
    );
    const numId = parseInt(id.replace('#', ''), 10);
    if (!isNaN(numId)) {
      updateComplaintStatusApi(numId, status, adminNotes);
    }
  };

  const addWaterTest = (testData: Omit<WaterTestReport, 'id' | 'reportNumber'>) => {
    const reportNum = `AQUA-CERT-NSUT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReport: WaterTestReport = {
      ...testData,
      id: `LAB-2026-${Math.floor(100 + Math.random() * 900)}`,
      reportNumber: reportNum,
    };
    setWaterTests((prev) => [newReport, ...prev]);

    // Find numeric tank id if possible
    createWaterTestApi({
      tank_id: 2, // Default to A2-ROOF-01 in postgres
      tested_by: testData.certifiedBy,
      ph: testData.ph,
      tds: testData.tds,
      turbidity: testData.turbidity,
      ecoli_result: testData.eColi,
      coliform_result: testData.coliform,
      notes: testData.notes,
    });
  };

  const markMaintenanceComplete = (tankId: string) => {
    setTanks((prev) =>
      prev.map((t) =>
        t.id === tankId
          ? {
              ...t,
              maintenanceStatus: 'GOOD',
              lastServiceDate: 'Today',
              nextServiceDate: '08 Nov 2026',
              aiMaintenanceRisk: 10,
            }
          : t
      )
    );
  };

  const advanceIncidentStage = (stage: IncidentStage, note: string) => {
    setIncident((prev) => ({
      ...prev,
      currentStage: stage,
      timeline: prev.timeline.map((item) =>
        item.stage === stage
          ? {
              ...item,
              timestamp: 'Just now',
              note: note || item.note,
              actor: session.name,
            }
          : item
      ),
    }));

    updateIncidentStageApi(incident.incidentNumber, stage, note);
  };

  return (
    <AquaGuardContext.Provider
      value={{
        role,
        setRole,
        session,
        setSession,
        hostels,
        selectedHostelId,
        setSelectedHostelId,
        selectedHostel,
        selectedTankId: selectedTankIdState,
        setSelectedTankId,
        selectedTank,
        tanks,
        currentReading,
        historyReadings,
        alerts,
        aiPrediction,
        complaints,
        waterTests,
        incident,
        isLiveUpdating,
        setIsLiveUpdating,
        lastRefreshTime,
        refreshData,
        runAIInference,
        resolveAlert,
        investigateAlert,
        addComplaint,
        updateComplaintStatus,
        addWaterTest,
        markMaintenanceComplete,
        advanceIncidentStage,
      }}
    >
      {children}
    </AquaGuardContext.Provider>
  );
}

export function useAquaGuard() {
  const context = useContext(AquaGuardContext);
  if (!context) {
    throw new Error('useAquaGuard must be used within an AquaGuardProvider');
  }
  return context;
}
