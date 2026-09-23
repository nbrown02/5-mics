\copy (
WITH us AS (
  SELECT r.id release_id, rg.id rg_id, r.name album, ac.name artist,
         COALESCE(rgfrd.year, rfrd.year) year
  FROM release r
  JOIN release_group rg ON rg.id=r.release_group
  JOIN artist_credit ac ON ac.id=rg.artist_credit
  LEFT JOIN release_group_first_release_date rgfrd ON rgfrd.release_group=rg.id
  LEFT JOIN release_first_release_date rfrd ON rfrd.release=r.id
  JOIN country_area ca ON ca.area=r.country
  JOIN iso_3166_1 i ON i.area=ca.area AND i.code='US'
  WHERE r.status=1 AND rg.type=1
),
ranked AS (
 SELECT us.*, m.id medium_id,
        row_number() over(partition by rg_id order by release_id, m.position) edition_rank
 FROM us JOIN medium m ON m.release=us.release_id
 WHERE m.position=1
)
SELECT artist, album, year, t.position, t.name track
FROM ranked x
JOIN track t ON t.medium=x.medium_id
WHERE edition_rank=1 AND t.position BETWEEN 1 AND 30
ORDER BY artist, album, t.position
) TO STDOUT WITH CSV HEADER;
