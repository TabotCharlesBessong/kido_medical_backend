import express, { NextFunction, Request, Response } from "express"
import dotenv from "dotenv"
import cors from "cors"
import DbInitialize from "./database/init"

dotenv.config()

const app = express()
const port = (process.env.PORT || 5001) as string

app.use(cors({origin:"*"}))

app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use((err: TypeError, req: Request, res: Response, next: NextFunction) => {
  try {
    if (err) {
      return res
        .status(500)
        .json({ status: false, message: (err as TypeError).message });
    }
  } catch (e) {}
});

const Bootstrap = async function () {
  try {
    await DbInitialize()
    app.listen(port,() => {
      console.log(`Our server is up and running at http://localhost:${port}`)
    })   
  } catch (error) {
    console.log("unablle to connect to database: ",error)
  }
}

Bootstrap()
