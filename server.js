var express = require('express');
var router = express();

let mongoose = require('mongoose');
let bodyParser = require('body-parser');
let port = process.env.PORT || 8080;
let config = require('config'); // load the db location from the JSON files
let user = require('./app/routes/user');

router.use(bodyParser.json());                                     
router.use(bodyParser.urlencoded({extended: true}));               
router.use(bodyParser.text());                                    
router.use(bodyParser.json({ type: 'application/json'}));

//db connection      
mongoose.connect(config.DBHost);
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

router.get("/", (req, res) => res.json({message: "Welcome to our Bookstore!"}));

router.route("/user")
    .get(user.getUsers)
    .post(user.createUser);

router.listen(port);
console.log("Listening on port " + port);

//   if (err) {
//     throw err;
//   }
//   else {
//     // db.authenticate(db_user, db_pswd, function(err, result) {
//     //   if (err)
//     //     throw err;
//     //   else {
// /*------- Don't edit above this ------*/

//           /*
//           *  Create new user user
//           *
//           *  PUT /createUser/:username/:phonenumber
//           */
//           router.put('/createUser/:username/:phonenumber', function(req, res){
//             var username = req.params.username;
//             var phonenumber = req.params.phonenumber;

//             db.collection('Users').find({'username': username}).toArray(function(err, query_res) {
//               if (query_res.length == 0) {

//                 var user = {
//                   'username': username,
//                   'number': phonenumber,
//                   'items': [],
//                   'lists': []
//                 };
//                 db.collection('Users').insert(user);

//                 var data = {
//                   "status": 201,
//                   "response": "New user created"
//                 }
//               }
//               else {
//                 var data = {
//                   "status": 400,
//                   "response": "Username already in use"
//                 }
//               }
//               res.json(data);
//             });
//           });

//           /*
//           *  Get a user
//           *
//           *  GET /createUser/:username/
//           */
//           router.get('/user/:username', function(req, res){
//             var username = req.params.username;

//             db.collection('Users').find({'username': username}).toArray(function(err, query_res) {
//               if (query_res.length == 0) {
//                 var data = {
//                   "status": 404,
//                   "response": "Username not found"
//                 }
//               }
//               else {
//                 var data = {
//                   "status": 200,
//                   "response": query_res[0]
//                 }
//               }
//               res.json(data);
//             });
//           });

//           /*
//           *  Delete user
//           *
//           *  DELETE /user/:username
//           */
//           router.delete('/user/:username', function(req, res) {
//             var username = req.params.username;
//             var data;

//             // delete username from all lists
//             db.collection('Users').find({'username': username}).toArray(function(err, query_res) {
//               if (query_res.length == 0) {
//                 data = {
//                   "status": 404,
//                   "response": "Username not found"
//                 }
//               }
//               else {
//                 for (var i = 0; i < query_res[0].lists.length; i++) {
//                   var listid = query_res[0].lists[i];
//                   db.collection('Lists').find({'listid': listid}, function(err, query_results) {
//                     if (query_results.length && query_results[0].usernames.length == 1) {
//                       // delete list if it drops down to zero users
//                       db.collection('Lists').remove({'listid': listid});
//                       db.collection('Items').remove({'listid': listid});
//                     }
//                     else {
//                       // just remove username from list
//                       db.collection('Lists').update({'listid': listid}, {$pull: {'username': username}});
//                     }
//                   });
//                 }
//                 db.collection('Items').update({'asignee': username}, {$set: {'asignee': null}});
//                 db.collection('Users').remove({'username': username});
//                 data = {
//                   "status": 202,
//                   "response": "User deleted"
//                 }
//               }
//               res.json(data);
//             });
//           });

//           /* Login with existing user NOT FULLY WORKING, no authentication
//           *
//           *  POST /login/:username
//           */
//           router.post('/login/:username', function(req,res){
//             var username = req.params.username;
//             db.collection('Users').find({'username': username}, function(err, cursor){
//               if(err)
//                 throw err;

//               cursor.toArray(function(err, query){

//                 if(query.length){
//                   var data={
//                     "status": 200
//                   }
//                 }
//                 else {
//                   var data = {
//                     "status": 400
//                   }

//                 }
//                 res.json(data);
//               })
//             })

//           })

//           /* Create list
//           *
//           * PUT /createList/:listname/:username
//           */
//           router.put('/createList/:listname/:username', function(req, res){
//             var listname = req.params.listname;
//             var username = req.params.username;

//             var id = Math.random().toString(36).substring(7);

