CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT,
    role VARCHAR(30) NOT NULL DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hostels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE blocks (
    id SERIAL PRIMARY KEY,
    hostel_id INTEGER NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tanks (
    id SERIAL PRIMARY KEY,
    tank_code VARCHAR(100) UNIQUE NOT NULL,
    block_id INTEGER REFERENCES blocks(id) ON DELETE SET NULL,
    capacity_liters NUMERIC(12,2),
    status VARCHAR(30) DEFAULT 'active',
    installation_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sensor_readings (
    id BIGSERIAL PRIMARY KEY,
    tank_id INTEGER NOT NULL REFERENCES tanks(id) ON DELETE CASCADE,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    temperature NUMERIC(6,2),
    ph NUMERIC(5,2),
    tds NUMERIC(8,2),
    turbidity NUMERIC(8,2),
    water_level NUMERIC(6,2),
    flow_rate NUMERIC(8,2),
    risk_score NUMERIC(5,2),
    ai_risk_probability NUMERIC(5,4)
);

CREATE TABLE water_tests (
    id SERIAL PRIMARY KEY,
    tank_id INTEGER NOT NULL REFERENCES tanks(id) ON DELETE CASCADE,
    tested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tested_by VARCHAR(150),
    ph NUMERIC(5,2),
    tds NUMERIC(8,2),
    turbidity NUMERIC(8,2),
    ecoli_result VARCHAR(50),
    coliform_result VARCHAR(50),
    report_file TEXT,
    notes TEXT
);

CREATE TABLE alerts (
    id BIGSERIAL PRIMARY KEY,
    tank_id INTEGER REFERENCES tanks(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    alert_type VARCHAR(100),
    severity VARCHAR(30),
    message TEXT,
    ai_probability NUMERIC(5,4),
    predicted_time_minutes INTEGER,
    status VARCHAR(30) DEFAULT 'active',
    resolved_at TIMESTAMP
);

CREATE TABLE complaints (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    tank_id INTEGER REFERENCES tanks(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    complaint_type VARCHAR(100),
    description TEXT,
    image_url TEXT,
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    status VARCHAR(30) DEFAULT 'open'
);

CREATE TABLE maintenance (
    id SERIAL PRIMARY KEY,
    tank_id INTEGER REFERENCES tanks(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(100),
    description TEXT,
    scheduled_date DATE,
    completed_date DATE,
    performed_by VARCHAR(150),
    status VARCHAR(30) DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE water_consumption (
    id BIGSERIAL PRIMARY KEY,
    tank_id INTEGER REFERENCES tanks(id) ON DELETE CASCADE,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    liters_consumed NUMERIC(12,2)
);

CREATE TABLE leakage_events (
    id BIGSERIAL PRIMARY KEY,
    tank_id INTEGER REFERENCES tanks(id) ON DELETE CASCADE,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    flow_rate NUMERIC(8,2),
    water_level NUMERIC(6,2),
    confidence NUMERIC(5,4),
    status VARCHAR(30) DEFAULT 'suspected',
    description TEXT
);

CREATE INDEX idx_sensor_readings_tank_time
ON sensor_readings(tank_id, recorded_at);

CREATE INDEX idx_alerts_tank_time
ON alerts(tank_id, created_at);

CREATE INDEX idx_complaints_tank
ON complaints(tank_id);

CREATE INDEX idx_maintenance_tank
ON maintenance(tank_id);
