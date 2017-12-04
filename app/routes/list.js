let mongoose = require('mongoose');
let List = require('../models/list');
let User = require('../models/user');

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
            await User.findOneAndUpdate({ "_id": list.owner }, { $push: { "listsIsMemberOf": list._id, "listsOwned": list._id }});
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
            var list = await List.findById({ "_id": req.params.listId });
            res.json(list);
        }
        catch(e) {
            res.status(404).json({ message: "List was not found", e });
        }
    }
    else {
        res.status(403).json({ message: "You do not have permission to access this list" });
    }
}

/*
 * PUT /list/:listId/member/:memberId
 * Add member to list
 */
function addMemberToList(req, res) {}

/*
 * DELETE /list/:listId/member/:memberId
 * Remove member from list
 */
function removeMemberFromList(req, res) {}

/*
 * PUT /list/:listId/item
 * Add item to list
 */
function addItemToList(req, res) {}

/*
 * GET list/:listId/item/:itemId
 * Return an item from list
 */
function getItemFromList(req, res) {}

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
        if (user.listsOwned.includes(listId)) {
            return true;
        }
        return false;
    }
    catch (e) {
        return false;
    }
}

module.exports = { createList, getList, addMemberToList, removeMemberFromList, addItemToList, getItemFromList, updateItemDescription, updateItemImage, updateItemStatus, removeItemFromList, deleteList };