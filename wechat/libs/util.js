'use strict'

var fs = require('fs')
var Promise = require('bluebird')

exports.readFileAsync = function(fpath,encoding){
	return new Promise(function(resolve,reject){
		fs.readFile(fpath,encoding,function(err,content){
			if(err) reject(err)
			else resolve(content)
		})
	})
}

exports.writeFileAsync = function(fpath,content){
	return new Promise(function(resolve,reject){
		fs.writeFile(fpath,content,function(err){
			if(err) reject(err)
			else resolve()
		})
	})
}

var crypto = require('crypto')

//随机创建一个字符串~~
var createNonce = function(){
	return Math.random().toString(36).substr(2,15)
}
//创建一个当时时间的字符串
var createTimestamp = function(){
	return parseInt(new Date().getTime()/1000,10) + ''
}


var _sign = function(noncestr,ticket,timestamp,url){
	var params = [
		'noncestr='+ noncestr,
		'jsapi_ticket=' + ticket,
		'timestamp=' + timestamp,
		'url='+ url
	]
	//console.log(timestamp)
	var str = params.sort().join('&')
	var shasum = crypto.createHash('sha1')

	shasum.update(str)
	return shasum.digest('hex')
}

exports.sign = function(ticket,url){
	var noncestr = createNonce()
	var timestamp = createTimestamp()
	var signature = _sign(noncestr,ticket,timestamp,url)
	//console.log(timestamp)
	return {
		noncestr:noncestr,
		timestamp:timestamp,
		signature:signature
	}
}
