import dotenv from "dotenv"
import ratelimit from "@fastify/rate-limit"
import { fastifyYupSchema } from "fastify-yup-schema"

import { fastify } from "./init/fastify"
import { router } from "./router"
import { pino } from "./init/pino"
import axios, { Axios, AxiosError } from "axios"


dotenv.config()

fastify.register(fastifyYupSchema)

fastify.register(router)

fastify.register(ratelimit, {
    max: 3,
    timeWindow: 60000,
    global: true,
    errorResponseBuilder: (req, context) => ({
      statusCode: 429,
      error: "Too Many Requests",
      message: `Rate limit exceeded: ${context.after}`
    })
  })


fastify.listen({ port: 3001, host: "0.0.0.0" }, async function (err, address) {
    pino.info("Listening on " + address)
    if (err) {
        console.log(err)
        fastify.log.error(err)
    }
})
