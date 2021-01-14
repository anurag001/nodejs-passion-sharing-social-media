$match:
{
	feedCategory:{"$in":interestList}
},
$match:
{
	'feedByDetails.location': { $geoWithin: { $centerSphere: [ [ latitude, longitude ], 10/3963.2 ] } }
}
<script src="//maps.google.com/maps/api/js?sensor=false"></script>
<script src="//maps.google.com/maps/api/js?sensor=false"></script>
