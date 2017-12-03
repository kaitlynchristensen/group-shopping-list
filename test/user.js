process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let User = require('../app/models/user');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();

chai.use(chaiHttp);

describe('Users', () => {
    beforeEach((done) => { // empty the database before each test
        User.remove({}, (err) => {
            done();
        });
    });

    describe('GET /user', () => {
        it('it should return an array of all users', (done) => {
            chai.request(server)
                .get('/user')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('array');
                    res.body.length.should.be.eql(0);
                    done();
                });
        });
    });

    describe('POST /user', function() {
        it('it should not create a user without a username', (done) => {
            let user = {
                "password": "password"
            };
            chai.request(server)
                .post('/user')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(406);
                    done();
                });
        });
        it('it should not create a user with an empty username', (done) => {
            let user = {
                "username": "",
                "password": "password"
            };
            chai.request(server)
                .post('/user')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(406);
                    done();
                });
        });
        it('it should not create a user without a password', (done) => {
            let user = {
                "username": "bob"
            };
            chai.request(server)
                .post('/user')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(406);
                    done();
                });
        });
        it('it should not create a user with an empty password', (done) => {
            let user = {
                "username": "bob",
                "password": ""
            };
            chai.request(server)
                .post('/user')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(406);
                    done();
                });
        });
        it('it should successfully create a user with valid data', (done) => {
            let user = {
                "username": "bob",
                "password": "password"
            };
            chai.request(server)
                .post('/user')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });
        it('it should not create a user with a username already in the database', (done) => {
            let user = {
                "username": "anh",
                "password": "pass"
            };
            chai.request(server)
                .post('/user')
                .send(user)
                .then((response) => {
                    chai.request(server)
                    .post('/user')
                    .send(user)
                    .then(() => {
                        throw Error('Something went wrong');
                    },
                    (res) => {
                        res.should.have.status(406);
                        done();
                    });
                },
                (err) => {
                    throw Error('Something went wrong');
                });
        });
    });

    describe('GET /user/:userId', () => {
        it('it should return the user with the given userId', (done) => {
            let user = {
                "username": "kaitlyn",
                "password": "password"
            };
            chai.request(server)
                .post('/user')
                .send(user)
                .end((err, res) => {
                    chai.request(server)
                    .get('/user/' + res.body.user._id)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.have.property('username');
                        res.body.should.have.property('listsOwned');
                        res.body.should.have.property('listsIsMemberOf');
                        res.body.username.should.eq('kaitlyn');
                        res.body.listsOwned.length.should.eq(0);
                        res.body.listsIsMemberOf.length.should.eq(0);
                        done();
                    });
                });
        });
        it('it should return an error when there is no user with given userId', (done) => {
            chai.request(server)
                .get('/user/nobody')
                .end((err, res) => {
                    res.should.have.status(404);
                    done();
                });
        });
    });

    describe('DELETE /user/:userId', () => {
        it('it should remove the user with the corresponding userId', (done) => {
            let user = {
                "username": "chris",
                "password": "password"
            };
            chai.request(server)
                .post('/user')
                .send(user)
                .then((response) => {
                    chai.request(server)
                    .delete('/user/' + response.body.user._id)
                    .then((response) => {
                        response.should.have.status(200);

                        chai.request(server)
                        .get('/user/chris')
                        .end((err, res) => {
                            res.should.have.status(404);
                            done();
                        });
                    },
                    (res) => {
                        throw Error('Something went wrong');
                    });
                },
                (res) => {
                    throw Error('Something went wrong');
                });
        });

        it('it should delete all lists owned and delete user as a member of all its lists', (done) => {
            throw new Error("Not Implemented");
        });

        it('it should throw an error if the username does not exist', (done) => {
            chai.request(server)
                .delete('/user/nobody')
                .end((err, res) => {
                    res.should.have.status(404);
                    done();
                });
        });
    });

});
