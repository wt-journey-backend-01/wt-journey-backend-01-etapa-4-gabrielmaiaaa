const { z } = require('zod');

const validarDadosCasos = z.object({
    titulo: z.string()
                .nonempty("Título é obrigatório"),
    descricao: z.string()
                       .nonempty("Descrição é obrigatório"),
    status: z.string()
                 .nonempty("Status é obrigatório")
                 .regex(/^(aberto|solucionado)$/, "Status inválido"),
    agente_id: z.coerce.number({ required_error: "Id inválido" })
                                   .int({ required_error: "Id inválido" })
                                   .nonnegative({ required_error: "Id inválido" })
}).strict();

const validarDadosParcialCasos = z.object({
    titulo: z.string()
                .nonempty("Título não pode ser vazio")
                .optional(),
    descricao: z.string()
                       .nonempty("Descrição não pode ser vazio")
                       .optional(),
    status: z.string()
                 .nonempty("Status não pode ser vazio")
                 .regex(/^(aberto|solucionado)$/, "Status inválido")
                 .optional(),
    agente_id: z.coerce.number({ required_error: "Id inválido" })
                                   .int({ required_error: "Id inválido" })
                                   .nonnegative({ required_error: "Id inválido" })
                                   .optional()
}).strict();

const validarIDs = z.object({
    id: z.coerce.number({ required_error: "Id inválido" })
                      .int({ required_error: "Id inválido" })
                      .nonnegative({ required_error: "Id inválido" })
                      .optional(),
    agente_id: z.coerce.number({ required_error: "Id inválido" })
                      .int({ required_error: "Id inválido" })
                      .nonnegative({ required_error: "Id inválido" })
                      .optional(),
    caso_id: z.coerce.number({ required_error: "Id inválido" })
                      .int({ required_error: "Id inválido" })
                      .nonnegative({ required_error: "Id inválido" })
                      .optional()
});

const validarAgente_idEStatus = z.object({
    status: z.string()
                 .nonempty("Status não pode ser vazio")
                 .regex(/^(aberto|solucionado)$/, "Status inválido")
                 .optional(),
    agente_id: z.coerce.number({ required_error: "Id inválido" })
                      .int({ required_error: "Id inválido" })
                      .nonnegative({ required_error: "Id inválido" })
                      .optional()
}).strict();

const validarString = z.object({
    q: z.string()
          .nonempty("Parametro 'q'  não pode estar vazio")
})

module.exports = {
    validarDadosCasos,
    validarDadosParcialCasos,
    validarIDs,
    validarAgente_idEStatus,
    validarString
}