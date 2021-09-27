const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
    console.log(err.name, err.message);
    console.log('UNCAUGHT EXCEPTION , shuting down.....');
    process.exit(1);
});

const app = require('./app');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {}).then((con) => {
    console.log('Db connected succesfully...');
});

const server = app.listen(process.env.PORT || 3000, () => {
    console.log('server runing at port who knows...');
});

process.on('unhandledRejection', (err) => {
    console.log(err.name, err.message);
    console.log('UNHANDLED REJECTION , shutiing down.....');
    server.close(() => {
        process.exit(1);
    });
});
