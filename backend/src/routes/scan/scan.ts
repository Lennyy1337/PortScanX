import { FastifyReply, FastifyRequest } from "fastify"
import { pino } from "../../init/pino"
import dns from "node:dns"
import NmapScanner from "../../utils/nmap"
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";

type body = {
    target: string
}

export async function scanTargetHandler(
    request: FastifyRequest<{ Body: body }>,
    reply: FastifyReply
) {
    try {
        const target = request.body.target

        try {
            const scanner = new NmapScanner()
            scanner.on("error", (error) => {
                reply
                    .code(500)
                    .send({ success: false, message: "Failed to scan target." })
            })

            scanner.on("data", (data) => {
                //console.log(data)
            })

            const results = await scanner.scan({
                target: target,
                osDetection: true
            })

            const ParsedData = JSON.parse(results as any)
            const data = ParsedData.nmaprun

            return reply.send({success: true, message: "Target scanned!", data: data})
        } catch (e) {
            console.log(e)
        }
        reply.send({ success: true, message: "Key redeemed!" })
    } catch (e) {
        pino.error(e)
        reply
            .code(500)
            .send({ success: false, message: "Internal server error" })
    }
}
