import express from 'express';
import dotenv from 'dotenv';

// dotenv CONFIG TO USED ENVIRONMENT VARIABLES
dotenv.config();

// Import Routes
import authRoute from './routes/auth'
//  import otherApiRoute from './routes/otherApi'

const app = express();

// Middlewares
app.use(express.json());

// Routes middlewares
app.use('/auth', authRoute);
// app.use('/api', otherApiRoute);

// Assign a port from the environment variable
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Your server is running on port, ${PORT}`)
});