//             var data = {
//               'listid': id,
//               'listname': listname,
//               'items': [],
//               'totalPrice': 0,
//               'usernames': [username],
//               'finished': false,
//             };

//             db.collection('Lists').insert(data);
//             db.collection('Users').update({'username': username}, {$push: {'lists': id}});
//             res.json(data);
//           });

//           /* Add user to list
//           *
//           * POST /list/:listid/add/:username
//           */
//           router.post('/list/:listid/add/:username', function(req, res) {
//             var listid = req.params.listid;
//             var username = req.params.username;
//             var data;

//             db.collection('Users').find({'username': username}).toArray(function(err, query_res) {
//               if (query_res.length != 0) {
//                 db.collection('Lists').update({'listid': listid}, {$push: {'usernames': username}}, function(err, result) {
//                   if (result.length == 0) {
//                     data = {
//                       "status": 404,
//                       "response": "List not found"
//                     }
//                   }
//                   else {
//                     db.collections('Users').update({'username': username}, {$push: {'lists': listid}});
//                     data = {
//                       "status": 200,
//                       "response": "User added to list"
//                     }
//                   }
//                 });
//               }
//               else {
//                 data = {
//                   "status": 404,
//                   "response": "Username not found"
//                 }
//               }
//             });
//             res.json(data);
//           });

//           /* Add item to list
//           *
//           *  POST /lists/:username/:listname/:itemname
//           *
//           */
//           router.post('/list/:listid/:itemname', function(req, res){
//             var listid = req.params.listid;
//             var itemname = req.params.itemname;

//             var id = Math.random().toString(36).substring(7);


//             var item={
//               'itemid': id,
//               'itemname': itemname,
//               'asignee': "",
//               'price': 0,
//               'listid': listid
//             }

//             db.collection('Items').insert(item);
//             db.collection('Lists').update({'listid': listid}, {$push: {'items':id}});
//             res.json(item);
//           });

//           /* View all lists
//           *
//           *  GET /lists
//           */
//           router.get('/lists', function(req, res){

//             db.collection('Lists').find().toArray(function(err, lists) {
//               if(err)
//                 throw error;
//               else {
//                   res.send({'status': 200, 'response': lists});
//                 }

//             });
//           });

//           /* Get list by id
//           *
//           *  GET /list/:listid
//           */
//           router.get('/list/:listid', function(req, res) {
//             var listid = req.params.listid;

//             db.collection('Lists').find({'listid': listid}).toArray(function(err, query_res) {
//               if(err)
//                 throw error;
//               else {
//                   res.send({'status': 200, 'response': query_res[0]});
//                 }

//             });
//           });

//           /* View items assigned to a user
//           *
//           *  GET /items/:username
//           */

//           router.get('/items/:username', function(req,res){
//             var username = req.params.username;
//             db.collection('Items').find({'asignee': username}).sort({vote: -1}).toArray(function(err, query) {
//                 if (query.length) {

//                   var data = {
//                     "status": 200,
//                     "response": query
//                   }
//                   res.json(data);

//                 } else {
//                   res.json({'status': 404, 'response': {'message': 'Could not find any items for' + username}});
//                 }
//               });
//           });

//           /* Get an item by id
//           *
//           *  GET /item/:itemid
//           */

//           router.get('/item/:itemid', function(req,res){
//             var itemid = req.params.itemid;
//             db.collection('Items').find({'itemid': itemid}).toArray(function(err, query) {
//                 if (query.length) {

//                   var data = {
//                     "status": 200,
//                     "response": query[0]
//                   }
//                   res.json(data);

//                 } else {
//                   res.json({'status': 404, 'response': {'message': 'Could not find any items for with that itemid'}});
//                 }
//               });
//           });

//           /* View a list
//           *
//           *  GET /lists/:listname
//           */
//           router.get('/lists/:listid', function(req, res){
//             var listid=req.params.listid;
//             db.collection('Lists').find({'listid': listid}).toArray(function(err,info){
//               if(err)
//                 throw error;
//               else {
//                 res.send({'status': 200, 'response': info});
//               }
//             });
//           });

//           router.get('/item/getPic/:itemId', function(req, res){
//             var itemId=req.params.itemId;
//             db.collection('Item').find({'itemid': itemId}).toArray(function(err,info){
//               if(err)
//                 throw error;
//               else {
//                 res.send({'status': 200, 'response': info});
//               }
//             });
//           });



//           /* Assign item to username
//           *
//           *  POST /lists/willGetItem/:username/:itemid
//           */
//           router.post('/lists/willGetItem/:username/:itemid', function(req, res) {
//             var itemid = req.params.itemid;
//             var username = req.params.username;

