import express from "express"

const app = express()
const port = 5000

app.listen(port,() => {
  console.log(`Our server is up and running at http://localhost:${port}`)
})