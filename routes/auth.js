import express from 'express';
const router = express.Router();
// import User from '../models/User';
import validation from './validation';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import poolPromise from '../database';

router.post('/register', async function (req, res) {
  // VALIDATE THE DATA BEFORE REGISTER A USER
  const { error } = validation.registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // CHECK IF THE USER EXIST IN THE DATABASE
  try {
    const pool = await poolPromise.poolPromise;
    const { recordset } = await pool.request()
      .input('input_email', poolPromise.sql.VarChar, req.body.email)
      .query('select * from [userr] where email = @input_email');

    // 404 Not Found In an API, means the endpoint is valid but the resource itself does not exist.
    if (recordset[0]) res.status(404).send('Email already exists');

  } catch (error) {
    res.status(400).send(error);
  }

  //HASH THE PASSWORD
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  // CREATE A NEW USER WITH THE  HASHEDPASSWORD
  // TRYING TO SAVE THE NEW USER IN THE DATABASE

  try {
    const pool = await poolPromise.poolPromise;
    const savedUser = await pool.request()
      .input('input_name', poolPromise.sql.VarChar, req.body.name)
      .input('input_email', poolPromise.sql.VarChar, req.body.email)
      .input('input_password', poolPromise.sql.VarChar, hashedPassword)
      .query('INSERT INTO [userr] (name, email, password) VALUES (@input_name, @input_email, @input_password)');

    if (savedUser.rowsAffected) res.status(200).send({ userEmail: req.body.email });

  } catch (error) {
    res.status(400).send(error);
  }

});

// LOGIN
router.post('/login', async function (req, res) {
  let user= null;

  // VALIDATE THE DATA BEFORE LOGIN A USER
  const { error } = validation.loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    // CHECK IF THE EMAIL EXIST IN THE DATABASE
    const pool = await poolPromise.poolPromise;
    const { recordset } = await pool.request()
      .input('input_email', poolPromise.sql.VarChar, req.body.email)
      .query('select * from [userr] where email = @input_email');

    user = recordset[0];

    // 404 Not Found In an API, means the endpoint is valid but the resource itself does not exist.
    if (!user) res.status(400).send('Email doesnt exists');
  } catch (error) {
    res.status(400).send(error);
  }

  // CHECK IF PASSWORD IS CORRECT
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) {
    return res.status(400).send('Invalid password')
  }
  else {
    const token = jwt.sign({ email: user.email }, process.env.TOKEN_SECRET);
    res.header('auth-token', token).send(token);
  }
});

module.exports = router;