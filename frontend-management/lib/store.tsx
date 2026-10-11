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
  fetchIncidentsApi,
  updateIncidentStageApi,
  updateAlertStatusApi,
  fetchAIPrediction,
  triggerAIInference
} from './api';

const LIVE_TELEMETRY_REFRESH_MS = 5000;

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
  incident: Incident;
  isLiveUpdating: boolean;
  setIsLiveUpdating: (val: boolean) => void;
  lastRefreshTime: Date;
  refreshData: () => Promise<void>;
  refreshComplaints: () => Promise<void>;
  runAIInference: () => Promise<AIPredictionData>;
  resolveAlert: (id: string) => Promise<boolean>;
  investigateAlert: (id: string) => Promise<boolean>;
  addComplaint: (complaint: Omit<Complaint, 'id' | 'submittedAt' | 'status'>) => void;
  updateComplaintStatus: (id: string, status: Complaint['status'], adminNotes?: string) => Promise<boolean>;
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

  const refreshComplaints = useCallback(async () => {
    try {
      const backendComplaints = await fetchComplaintsApi();
      setComplaints(backendComplaints);
    } catch (err) {
      console.warn('Failed to refresh complaints:', err);
    }
  }, []);

  const refreshAlerts = useCallback(async () => {
    try {
      const backendAlerts = await fetchAlertsApi();
      setAlerts(backendAlerts);
    } catch (err) {
      console.warn('Failed to refresh alerts:', err);
    }
  }, []);

  // Polling loop
  useEffect(() => {
    const syncLiveData = () => {
      void refreshData();
      void refreshComplaints();
    };

    const initialSync = setTimeout(syncLiveData, 0);
    if (!isLiveUpdating) {
      return () => clearTimeout(initialSync);
    }

    const interval = setInterval(syncLiveData, LIVE_TELEMETRY_REFRESH_MS);

    return () => {
      clearTimeout(initialSync);
      clearInterval(interval);
    };
  }, [isLiveUpdating, refreshData, refreshComplaints]);

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
        const [backendTanks, backendHostels, backendAlerts, backendComplaints, backendIncident] = await Promise.all([
          fetchTanks(),
          fetchHostelsApi(),
          fetchAlertsApi(),
          fetchComplaintsApi(),
          fetchIncidentsApi(),
        ]);
        if (backendTanks && backendTanks.length > 0) {
          setTanks(backendTanks);
          setSelectedTankIdState(backendTanks[0].id);
          if (backendTanks[0].hostelId) {
            setSelectedHostelIdState(backendTanks[0].hostelId);
          }
        }
        if (backendHostels && backendHostels.length > 0) {
          setHostels(backendHostels);
          if (!backendTanks?.[0]?.hostelId) {
            setSelectedHostelIdState(backendHostels[0].id);
          }
        }
        if (backendAlerts && backendAlerts.length > 0) setAlerts(backendAlerts);
        if (backendComplaints && backendComplaints.length > 0) setComplaints(backendComplaints);
        if (backendIncident) setIncident(backendIncident);
      } catch (err) {
        console.warn('Initial backend sync failed, running on resilient local cache:', err);
      }
    }
    loadBackendData();
  }, []);

  const updateAlertStatus = useCallback(async (id: string, status: AlertItem['status']): Promise<boolean> => {
    const previousAlerts = alerts;
    setAlerts((prev) =>
      prev.map((a) => (
        a.id === id
          ? {
              ...a,
              status,
              severity: status === 'RESOLVED' ? 'RESOLVED' : a.severity,
            }
          : a
      ))
    );

    const numId = parseInt(id.replace('ALT-', ''), 10);
    if (!isNaN(numId)) {
      const didPersist = await updateAlertStatusApi(numId, status);
      if (!didPersist) {
        setAlerts(previousAlerts);
        console.warn(`Failed to persist alert ${id} status update to ${status}`);
        return false;
      }
      await refreshAlerts();
    }
    return true;
  }, [alerts, refreshAlerts]);

  const resolveAlert = useCallback((id: string) => {
    return updateAlertStatus(id, 'RESOLVED');
  }, [updateAlertStatus]);

  const investigateAlert = useCallback((id: string) => {
    return updateAlertStatus(id, 'INVESTIGATING');
  }, [updateAlertStatus]);

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

  const updateComplaintStatus = async (id: string, status: Complaint['status'], adminNotes?: string) => {
    const previousComplaints = complaints;
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status, adminNotes: adminNotes ?? c.adminNotes } : c))
    );
    const numId = parseInt(id.replace('#', ''), 10);
    if (!isNaN(numId)) {
      const didPersist = await updateComplaintStatusApi(numId, status, adminNotes);
      if (!didPersist) {
        setComplaints(previousComplaints);
        console.warn(`Failed to persist complaint ${id} status update to ${status}`);
        return false;
      }
      await refreshComplaints();
    }
    return true;
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
        incident,
        isLiveUpdating,
        setIsLiveUpdating,
        lastRefreshTime,
        refreshData,
        refreshComplaints,
        runAIInference,
        resolveAlert,
        investigateAlert,
        addComplaint,
        updateComplaintStatus,
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
