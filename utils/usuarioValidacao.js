const { z } = require('zod');

const usuarioRegistroSchema = z.object({
  nome: z.string().nonempty("Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  senha: z.string()
               .min(8, "Senha deve ter no mínimo 8 caracteres")
               .regex(/[a-z]/, "Senha deve conter letra minúscula")
               .regex(/[A-Z]/, "Senha deve conter letra maiúscula")
               .regex(/[0-9]/, "Senha deve conter número")
               .regex(/[^a-zA-Z0-9]/, "Senha deve conter caractere especial"),
}).strict();

const usuarioLoginSchema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string()
               .min(8, "Senha deve ter no mínimo 8 caracteres")
               .regex(/[a-z]/, "Senha deve conter letra minúscula")
               .regex(/[A-Z]/, "Senha deve conter letra maiúscula")
               .regex(/[0-9]/, "Senha deve conter número")
               .regex(/[^a-zA-Z0-9]/, "Senha deve conter caractere especial"),
});

const validarID = z.object({
    id: z.coerce.number({ required_error: "Id inválido" }).int({ required_error: "Id inválido" }).nonnegative({ required_error: "Id inválido" })
})

module.exports = {
    usuarioRegistroSchema,
    usuarioLoginSchema,
    validarID
};