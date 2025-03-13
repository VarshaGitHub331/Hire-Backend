const { publisher } = require("./redisClient");

async function sendNotification(userId, message) {
  console.log("📢 sendNotification called for user:", userId);

  if (!publisher.isReady) {
    console.error("❌ Redis client is not ready. Cannot publish.");
    return Promise.reject(new Error("Redis client not ready"));
  }

  const channel = `notifications:${userId}`;
  console.log(`🛠 Attempting to publish to ${channel}...`);

  try {
    await publisher.publish(channel, message);
    console.log(`🚀 Message published to ${channel}`);
    return;
  } catch (e) {
    console.error("❌ Error publishing message:", e);
    throw e;
  }
}

module.exports = { sendNotification };
