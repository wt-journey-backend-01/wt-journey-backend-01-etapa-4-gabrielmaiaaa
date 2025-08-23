const { z } = require('zod');

const usuarioRegistroSchema = z.object({
    nome: z.string({ required_error: "Nome é obrigatório" }).min(2, "Nome não pode estar vazio"),
    email: z.string({ required_error: "Email é obrigatório" }).email("Email inválido"),
    senha: z.string({ required_error: "Senha é obrigatória" }).min(4, "A senha tem que ter 4 caracteres")
});

const usuarioLoginSchema = z.object({
    email: z.string({ required_error: "Email é obrigatório" }).email("Email inválido"),
    senha: z.string({ required_error: "Senha é obrigatória" }).min(4, "A senha tem que ter 4 caracteres")
});

const validarID = z.object({
    id: z.coerce.number({ required_error: "Id inválido" }).int({ required_error: "Id inválido" }).nonnegative({ required_error: "Id inválido" })
})

module.exports = {
    usuarioRegistroSchema,
    usuarioLoginSchema,
    validarID
};