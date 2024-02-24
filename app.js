const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const _ = require('lodash');
// const ejs = require('ejs');

// Local Module
// const date = require(__dirname + '/date.js');

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

mongoose.connect('mongodb://localhost:27017/todoListDB');

const itemSchema = {
    name: String
}
const Item = mongoose.model('Item', itemSchema);

const item1 = new Item({
    name: "Welcome To Your TodoList"
});

const item2 = new Item({
    name: "Remember Your Task By adding in List Using '+' button"
});

const item3 = new Item({
    name: "<--- Tick this block to Delete an Item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemSchema]
};
const List = mongoose.model('list', listSchema);

// let list = ['Do Exercise', 'Complete Work', 'Ride Bike'];
// let workList = [];

app.get('/', function (req, res) {

    // let currentDay = date.getDate();

    Item.find({}).then(function (foundItem) {

        if (foundItem === 0) {
            Item.insertMany(defaultItems).then(function () {
                console.log("Items Added Successfully!");
            });
            res.redirect('/');
        } else {
            res.render('list', { listName: "Today", listItems: foundItem });
        }

    });
});

// app.get('/work', function (req, res) {
//     res.render('list', { listName: "Work List", listItems: workList });
// });

app.get('/:customListName', function (req, res) {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({ name: customListName }).then(function (foundItem) {
        if (!foundItem) {
            const list = new List({
                name: customListName,
                items: defaultItems
            });
            list.save();
            res.redirect('/' + customListName);
        } else {
            res.render('list', { listName: foundItem.name, listItems: foundItem.items });
        }
    });

});

app.post('/', function (req, res) {

    let listName = req.body.list;
    let itemName = req.body.newItem;

    const item = new Item({
        name: itemName
    });

    if (listName === "Today") {
        item.save();
        res.redirect('/');
    } else {
        List.findOne({ name: listName }).then(function (foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect('/' + listName);
        });
    }
    // if (req.body.button === 'Work') {
    //     workList.push(item);
    //     res.redirect('/work');
    // } else {
    //     list.push(item);
    //     res.redirect('/');
    // }

});

app.post('/delete', function (req, res) {
    const checkedItemID = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndDelete(checkedItemID).then(function () {
            console.log("Checked Item Deleted Succesfully");
        });
        res.redirect('/');
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemID } } }).then(function () {
            res.redirect('/' + listName);
        });
    }

});

app.listen(3000, function () {
    console.log("Server is running on Port 3000");
});