SELECT
    date_trunc('week', snp_timestamp) AS "Week",
    count(*) AS "Snapshots",
    sum(snp_vehicles_available) AS "Vehicles Available",
    sum(snp_vehicles_faulty) AS "Vehicles Faulty",
    sum(snp_boxes_available) AS "Boxes Available",
    sum(snp_boxes_faulty) AS "Boxes Faulty"
FROM smai_snapshot
GROUP BY 1
ORDER BY 1;