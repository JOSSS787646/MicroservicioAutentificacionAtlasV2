const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');

const commonRecoveryQuestions = [
  "¿Cuál es el nombre de tu primera mascota?",
  "¿Cuál es tu ciudad natal?",
  "¿Cuál es el nombre de tu escuela primaria?",
  "¿Cuál es tu comida favorita?",
  "¿Cuál es el nombre de tu mejor amigo de la infancia?"
];

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags:
 *       - Autenticación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - recoveryQuestion
 *               - recoveryAnswer
 *             properties:
 *               username:
 *                 type: string
 *                 example: jose
 *               password:
 *                 type: string
 *                 example: 123
 *               recoveryQuestion:
 *                 type: string
 *                 example: ¿Cuál es tu ciudad natal?
 *               recoveryAnswer:
 *                 type: string
 *                 example: Oaxaca
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente.
 *       400:
 *         description: Faltan datos requeridos.
 *       409:
 *         description: El usuario ya existe.
 *       500:
 *         description: Error en el servidor.
 */
exports.register = async (req, res) => {
  try {
    const { username, password, recoveryQuestion, recoveryAnswer } = req.body;

    if (!username || !password || !recoveryQuestion || !recoveryAnswer) {
      return res.status(400).json({ message: 'Faltan datos requeridos.' });
    }

    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'El usuario ya existe.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedAnswer = await bcrypt.hash(recoveryAnswer.toLowerCase(), 10);

    const user = new User({
      username: username.toLowerCase(),
      password: hashedPassword,
      recoveryQuestion,
      recoveryAnswer: hashedAnswer,
    });

    await user.save();

    res.status(201).json({ message: 'Usuario registrado exitosamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags:
 *       - Autenticación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: jose
 *               password:
 *                 type: string
 *                 example: 123
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *       400:
 *         description: Faltan datos para autenticación
 *       401:
 *         description: Usuario o contraseña incorrectos
 *       500:
 *         description: Error en el servidor
 */

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Faltan datos para autenticación.' });
    }

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos.' });
    }

    // Generar access token
    const accessToken = jwt.sign(
      { id: user._id, username: user.username },
      jwtSecret,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,       // ej. "1h"
        issuer: process.env.JWT_ISSUER,
        audience: process.env.JWT_AUDIENCE
      }
    );

    // Generar refresh token con duración más larga
    const refreshToken = jwt.sign(
      { id: user._id, username: user.username },
      jwtSecret,
      {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN, // ✅ usa variable del .env
        issuer: process.env.JWT_ISSUER,
        audience: process.env.JWT_AUDIENCE
      }
    );


    // Opcional: guardar refreshToken en base de datos o en Redis si quieres poder revocarlo

    // Enviar ambos tokens
    res.json({ accessToken, refreshToken });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
};


/**
 * @swagger
 * /api/auth/recovery-questions:
 *   get:
 *     summary: Obtener preguntas comunes de recuperación
 *     tags:
 *       - Recuperación
 *     responses:
 *       200:
 *         description: Lista de preguntas de seguridad
 */
exports.getCommonRecoveryQuestions = (req, res) => {
  res.json(commonRecoveryQuestions);
};

/**
 * @swagger
 * /api/auth/verify-recovery:
 *   post:
 *     summary: Verificar respuesta de recuperación
 *     tags:
 *       - Recuperación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - recoveryAnswer
 *             properties:
 *               username:
 *                 type: string
 *                 example: jose
 *               recoveryAnswer:
 *                 type: string
 *                 example: Oaxaca
 *     responses:
 *       200:
 *         description: Respuesta correcta. Puedes restablecer tu contraseña.
 *       400:
 *         description: Faltan datos para recuperación
 *       404:
 *         description: Usuario no encontrado
 *       401:
 *         description: Respuesta incorrecta
 *       500:
 *         description: Error en el servidor
 */
exports.verifyRecoveryAnswer = async (req, res) => {
  try {
    const { username, recoveryAnswer } = req.body;

    if (!username || !recoveryAnswer) {
      return res.status(400).json({ message: 'Faltan datos para recuperación.' });
    }

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const match = await bcrypt.compare(recoveryAnswer.toLowerCase(), user.recoveryAnswer);

    if (match) {
      res.json({ message: 'Respuesta correcta. Puedes restablecer tu contraseña.' });
    } else {
      res.status(401).json({ message: 'Respuesta incorrecta.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
};


/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Restablecer la contraseña de un usuario
 *     tags: [Autenticación]
 *     description: Permite al usuario establecer una nueva contraseña después de haber respondido correctamente a la pregunta de recuperación.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - newPassword
 *             properties:
 *               username:
 *                 type: string
 *                 example: jose
 *               newPassword:
 *                 type: string
 *                 example: nuevaContraseña123
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente.
 *       400:
 *         description: Faltan datos requeridos.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error en el servidor.
 */


// controllers/authController.js
exports.resetPassword = async (req, res) => {
  try {
    const { username, newPassword } = req.body;

    if (!username || !newPassword) {
      return res.status(400).json({ message: 'Faltan datos requeridos.' });
    }

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar y guardar
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Contraseña actualizada correctamente.' });
  } catch (error) {
    console.error('Error al restablecer la contraseña:', error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
};

/**
 * @swagger
 * /api/auth/recovery-question/{username}:
 *   get:
 *     summary: Obtener la pregunta de recuperación del usuario
 *     tags: [Recuperación]
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: Nombre del usuario
 *     responses:
 *       200:
 *         description: Pregunta obtenida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 recoveryQuestion:
 *                   type: string
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error en el servidor
 */
exports.getRecoveryQuestionByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username: username.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    res.json({ recoveryQuestion: user.recoveryQuestion });
  } catch (error) {
    console.error('Error al obtener la pregunta de recuperación:', error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
};




/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Renovar access token con refresh token
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Nuevo access token generado
 *       401:
 *         description: Token inválido o expirado
 */
exports.refreshToken = (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token requerido.' });
  }

  jwt.verify(refreshToken, jwtSecret, (err, userData) => {
    if (err) {
      return res.status(401).json({ message: 'Refresh token inválido o expirado.' });
    }

    // Generar un nuevo access token
    const newAccessToken = jwt.sign(
      { id: userData.id, username: userData.username },
      jwtSecret,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
        issuer: process.env.JWT_ISSUER,
        audience: process.env.JWT_AUDIENCE
      }
    );

    res.json({ accessToken: newAccessToken });
  });
};
