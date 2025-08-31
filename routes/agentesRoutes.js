const express = require('express');
const router = express.Router();

const agentesController = require('../controllers/agentesController');
const {authMiddleware, debugMiddleware} = require('../middlewares/authMiddleware');

router.get('/agentes', debugMiddleware, authMiddleware, agentesController.getAllAgentes);
router.get('/agentes/:id', debugMiddleware, authMiddleware, agentesController.getAgente);
router.post('/agentes', debugMiddleware, authMiddleware, agentesController.postAgente);
router.put('/agentes/:id', debugMiddleware, authMiddleware, agentesController.putAgente);
router.patch('/agentes/:id', debugMiddleware, authMiddleware, agentesController.patchAgente);
router.delete('/agentes/:id', debugMiddleware, authMiddleware, agentesController.deleteAgente);
router.get('/agentes/:id/casos', debugMiddleware, authMiddleware, agentesController.getCasosDoAgente);

module.exports = router