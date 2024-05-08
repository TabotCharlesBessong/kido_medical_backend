import Db from "./index"

const DbInitialize = async () => {
  try {
    console.log("Database connected successfully")
    await Db.authenticate()
  } catch (error) {
    console.log("unablle to connect to database: ", error);
  }
}

export default DbInitialize