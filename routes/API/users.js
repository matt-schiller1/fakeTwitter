const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const passport = require('passport');
const keys = require('../../config/keys');
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');
const User = require('../../models/User');
const router = express.Router();


//Test
router.get('/test', (req, res) => {
  res.json("you found the users!");
})

//Current User
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({
    id: req.user.id,
    handle: req.user.handle,
    name: req.user.name,
    email: req.user.email
  });
})


//Registration
router.post("/register", (req, res) => {
  console.log(req.body);
  const { errors, isValid } = validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email })
    .then(user => {
      if (user) {
        return res.status(400).json({ email: "A user has already registered with that email address my dude!" })
      } else {
        const newUser = new User({
          handle: req.body.handle,
          name: req.body.name,
          email: req.body.email,
          password: req.body.password
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser.save()
              .then(user => {
                const payload = { id: user.id, handle: user.handle, name: user.name };

                jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 }, (err, token => {
                  res.json({
                    success: true,
                    token: "Bearer " + token
                  });
                }));
              })
              .catch(err => console.log(err));
          })

        })
      }
    })
})

router.post('/login', (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email })
    .then(user => {
      if (!user) {
        errors.email = 'User not found';
        return res.status(404).json(errors);
      }

      bcrypt.compare(password, user.password)
        .then(isMatch => {
          if (isMatch) {
            const payload = { id: user.id, handle: user.handle, name: user.name };
            jwt.sign(
              payload,
              keys.secretOrKey,
              //Expires in 1 hour
              { expiresIn: 3600 },
              (err, token) => {
                res.json({
                  success: true,
                  token: 'Bearer' + token
                });
              });
          } else {
            errors.password = 'Incorrect password'
            return res.status(400).json(errors);
          }
        })
    })
})

module.exports = router;