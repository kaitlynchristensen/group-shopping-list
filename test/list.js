process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let User = require('../app/models/user');
let List = require('../app/models/list');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();

chai.use(chaiHttp);

let listOwnerId;
let listOwnerName = "kaitlyn";
let listMemberOnlyId;
let listMemberOnlyName = "kathy";

describe('Lists', () => {
    before((done) => {
        User.remove({}, (err) => {})
        .then((err, res) => {
            let user1 = {
                "username": listOwnerName,
                "password": "password"
            };
            chai.request(server)
                .post('/user')
                .send(user1)
                .end((err, res) => {
                    listOwnerId = res.body.user._id;
                    let user2 = {
                        "username": listMemberOnlyName,
                        "password": "password"
                    };
                    chai.request(server)
                        .post('/user')
                        .send(user2)
                        .end((err, res) => {
                            listMemberOnlyId = res.body.user._id;
                            done();
                        });
                });
        });
    });

    beforeEach((done) => { // empty the database before each test
        List.remove({}, (err) => {
            done();
        });
    });

    describe('POST /list', () => {
        it('it should create a new list owned by the user who created it and with a single member and it should return the new list', (done) => {
            let reqBody = {
                "user": listOwnerId
            };
            let newListId;
            chai.request(server)
                .post('/list')
                .send(reqBody)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.list.should.have.property("_id");
                    res.body.list.should.have.property("owner");
                    res.body.list.should.have.property("members");
                    res.body.list.owner.should.be.eql(listOwnerId);
                    res.body.list.members.length.should.eql(1);
                    res.body.list.members[0].should.eql(listOwnerId);

                    newListId = res.body._id;

                    chai.request(server)
                        .get('/user/' + listOwnerId)
                        .end((err, res) => {
                            res.body.user.listsOwned.should.contain(newListId);
                            res.body.user.listsIsMemberOf.should.contain(newListId);
                            done();
                        })
                });
        });
    });

    describe('GET /list/:listId', () => {
        it('it should return the list corresponding to the id', (done) => {
            throw new Error("Not Implemented");
        });

        it('it should return an error if the list does not exist', (done) => {
            throw new Error("Not Implemented");
        });

        it("it should return an error if the user is not a member", (done) => {
            throw new Error("Not Implemented");
        });
    });

    describe('PUT /list/:listId/member/:memberId', () => {
        it('it should add a new member to list of members', (done) => {
            throw new Error("Not Implemented");
        });

        it('it should return an error if the list does not exist', (done) => {
            throw new Error("Not Implemented");
        });

        it('it should return an error if the member does not exist', (done) => {
            throw new Error("Not Implemented");
        });

        it('it should return an error if the member is already on the list', (done) => {
            throw new Error("Not Implemented");
        });

        it("it should return an error if the user is not the owner", (done) => {
            throw new Error("Not Implemented");
        });
    });

    describe('DELETE /list/:listId/member/:memberId', () => {
        it("it should delete a member from the list of members and delete the list from the member's lists", (done) => {
            throw new Error("Not Implemented");
        });

        it('it should return an error if the list does not exist', (done) => {
            throw new Error("Not Implemented");
        });

        it('it should return an error if the member does not exist', (done) => {
            throw new Error("Not Implemented");
        });

        it('it should return an error if the member is the owner', (done) => {
            throw new Error("Not Implemented");
        });

        it('it should return an error if the member is not on the list', (done) => {
            throw new Error("Not Implemented");
        });

        it("it should return an error if the user is not the owner", (done) => {
            throw new Error("Not Implemented");
        });
    });

    describe('PUT /list/:listId/item', () => {
        it('it should create a new item, add it to the list and return the item', (done) => {
            throw new Error("Not Implemented");
        });

        it('it should return an error if the list does not exist', (done) => {
            throw new Error("Not Implemented");
        });

        it("it should return an error if the user is not a member", (done) => {
            throw new Error("Not Implemented");
        });
    });

    describe('GET list/:listId/item/:itemId', () => {
        it('it should return the item with itemId', (done) => {
            throw new Error("Not Implemented");
        });

        it('it should return an error if the list does not exist', (done) => {
            throw new Error("Not Implemented");
        });

        it('it should return an error if the item is not on the list', (done) => {
            throw new Error("Not Implemented");
        });

        it("it should return an error if the user is not a member", (done) => {
            throw new Error("Not Implemented");
        });
    });

    describe('PUT list/:listId/item/:itemId/description', () => {
        it("it should update the item's description", (done) => {
            throw new Error("Not Implemented");
        });

        it("it should remove the item's description if an empty string is given", (done) => {
            throw new Error("Not Implemented");
        });

        it('it should return an error if the list does not exist', (done) => {
            throw new Error("Not Implemented");
        });

        it('it should return an error if the item is not on the list', (done) => {
            throw new Error("Not Implemented");
        });

        it('it should return an error if there is no description field in request', (done) => {
            throw new Error("Not Implemented");
        });

        it("it should return an error if the user is not a member", (done) => {
            throw new Error("Not Implemented");
        });
    });

    describe('PUT list/:listId/item/:itemId/image', () => {
        it("it should replace the item's image and mark it as complete", (done) => {
            throw new Error("Not Implemented. More tests are necessary here.");
        });
    });

    describe('DELETE /list/:listId/item/:itemId', () => {
        it('it should delete an item from the list and from the list database', (done) => {
            throw new Error("Not Implemented");
        });

        it('it should return an error if the list does not exist', (done) => {
            throw new Error("Not Implemented");
        });

        it('it should return an error if the item is not on the list', (done) => {
            throw new Error("Not Implemented");
        });

        it('it should return an error if the item does not exist', (done) => {
            throw new Error("Not Implemented");
        });

        it("it should return an error if the user is not a member", (done) => {
            throw new Error("Not Implemented");
        });
    });

    describe('DELETE /list/:listId', () => {
        it("it should delete each item on the list, delete its reference from each member's list, delete its reference from the owner's list, and delete the list", (done) => {
            throw new Error("Not Implemented");
        });

        it('it should return an error if the list does not exist', (done) => {
            throw new Error("Not Implemented");
        });

        it("it should not fail if a member cannot be found", (done) => {
            throw new Error("Not Implemented");
        });

        it("it should not fail if a list reference cannot be found on a member's list", (done) => {
            throw new Error("Not Implemented");
        });

        it("it should not fail if a list reference cannot be found on owner's list", (done) => {
            throw new Error("Not Implemented");
        });

        it("it should not fail if an item reference cannot be found in database", (done) => {
            throw new Error("Not Implemented");
        });

        it("it should return an error if the user is not the owner", (done) => {
            throw new Error("Not Implemented");
        });
    });
});