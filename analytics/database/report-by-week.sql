SELECT
    date_trunc('week', snp_timestamp) AS "Week",
    count(*) AS "Snapshots",
    to_char(cast(sum(snp_vehicles_available) as decimal) / count(*), '990.00') AS "Bikes per Station",
    sum(snp_vehicles_available) AS "Vehicles Available",
    sum(snp_vehicles_faulty) AS "Vehicles Faulty",
    sum(snp_boxes_available) AS "Boxes Available",
    sum(snp_boxes_faulty) AS "Boxes Faulty"
FROM smai_snapshot
GROUP BY 1
ORDER BY 1;