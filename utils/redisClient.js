const redis = require("redis");

const publisher = redis.createClient({
  socket: { host: "myredis", port: 6379 }, // Update host if using Docker
});

const subscriber = redis.createClient({
  socket: { host: "myredis", port: 6379 },
});
const cacher = redis.createClient({
  socket: { host: "myredis", port: 6379 },
});
(async () => {
  await publisher.connect();
  console.log("📡 Redis Publisher Connected");

  await subscriber.connect();
  console.log("🔔 Redis Subscriber Connected");

  await cacher.connect();
  console.log("📦 Redis Cacher Connected");
})();

module.exports = { publisher, subscriber, cacher };
