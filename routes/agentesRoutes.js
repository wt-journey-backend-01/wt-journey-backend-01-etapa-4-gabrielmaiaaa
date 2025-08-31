const express = require('express');
const router = express.Router();

const agentesController = require('../controllers/agentesController');
const {authMiddleware} = require('../middlewares/authMiddleware');

router.get('/agentes', authMiddleware, agentesController.getAllAgentes);
router.get('/agentes/:id', authMiddleware, agentesController.getAgente);
router.post('/agentes', authMiddleware, agentesController.postAgente);
router.put('/agentes/:id', authMiddleware, agentesController.putAgente);
router.patch('/agentes/:id', authMiddleware, agentesController.patchAgente);
router.delete('/agentes/:id', authMiddleware, agentesController.deleteAgente);
router.get('/agentes/:id/casos', authMiddleware, agentesController.getCasosDoAgente);

module.exports = router