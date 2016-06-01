var expect = require('chai').expect;
var assert = require('chai').assert;
var sinon = require('sinon');

var Fitbit = require('../dist/Fitbit').Fitbit;

var options;
var client;
var error = new Error('ERROR');

describe('Fitbit API Client:', function () {

    describe('OAuth functionality:', function () {

        beforeEach(function (done) {
            options = {
                creds: {
                    clientID: "YOUR_CLIENT_ID",
                    clientSecret: "YOUR_CLIENT_SECRET"
                },
                uris: {
                    "authorizationUri": "https://www.fitbit.com",
                    "authorizationPath": "/oauth2/authorize",
                    "tokenUri": "https://api.fitbit.com",
                    "tokenPath": "/oauth2/token"
                },
                authorization_uri: {
                    "redirect_uri": "http://localhost:3000/oauth_callback",
                    "response_type": "code",
                    "scope": "activity",
                    "state": "3(#0/!~"
                }
            };
            client = new Fitbit(options);
            done();
        });

        it('generate authorization URL', function (done) {
            var url = client.authorizeURL();
            expect(url).to.equal("https://www.fitbit.com/oauth2/authorize?redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Foauth_callback&response_type=code&scope=activity&state=3(%230%2F!~&client_id=YOUR_CLIENT_ID");
            done();
        });

        it('generate an access token', function (done) {
            var callback = sinon.spy();
            sinon.stub(client, 'fetchToken', function (r, cb) {
                expect(r).to.eq('code');
                cb.call(void 0, null, 'token', 'tokenSecret');
            });
            client.fetchToken('code', callback);

            expect(callback.calledWith(null, 'token')).to.be.true;

            // client._oauth.getOAuthAccessToken.restore();
            done();
        });

        // it('error when making an unauthorized API call', function (done) {
        //     try {
        //         client.apiCall('https://test.api.endpoint', function () {
        //         });
        //     } catch (ex) {
        //         expect(ex.message).to.eq('Authenticate before making API calls');
        //         done();
        //     }
        // });
        //
        // it('error when making an API call with no user ID', function (done) {
        //     client.accessToken = 'accessToken';
        //     client.accessTokenSecret = 'accessTokenSecret';
        //     try {
        //         client.apiCall('https://test.api.endpoint', function () {
        //         });
        //     } catch (ex) {
        //         expect(ex.message).to.eq('API calls require a user ID');
        //         done();
        //     }
        // });

    });

    describe('API calls:', function () {

        beforeEach(function (done) {
            options = {
                creds: {
                    clientID: "YOUR_CLIENT_ID",
                    clientSecret: "YOUR_CLIENT_SECRET"
                },
                uris: {
                    "authorizationUri": "https://www.fitbit.com",
                    "authorizationPath": "/oauth2/authorize",
                    "tokenUri": "https://api.fitbit.com",
                    "tokenPath": "/oauth2/token"
                },
                authorization_uri: {
                    "redirect_uri": "http://localhost:3000/oauth_callback",
                    "response_type": "code",
                    "scope": "activity",
                    "state": "3(#0/!~"
                }
            };
            client = new Fitbit(options);
            done();
        });

        it('make a GET request', function (done) {
            var callback = sinon.spy();
            var data = {
                data: 'Test data'
            };

            var fibitUrl = "https://api.fitbit.com/1/user/userId/activities/date/2016-06-01.json";

            sinon.stub(client, 'request', function (u, cb) {
                expect(u).to.contain("https://api.fitbit.com/1/user/");
                cb.call(void 0, null, data);
            });

            client.request(fibitUrl, callback);

            expect(callback.calledWith(null, data)).to.be.true;
            done();
        });

    });

    describe('Get Activity measures:', function () {

        beforeEach(function (done) {
            options = {
                creds: {
                    clientID: "YOUR_CLIENT_ID",
                    clientSecret: "YOUR_CLIENT_SECRET"
                },
                uris: {
                    "authorizationUri": "https://www.fitbit.com",
                    "authorizationPath": "/oauth2/authorize",
                    "tokenUri": "https://api.fitbit.com",
                    "tokenPath": "/oauth2/token"
                },
                authorization_uri: {
                    "redirect_uri": "http://localhost:3000/oauth_callback",
                    "response_type": "code",
                    "scope": "activity",
                    "state": "3(#0/!~"
                }
            };
            client = new Fitbit(options);
            done();
        });

        it('getDailySteps', function (done) {
            var data = {
                body: {
                    steps: '10000'
                }
            };
            sinon.stub(client, 'getDailySteps', function (u, cb) {
                cb.call(void 0, null, data.body.steps);
            });
            client.getDailySteps(new Date(), function (err, steps) {
                expect(steps).to.eq(data.body.steps);
            });

            done();
        });

        it('getDailySteps error', function (done) {
            var error = new Error('ERROR');
            sinon.stub(client, 'getDailySteps', function (u, cb) {
                cb.call(void 0, error);
            });
            client.getDailySteps(new Date(), function (err, steps) {
                expect(err.message).to.eq('ERROR');
            });

            done();
        });
        
    });


});