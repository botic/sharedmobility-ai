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