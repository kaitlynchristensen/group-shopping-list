let mongoose = require('mongoose');
let List = require('../models/list');
let User = require('../models/user');

/*
 * POST /list
 * Create new list
 */
function createList(req, res) {
    var newList = new List({
        owner: req.body.user,
        members: [req.body.user]
    });

    newList.save((err, list) => {

        if (err == null) {
            User.findOneAndUpdate({ "_id": list.owner }, { $push: { "listsOwned": list._id }, $push: { "listsIsMemberOf": list._id }}, (err, user) => {
                if (err == null) {
                    res.json({ message: "You have successfully created a new list", list});
                }
                else {
                    List.findOneAndRemove({ "_id": list._id });
                    res.json({ message: "List creation was unsuccessful", err});
                }
            });
        }
        else {
            res.json({ message: "List creation was unsuccessful", err});
        }
    });
}

/*
 * GET /list/:listId
 * Return a list by id
 */
function getList(req, res) {}

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

module.exports = { createList, getList, addMemberToList, removeMemberFromList, addItemToList, getItemFromList, updateItemDescription, updateItemImage, updateItemStatus, removeItemFromList, deleteList };