const express = require('express');
const router = express.Router();

const casosController = require('../controllers/casosController');
const {authMiddleware,debugMiddleware} = require('../middlewares/authMiddleware');

router.get("/casos/search", debugMiddleware, authMiddleware, casosController.getCasosPorString);

router.get('/casos', debugMiddleware, authMiddleware, casosController.getAllCasos);
router.get('/casos/:id', debugMiddleware, authMiddleware, casosController.getCaso);
router.post('/casos', debugMiddleware, authMiddleware, casosController.postCaso);
router.put('/casos/:id', debugMiddleware, authMiddleware, casosController.putCaso);
router.patch('/casos/:id', debugMiddleware, authMiddleware, casosController.patchCaso);
router.delete('/casos/:id', debugMiddleware, authMiddleware, casosController.deleteCaso);
router.get('/casos/:caso_id/agente', debugMiddleware, authMiddleware, casosController.getAgenteDoCaso);

module.exports = router