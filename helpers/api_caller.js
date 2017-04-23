/*jslint node: true */
"use strict";

var rp = require('request-promise');

var config = require('../config');
var utils = require('../helpers/tools');

var findById = function(id){
	var options = {
		uri: config['ARCHIVES_URL'] + id,
		// qs: {
		// 	access_token: 'xxxxx xxxxx'
		// },
		headers: {
			'User-Agent': 'Request-Promise'
		},
		json: true
	};
	return new Promise(function(resolve, reject){
		rp(options)
			.then(function(response) {
				resolve(response);
			})
			.catch(function(response) {
				// utils.errorHandler(err);
				reject(response);
			});
	});
};

var findByUrl = function(url){
	var options = {
		uri: config['URLS_URL'] + url,
		// qs: {
		// 	access_token: 'xxxxx xxxxx'
		// },
		headers: {
			'User-Agent': 'Request-Promise'
		},
		json: true
	};
	return new Promise(function(resolve, reject){
		rp(options)
			.then(function (archive) {
				resolve(archive);
			})
			.catch(function (err) {
				utils.errorHandler(err);
				reject(err);
			});
	});
};

var getArticleInfo = function(articleUrl){
	var options = {
		uri: config['ARTICLE_INFO_URL'] + encodeURIComponent(articleUrl),
		// qs: {
		// 	access_token: 'xxxxx xxxxx'
		// },
		headers: {
			'User-Agent': 'Request-Promise'
		},
		json: true
	};
	return new Promise(function(resolve, reject){
		rp(options)
			.then(function (archive) {
				resolve(archive);
			})
			.catch(function (err) {
				utils.errorHandler(err);
				reject(err);
			});
	});
}

module.exports = {
	findById: findById,
	findByUrl: findByUrl,
	getArticleInfo: getArticleInfo
};