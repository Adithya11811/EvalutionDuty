let con = require("../dataBase/conection");
const express = require("express");

const ad_report = express.Router();
const bodyparser = require("body-parser");
ad_report.use(bodyparser.json());
ad_report.use(bodyparser.urlencoded({ extended: true }));
ad_report.use(express.static("public"));

function executeQueries(morn_slot_sql, aft_slot_sql, callback) {
  con.query(morn_slot_sql, (err, morn_results) => {
    if (err) {
      callback(err, null);
      return;
    }

    con.query(aft_slot_sql, (err, aft_results) => {
      if (err) {
        callback(err, null);
        return;
      }

      callback(null, { morn_results, aft_results });
    });
  });
}

ad_report.get("/reports", (err, res) => {
  let morn_slot_sql = "SELECT * FROM slot_morn";
  let aft_slot_sql = "SELECT * FROM slot_aft";

  executeQueries(morn_slot_sql, aft_slot_sql, (err, results) => {
    if (err) {
      // Handle the error appropriately
      console.error(err);
      res.status(500).send("Internal Server Error");
      return;
    }

    res.render(__dirname + "/ad_reports", {
      morn_results: results.morn_results,
      aft_results: results.aft_results,
      report_results: []
    });
  });
});

ad_report.post("/reports", (req, res) => {
  let morn_slot_sql = "SELECT * FROM slot_morn";
  let aft_slot_sql = "SELECT * FROM slot_aft";
  const dateSessionValue = req.body.date_session;
  let [date, session] = dateSessionValue.split("|");
  console.log(date)
  console.log(session)
  


  executeQueries(morn_slot_sql, aft_slot_sql, (err, results) => {
    if (err) {
      // Handle the error appropriately
      console.error(err);
      res.status(500).send("Internal Server Error");
      return;
    }

    let rprt_sql = "SELECT * FROM reports WHERE date = ? AND session = ?";
    con.query(rprt_sql, [date, session], (err1, res1) => {
      if (err1) {
        // Handle the error appropriately
        console.error(err1);
        res.status(500).send("Internal Server Error");
        return;
      }
      console.log(res1)
      res.render(__dirname + "/ad_reports", {
        morn_results: results.morn_results,
        aft_results: results.aft_results,
        report_results: res1,
      });
    });
  });
});

module.exports = ad_report;
