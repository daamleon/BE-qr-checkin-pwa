import jsonServer from "json-server";

const server = jsonServer.create();
const middlewares = jsonServer.defaults();
const router = jsonServer.router("db.json");
const db = router.db; // Database instance

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Mengizinkan CORS agar bisa diakses dari frontend
server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// **Update Status Check-in Peserta**
server.patch("/events/:eventId/participants/:participantId", (req, res) => {
  const { eventId, participantId } = req.params;
  const { checked_in, check_in_time } = req.body;

  // Cari event berdasarkan eventId
  const event = db
    .get("events")
    .find({ id: Number(eventId) })
    .value();
  if (!event) {
    return res.status(404).json({ error: "Event not found" });
  }

  // Cari participant berdasarkan participantId di dalam event
  const participant = event.participants.find((p) => p.id === participantId);
  if (!participant) {
    return res
      .status(404)
      .json({ error: "Participant not found in this event" });
  }

  // Update status check-in peserta
  participant.checked_in = checked_in;
  participant.check_in_time = check_in_time;

  // Simpan perubahan ke db.json
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

// Gunakan router default JSON Server
server.use(router);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🔥 Server running on ${PORT}`));

