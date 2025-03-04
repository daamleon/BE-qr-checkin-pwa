import jsonServer from "json-server";

const server = jsonServer.create();
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

const router = jsonServer.router("db.json");
server.use(router);

server.patch("/participants/:id", (req, res) => {
  const { id } = req.params;
  const { checked_in, check_in_time } = req.body;

  const db = router.db;
  const participant = db.get("participants").find({ id }).value();

  if (!participant) {
    return res.status(404).json({ error: "Participant not found" });
  }

  db.get("participants")
    .find({ id })
    .assign({ checked_in, check_in_time })
    .write();

  res.json({
    success: true,
    message: "Participant checked in successfully",
    data: participant,
  });
});

server.listen(5000, () => {
  console.log("🔥 JSON Server running on http://localhost:5000");
});
