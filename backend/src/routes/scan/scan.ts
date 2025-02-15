import { FastifyReply, FastifyRequest } from "fastify"
import { pino } from "../../init/pino"
import dns from "node:dns"
import NmapScanner from "../../utils/nmap"
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile"
import axios, { AxiosResponse } from "axios"

type body = {
    target: string
}
interface IIPResponse {
    query: string
    status: "success" | "fail"
    isp: string
    org: string
    as: string
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

async function lookupIp(ip: string): Promise<IIPResponse | null> {
    try {
        const response: AxiosResponse = await axios.get(
            `http://ip-api.com/json/${ip}?fields=status,org,query`
        )
        return response.data
    } catch (error) {
        pino.error("IP lookup failed:", error)
        return null
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
            let cloudflare: Boolean = false
            let ipInfo: IIPResponse | null = {
                query: request.body.target,
                status: "success",
                as: "unkown",
                isp: "unkown",
                org: "unkown"
            }

            if(data.hosthint.address.addr){
                cloudflare = await isCloudlare(data.hosthint.address.addr)
                ipInfo  = await lookupIp(data.hosthint.address.addr)
            }

            return reply.send({
                success: true,
                message: "Target scanned!",
                data: {
                    data,
                    cloudflare,
                    ipinfo: ipInfo
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
