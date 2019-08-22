-- exports all data
SELECT
  sta_internal_identifier,
  sta_slug,
  snp_timestamp,
  snp_station_status,
  snp_vehicles_available,
  snp_vehicles_faulty,
  snp_boxes_available,
  snp_boxes_faulty
FROM
  smai_snapshot,
  smai_station
WHERE
  snp_timestamp >= '2018-07-27'
  AND snp_timestamp <  '2018-07-28'
  AND snp_station_status = 'operational'
  AND snp_sta_id = sta_id
ORDER BY snp_timestamp ASC, sta_internal_identifier ASC

-- only every 15 minutes
SELECT
  snp_sta_id,
  sta_slug,
  snp_timestamp,
  snp_vehicles_available,
  snp_boxes_available
FROM
  smai_snapshot,
  smai_station
WHERE
  snp_timestamp >= '2019-06-01'
  AND snp_timestamp <  '2019-08-01'
  AND EXTRACT(MINUTE FROM snp_timestamp) IN (7, 24, 37, 52)
  AND snp_station_status = 'operational'
  AND snp_sta_id = sta_id
ORDER BY snp_timestamp ASC, sta_internal_identifier ASC

-- only every 15 minutes && only Citybike Wien && minimal result set size
SELECT
  snp_sta_id,
  snp_timestamp,
  snp_vehicles_available,
  snp_boxes_available
FROM
  smai_snapshot,
  smai_station
WHERE
  sta_ser_id = 2 -- only citybikewien
  AND snp_sta_id = sta_id
  AND snp_timestamp >= '2019-06-01'
  AND snp_timestamp <  '2019-08-01'
  AND EXTRACT(MINUTE FROM snp_timestamp) IN (7, 24, 37, 52)
  AND snp_station_status = 'operational'
ORDER BY snp_timestamp ASC, snp_sta_id ASC


-- also contain weather information
SELECT
  snp_timestamp,  
  sta_id,
  sta_slug,
  sta_longitude,
  sta_latitude,
  snp_vehicles_available,
  snp_boxes_available,
  wet_sunshine,
  wet_rain,
  wet_temperature
FROM
  smai_snapshot,
  smai_station,
  smai_weather
WHERE
  sta_ser_id = 2 -- only citybikewien
  AND snp_sta_id = sta_id
  AND snp_timestamp >= '2019-06-01'
  AND snp_timestamp <  '2019-08-01'
  AND EXTRACT(MINUTE FROM snp_timestamp) IN (7, 24, 37, 52)
  AND snp_station_status = 'operational'
  AND date_trunc('hour', snp_timestamp) = date_trunc('hour', wet_timestamp)
ORDER BY snp_timestamp ASC, snp_sta_id ASC
