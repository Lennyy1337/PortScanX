import { createYupSchema } from "fastify-yup-schema"

export const scanSchema = createYupSchema((yup) => ({
    body: yup
        .object()
        .shape({
            target: yup.string().required(),
        })
        .noUnknown(),
}))
