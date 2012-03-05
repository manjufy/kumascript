/*jshint node: true, expr: false, boss: true */

var util = require('util'),
    fs = require('fs'),
    _ = require('underscore'),
    nodeunit = require('nodeunit'),
    express = require('express'),
    request = require('request'),

    kumascript = require('..'),
    ks_utils = kumascript.utils,
    ks_templates = kumascript.templates,
    ks_server = kumascript.server,
    ks_test_utils = kumascript.test_utils;

module.exports = nodeunit.testCase({

    "Fetching document1 from service should be processed as expected": function (test) {
        var expected_fn = __dirname + '/fixtures/documents/document1-expected.txt',
            result_url  = 'http://localhost:9000/docs/document1';
        fs.readFile(expected_fn, 'utf8', function (err, expected) {
            request(result_url, function (err, resp, result) {
                test.equal(result.trim(), expected.trim());
                test.done();
            });
        });
    },

    "POSTing document to service should be processed as expected": function (test) {
        var expected_fn = __dirname + '/fixtures/documents/document1-expected.txt',
            source_fn   = __dirname + '/fixtures/documents/document1.txt',
            result_url  = 'http://localhost:9000/docs/';
        fs.readFile(expected_fn, 'utf8', function (err, expected) {
            fs.readFile(source_fn, 'utf8', function (err, source) {
                request.post(
                    { url: result_url, body: source },
                    function (err, resp, result) {
                        test.equal(result.trim(), expected.trim());
                        test.done();
                    }
                );
            });
        });
    },

    // Build both a service instance and a document server for test fixtures.
    setUp: function (next) {
        this.test_server = ks_test_utils.createTestServer();
        try {
            this.server = new ks_server.Server({
                port: 9000,
                document_url_template: "http://localhost:9001/documents/{path}.txt",
                template_url_template: "http://localhost:9001/templates/{name}.ejs"
            });

            // HACK: This needs to be configurable in server options, where
            // KumaEJSTemplate is hardcoded. That, and/or KumaEJSTemplate
            // should be the thing tested here.
            this.server.template_loader.options.type_map._default =
                ks_templates.EJSTemplate;
                
            this.server.listen();
        } catch (e) {
            util.debug("ERROR STARTING TEST SERVER " + e);
            throw e;
        }
        next();
    },

    // Kill all the servers on teardown.
    tearDown: function (next) {
        this.server.close();
        this.test_server.close();
        next();
    }

});
