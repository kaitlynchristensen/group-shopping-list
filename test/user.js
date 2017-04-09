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
                    res.body.should.be.a('array');
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
                (res) => {
                    throw Error('Something went wrong');
                });
        });
    });
});
