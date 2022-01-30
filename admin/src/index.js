const express = require("express")
const bodyParser = require("body-parser")
const config = require("config")

const createReport = require('./services/reportService');
const investmentService = require("./services/investmentService");

const app = express()

app.use(bodyParser.json({ limit: "10mb" }))

app.get("/investments/:id", async (req, res) => {
  const { id } = req.params

  try {
    res.send(await investmentService.getById(id))
  } catch (e) {
    console.error(e)
    res.sendStatus(500);
  }
})

app.get('/report', async (req, res) => {
  try {
    // Basicly we can process investments response with streams, but I did not implement it here due to lack of tim
    const investments = await investmentService.get();

    const csv = await createReport(investments);

    await investmentService.sendReport(csv);

    res.send(csv)
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
})

app.listen(config.port, (err) => {
  if (err) {
    console.error("Error occurred starting the server", err)
    process.exit(1)
  }
  console.log(`Server running on port ${config.port}`)
})
