require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 3000;

const agentesRouter = require('./routes/agentesRoutes');
const casosRouter = require('./routes/casosRoutes');
const authRouter = require('./routes/authRoutes');
const { errorHandler } = require("./utils/errorHandler");

app.use(express.json());
app.use(cookieParser());

app.use(agentesRouter);
app.use(casosRouter);
app.use(authRouter);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Servidor do Departamento de Polícia rodando em localhost:${PORT}`);
});