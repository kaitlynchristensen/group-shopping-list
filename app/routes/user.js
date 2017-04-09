let mongoose = require('mongoose');
let User = require('../models/user');

/*
 * GET /user
 * Returns a list of all users
 */
function getUsers(req, res) {
    let query = User.find({});
    query.exec((err, users) => {
        if (err == null) {
            res.json(users);
        }
        else {
            res.send(err);
        }
    });
}

/*
 * POST /user
 * Creates a new user
 */
function createUser(req, res) {
    var validateUserDataResult = validateUserData(req.body);
    if (validateUserDataResult.isValid) {

        usernameAlreadyExists(req.body.username, function(isDuplicate) {
            if (!isDuplicate) {
                var newUser = new User(req.body);

                newUser.save((err, user) => {
                    if (err == null) {
                        res.json({ message: "You have successfully created a new user", user });
                    }
                    else {
                        res.send(err);
                    }
                });
            }
            else {
                res.status(406).json({ message: "That username already exists. Try another one." });
            }
        });
    }
    else {
        res.status(406).json({ message: validateUserDataResult.message });
    }

}

function validateUserData(userData) {
    var result = true;
    var message = "";
    if (!userData.hasOwnProperty('username')) {
        result = false;
        message = "Username required";
    }
    else if (userData.username.length == 0) {
        result = false;
        message = "Username cannot be empty";
    }
    else if (!userData.hasOwnProperty("password")) {
        result = false;
        message = "Password required"
    }
    else if (userData.password.length == 0) {
        result = false;
        message = "Password cannot be empty";
    }

    return { isValid: result, errorMessage: message };    
}

function usernameAlreadyExists(username, callback) {
    let query = User.find({ "username": username });
    query.exec((err, matchingUsers) => {
        if (err == null) {
            if (matchingUsers.length == 0) {
                callback(false);
            }
            else {
                callback(true);
            }
        }
        else {
            throw err;
        }
    });
}


// /*
//  * GET /book route to retrieve all the books.
//  */
// function getBooks(req, res) {
//     //Query the DB and if no errors, send all the books
//     let query = Book.find({});
//     query.exec((err, books) => {
//         if(err) res.send(err);
//         //If no errors, send them back to the client
//         res.json(books);
//     });
// }

// /*
//  * POST /book to save a new book.
//  */
// function postBook(req, res) {
//     //Creates a new book
//     var newBook = new Book(req.body);
//     //Save it into the DB.
//     newBook.save((err,book) => {
//         if(err) {
//             res.send(err);
//         }
//         else { //If no errors, send it back to the client
//             res.json({message: "Book successfully added!", book });
//         }
//     });
// }

// /*
//  * GET /book/:id route to retrieve a book given its id.
//  */
// function getBook(req, res) {
//     Book.findById(req.params.id, (err, book) => {
//         if(err) res.send(err);
//         //If no errors, send it back to the client
//         res.json(book);
//     });     
// }

// /*
//  * DELETE /book/:id to delete a book given its id.
//  */
// function deleteBook(req, res) {
//     Book.remove({_id : req.params.id}, (err, result) => {
//         res.json({ message: "Book successfully deleted!", result });
//     });
// }

// /*
//  * PUT /book/:id to updatea a book given its id
//  */
// function updateBook(req, res) {
//     Book.findById({_id: req.params.id}, (err, book) => {
//         if(err) res.send(err);
//         Object.assign(book, req.body).save((err, book) => {
//             if(err) res.send(err);
//             res.json({ message: 'Book updated!', book });
//         }); 
//     });
// }

//export all the functions
module.exports = { getUsers, createUser };