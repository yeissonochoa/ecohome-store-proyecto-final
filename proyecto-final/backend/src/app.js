/**
 * src/app.js
 * -----------------------------------------------------------------------
 * Configura la instancia de Express: middlewares globales, montaje de
 * rutas versionadas bajo /api/v1 y manejador de errores centralizado
 * (siempre al final de la cadena de middlewares).
 * -----------------------------------------------------------------------
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const env = require('./config/env');
const routes = require('./interfaces/routes');
const errorHandler = require('./infrastructure/middlewares/errorHandler');
const AppError = require('./infrastructure/utils/AppError');

const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());
app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));

app.use('/api/v1', routes);

// 404 para cualquier ruta no definida
app.use((req, res, next) => {
  next(AppError.notFound(`Ruta ${req.method} ${req.originalUrl} no existe.`));
});

// Manejador de errores centralizado (siempre el último middleware)
app.use(errorHandler);

module.exports = app;
