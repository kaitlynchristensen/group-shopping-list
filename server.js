//Express server setup
var express = require('express');
var router = express(); //used to be var router = express.Router() but I cant get that to work, and I dont know why we need router (just got it from module3)
var port = process.env.PORT || 8080;
router.listen(port);

//Database setup
var MongoClient = require('mongodb').MongoClient;
var mongoURI = 'mongodb://ec2-54-175-174-41.compute-1.amazonaws.com:43/'
var db_name = "teamnice"
var db_user = "foo"
var db_pswd = "bar"

MongoClient.connect(mongoURI + db_name, function(err, db) {
  if (err) {
    throw err;
  }
  else {
    db.authenticate(db_user, db_pswd, function(err, result) {
      if (err)
        throw err;
      else {
/*------- Don't edit above this ------*/

          /*
          *  Create new user user
          *
          *  PUT /createUser/:username/:phonenumber
          */
          router.put('/createUser/:username/:phonenumber', function(req, res){
            var username = req.params.username;
            var phonenumber = req.params.phonenumber;

            db.collection('Users').find({'username': username}).toArray(function(err, query_res) {
              if (query_res.length == 0) {

                var user = {
                  'username': username,
                  'number': phonenumber,
                  'items': [],
                  'lists': []
                };
                db.collection('Users').insert(user);

                var data = {
                  "status": 201,
                  "response": "New user created"
                }
              }
              else {
                var data = {
                  "status": 400,
                  "response": "Username already in use"
                }
              }
              res.json(data);
            });
          });

          /*
          *  Get a user
          *
          *  GET /createUser/:username/
          */
          router.get('/user/:username', function(req, res){
            var username = req.params.username;

            db.collection('Users').find({'username': username}).toArray(function(err, query_res) {
              if (query_res.length == 0) {
                var data = {
                  "status": 404,
                  "response": "Username not found"
                }
              }
              else {
                var data = {
                  "status": 200,
                  "response": query_res[0]
                }
              }
              res.json(data);
            });
          });

          /*
          *  Delete user
          *
          *  DELETE /user/:username
          */
          router.delete('/user/:username', function(req, res) {
            var username = req.params.username;
            var data;

            // delete username from all lists
            db.collection('Users').find({'username': username}).toArray(function(err, query_res) {
              if (query_res.length == 0) {
                data = {
                  "status": 404,
                  "response": "Username not found"
                }
              }
              else {
                for (var i = 0; i < query_res[0].lists.length; i++) {
                  var listid = query_res[0].lists[i];
                  db.collection('Lists').find({'listid': listid}, function(err, query_results) {
                    if (query_results.length && query_results[0].usernames.length == 1) {
                      // delete list if it drops down to zero users
                      db.collection('Lists').remove({'listid': listid});
                      db.collection('Items').remove({'listid': listid});
                    }
                    else {
                      // just remove username from list
                      db.collection('Lists').update({'listid': listid}, {$pull: {'username': username}});
                    }
                  });
                }
                db.collection('Items').update({'asignee': username}, {$set: {'asignee': null}});
                db.collection('Users').remove({'username': username});
                data = {
                  "status": 202,
                  "response": "User deleted"
                }
              }
              res.json(data);
            });
          });

          /* Login with existing user NOT FULLY WORKING, no authentication
          *
          *  POST /login/:username
          */
          router.post('/login/:username', function(req,res){
            var username = req.params.username;
            db.collection('Users').find({'username': username}, function(err, cursor){
              if(err)
                throw err;

              cursor.toArray(function(err, query){

                if(query.length){
                  var data={
                    "status": 200
                  }
                }
                else {
                  var data = {
                    "status": 400
                  }

                }
                res.json(data);
              })
            })

          })

          /* Create list
          *
          * PUT /createList/:listname/:username
          */
          router.put('/createList/:listname/:username', function(req, res){
            var listname = req.params.listname;
            var username = req.params.username;

            var id = Math.random().toString(36).substring(7);

            var data = {
              'listid': id,
              'listname': listname,
              'items': [],
              'totalPrice': 0,
              'usernames': [username],
              'finished': false,
            };

            db.collection('Lists').insert(data);
            db.collection('Users').update({'username': username}, {$push: {'lists': id}});
            res.json(data);
          });

          /* Add user to list
          *
          * POST /list/:listid/add/:username
          */
          router.post('/list/:listid/add/:username', function(req, res) {
            var listid = req.params.listid;
            var username = req.params.username;
            var data;

            db.collection('Users').find({'username': username}).toArray(function(err, query_res) {
              if (query_res.length != 0) {
                db.collection('Lists').update({'listid': listid}, {$push: {'usernames': username}}, function(err, result) {
                  if (result.length == 0) {
                    data = {
                      "status": 404,
                      "response": "List not found"
                    }
                  }
                  else {
                    db.collections('Users').update({'username': username}, {$push: {'lists': listid}});
                    data = {
                      "status": 200,
                      "response": "User added to list"
                    }
                  }
                });
              }
              else {
                data = {
                  "status": 404,
                  "response": "Username not found"
                }
              }
            });
            res.json(data);
          });

          /* Add item to list
          *
          *  POST /lists/:username/:listname/:itemname
          *
          */
          router.post('/list/:listid/:itemname', function(req, res){
            var listid = req.params.listid;
            var itemname = req.params.itemname;

            var id = Math.random().toString(36).substring(7);


            var item={
              'itemid': id,
              'itemname': itemname,
              'asignee': "",
              'picture': "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",
              'price': 0,
              'listid': listid
            }

            db.collection('Items').insert(item);
            db.collection('Lists').update({'listid': listid}, {$push: {'items':id}});
            res.json(item);
          });

          /* View all lists
          *
          *  GET /lists
          */
          router.get('/lists', function(req, res){

            db.collection('Lists').find().toArray(function(err, lists) {
              if(err)
                throw error;
              else {
                  res.send({'status': 200, 'response': lists});
                }

            });
          });

          /* Get list by id
          *
          *  GET /list/:listid
          */
          router.get('/list/:listid', function(req, res) {
            var listid = req.params.listid;

            db.collection('Lists').find({'listid': listid}).toArray(function(err, query_res) {
              if(err)
                throw error;
              else {
                  res.send({'status': 200, 'response': query_res[0]});
                }

            });
          });

          /* View items assigned to a user
          *
          *  GET /items/:username
          */

          router.get('/items/:username', function(req,res){
            var username = req.params.username;
            db.collection('Items').find({'asignee': username}).sort({vote: -1}).toArray(function(err, query) {
                if (query.length) {

                  var data = {
                    "status": 200,
                    "response": query
                  }
                  res.json(data);

                } else {
                  res.json({'status': 404, 'response': {'message': 'Could not find any items for' + username}});
                }
              });
          });

          /* Get an item by id
          *
          *  GET /item/:itemid
          */

          router.get('/item/:itemid', function(req,res){
            var itemid = req.params.itemid;
            db.collection('Items').find({'itemid': itemid}).toArray(function(err, query) {
                if (query.length) {

                  var data = {
                    "status": 200,
                    "response": query[0]
                  }
                  res.json(data);

                } else {
                  res.json({'status': 404, 'response': {'message': 'Could not find any items for with that itemid'}});
                }
              });
          });

          /* View a list
          *
          *  GET /lists/:listname
          */
          router.get('/lists/:listid', function(req, res){
            var listid=req.params.listid;
            db.collection('Lists').find({'listid': listid}).toArray(function(err,info){
              if(err)
                throw error;
              else {
                res.send({'status': 200, 'response': info});
              }
            });
          });

          router.get('/item/getPic/:itemId', function(req, res){
            var itemId=req.params.itemId;
            db.collection('Item').find({'itemid': itemId}).toArray(function(err,info){
              if(err)
                throw error;
              else {
                res.send({'status': 200, 'response': info});
              }
            });
          });



          /* Assign item to username
          *
          *  POST /lists/willGetItem/:username/:itemid
          */
          router.post('/lists/willGetItem/:username/:itemid', function(req, res) {
            var itemid = req.params.itemid;
            var username = req.params.username;

            db.collection('Items').find({'itemid': itemid}).toArray(function(err, query) {
                if (query[0].asignee!="") {
                  var data = {
                    "status": 400,
                    "response": "Item has already been assigned to someone"
                  }
                  res.json(data);

                } else {
                  db.collection('Items').update({'itemid': itemid},{ $set: {'asignee': username }});
                  db.collection('Users').update({'username': username}, {$push: {'items': itemid}});
                  var data = {
                    'status':200
                  }
                  res.json(data);
                }
              });

          });

          /* Remove item assignment
          *
          *  DELETE /assignment/:itemid/:username
          */
          router.delete('/assignment/:itemid/:username', function(req, res) {
            var itemid = req.params.itemid;
            var username = req.params.username;

            db.collection('Items').update({'itemid': itemid}, {$set: {'asignee': ''}});
            db.collection('Users').update({'username': username}, {$pull: {'items': itemid}});

            var data = {
                    'status':200
                  }
            res.json(data);
          });

          /* Upload picture
          *
          *  POST /lists/gotItem/:username/:itemname
          *  ?Body for picture??
          */
          router.post('/lists/gotItem/:username/:itemid', function(req, res){
            var username = req.params.username;
            var itemid = req.params.itemid;

            // access request body as stream
            var image = [];
            req.on('data', function(chunk) {
              image.push(chunk);
            }).on('end', function() {
              image = Buffer.concat(image).toString();
              // at this point, `body` has the entire request body stored in it as a string
              console.log(image);

              db.collection('Items').find({'itemid': itemid}).toArray(function(err, query) {
                if (query[0].asignee!=username) {
                  var data = {
                    "status": 400,
                  }
                  res.json(data);

                } else {

                  db.collection('Items').update({'itemid': itemid},{ $set: {'picture': image }});
                  var data = {
                    'status':200
                  }
                  res.json(data);
                }
              });

            });

          })

          /* Set item price
          *
          *  POST /item/:itemid/price/:price
          */
          router.post('/item/:itemid/price/:price', function(req, res){
            var itemid = req.params.itemid;
            var price = req.params.price;

            db.collection('Items').update({'itemid': itemid},{ $set: {'price': price }});
              var data = {
                'status': 200
              }
              res.json(data);
          })


          /* Delete list
          *
          *  DELETE /lists/:listname
          *
          */

          router.delete('/lists/:listid', function(req,res,next){

            //delete from lists db and items db
            var listid= req.params.listid;

            db.collection('Items').remove({'listid':listid});

            db.collection('Lists').find({'listid': listid}, function(err, query_res) {
              if (query_res.length != 0) {
                var usernames = query_res[0].usernames;
                for (var i = 0; i < usernames.length; i++) {
                  var username = usernames[i];
                  db.collection('Users').update({'username': username}, {$pull: {'lists': listid}});
                  // delete any deleted items from user's item list
                  db.collection('Users').find({'username': username}, function(err, query_res) {
                    for (var j = 0; j < query_res[0].items; j++) {
                      var item = query_res[0].items[i];
                      db.collection('Items').find({'itemid': item}, function(err, query_res) {
                        if (query_res.length == 0) {
                          db.collection('Users').update({'username': username}, {$pull: {'items': item}});
                        }
                      });
                    }
                  });
                }
              }
            });

            db.collection('Lists').deleteOne({'listid':listid});
            data = { "status": 200};

            res.json(data);
          });


          /* Delete item
          *
          *  POST /lists/:listname/:itemname
          *
          */

          router.delete('/list/:listid/:itemid', function(req,res,next){
            var listid = req.params.listid;
            var itemid = req.params.itemid;
            //delete from items and lists


            db.collection('Lists').update({'listid': listid}, {$pull: {'items': itemid}}, function(err, cursor) {
              if (err)
                throw error;
              db.collection('Items').deleteOne({'itemid':itemid});
              data = {
                    "status": 200
                  }
              res.send(data);
            });

          })

          /* Last: Nudge: sendt person in charge reminder textmessage
          *
          *  POST /:username?message
          *
          */

          /* Optional: Integrate with payment app
          *
          *
          *
          */








/*------- Don't edit below this ------*/
      }
    });
    }
  });
module.exports = router;
