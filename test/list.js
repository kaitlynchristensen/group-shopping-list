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
        let removeRes = await User.remove({});
        let createOwnerRes = await chai.request(server)
            .post('/user')
            .send(owner);

        listOwnerId = createOwnerRes.body.user._id;

        let createMemberRes = await chai.request(server)
            .post('/user')
            .send(member);
        
        listMemberOnlyId = createMemberRes.body.user._id;
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
            let error;
            let reqBody = {
                "user": "nobody"
            };
            try {
                await chai.request(server)
                    .post('/list')
                    .send(reqBody);
            }
            catch(e) {
                error = e;
            }
            finally {
                error.should.have.status(403);                
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
            let error;
            try {
                var getListRes = await chai.request(server)
                    .get('/list/abcdefghijkl')
                    .send(reqBody);
            }
            catch(e) {
                error = e;
            }
            finally {
                error.should.have.status(403);
            }
        });

        it("it should return an error if the user is not a member", async () => {
            let error;
            let notAMemberReqBody = {
                "user": "randomcode"
            }
            try {
                var getListRes = await chai.request(server)
                    .get('/list/' + listId)
                    .send(notAMemberReqBody);
            }
            catch(e) {
                error = e;
            }
            finally {
                error.should.have.status(403);
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
            let addMemberError;
            try {
                var fakeListId = "blahblahblah";

                var addMemberRes = await chai.request(server)
                    .put('/list/' + fakeListId + '/member/' + listMemberOnlyId)
                    .send(ownerBody);
            }
            catch(e) {
                addMemberError = e;
            }
            finally {
                try {
                    var getMemberRes = await chai.request(server)
                        .get('/user/' + listMemberOnlyId)
                        .send(memberBody);
                }
                finally {
                    addMemberError.should.have.status(404);
                    getMemberRes.body.listsIsMemberOf.should.not.contain(fakeListId);
                }
            }
        });

        it("it should return an error if the member does not exist and the member should not be added to the list's members", async () => {
            let addMemberError;
            try {
                var fakeUserId = "blahblahblahblah";

                var addMemberRes = await chai.request(server)
                    .put('/list/' + listId + '/member/' + fakeUserId)
                    .send(ownerBody);
            }
            catch(e) {
                addMemberError = e;
            }
            finally {
                try {
                    var getListRes = await chai.request(server)
                        .get('/list/' + listId)
                        .send(ownerBody);
                }
                finally {
                    addMemberError.should.have.status(404);
                    getListRes.body.members.should.not.contain(fakeUserId);
                }
            }
        });

        it('it should return an error if the member is already on the list', async () => {
            let error;
            try {
                var addMemberRes = await chai.request(server)
                    .put('/list/' + listId + '/member/' + listOwnerId)
                    .send(ownerBody);
            }
            catch(e) {
                error = e;
            }
            finally {
                error.should.have.status(404);           
            }
        });

        it("it should return an error if the user is not the owner", async () => {
            let addMemberError;
            try {
                var addMemberRes = await chai.request(server)
                    .put('/list/' + listId + '/member/' + listMemberOnlyId)
                    .send(memberBody);
            }
            catch(e) {
                addMemberError = e;
            }
            finally {
                try {
                    var getListRes = await chai.request(server)
                        .get('/list/' + listId)
                        .send(ownerBody);
                }
                finally {
                    addMemberError.should.have.status(404);
                    getListRes.body.members.should.not.contain(listMemberOnlyId);
                }
            }
        });
    });

    describe('DELETE /list/:listId/member/:memberId', () => {
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

            var createListResponse = await chai.request(server)
                .post('/list')
                .send(ownerBody);

            listId = createListResponse.body.list._id;

            var addMemberResponse = await chai.request(server)
                .put('/list/' + listId + '/member/' + listMemberOnlyId)
                .send(ownerBody);
        });

        it("it should delete a member from the list of members and delete the list from the member's lists", async () => {
            try {
                var deleteMemberRes = await chai.request(server)
                    .delete('/list/' + listId + '/member/' + listMemberOnlyId)
                    .send(memberBody);
            }
            finally {
                try {
                    var getListRes = await chai.request(server)
                        .get('/list/' + listId)
                        .send(ownerBody);

                    var getExMemberRes = await chai.request(server)
                        .get('/user/' + listMemberOnlyId)
                        .send(memberBody);
                }
                finally {
                    getListRes.body.members.should.not.contain(listMemberOnlyId);
                    getExMemberRes.body.listsIsMemberOf.should.not.contain(listId);
                }
            }
        });

        it("it should not return an error if the user is the owner", async () => {
            try {
                var deleteMemberRes = await chai.request(server)
                    .delete('/list/' + listId + '/member/' + listMemberOnlyId)
                    .send(ownerBody);
            }
            finally {
                try {
                    var getListRes = await chai.request(server)
                        .get('/list/' + listId)
                        .send(ownerBody);

                    var getExMemberRes = await chai.request(server)
                        .get('/user/' + listMemberOnlyId)
                        .send(memberBody);
                }
                finally {
                    getListRes.body.members.should.not.contain(listMemberOnlyId);
                    getExMemberRes.body.listsIsMemberOf.should.not.contain(listId);
                }
            }
        });

        it('it should return an error if the list does not exist', async () => {
            let fakeListId = "akjdfkjagldgf";
            let error;
            try {
                var deleteMemberRes = await chai.request(server)
                    .delete('/list/' + fakeListId + '/member/' + listMemberOnlyId)
                    .send(ownerBody);
            }
            catch(e) {
                error = e;
            }
            finally {
                error.should.have.status(403);
            }
        });

        it('it should return an error if the member does not exist', async () => {
            let fakeUserId = "michaelscotttt";
            let error;
            try {
                var deleteMemberRes = await chai.request(server)
                    .delete('/list/' + listId + '/member/' + fakeUserId)
                    .send(ownerBody);
            }
            catch(e) {
                error = e;
            }
            finally {
                error.should.have.status(404);
            }
        });

        it('it should return an error if the member is the owner', async () => {
            let error;
            try {
                var deleteMemberRes = await chai.request(server)
                    .delete('/list/' + listId + '/member/' + listOwnerId)
                    .send(ownerBody);
            }
            catch(e) {
                error = e;
            }
            finally {
                error.should.have.status(403);
            }
        });

        it('it should return an error if the member is not on the list', async () => {
            let deleteMemberError;
            let newMemberId;

            let newMemberBody = {
                "username": "pam",
                "password": "beasly"
            }

            try {
                var createUserRes = await chai.request(server)
                    .post('/user')
                    .send(newMemberBody);

                newMemberId = createUserRes.body._id;
            }
            finally {
                try {
                    var deleteMemberRes = await chai.request(server)
                        .delete('/list/' + listId + '/member/' + listMemberOnlyId)
                        .send(newMemberBody);
                }
                catch(e) {
                    deleteMemberError = e;
                }
                finally {
                    deleteMemberError.should.have.status(403);
                }
            }
        });
    });

    describe('POST /list/:listId/item', () => {

        let memberBody;
        let listId;

        beforeEach(async () =>  {
            memberBody = {
                "user": listOwnerId
            }

            var createListResponse = await chai.request(server)
                .post('/list')
                .send(memberBody);

            listId = createListResponse.body.list._id;
        });

        it('it should create a new item with a description, add it to the list and return the item', async () => {
            let itemDescription = "dishsoap";
            
            let newItemReqBody = {
                user: listOwnerId,
                description: itemDescription
            }
            
            try {
                var createItemRes = await chai.request(server)
                    .post('/list/' + listId + '/item')
                    .send(newItemReqBody);

                var getListRes = await chai.request(server)
                    .get('/list/' + listId)
                    .send(memberBody);
            }
            finally {
                createItemRes.should.have.status(200);
                createItemRes.body.item.should.have.property("_id");
                createItemRes.body.item.should.have.property("description");
                createItemRes.body.item.description.should.eql(itemDescription);

                let itemId = createItemRes.body.item._id;

                getListRes.body.items.length.should.be.eql(1);
                getListRes.body.items[0].should.be.eql(itemId);
            }
        });

        it('it should create a new item without a description, add it to the list and return the item', async () => {
            try {
                var createItemRes = await chai.request(server)
                    .post('/list/' + listId + '/item')
                    .send(memberBody);

                var getListRes = await chai.request(server)
                    .get('/list/' + listId)
                    .send(memberBody);
            }
            finally {
                createItemRes.should.have.status(200);
                createItemRes.body.item.should.have.property("_id");

                let itemId = createItemRes.body.item._id;

                getListRes.body.items.length.should.be.eql(1);
                getListRes.body.items[0].should.be.eql(itemId);
            }
        });

        it('it should return an error if the list does not exist', async () => {
            let fakeListId = "jkgaljieghanb";
            let error;
            try {
                var createItemRes = await chai.request(server)
                    .post('/list/' + fakeListId + '/item')
                    .send(memberBody);
            }
            catch (e) {
                error = e;
            }
            finally {
                error.should.have.status(403);
            }
        });

        it("it should return an error if the user is not a member", async () => {
            let addItemError;
            let newMemberId;

            try {
                var createUserRes = await chai.request(server)
                    .post('/user')
                    .send({
                        "username": "pam",
                        "password": "beasly"
                    });

                newMemberId = createUserRes.body._id;
            }
            finally {
                try {
                    var addItemRes = await chai.request(server)
                        .post('/list/' + listId + '/item')
                        .send({
                            "user": newMemberId
                        });
                }
                catch(e) {
                    addItemError = e;
                }
                finally {
                    addItemError.should.have.status(403);
                }
            }
        });
    });

    describe('GET list/:listId/item/:itemId', () => {

        let memberBody;
        let listId;
        let itemId;
        let itemDescription = "Toilet Paper";

        beforeEach(async () =>  {
            memberBody = {
                "user": listOwnerId
            }

            var createListResponse = await chai.request(server)
                .post('/list')
                .send(memberBody);

            listId = createListResponse.body.list._id;

            var addItemResponse = await chai.request(server)
                .post('/list/' + listId + '/item')
                .send({
                    "user": listOwnerId,
                    "description": itemDescription
                });

            itemId = addItemResponse.body.item._id;
        });

        it('it should return the item with itemId', async () => {
            try {
                var getItemRes = await chai.request(server)
                    .get('/list/' + listId + '/item/' + itemId)
                    .send(memberBody);
            }
            finally {
                getItemRes.body.should.have.property("_id");
                getItemRes.body._id.should.eql(itemId);
                getItemRes.body.should.have.property("description");
                getItemRes.body.description.should.eql(itemDescription);
            }
        });

        it('it should return an error if the list does not exist', async () => {
            let error;
            let fakeListId = "nothinghere";
            try {
                var getItemRes = await chai.request(server)
                    .get('/list/' + fakeListId + '/item/' + itemId)
                    .send(memberBody);
            }
            catch (e) {
                error = e;
            }
            finally {
                error.should.have.status(403);
            }
        });

        it('it should return an error if the item is not on the list', async () => {
            let newListId;
            let itemNotOnListId;
            let getItemError;

            try {
                var createListRes = await chai.request(server)
                    .post('/list')
                    .send(memberBody);

                newListId = createListRes.body.list._id;
            }
            finally {
                try {
                    var addItemRes = await chai.request(server)
                        .post('/list/' + newListId + '/item')
                        .send(memberBody);
                }
                finally {
                    itemNotOnListId = addItemRes.body.item._id;

                    try {
                        var getItemRes = await chai.request(server)
                            .get('/list/' + listId + '/item/' + itemNotOnListId)
                            .send(memberBody);
                    }
                    catch(e) {
                        getItemError = e;
                    }
                    finally {
                        getItemError.should.have.status(404);
                    }
                }
            }
        });

        it("it should return an error if the user is not a member", async () => {
            let addItemError;
            let newMemberId;

            try {
                var createUserRes = await chai.request(server)
                    .post('/user')
                    .send({
                        "username": "wendy",
                        "password": "passw0rd"
                    });

                newMemberId = createUserRes.body._id;
            }
            finally {
                try {
                    var addItemRes = await chai.request(server)
                        .get('/list/' + listId + '/item/' + itemId)
                        .send({
                            "user": newMemberId
                        });
                }
                catch(e) {
                    addItemError = e;
                }
                finally {
                    addItemError.should.have.status(403);
                }
            }
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