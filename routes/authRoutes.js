const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/logout', authController.logout);
router.delete('/auth/:id', authController.deletar);
router.get('/usuarios/me', authMiddleware, authController.getDados);

module.exports = router