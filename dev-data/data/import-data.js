const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('../../models/tourModel');

// console.log(process.env);

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {}).then((con) => {
    console.log('Db connected succesfully...');
});

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`));

const importData = async () => {
    try {
        await Tour.create(tours);
        console.log('data imported succesfully');
    } catch (err) {
        console.log(err);
    }
};

const deleteData = async () => {
    try {
        await Tour.deleteMany({});
        console.log('data deleted succesfully');
    } catch (err) {
        console.log(err);
    }
};

console.log(process.argv);

if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete') {
    deleteData();
}
