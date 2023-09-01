let con = require("../dataBase/conection");
const express = require("express");
const path = require("path");
const csv = require("fast-csv");
const fs = require("fs");
const multer = require("multer");

const ad_userReg = express.Router();
const bodyparser = require("body-parser");
ad_userReg.use(bodyparser.json());
ad_userReg.use(bodyparser.urlencoded({ extended: true }));
ad_userReg.use(express.static('public'))

let Userstore = multer.diskStorage({
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
  storage: Userstore,
});

ad_userReg.get("/userReg", function (req, res) {
  res.sendFile(__dirname + "/ad_userReg.html");
});

ad_userReg.post("/userReg", function (req, res) {
  let name = req.body.fac_name;
  let fac_id = req.body.fac_id;
  let fac_des = req.body.fac_des;
  let branch = req.body.branch;
  let email = req.body.email;
  let contact = req.body.contact;

  let sql =
    "INSERT INTO faculty(fac_name,fac_id,fac_des,branch,email,contact) VALUES ?";
  let pass = [[name, fac_id, fac_des, branch, email, contact]];
  con.query(sql, [pass], function (error, result) {
    if (error) throw error;
  });
  let sql1 = "INSERT INTO select_lim(fid,slot_lim,sel_slots) VALUES ?";
  let pass1 = [[fac_id, 2, 0]];
  con.query(sql1, [pass1], function (error, result) {
    if (error) throw error;
    res.send("User register successful ");
  });
});

ad_userReg.post("/bulkUser", upload.single("userRegFile"), (req, res) => {
  console.log(req.file.path);
  const uploadPath = path.join(__dirname, "../uploads", req.file.filename);
  uploadUserReg(uploadPath);
  res.send("data imported");
});

function uploadUserReg(path) {
  let stream = fs.createReadStream(path);
  let csvDataColl = [];
  let csvData = []
  let fileStream = csv
    .parse()
    .on("data", function (data) {
      csvDataColl.push(data);
      csvData.push(data)
    })
    .on("end", function () {
      csvDataColl.shift();
      csvData.shift()
      let query =
        "INSERT INTO faculty(fac_name,fac_id,fac_des,branch,email,contact) VALUES ?";
      con.query(query, [csvDataColl], (error, result) => {
        if (error) throw error;
      });
      for (const row of csvData) {
        console.log(row[1])
        if (row[1]) {
            let q1 = "INSERT INTO select_lim(fid,slot_lim,sel_slots) VALUES ?";
            let p = [[row[1], 2, 0]]
            con.query(q1, [p], (err, res) => {
              if (err) throw err;
            });
          }
        }
    });
  stream.pipe(fileStream);
}

module.exports = ad_userReg;
