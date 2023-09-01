const con = require("../dataBase/conection");
const express = require("express");
const cookieParser = require("cookie-parser");

const ad_faculty = express.Router();

const bodyparser = require("body-parser");
const { name } = require("ejs");

ad_faculty.use(bodyparser.urlencoded({ extended: true }));
ad_faculty.use(cookieParser());

ad_faculty.get("/selslots", (req, res) => {
  const sel_members = req.cookies.fac_id;
  const date = req.query.date;
  let session = req.query.session;
  console.log(date);

  let query = "SELECT * FROM select_lim WHERE fid = ?";
  con.query(query, [sel_members], (error, result) => {
    if (error) throw error;

    result.forEach((row) => {
      let lim_slot = row.slot_lim;
      let sel_slot = row.sel_slots;
      if (lim_slot > sel_slot) {
        sel_slot += 1;
        let query1 = "UPDATE select_lim SET sel_slots = ? WHERE fid = ?";
        con.query(query1, [sel_slot, sel_members], (err, res1) => {
          if (err) throw err;
          console.log("Hehe");
        });
        let sess = "exam_morn";
        if (session === "Morning") slotquery(sess, date, sel_members);
        else sess = "exam_aft";
        slotquery(sess, date, sel_members);
        res.redirect("/user");
      } else {
        res.send("you have already selected 2 slots");
      }
    });
  });
});

slotquery = function (sess, date, sel_members) {
  const sql = `SELECT * FROM ${sess} WHERE date = ?`;
  con.query(sql, [date], (error, result) => {
    if (error) throw error;
    result.forEach((row) => {
      let rslots = row.rem_slot;
      let sslots = row.sel_slot;
      let tslots = row.total_slot;
      let selmem = row.sel_members;
      if (rslots > 0 && sslots < tslots) {
        rslots = row.rem_slot - 1;
        sslots = row.sel_slot + 1;
        if (selmem.length == 0) selmem = selmem + sel_members;
        else selmem = selmem + "," + sel_members;
      }
      console.log(rslots);
      let up_sql1 = `UPDATE ${sess} SET rem_slot = ?, sel_slot = ?, sel_members = ? WHERE date = ?`;
      con.query(up_sql1, [rslots, sslots, selmem, date], (error, result) => {
        if (error) throw error;
        console.log("slot updated");
      });
    });
  });
  let rep_sql = "SELECT * from faculty WHERE fac_id = ?";
  con.query(rep_sql, [sel_members], (err, res) => {
    if (err) throw err;
    res.forEach((row) => {
      let name = row.fac_name;
      let des = row.fac_des;
      let branch = row.branch;
      console.log(sess);
      if(sess == "exam_morn") sess = "Morning"
  else if(sess == "exam_aft") sess = "Afternoon"
      
      let rprt_sql =
        "INSERT INTO reports (id, name, designation, department, date, session) VALUES ?";
      let values = [[sel_members, name, des, branch, date, sess]];
      con.query(rprt_sql, [values], (err1, res1) => {
        if (err1) throw err1;
        console.log("done");
      });
    });
  });
};
module.exports = ad_faculty;
