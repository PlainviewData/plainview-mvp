/*jslint node: true */
"use strict";

var express = require('express');
var httpProxy = require('http-proxy');
var http = require('http');
var rp = require('request-promise');
var swat_proxy = require('swat-proxy');

var router = express.Router();

var utils = require('../helpers/tools');
var pv = require('../helpers/api_caller');

var request = require('request-json');
var client = request.createClient('http://www.plainview.io/');

var supportedDomains;

client.get('supportedDomains/', function(err, res, supportedDomains) {

    var supportedDomainsUrls = [];
    supportedDomains.forEach(function(domain){
        supportedDomainsUrls.push("http://www." + domain + ".com");
    })

    swat_proxy.proxyMultiple(supportedDomainsUrls, {
      selector: 'body',
      manipulation: swat_proxy.Manipulations.APPEND,
      content: '<script> alert ("Plainview is working (Custom JS)"); </script>',
      matchType: 'domain'
    });
});

router.get('/b', function(req, res){
	swat_proxy.deliverWebpage({}, res, "http://www.huffingtonpost.com");
});

router.get('/statusCode/:url', function(req, res){
	var url = req.body.url;
	//finds the http status code of a webpage
	req.params.url = decodeURI(req.params.url);	

	try {
		req.param.url = utils.formatUrl(req.param.url);
	} catch (err) {
		res.send("Invalid url");
	}
	utils.getStatusCode(req.params.url)
	.then(function(statusCode){
		res.send(statusCode);
	}).catch(function(err){
		utils.errorHandler(err);
		res.send("Internal server error");
	});
});

router.get('/a/:archiveId', function(req, res){
	//gets a short url for an archive id
	if (!utils.checkValidId(req.params.archiveId)) { res.send("Invalid id"); }
	var article;
	var archive;
	pv.findById(req.params.archiveId)
	.then(function(result){
		archive = result.archive.archive;
		article = result.article.article;
		article.text = article.text[0];
		return pv.getArticleInfo(result.archive.archive.url);
	}).then(function(result){
		if (result.content == article.text && result.headline == article.headline){
			swat_proxy.deliverWebpage({}, res,result.archive.archive.url);
		} else {
			res.render("url", {archive: archive, article: article});
		}
	}).catch(function(err){
		res.render('archiveNotFound');
	});
});

router.get('/http://*', function(req, res) {
	//gets the instanced use of a url if redirected from a short url
	//gets all the uses of the url if not redirected from a short url
	try {
		req.params[0] = utils.formatUrl(req.params[0]);
	} catch (err) {
		res.send("Invalid url");
	}
	if (req.archive){
		res.render('url', {archive: req.archive});
	} else {
		pv.findByUrl(req.params[0])
		.then(function(usages){
			res.render('urlUsage', {usages: usages});
		});
	}
});


// function renderPage(req, res){
// 	if (req.statusCode > 400){
// 		res.render('error', {statusCode: req.statusCode});
// 	} else {
// 		res.render('url', {url: "google", statusCode: req.statusCode});
// 	}
// }


router.get('/', function(req, res) {
	res.send("It is working!");
});

module.exports = router;
