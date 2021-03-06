var Hapi = require('hapi');
var Code = require('code');
var Lab = require('lab');
var lab = exports.lab = Lab.script();

var describe = lab.describe;
var it = lab.it;
var before = lab.before;
var beforeEach = lab.beforeEach;
var after = lab.after;
var afterEach = lab.afterEach;
var expect = Code.expect;

describe('Access Token', function() {

    it('sets the access token key name and profile url', function(done) {
        var server = new Hapi.Server();
        server.connection();

        server.register(require('../'), function (err) {
            expect(err).to.not.exist();

            server.auth.strategy('access-token', 'access-token', {
                accessTokenKeyName: 'fishface',
                profileUrl: 'http://www.google.co.uk/?access_token=',
                validateFunc: function(payload, accessToken, reply) {
                    expect(accessToken).to.equal('barry');
                    reply.continue({credentials: 'barry'})
                }
            });

            server.route({ method: 'GET', path: '/', config: {
                auth: 'access-token',
                handler: function(request, reply) {
                    reply(null, {credentials: request.auth.credentials});
                }
            }});

            server.inject({url:'/?fishface=barry'}, function(res) {
                return done();
            });
        });
    });

    it('sets the user credentials for the request', function(done) { 
        var server = new Hapi.Server();
        server.connection();

        server.register(require('../'), function (err) {
            expect(err).to.not.exist();

            server.auth.strategy('access-token', 'access-token', {
                accessTokenKeyName: 'fishface',
                profileUrl: 'http://www.google.co.uk/?access_token=',
                validateFunc: function(payload, accessToken, reply) {
                    reply.continue({
                        credentials: {
                            name: 'Barry White',
                            age: 24
                        }
                    });
                }
            });

            server.route({ method: 'GET', path: '/', config: {
                auth: 'access-token',
                handler: function(request, reply) {
                    expect(request.auth.credentials).to.exist();
                    expect(request.auth.credentials.name).to.exist();
                    expect(request.auth.credentials.name).to.equal('Barry White');
                    expect(request.auth.credentials.age).to.equal(24);
                    reply({credentials: request.auth.credentials})
                }
            }});

            server.inject({url:'/?fishface=barry'}, function(res) {
                return done();
            });
        });
    });

    it('passes the original request through', function(done) { 
        var server = new Hapi.Server();
        server.connection();

        server.register(require('../'), function (err) {
            expect(err).to.not.exist();

            server.auth.strategy('access-token', 'access-token', {
                accessTokenKeyName: 'fishface',
                profileUrl: 'http://www.google.co.uk/?access_token=',
                validateFunc: function(payload, accessToken, reply, request) {

                    expect(request).to.exist();

                    reply.continue({
                        credentials: {
                            name: 'Barry White',
                            age: 24
                        }
                    });
                }
            });

            server.route({ method: 'GET', path: '/', config: {
                auth: 'access-token',
                handler: function(request, reply) {

                    expect(request.auth.credentials).to.exist();
                    expect(request.auth.credentials.name).to.exist();
                    expect(request.auth.credentials.name).to.equal('Barry White');
                    expect(request.auth.credentials.age).to.equal(24);
                    expect(request.query.terry).to.equal('shpongle');
                    reply({credentials: request.auth.credentials})
                }
            }});

            server.inject({url:'/?fishface=barry&terry=shpongle'}, function(res) {
                return done();
            });
        });
    });

    it('token is in the post data', function(done) { 
        var server = new Hapi.Server();
        server.connection();

        server.register(require('../'), function (err) {
            expect(err).to.not.exist();

            server.auth.strategy('access-token', 'access-token', {
                accessTokenKeyName: 'fishface',
                profileUrl: 'http://www.google.co.uk/?access_token=',
                validateFunc: function(payload, accessToken, reply, request) {

                    expect(request).to.exist();
                    request.auth.credentials = {
                        name: 'Barry White',
                        age: 24
                    };
                    reply.continue();
                }
            },false, { payload: true });

            server.route({ method: 'POST', path: '/', config: {
                auth: {strategies: ['access-token'], payload: true},
                handler: function(request, reply) {

                    expect(request.auth.credentials).to.exist();
                    expect(request.auth.credentials.name).to.exist();
                    expect(request.auth.credentials.name).to.equal('Barry White');
                    expect(request.auth.credentials.age).to.equal(24);
                    expect(request.payload.terry).to.equal('shpongle');
                    reply({credentials: request.auth.credentials})
                }
            }});

            server.inject({url:'/', method: 'POST', payload: { fishface: 'barry', terry: 'shpongle' }}, function (res) {

                expect(res.statusCode).to.equal(200);
                return done();
            });
        });
    });

});
