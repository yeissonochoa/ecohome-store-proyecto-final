/**
 * src/interfaces/routes/index.js
 * -----------------------------------------------------------------------
 * Punto único de montaje de todos los routers de la API.
 * -----------------------------------------------------------------------
 */
const { Router } = require('express');
const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');
const messageRoutes = require('./messageRoutes');
const userRoutes = require('./userRoutes');

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({ success: true, data: { status: 'up', timestamp: new Date().toISOString() } });
});

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/messages', messageRoutes);
router.use('/users', userRoutes);

module.exports = router;
