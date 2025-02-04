import { fastify } from "./init/fastify"
import { captchaPreHandler } from "./middlewares/captcha"
import { scanTargetHandler } from "./routes/scan/scan"
import { scanSchema } from "./schema/scan.schema"

export async function router() {
    fastify.route({
        method: "POST",
        url: "/v1/scan",
        schema: scanSchema,
        // preHandler: captchaPreHandler, disabled until further notice
        handler: scanTargetHandler,
    })
}
