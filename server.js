import jsonServer from "json-server";

const server = jsonServer.create();
const middlewares = jsonServer.defaults();
const router = jsonServer.router("db.json");
const db = router.db; // Database instance

server.use(middlewares);
server.use(jsonServer.bodyParser);

server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

server.patch("/events/:eventId/participants/:participantId", (req, res) => {
  const { eventId, participantId } = req.params;
  const { checked_in, check_in_time } = req.body;

  const event = db
    .get("events")
    .find({ id: Number(eventId) })
    .value();
  if (!event) {
    return res.status(404).json({ error: "Event not found" });
  }

  const participant = event.participants.find((p) => p.id === participantId);
  if (!participant) {
    return res
      .status(404)
      .json({ error: "Participant not found in this event" });
  }

  participant.checked_in = checked_in;
  participant.check_in_time = check_in_time;

  db.get("events")
    .find({ id: Number(eventId) })
    .assign({ participants: event.participants })
    .write();

  res.json({
    success: true,
    message: "Participant checked in successfully",
    data: participant,
  });
});

server.use(router);

server.listen(5000, () => {
  console.log("🔥 JSON Server running on http://localhost:5000");
});
