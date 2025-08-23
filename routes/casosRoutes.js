const express = require('express')
const router = express.Router();

const casosController = require('../controllers/casosController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get("/casos/search", casosController.getCasosPorString);

router.get('/casos', authMiddleware, casosController.getAllCasos);
router.get('/casos/:id', authMiddleware, casosController.getCaso);
router.post('/casos', authMiddleware, casosController.postCaso);
router.put('/casos/:id', authMiddleware, casosController.putCaso);
router.patch('/casos/:id', authMiddleware, casosController.patchCaso);
router.delete('/casos/:id', authMiddleware, casosController.deleteCaso);
router.get('/casos/:caso_id/agente', authMiddleware, casosController.getAgenteDoCaso);

module.exports = router