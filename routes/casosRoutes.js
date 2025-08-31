const express = require('express')
const router = express.Router();

const casosController = require('../controllers/casosController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.get("/casos/search", casosController.getCasosPorString);

router.get('/casos', casosController.getAllCasos);
router.get('/casos/:id', casosController.getCaso);
router.post('/casos', casosController.postCaso);
router.put('/casos/:id', casosController.putCaso);
router.patch('/casos/:id', casosController.patchCaso);
router.delete('/casos/:id', casosController.deleteCaso);
router.get('/casos/:caso_id/agente', casosController.getAgenteDoCaso);

module.exports = router