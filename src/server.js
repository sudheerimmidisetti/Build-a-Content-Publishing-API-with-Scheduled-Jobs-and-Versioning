const app = require("./app");
const publishQueue = require("./queue");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

publishQueue.add(
  "checkScheduled",
  {},
  {
    repeat: { every: 60000 }, // every 60 seconds
  }
);

