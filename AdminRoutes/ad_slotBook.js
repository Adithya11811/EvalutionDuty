let con = require("../dataBase/conection");
const express = require("express");
const path = require("path");
const csv = require("fast-csv");
const fs = require("fs");
const multer = require("multer");
const { parse } = require('fast-csv');


const ad_slotBook = express.Router();
const bodyparser = require("body-parser");
ad_slotBook.use(bodyparser.json());
ad_slotBook.use(bodyparser.urlencoded({ extended: true }));
ad_slotBook.use(express.static('public'))

let Slotstore = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "./uploads/");
  },
  filename: function (req, file, callback) {
    callback(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

let upload = multer({
  storage: Slotstore,
});

ad_slotBook.get("/slotBook", function (req, res) {
  res.sendFile(__dirname + "/ad_slotBook.html");
});

ad_slotBook.post("/slotBook", function (req, res) {
  let date = req.body.date;
  let session = req.body.session;
  let total_slots = req.body.total_slots;

  console.log(session);

  if (session === "Afternoon") {
    let sql = "INSERT INTO slot_aft(date,slot,session) VALUES ?";
    let pass = [[date, total_slots, session]];
    con.query(sql, [pass], function (error, result) {
      if (error) throw error;
      res.send("slot inserted");
    });
    let sql1 =
      "INSERT INTO exam_aft(date,session,total_slot,rem_slot,sel_slot) VALUES ?";
    let p1 = [[date, session, total_slots, total_slots, 0]];
    con.query(sql1, [p1], function (err, res1) {
      if (err) throw err;
      console.log("slot inserted");
    });
  } else {
    let sql = "INSERT INTO slot_morn(date,slot,session) VALUES ?";
    let pass = [[date, total_slots, session]];
    con.query(sql, [pass], function (error, result) {
      if (error) throw error;
      res.send("slot inserted");
    });
    let sql1 =
      "INSERT INTO exam_morn(date,session,total_slot,rem_slot,sel_slot) VALUES ?";
    let p1 = [[date, session, total_slots, total_slots, 0]];
    con.query(sql1, [p1], function (err, res1) {
      if (err) throw err;
      console.log("slot inserted");
    });
  }
});

ad_slotBook.post("/bulkSlot", upload.single("slotFile"), function (req, res) {
    console.log(req.file.path);
    const uploadPath = path.join(__dirname, "../uploads", req.file.filename);
  
    const stream = fs.createReadStream(uploadPath);
  
    // Parse the CSV data
    const csvData = [];
  
    csv
      .parseStream(stream, { headers: true })
      .on("data", function (data) {
        csvData.push(data);
      })
      .on("end", function () {
        // Loop through each row and insert into appropriate table
        for (const row of csvData) {
          if (row.session === "Morning") {
            con.query(
              "INSERT INTO slot_morn (date, session, slot) VALUES (?, ?, ?)",
              [row.date, row.session, row.slot],
              (err, result) => {
                if (err) throw err;
                // console.log(`Inserted row with ID ${result.insertId} into slot_morn table`);
              }
              
            );
            con.query(
                "INSERT INTO exam_morn (date, session, total_slot,rem_slot,sel_slot) VALUES (?, ?, ?,?,?)",
                [row.date, row.session, row.slot,row.slot,0],
                (err, result) => {
                  if (err) throw err;
                //   console.log(`Inserted row with ID ${result.insertId} into exam_morn table`);
                }
                
              );
          } else if (row.session === "Afternoon") {
            con.query(
              "INSERT INTO slot_aft (date, session, slot) VALUES (?, ?, ?)",
              [row.date, row.session, row.slot],
              (err, result) => {
                if (err) throw err;
                // console.log(`Inserted row with ID ${result.insertId} into exam_aft table`);
              }
            );
            con.query(
                "INSERT INTO exam_aft (date, session, total_slot,rem_slot,sel_slot) VALUES (?, ?, ?,?,?)",
                [row.date, row.session, row.slot,row.slot,0],
                (err, result) => {
                  if (err) throw err;
                //   console.log(`Inserted row with ID ${result.insertId} into exam_aft table`);
                }
              );
          }
        }
  
        // Send response
        res.send("CSV file uploaded successfully");
      });
  });
  

module.exports = ad_slotBook;
