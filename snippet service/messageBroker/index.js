const amqplib = require("amqplib");

class MessageBroker {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.exchange = {
      CODE_EDITOR: "CODE_EDITOR",
    };
    this.routingKeys = {
      FETCH_SNIPPET: "fetch_snippet",
      SNIPPET_REQUEST: "snippet_request",
      SNIPPET_RESPONSE: "snippet_response",
    };
  }
  async initialize() {
    try {
      this.connection = await amqplib.connect(process.env.MESSAGE_BROKER_URL);
      this.channel = await this.connection.createChannel();

      await this.channel.assertExchange(this.exchange.CODE_EDITOR, "direct", {
        durable: true,
      });
      return this.channel;
    } catch (error) {
      console.log("failed to intiliaze message broker");
      throw error;
    }
  }

  async publishMessage(routingKey, message, options = {}) {
    try {
      if (!this.channel) throw "channel not intialized";
      const messageBuffer = Buffer.from(JSON.stringify(message));

      await this.channel.publish(
        this.exchange.CODE_EDITOR,
        routingKey,
        messageBuffer,
        {
          persistent: true,
          timpstamp: Date.now(),
          messageId: `msg_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`,
          ...options,
        }
      );
    } catch (error) {
      console.log("failed to publish message ");
      throw error;
    }
  }

  async subscribeMessage(queueName, routingKey , messageHandler) {
    try {
      if (!this.channel) throw "channel not intialized";
      const queue = await this.channel.assertQueue(queueName, {
        durable: true,
      });
      await this.channel.bindQueue(
        // bind queue with exchange viva routing key
        queue.queue,
        this.exchange.CODE_EDITOR,
        routingKey,
      );
      // Set prefetch to 1 (process one message at a time)
      await this.channel.prefetch(1);

      //cosuming messages when come
      await this.channel.consume(queue.queue, async (msg) => {
        try {
          const messageContent = JSON.parse(msg.content.toString());
          console.log("Message received : ", messageContent);

            await messageHandler(messageContent, msg);
          //send ack
          this.channel.ack(msg);
        } catch (error) {
          console.log(
            "Error has occured while processing messaage : ",
            error.message
          );
          this.channel.nack(msg, false, true);
        }
      });
    } catch (error) {
      console.log("failed to subscribe to messages ");
      throw error;
    }
  }

  async closeMessageBroker() {
    try {
      if (!this.channel) throw "channel not intialized";
      else {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
    } catch (error) {
      console.log("failed to subscribe to messages ");
      throw error;
    }
  }
}


module.exports = MessageBroker;