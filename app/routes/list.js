let mongoose = require('mongoose');
let List = require('../models/list');
let User = require('../models/user');
let Item = require('../models/item');

const all = Promise.all.bind(Promise);

/*
 * POST /list
 * Create new list
 */
async function createList(req, res) {
    if (await isValidUser(req.body.user)) {

        var listModel = new List({
            owner: req.body.user,
            members: [req.body.user]
        });
        var list;
        try {
            list = await listModel.save();
            await User.findOneAndUpdate(
                { "_id": list.owner }, 
                { $push: { "listsIsMemberOf": list._id, "listsOwned": list._id }}
            );
            res.json({ message: "You have successfully created a new list", list});
        }
        catch(e) {
            if (list != null) {
                List.findOneAndRemove({ "_id": list.list._id });
            }
            res.status(404).json({ message: "List was not created", e});
        }
    }
    else {
        res.status(403).json({ message: "Not a valid user" });
    }
}

/*
 * GET /list/:listId
 * Return a list by id
 */
async function getList(req, res) {
    if (await isMember(req.body.user, req.params.listId)) {

        try {
            var list = await List.findOne({ "_id": req.params.listId });
            res.json(list);
        }
        catch(e) {
            res.status(500).json({ message: "Could not get list", e });
        }
    }
    else {
        res.status(403).json({ message: "You don't have permission to access this list" });
    }
}

/*
 * PUT /list/:listId/member/:memberId
 * Add member to list
 */
async function addMemberToList(req, res) {
    if (await isOwner(req.body.user, req.params.listId)) {
        
        try {
            var [list, user] = await all([
                List.findOneAndUpdate(
                    { "_id": req.params.listId, members: { $nin: [req.params.memberId] }}, 
                    { $push: { "members": req.params.memberId }}),
                User.findOneAndUpdate(
                    { "_id": req.params.memberId, listsIsMemberOf: { $nin: [req.params.listId] } },
                    { $push: { "listsIsMemberOf": req.params.listId } })
            ]);

            if (list != null && user != null) {
                res.json(list);
            }
            else {
                throw new Error("Not found (or the member is already on the list!)");         
            }   

        }
        catch(err) {
            try {
                if (list) {
                    List.findOneAndUpdate(
                        { "_id": req.params.listId }, 
                        { $set: { "members": list.members }});
                }
                if (user) {
                    User.findOneAndUpdate(
                        { "_id": req.params.memberId },
                        { $set: { "listsIsMemberOf": user.listsIsMemberOf } });
                }
            }
            finally {
                res.status(404).json({ message: "Could not add member to list", err });
            }
        }
    }
    else {
        res.status(404).json({ message: "List was not found" });
    }
}

/*
 * DELETE /list/:listId/member/:memberId
 * Remove member from list
 */
async function removeMemberFromList(req, res) {

    if (await canRemoveMember(req.body.user, req.params.memberId, req.params.listId)) {
        
        try {
            var list = await List.findOneAndUpdate(
                { "_id": req.params.listId, members: { $in: [req.params.memberId] }}, 
                { $pull: { "members": req.params.memberId }});
        }
        catch (err) {
            res.status(404).json({ message: "Could not update list", err });
            return;
        }

        try {
            var user = await User.findOneAndUpdate(
                { "_id": req.params.memberId, listsIsMemberOf: { $in: [req.params.listId] } },
                { $pull: { "listsIsMemberOf": req.params.listId } });
        }
        catch (err) {
            try {
                var list = await List.findOneAndUpdate(
                    { "_id": req.params.listId, members: { $nin: [req.params.memberId] }}, 
                    { $push: { "members": req.params.memberId }});
            }
            finally {
                res.status(404).json({ message: "Could not update list", err });
            }
        }

        res.status(200).json({ message: "Successfully removed member from list" });
    }
    else {
        res.status(403).json({ message: "You do not have permission to remove this member" });
    }
}

/*
 * PUT /list/:listId/item
 * Add item to list
 */
async function addItemToList(req, res) {
    if (await isMember(req.body.user, req.params.listId)) {
        let newItemId;

        var itemModel = new Item({
            list: req.params.listId,
            description: req.body.description
        });

        try {
            var createItemRes = await itemModel.save();
        }
        catch (e) {
            res.status(500).json({ message: "Item was not created" });
            return;
        }

        newItemId = createItemRes.id;
        
        try {
            var updateListRes = await List.findOneAndUpdate(
                { "_id": req.params.listId }, 
                { $push: { "items":  newItemId }});
        }
        catch (e) {
            await Item.findOneAndRemove({ "_id": newItemId });

            res.status(500).json({ message: "Item was not created" });
            return;
        }

        let item = createItemRes;
        res.json({ message: "You have successfully added an item to the list", item });
    }
    else {
        res.status(403).json({ message: "You do not have permission to add an item to this list" });
    }
}

/*
 * GET list/:listId/item/:itemId
 * Return an item from list
 */
async function getItemFromList(req, res) {
    if (await isMember(req.body.user, req.params.listId)) {

        try {
            var item = await Item.findOne({ "_id": req.params.itemId });

            if (req.params.listId == item.list.toString()) {
                res.json(item);
            }
            else {
                res.status(404).json({ message: "Item was not found on this list" });
            }
        }
        catch(e) {
            res.status(404).json({ message: "Item was not found on this list", e });
        }
    }
    else {
        res.status(403).json({ message: "You do not have permission to access this list" });
    }
}

/*
 * PUT list/:listId/item/:itemId/description
 * Update an item's description
 */
function updateItemDescription(req, res) {}

 /*
 * PUT list/:listId/item/:itemId/image
 * Update an item's image
 */
function updateItemImage(req, res) {}

/*
 * PUT list/:listId/item/:itemId/completed
 * Update an item's status
 */
function updateItemStatus(req, res) {}

/*
 * DELETE /list/:listId/item/:itemId
 * Remove item from list
 */
function removeItemFromList(req, res) {}

/*
 * DELETE /list/:listId
 * Delete a list
 */
function deleteList(req, res) {}

async function isValidUser(userId) {
    try {
        await User.findById(userId);
        return true;
    }
    catch(e) {
        return false;
    }
}

async function isMember(userId, listId) {
    try {
        let user = await User.findById(userId);
        if (user.listsIsMemberOf.filter((list) => list.equals(listId) ).length > 0) {
            return true;
        }
        return false;
    }
    catch (e) {
        return false;
    }
}

async function isOwner(userId, listId) {
    try {
        let user = await User.findById(userId);
        if (user.listsOwned.filter((list) => list.equals(listId) ).length > 0) {
            return true;
        }
        return false;
    }
    catch (e) {
        return false;
    }
}

async function canRemoveMember(userId, memberToRemoveId, listId) {
    try {
        let user = await User.findById(userId);

        if (user.listsOwned.filter((list) => list.equals(listId) ).length > 0) {
            if (userId == memberToRemoveId) {
                return false;
            }
            return true;
        }
        
        if (user.listsIsMemberOf.filter((list) => list.equals(listId) ).length > 0) {
            if (userId != memberToRemoveId) {
                return false;
            }
            return true;
        }

        return false;
    }
    catch (e) {
        return false;
    }
}

module.exports = { createList, getList, addMemberToList, removeMemberFromList, addItemToList, getItemFromList, updateItemDescription, updateItemImage, updateItemStatus, removeItemFromList, deleteList };