var mysql = require('mysql');
var QueryBuilder = require('./lib/query-builder');







var qb = new QueryBuilder();
debugger;
var query = qb.select([
		"id",
		'owner_id',
		'name', 
		'address.id', 
		'address.resturant_id',
		'address.address1', 
		'address.address2', 
		'address.postal_code', 
		'address.city', 
		'address.lat', 
		'address.lng'
	])
	.from("resturants")
	.addJoin({
		table: "resturant_address", 
		as: "address", 
		key: "id", 
		foreign_key: "resturant_id"
	})
	.where({
		id: {'$eql': 5},
		'address.postal_code': {'$eql': 5491}
	});
console.log(""+query.toString());