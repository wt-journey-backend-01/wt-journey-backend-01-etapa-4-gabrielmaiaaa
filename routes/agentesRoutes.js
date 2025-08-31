const express = require('express')
const router = express.Router();

const agentesController = require('../controllers/agentesController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.get('/agentes', agentesController.getAllAgentes);
router.get('/agentes/:id', agentesController.getAgente);
router.post('/agentes', agentesController.postAgente);
router.put('/agentes/:id', agentesController.putAgente);
router.patch('/agentes/:id', agentesController.patchAgente);
router.delete('/agentes/:id', agentesController.deleteAgente);
router.get('/agentes/:id/casos', agentesController.getCasosDoAgente);

module.exports = router