//             db.collection('Items').find({'itemid': itemid}).toArray(function(err, query) {
//                 if (query[0].asignee!="") {
//                   var data = {
//                     "status": 400,
//                     "response": "Item has already been assigned to someone"
//                   }
//                   res.json(data);

//                 } else {
//                   db.collection('Items').update({'itemid': itemid},{ $set: {'asignee': username }});
//                   db.collection('Users').update({'username': username}, {$push: {'items': itemid}});
//                   var data = {
//                     'status':200
//                   }
//                   res.json(data);
//                 }
//               });

//           });

//           /* Remove item assignment
//           *
//           *  DELETE /assignment/:itemid/:username
//           */
//           router.delete('/assignment/:itemid/:username', function(req, res) {
//             var itemid = req.params.itemid;
//             var username = req.params.username;

//             db.collection('Items').update({'itemid': itemid}, {$set: {'asignee': ''}});
//             db.collection('Users').update({'username': username}, {$pull: {'items': itemid}});

//             var data = {
//                     'status':200
//                   }
//             res.json(data);
//           });

//           /* Upload picture
//           *
//           *  POST /lists/gotItem/:username/:itemname
//           *  ?Body for picture??
//           */
//           router.post('/lists/gotItem/:username/:itemid', function(req, res){
//             var username = req.params.username;
//             var itemid = req.params.itemid;

//             // access request body as stream
//             var image = [];
//             req.on('data', function(chunk) {
//               image.push(chunk);
//             }).on('end', function() {
//               image = Buffer.concat(image).toString();
//               // at this point, `body` has the entire request body stored in it as a string
//               console.log(image);

//               db.collection('Items').find({'itemid': itemid}).toArray(function(err, query) {
//                 if (query[0].asignee!=username) {
//                   var data = {
//                     "status": 400,
//                   }
//                   res.json(data);

//                 } else {

//                   db.collection('Items').update({'itemid': itemid},{ $set: {'picture': image }});
//                   var data = {
//                     'status':200
//                   }
//                   res.json(data);
//                 }
//               });

//             });

//           })

//           /* Set item price
//           *
//           *  POST /item/:itemid/price/:price
//           */
//           router.post('/item/:itemid/price/:price', function(req, res){
//             var itemid = req.params.itemid;
//             var price = req.params.price;

//             db.collection('Items').update({'itemid': itemid},{ $set: {'price': price }});
//               var data = {
//                 'status': 200
//               }
//               res.json(data);
//           })


//           /* Delete list
//           *
//           *  DELETE /lists/:listname
//           *
//           */

//           router.delete('/lists/:listid', function(req,res,next){

//             //delete from lists db and items db
//             var listid= req.params.listid;

//             db.collection('Items').remove({'listid':listid});

//             db.collection('Lists').find({'listid': listid}, function(err, query_res) {
//               if (query_res.length != 0) {
//                 var usernames = query_res[0].usernames;
//                 for (var i = 0; i < usernames.length; i++) {
//                   var username = usernames[i];
//                   db.collection('Users').update({'username': username}, {$pull: {'lists': listid}});
//                   // delete any deleted items from user's item list
//                   db.collection('Users').find({'username': username}, function(err, query_res) {
//                     for (var j = 0; j < query_res[0].items; j++) {
//                       var item = query_res[0].items[i];
//                       db.collection('Items').find({'itemid': item}, function(err, query_res) {
//                         if (query_res.length == 0) {
//                           db.collection('Users').update({'username': username}, {$pull: {'items': item}});
//                         }
//                       });
//                     }
//                   });
//                 }
//               }
//             });

//             db.collection('Lists').deleteOne({'listid':listid});
//             data = { "status": 200};

//             res.json(data);
//           });


//           /* Delete item
//           *
//           *  POST /lists/:listname/:itemname
//           *
//           */

//           router.delete('/list/:listid/:itemid', function(req,res,next){
//             var listid = req.params.listid;
//             var itemid = req.params.itemid;
//             //delete from items and lists


//             db.collection('Lists').update({'listid': listid}, {$pull: {'items': itemid}}, function(err, cursor) {
//               if (err)
//                 throw error;
//               db.collection('Items').deleteOne({'itemid':itemid});
//               data = {
//                     "status": 200
//                   }
//               res.send(data);
//             });

//           })

//           /* Last: Nudge: sendt person in charge reminder textmessage
//           *
//           *  POST /:username?message
//           *
//           */

//           /* Optional: Integrate with payment app
//           *
//           *
//           *
//           */

// /*------- Don't edit below this ------*/
//       }
//     });
//     }

module.exports = router;
