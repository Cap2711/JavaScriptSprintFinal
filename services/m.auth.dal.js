const { ObjectId } = require("mongodb");
const dal = require("./m.db");

async function getLogins() {
  try {
    await dal.connect();
    const cursor = dal.db("Auth").collection("Logins").find();
    const results = await cursor.toArray();
    await dal.close();
    return results;
  } catch (error) {
    console.log(error);
  }
}

async function getLoginByUsername(name) {
  try {
    await dal.connect();
    const result = await dal.db("Auth").collection("Logins").findOne({ "username": name });
    await dal.close();
    return result;
  } catch (error) {
    console.log(error);
  }
}

async function getLoginByEmail(email) {
  try {
    await dal.connect();
    const result = await dal.db("Auth").collection("Logins").findOne({ "email": email });
    await dal.close();
    return result;
  } catch (error) {
    console.log(error);
  }
}

async function getLoginById(id) {
  try {
    await dal.connect();
    const result = await dal.db("Auth").collection("Logins").findOne({ _id: new ObjectId(id) });
    await dal.close();
    return result;
  } catch (error) {
    console.log(error);
  }
}

async function addLogin(name, email, password, uuidv4) {
  let newLogin = {
    username: name,
    email: email,
    password: password,
    uuid: uuidv4,
    last_updated: new Date()
  };

  try {
    await dal.connect();
    const result = await dal.db("Auth").collection("Logins").insertOne(newLogin);
    await dal.close();
    return result.insertedId;
  } catch (error) {
    if (error.code === 11000)
      return error;
    console.log(error);
  }
}



module.exports = {
  getLogins,
  getLoginByUsername,
  getLoginByEmail,
  getLoginById,
  addLogin,
  
}
