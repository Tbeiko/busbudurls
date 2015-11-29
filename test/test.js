/*jslint node: true */
/*global describe: false, before: false, after: false, it: false */
"use strict";
// Declare the variables used
var expect = require('chai').expect,
    request = require('request'),
    server = require('../index'),
    redis = require('redis'),
    client;
client = redis.createClient();

// Server tasks
describe('server', function () {
    // Beforehand, start the server
    before(function (done) {
        console.log('Starting the server');
        done();
    });
    // Afterwards, stop the server and empty the database
    after(function (done) {
        console.log('Stopping the server');
        client.flushdb();
        done();
    });
    // Test the index route
    describe('Test the index route', function () {
        it('should return a page with the title Busbud URL Shortener', function (done) {
            request.get({ url: 'http://localhost:5000' }, function (error, response, body) {
                expect(body).to.include('Busbud URL Shortener');
                expect(response.statusCode).to.equal(200);
                expect(response.headers['content-type']).to.equal('text/html; charset=utf-8');
                done();
            });
        });
    });

    // Test submitting a URL without a custom slug
    describe('Test submitting a URL without slug', function () {
        it('should return the shortened URL without slug', function (done) {
            request.post('http://localhost:5000', {from: {url: 'www.google.com', slug: null}}, function (error, response, body) {
                expect(body).to.include('Your shortened URL is');
                expect(response.statusCode).to.equal(200);
                expect(response.headers['content-type']).to.equal('text/html; charset=utf-8');
                done();
            });
        });
    });

    // NOT WORKING 
    // Test submitting a URL with a custom slug -- NOT WORKING
    describe('Test submitting a URL with slug', function () {
        it('should return the shortened URL with slug', function (done) {
            // It seems that the parameters 'url:' and 'slug:' are not being sent through
            request.post('http://localhost:5000', {from: {url: 'www.google.com', slug: "testslug"}}, function (error, response, body) {
                expect(body).to.include('testslug');
                expect(response.statusCode).to.equal(200);
                expect(response.headers['content-type']).to.equal('text/html; charset=utf-8');
                done();
            });
        });
    });

    // NOT WORKING 
    // Test submitting a URL with custom slug when slug already used
    describe('Test submitting a URL with used slug', function () {
        it('should return the shortened URL without slug', function (done) {
            client.set('testslug', 'http://www.google.com');
            // It seems that the parameters 'url:' and 'slug:' are not being sent through
            request.post('http://localhost:5000', {from: {url: 'www.google.com', slug: "testslug"}}, function (error, response, body) {
                expect(body).to.include('Oops, a custom URL with that slug already exists.');
                expect(response.statusCode).to.equal(200);
                expect(response.headers['content-type']).to.equal('text/html; charset=utf-8');
                done();
            });
        });
    });

    // Test submitting an empty form
    describe('Test submitting an empty form', function () {
        it('should return the page without a URL', function (done) {
            request.post('http://localhost:5000', {from: {url: null, slug: null}}, function (error, response, body) {
                expect(body).to.include('Oops, it seems you forgot to add a URL. Try again!');
                expect(response.statusCode).to.equal(200);
                expect(response.headers['content-type']).to.equal('text/html; charset=utf-8');
                done();
            });
        });
    });

    // Test following a URL with http://
    describe('Test folling a URL', function () {
        it('should redirect the user to the shortened URL', function(done) {
            // Create the URL 
            client.set('testurl', 'http://www.google.com', function () {
                // Follow the link
                request.get({
                    url: 'http://localhost:5000/testurl',
                    followRedirect: false
                }, function (error, response, body) {
                    expect(response.headers.location).to.equal('http://www.google.com');
                    expect(response.statusCode).to.equal(301);
                    done();
                });
            });
        });
    });

    
    // Test non-existent link 
    describe('Test following a non-existent-link', function () {
        it('should return a 404 error', function (done) {
            // Follow the link
            request.get({
                url: 'http://localhost:5000/nonexistanturl',
                followRedirect: false
            }, function (error, response, body) {
                expect(response.statusCode).to.equal(404);
                expect(body).to.include("Something went wrong, we couldn't find the link you were looking for.");
                done();
            });
        });
    });
});