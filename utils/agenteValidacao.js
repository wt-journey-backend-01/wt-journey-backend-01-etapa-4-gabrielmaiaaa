const { z } = require('zod');

const dadosAgentes = z.object({
    nome: z.string()
                 .nonempty("Nome é obrigatório"),
    dataDeIncorporacao: z.string()
                                        .nonempty("Data de incorporação é obrigatória"),
    cargo: z.string()
                 .nonempty("Cargo é obrigatório")
}).strict();

const dadosParcialAgentes = z.object({
    nome: z.string()
                 .nonempty("Nome é obrigatório")
                 .optional(),
    dataDeIncorporacao: z.string()
                                        .nonempty("Data de incorporação é obrigatória")
                                        .optional(),
    cargo: z.string()
                 .nonempty("Cargo é obrigatório")
                 .optional()
}).strict();

const agenteIdValido = z.object({
    id: z.coerce.number({ required_error: "Id inválido" })
                      .int({ required_error: "Id inválido" })
                      .nonnegative({ required_error: "Id inválido" })
});

const agenteCargoESorteValido = z.object({
    cargo: z.string()
                 .nonempty("Cargo é obrigatório")
                 .regex(/^(inspetor|delegado)$/, "Cargo inválido")
                 .optional(),
    sort: z.string()
                 .nonempty("Sort é obrigatório")
                 .regex(/^(dataDeIncorporacao|-dataDeIncorporacao)$/, "Sort inválido")
                 .optional()
}).strict();

module.exports = {
    dadosAgentes,
    dadosParcialAgentes,
    agenteIdValido,
    agenteCargoESorteValido
}