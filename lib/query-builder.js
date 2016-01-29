var mysql = require('mysql');
var _ = require('underscore');

var WhereConditionKeys = {
	"$eql": function(whereKey, arg) {
		var hasSubKey = whereKey.search(/^[a-z]+\./) != -1;
		whereKey = hasSubKey ? whereKey : "t1."+whereKey;
		return mysql.format("?? = ?", [whereKey, arg]);
	}
}

function parseCondition(whereKey, key, arg) {
	return WhereConditionKeys[key](whereKey, arg);
}


function QueryBuilder() {
	this._select = null;
	this._from = null;
	this.join = [];
	this._where = null;
}

QueryBuilder.prototype.select = function(selectArray) {
	this._select = selectArray;
	return this;
}

QueryBuilder.prototype.from = function(from) {
	this._from = from;
	return this;
}

QueryBuilder.prototype.where = function(where) {
	this._where = where;
	return this;
};

QueryBuilder.prototype.addJoin = function(joinObject) {
	this.join.push(joinObject);
	return this;
}

QueryBuilder.prototype.makeQuery = function() {
	var sql = [];
	sql.push("SELECT "+ this.makeSelectFields());
	sql.push(mysql.format("FROM ?? as ??", [this._from, "t1"]));

	this.join.forEach(function(joinObject) {
		sql.push(mysql.format("JOIN ?? as ?? ON ?? = ??", [
			joinObject.table,
			joinObject.as,
			"t1."+joinObject.key,
			joinObject.as+"."+joinObject.foreign_key
		]))
	})
		
	if(this._where) {
		if(this._where != null && typeof this._where != 'object') {
			throw new Error("WHERE SHOULD BE A OBJECT");
		}
		var whereStatms = []
		var whereKeys = _.keys(this._where);
		console.log("COUNT 1: ", whereKeys.length)
		for (i in whereKeys) {
			var whereConKeys = _.keys(this._where[whereKeys[i]])
			console.log("COUNT 2: ", whereConKeys.length)

			for(j in whereConKeys) {
				var parsedCondition = parseCondition(whereKeys[i], whereConKeys[j], this._where[whereKeys[i]][whereConKeys[j]]);
				whereStatms.push(parsedCondition);
			}

		}
		sql.push("WHERE "+ whereStatms.join(" AND "))


	}

	return sql.join(" ");
};

QueryBuilder.prototype.makeSelectFields = function() {
	var fields = [];
	this._select.forEach(function(selectKey) {
		var hasSubKey = selectKey.search(/^[a-z]+\./) != -1;
		var asKey = hasSubKey ? selectKey : "t1."+selectKey


		fields.push(
			mysql.format("?? as ?", [hasSubKey ? selectKey : asKey, hasSubKey ? asKey : selectKey])
		)
	})
	return fields;
}

QueryBuilder.prototype.toString = function() {
	return this.makeQuery()
};

module.exports = QueryBuilder;