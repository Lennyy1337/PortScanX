import { FastifyReply, FastifyRequest } from "fastify"
import { pino } from "../../init/pino"
import dns from "node:dns"
import NmapScanner from "../../utils/nmap"
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile"
import axios from "axios"

type body = {
    target: string
}

async function isCloudlare(target: String): Promise<Boolean> {
    try {
        const response = await axios.get(`http://${target}`)
        return false
    } catch (error) {
        if (axios.isAxiosError(error)) {
            return error.response?.headers["cf-ray"] !== undefined
        }
        return false
    }
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
                osDetection: true,
            })

            const ParsedData = JSON.parse(results as any)
            const data = ParsedData.nmaprun

            const cloudflare: Boolean = await isCloudlare(data.hosthint.address.addr)

            return reply.send({
                success: true,
                message: "Target scanned!",
                data: {
                    data,
                    cloudflare,
                },
            })
        } catch (e) {
            console.log(e)
        }
        reply.send({ success: false, message: "Error on scan" })
    } catch (e) {
        pino.error(e)
        reply
            .code(500)
            .send({ success: false, message: "Internal server error" })
    }
}
