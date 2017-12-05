process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let User = require('../app/models/user');
let List = require('../app/models/list');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();

chai.use(chaiHttp);

const all = Promise.all.bind(Promise);

let listOwnerId;
let listOwnerName = "kaitlyn";
let listMemberOnlyId;
let listMemberOnlyName = "kathy";

describe('Lists', () => {

    beforeEach(async () => { // empty the database before each test
        await List.remove({});
        await User.remove({});

        let owner = {
            "username": "sadie",
            "password": "password"
        };

        let member = {
            "username": "hawkins",
            "password": "password"
        };

        try {
            let removeRes = await User.remove({});
            let createOwnerRes = await chai.request(server)
                .post('/user')
                .send(owner);

            listOwnerId = createOwnerRes.body.user._id;

            let createMemberRes = await chai.request(server)
                .post('/user')
                .send(member);
            
            listMemberOnlyId = createMemberRes.body.user._id;
        }
        catch(e) {
            console.log("deleteme");
        }
    });

    describe('POST /list', () => {
        it('it should create a new list owned by the user who created it and with a single member and it should return the new list', async () => {
            let reqBody = {
                "user": listOwnerId
            };

            try {
                var createListRes = await chai.request(server)
                    .post('/list')
                    .send(reqBody);

                var getOwnerRes = await chai.request(server)
                    .get('/user/' + listOwnerId)
                    .send(reqBody);
            }
            finally {

                createListRes.should.have.status(200);
                createListRes.body.list.should.have.property("_id");
                createListRes.body.list.should.have.property("owner");
                createListRes.body.list.should.have.property("members");
                createListRes.body.list.owner.should.be.eql(listOwnerId);
                createListRes.body.list.members.length.should.eql(1);
                createListRes.body.list.members[0].should.eql(listOwnerId);

                getOwnerRes.body.listsOwned.should.contain(createListRes.body.list._id);
                getOwnerRes.body.listsIsMemberOf.should.contain(createListRes.body.list._id);
            }
        });

        it("it should return an error if the userId is invalid", async () => {
            let reqBody = {
                "user": "nobody"
            };
            try {
                await chai.request(server)
                    .post('/list')
                    .send(reqBody);
                throw new Error("Test should fail");
            }
            catch(err) {
                err.should.have.status(403);
            }
        });
    });

    describe('GET /list/:listId', () => {
        let reqBody;
        let listId;

        beforeEach(async () =>  {
            reqBody = {
                "user": listOwnerId
            };
            try {
                var response = await chai.request(server)
                    .post('/list')
                    .send(reqBody);
            }
            finally {
                listId = response.body.list._id;
            }
        });

        it('it should return the list corresponding to the id', async () => {
            try {
                var getListRes = await chai.request(server)
                    .get('/list/' + listId)
                    .send(reqBody);
            }
            finally {
                getListRes.body.should.have.property('owner');
                getListRes.body._id.should.eql(listId);
            }
        });

        it('it should return an error if the list does not exist', async () => {
            try {
                var getListRes = await chai.request(server)
                    .get('/list/abcdefghijkl')
                    .send(reqBody);
            }
            catch(err) {
                err.should.have.status(404);
            }
        });

        it("it should return an error if the user is not a member", async () => {
            let notAMemberReqBody = {
                "user": "randomcode"
            }
            try {
                var getListRes = await chai.request(server)
                    .get('/list/' + listId)
                    .send(notAMemberReqBody);
            }
            catch(err) {
                err.should.have.status(404);
            }
        });
    });

    describe('PUT /list/:listId/member/:memberId', () => {
        let ownerBody;
        let memberBody;
        let listId;

        beforeEach(async () =>  {
            ownerBody = {
                "user": listOwnerId
            };
            memberBody = {
                "user": listMemberOnlyId
            }
            try {
                var listResponse = await chai.request(server)
                    .post('/list')
                    .send(ownerBody);
            }
            finally {
                listId = listResponse.body.list._id;
            }
        });

        it("it should add a new member to list of members and add list to member's list", async () => {
            try {
                var addMemberRes = await chai.request(server)
                    .put('/list/' + listId + '/member/' + listMemberOnlyId)
                    .send(ownerBody);

                var getListRes = await chai.request(server)
                    .get('/list/' + listId)
                    .send(memberBody);

                var getMemberRes = await chai.request(server)
                    .get('/user/' + listMemberOnlyId)
                    .send(memberBody);
            }
            finally {
                addMemberRes.should.have.status(200);
                getListRes.should.have.status(200);
                getListRes.body.members.should.contain(listMemberOnlyId);
                getMemberRes.body.listsIsMemberOf.should.contain(listId);
            }
        });

        it('it should return an error if the list does not exist and the list id should not be added anywhere', async () => {
            try {
                var fakeListId = "blahblahblah";

                var addMemberRes = await chai.request(server)
                    .put('/list/' + fakeListId + '/member/' + listMemberOnlyId)
                    .send(ownerBody);
            }
            catch(err) {
                err.should.have.status(404);
            }
            finally {
                try {
                    var getMemberRes = await chai.request(server)
                        .get('/user/' + listMemberOnlyId)
                        .send(memberBody);
                }
                finally {
                    getMemberRes.body.listsIsMemberOf.should.not.contain(fakeListId);
                }
            }
        });

        it("it should return an error if the member does not exist and the member should not be added to the list's members", async () => {
            try {
                var fakeUserId = "blahblahblahblah";

                var addMemberRes = await chai.request(server)
                    .put('/list/' + listId + '/member/' + fakeUserId)
                    .send(ownerBody);
            }
            catch(err) {
                err.should.have.status(404);
            }
            finally {
                try {
                    var getListRes = await chai.request(server)
                        .get('/list/' + listId)
                        .send(ownerBody);
                }
                finally {
                    getListRes.body.members.should.not.contain(fakeUserId);
                }
            }
        });

        it('it should return an error if the member is already on the list', async () => {
            try {
                var addMemberRes = await chai.request(server)
                    .put('/list/' + listId + '/member/' + listOwnerId)
                    .send(ownerBody);
            }
            catch(err) {
                err.should.have.status(403);
            }
        });

        it("it should return an error if the user is not the owner", async () => {
            try {
                var addMemberRes = await chai.request(server)
                    .put('/list/' + listId + '/member/' + listMemberOnlyId)
                    .send(memberBody);
            }
            catch(err) {
                err.should.have.status(404);
            }
            finally {
                try {
                    var getListRes = await chai.request(server)
                        .get('/list/' + listId)
                        .send(ownerBody);
                }
                finally {
                    getListRes.body.members.should.not.contain(listMemberOnlyId);
                }
            }
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