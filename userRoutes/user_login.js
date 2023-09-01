let con = require('../dataBase/conection')
const express = require('express')
const bodyparser = require('body-parser')
const cookieParser = require('cookie-parser')

const us_login = express.Router()

us_login.use(bodyparser.json())

us_login.use(bodyparser.urlencoded({extended:false}))
us_login.use(cookieParser())

// A utility function that returns a Promise which resolves with the results of the SQL query
function sqlQuery(sql, params) {
  return new Promise((resolve, reject) => {
    con.query(sql, params, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

us_login.get("/", (req, res) => {
  res.sendFile(__dirname + "/user_login.html")
})

us_login.post("/", async (req, res) => {
  let fac_id = req.body.un
  let fnum = req.body.pwd
  let sql = "SELECT * FROM faculty WHERE fac_id = ? AND contact = ?"

  try {
    const results = await sqlQuery(sql, [fac_id, fnum]);
    if (results.length > 0) {
      let fac_name = results[0].fac_name;

      // Use Promise.all to execute both queries simultaneously
      const [r1, r2] = await Promise.all([
        sqlQuery("SELECT * FROM exam_morn"),
        sqlQuery("SELECT * FROM exam_aft")
      ]);
      res.cookie('fac_id', fac_id);
      res.render(__dirname + "/wlcm", {
        FacultyName: fac_name,
        morn_session: r1,
        aft_session: r2
      });
    } else {
      res.redirect("/user");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("An error occurred.");
  }
});

module.exports = us_login;
