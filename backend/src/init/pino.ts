import pinoImport from 'pino'

export const pino = pinoImport({
    transport: {
        target: 'pino-pretty'
    }
})
