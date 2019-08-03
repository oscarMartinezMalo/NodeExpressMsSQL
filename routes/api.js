
import express from 'express';
const router = express.Router();
import verifyToken from './verifyToken';
import poolPromise from '../database';

// BEFORE CONTINUE WITH THE HADDLER USE VERIFY TOKEN TO CHECK IF IS LOGGED
router.get('/', verifyToken, async (req, res) => {
    // res.send(req.userJWT.email);
    // FIND AN USER BASE ON THIS TOKEN
    // const user = await User.findOne({ id: req.body.email });
    // res.send(user);
    let user;

    try {
        // CHECK IF THE EMAIL EXIST IN THE DATABASE
        const pool = await poolPromise.poolPromise;
        const { recordset } = await pool.request()
            .input('input_email', poolPromise.sql.VarChar, req.userJWT.email)
            .query('select * from [user] where email = @input_email');

        user = recordset[0];

        // 404 Not Found In an API, means the endpoint is valid but the resource itself does not exist.
        if (!user) res.status(400).send('Email doesnt exists');
    } catch (error) {
        res.status(400).send(error);
    }

    // RETURN THE NAME FROM THE JWT ID IN THIS CASE THE ID IS( USER EMAIL )
    res.status(200).send(user.name);
});

module.exports = router;