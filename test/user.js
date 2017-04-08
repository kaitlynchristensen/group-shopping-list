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
        it('it should return all users', (done) => {
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
});
