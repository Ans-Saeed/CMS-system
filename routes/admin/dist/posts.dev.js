"use strict";

var express = require('express');

var router = express.Router();

var fs = require('fs'); //for file system
//model


var Post = require('../../models/Post');

var Category = require('../../models/Category');

var Comment = require('../../models/Comment');

var _require = require('../home'),
    route = _require.route;

var _require2 = require('../../helpers/upload-helpers'),
    isEmpty = _require2.isEmpty,
    uploadDir = _require2.uploadDir;

var _require3 = require('../../helpers/authentication'),
    userAuthenticated = _require3.userAuthenticated;

router.all('/*', userAuthenticated, function (req, res, next) {
  req.app.locals.layout = 'admin';
  next();
}); //by default it it /admin/posts

router.get('/', function (req, res) {
  //before render we need to get data
  //passing nothing is gonna bring everything
  //use populate to get category object
  Post.find({}).populate('category').then(function (posts) {
    res.render('admin/posts', {
      posts: posts
    });
  })["catch"](function (error) {
    console.log(error);
  }); //res.render('admin/posts');
}); //my post

router.get('/my-posts', function (req, res) {
  Post.find({
    user: req.user.id
  }).populate('category').then(function (posts) {
    res.render('admin/posts/my-posts', {
      posts: posts
    });
  })["catch"](function (error) {
    console.log(error);
  });
});
router.get('/create', function (req, res) {
  Category.find({}).then(function (categories) {
    res.render("admin/posts/create", {
      categories: categories
    });
  });
});
router.post('/create', function (req, res) {
  var errors = [];

  if (!req.body.title) {
    errors.push({
      message: 'please add a title'
    });
  }

  if (!req.body.body) {
    errors.push({
      message: 'please add a description'
    });
  }

  if (errors.length > 0) {
    res.render('admin/posts/create', {
      errors: errors
    });
  } else {
    var _filename = '';

    if (!isEmpty(req.files)) {
      var file = req.files.file; //for having every file name different

      _filename = Date.now() + '_' + file.name;
      file.mv('./public/uploads/' + _filename, function (err) {
        if (err) throw err;
      });
    }

    var _allowComments = true;

    if (req.body.allowComments) {
      _allowComments = true;
    } else {
      _allowComments = false;
    }

    var newPost = new Post({
      user: req.user.id,
      title: req.body.title,
      //status: req.body.status,
      allowComments: _allowComments,
      body: req.body.body,
      file: _filename,
      category: req.body.category
    });
    newPost.save().then(function (savedPost) {
      req.flash('success_message', "Post ".concat(savedPost.title, " was created successfully"));
      res.redirect('/admin/posts');
    })["catch"](function (error) {
      console.log(error, "could not save");
    });
  }
}); //Edit

router.get('/edit/:id', function (req, res) {
  // res.send(req.params.id);
  //make a query to post out
  Post.findOne({
    _id: req.params.id
  }).then(function (post) {
    Category.find({}).then(function (categories) {
      res.render("admin/posts/edit", {
        post: post,
        categories: categories
      });
    });
  });
}); //updating post

router.put('/edit/:id', function (req, res) {
  Post.findOne({
    _id: req.params.id
  }).then(function (post) {
    if (req.body.allowComments) {
      allowComments = true;
    } else {
      allowComments = false;
    }

    post.user = req.user.id;
    post.title = req.body.title; // post.status = req.body.status;

    post.allowComments = allowComments;
    post.body = req.body.body;
    post.category = req.body.category;

    if (!isEmpty(req.files)) {
      var file = req.files.file;
      filename = Date.now() + '_' + file.name;
      post.file = filename;
      file.mv('./public/uploads/' + filename, function (err) {
        if (err) throw err;
      });
    }

    post.save().then(function (updatedPost) {
      req.flash('success_message', 'Post was successfully updated');
      res.redirect('/admin/posts/my-posts');
    })["catch"](function (error) {
      console.log(error);
    });
  }); //res.send('It works');
}); // router.delete('/:id', (req, res) => {
//     Post.findOne({
//             _id: req.params.id
//         }).populate('comments')
//         .then(post => {
//             fs.unlink(uploadDir + post.file, (err) => {
//                 if (!post.comments.length < 1) {
//                     post.comments.forEach(comment => {
//                         comment.remove();
//                     });
//                 }
//                 post.remove().then(removedPost => {
//                     req.flash('success_message', 'Post was succesfully deleted');
//                     res.redirect('/admin/posts');
//                 });
//             });
//         });
// });

router["delete"]('/:id', function (req, res) {
  Post.findByIdAndDelete(req.params.id).then(function (post) {
    if (post.comments.length > 0) {
      Comment.deleteMany({
        _id: {
          $in: post.comments
        }
      }).then(function (deletedComments) {
        console.log(deletedComments);
      })["catch"](function (err) {
        console.log(err);
      });
    }

    fs.unlink(uploadDir + post.file, function () {
      req.flash('success_message', "Post was successfully deleted");
      res.redirect("/admin/posts/my-posts");
    });
  });
});
module.exports = router;