import { FastifyRequest, FastifyReply } from "fastify";
import { pino } from "../init/pino";
import axios from "axios";

export async function captchaPreHandler(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const body = request.body as any;

    const token = body.captcha;

    const secretKey = process.env.TURNSTILE_SECRET_KEY;

    const verificationResponse = await axios.post(
      `https://challenges.cloudflare.com/turnstile/v0/siteverify`,
      `secret=${secretKey}&response=${token}`,
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { success } = verificationResponse.data;
    //const success = true
    if (!success) {
      reply
        .code(400)
        .send({
          success: false,
          message: "Invalid captcha.",
        });
      return;
    }
  } catch (error) {
    reply.code(500).send({ success: false, message: "Internal server error." });
    pino.error(error);
  }
}
