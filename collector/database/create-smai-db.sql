--
-- Creates the database tables for Postgres
--

CREATE TYPE station_status AS ENUM ('operational', 'outage', 'unknown');

CREATE TABLE IF NOT EXISTS smai_service (
    ser_id SERIAL,
    ser_slug TEXT UNIQUE NOT NULL,
    ser_name TEXT NOT NULL,
    ser_description TEXT NOT NULL DEFAULT '',
    ser_url TEXT NOT NULL DEFAULT '',
    PRIMARY KEY( ser_id )
);

CREATE TABLE IF NOT EXISTS smai_station (
    sta_id SERIAL,
    sta_ser_id INTEGER REFERENCES smai_service(ser_id),
    sta_slug TEXT UNIQUE NOT NULL,
    sta_internal_identifier TEXT NOT NULL,
    sta_internal_name TEXT NOT NULL,
    sta_external_name TEXT NOT NULL DEFAULT '',
    sta_description TEXT NOT NULL DEFAULT '',
    sta_url TEXT NOT NULL DEFAULT '',
    sta_address TEXT NOT NULL DEFAULT '',
    sta_longitude FLOAT NOT NULL,
    sta_latitude FLOAT NOT NULL,
    sta_timezone_name VARCHAR(14) NOT NULL,
    PRIMARY KEY( sta_id )
);

CREATE TABLE IF NOT EXISTS smai_snapshot (
    snp_id SERIAL,
    snp_sta_id INTEGER REFERENCES smai_station(sta_id),
    snp_timestamp TIMESTAMP NOT NULL,
    snp_station_status station_status NOT NULL,
    snp_vehicles_available SMALLINT NOT NULL,
    snp_vehicles_faulty SMALLINT,
    snp_boxes_available SMALLINT NOT NULL,
    snp_boxes_faulty SMALLINT,
    PRIMARY KEY( snp_id ),

--  check if the given count is correct and valid
    CONSTRAINT valid_vehicles_available CHECK (snp_vehicles_available >= 0),
    CONSTRAINT valid_vehicles_faulty CHECK (snp_vehicles_faulty >= 0 or snp_vehicles_faulty is null),
    CONSTRAINT valid_boxes_available CHECK (snp_boxes_available >= 0),
    CONSTRAINT valid_boxes_faulty CHECK (snp_boxes_faulty >= 0 or snp_boxes_faulty is null)
);