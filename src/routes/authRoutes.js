const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/recovery-questions', authController.getCommonRecoveryQuestions);
router.post('/verify-recovery', authController.verifyRecoveryAnswer);
router.post('/reset-password', authController.resetPassword);
router.get('/recovery-question/:username', authController.getRecoveryQuestionByUsername);


module.exports = router;
