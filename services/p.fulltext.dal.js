const dal = require("./p.db");

var getFullText = function(text) {
  if(DEBUG) console.log("postgres.dal.getFullText()");
  return new Promise(function(resolve, reject) {

    const sql = `SELECT breed, color, age, name FROM cats \
    WHERE breed iLIKE '%'||$1||'%' \
          OR color iLIKE '%'||$1||'%' \
          OR age::text iLIKE '%'||$1||'%' \
          OR name iLIKE '%'||$1||'%'`;




    if(DEBUG) console.log(sql);
    dal.query(sql, [text], (err, result) => {
      if (err) {
        if(DEBUG) console.log(err);
        reject(err);
      } else {
        if(DEBUG) console.log(`Row count: ${result.rowCount}`);
        resolve(result.rows);
      }
    }); 
  }); 
};

module.exports = {
    getFullText,
}