CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE claim_status AS ENUM (
  'SUBMITTED', 'NPA_DATA_CROSSED', 'PHYSICAL_DELIVERY_CONFIRMED',
  'VERIFIED_LOGGED', 'SLA_ACTIVE', 'SLA_BREACHED',
  'PAID', 'DISPUTED', 'REJECTED'
);
CREATE TYPE claim_type AS ENUM ('UNDER_RECOVERY', 'UPPF');
CREATE TYPE fuel_type AS ENUM ('PMS', 'GO', 'AGO', 'LPG');
CREATE TYPE asset_status AS ENUM ('LISTED', 'BIDDING_ACTIVE', 'MATCHED', 'SETTLED', 'MATURED_UNPAID');
CREATE TYPE bid_status AS ENUM ('ACTIVE', 'ACCEPTED', 'REJECTED', 'EXPIRED');
CREATE TYPE settlement_status AS ENUM ('PENDING', 'RTGS_SUBMITTED', 'CONFIRMED', 'FAILED', 'DISPUTED');
CREATE TYPE station_license_status AS ENUM ('ACTIVE', 'EXPIRED', 'SUSPENDED');
CREATE TYPE fuel_marking_status AS ENUM ('COMPLIANT', 'PENDING', 'NON_COMPLIANT');
CREATE TYPE complaint_type AS ENUM ('SHORT_DISPENSING', 'FUEL_ADULTERATION', 'PRICE_GOUGING', 'UNLICENSED_SALE');
CREATE TYPE report_status AS ENUM ('RECEIVED', 'TRIAGED', 'FORWARDED_TO_NPA', 'UNDER_INVESTIGATION', 'RESOLVED', 'DISMISSED');

-- Claims table
CREATE TABLE claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_type claim_type NOT NULL,
  claimant_org_id UUID NOT NULL,
  npa_reference VARCHAR(50) UNIQUE NOT NULL,
  brv_manifest_id VARCHAR(50),
  fuel_type fuel_type NOT NULL,
  volume_liters DECIMAL(15,3) NOT NULL,
  claimed_amount_ghs DECIMAL(18,2) NOT NULL,
  exchange_rate_usd DECIMAL(10,4),
  supporting_docs TEXT[],
  status claim_status NOT NULL DEFAULT 'SUBMITTED',
  sla_deadline TIMESTAMPTZ,
  sla_started_at TIMESTAMPTZ,
  sla_breached_at TIMESTAMPTZ,
  fabric_tx_id VARCHAR(100),
  merkle_root VARCHAR(66),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_claims_status ON claims(status) WHERE status NOT IN ('PAID', 'REJECTED');
CREATE INDEX idx_claims_sla_deadline ON claims(sla_deadline) WHERE status = 'SLA_ACTIVE';
CREATE INDEX idx_claims_claimant ON claims(claimant_org_id, status);
CREATE INDEX idx_claims_created ON claims(created_at DESC);

-- Audit log (immutable)
CREATE TABLE claim_audit_log (
  id BIGSERIAL PRIMARY KEY,
  claim_id UUID NOT NULL REFERENCES claims(id),
  action VARCHAR(50) NOT NULL,
  actor_id UUID,
  actor_role VARCHAR(30),
  previous_status VARCHAR(30),
  new_status VARCHAR(30),
  verification_data JSONB,
  fabric_tx_id VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_claim ON claim_audit_log(claim_id, created_at DESC);
REVOKE UPDATE, DELETE ON claim_audit_log FROM PUBLIC;

-- Marketplace assets
CREATE TABLE marketplace_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL UNIQUE REFERENCES claims(id),
  face_value_ghs DECIMAL(18,2) NOT NULL,
  fuel_type VARCHAR(20) NOT NULL,
  claimant_org_id UUID NOT NULL,
  maturity_date DATE NOT NULL,
  risk_score DECIMAL(3,1),
  asset_status asset_status NOT NULL DEFAULT 'LISTED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assets_status ON marketplace_assets(asset_status);
CREATE INDEX idx_assets_maturity ON marketplace_assets(maturity_date);
CREATE INDEX idx_assets_claimant ON marketplace_assets(claimant_org_id);

-- Bids
CREATE TABLE bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES marketplace_assets(id),
  bidder_org_id UUID NOT NULL,
  discount_rate DECIMAL(5,4) NOT NULL,
  funded_amount_ghs DECIMAL(18,2) NOT NULL,
  tenor_days INTEGER NOT NULL,
  bid_status bid_status NOT NULL DEFAULT 'ACTIVE',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bids_asset ON bids(asset_id);
CREATE INDEX idx_bids_bidder ON bids(bidder_org_id);
CREATE INDEX idx_bids_status ON bids(bid_status);

-- Settlements
CREATE TABLE settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES marketplace_assets(id),
  winning_bid_id UUID NOT NULL REFERENCES bids(id),
  claimant_org_id UUID NOT NULL,
  bidder_org_id UUID NOT NULL,
  settlement_amount DECIMAL(18,2) NOT NULL,
  discount_amount DECIMAL(18,2) NOT NULL,
  funded_amount_ghs DECIMAL(18,2) NOT NULL,
  rtgs_reference VARCHAR(50),
  settled_at TIMESTAMPTZ,
  fabric_tx_id VARCHAR(100),
  status settlement_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_settlements_asset ON settlements(asset_id);
CREATE INDEX idx_settlements_status ON settlements(status);

-- Fuel prices
CREATE TABLE fuel_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fuel_type VARCHAR(20) NOT NULL,
  pump_price_ghs DECIMAL(10,2) NOT NULL,
  ex_pump_price_ghs DECIMAL(10,2) NOT NULL,
  effective_date TIMESTAMPTZ NOT NULL,
  source VARCHAR(50) NOT NULL DEFAULT 'NPA',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prices_fuel_type ON fuel_prices(fuel_type);
CREATE INDEX idx_prices_effective ON fuel_prices(effective_date DESC);

-- Stations
CREATE TABLE stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  npa_station_id VARCHAR(50) UNIQUE NOT NULL,
  station_name VARCHAR(200) NOT NULL,
  region VARCHAR(50) NOT NULL,
  district VARCHAR(100),
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  license_status station_license_status NOT NULL DEFAULT 'ACTIVE',
  license_expiry TIMESTAMPTZ,
  last_inspection TIMESTAMPTZ,
  fuel_marking_compliance fuel_marking_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stations_region ON stations(region);
CREATE INDEX idx_stations_license ON stations(license_status);

-- Consumer reports
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_type complaint_type NOT NULL,
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  description TEXT,
  station_id UUID REFERENCES stations(id),
  evidence_url VARCHAR(500),
  status report_status NOT NULL DEFAULT 'RECEIVED',
  priority INTEGER NOT NULL DEFAULT 50,
  confidence DECIMAL(3,2) DEFAULT 0.5,
  is_duplicate BOOLEAN NOT NULL DEFAULT FALSE,
  npa_report_id VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_type ON reports(complaint_type);
CREATE INDEX idx_reports_priority ON reports(priority DESC);
