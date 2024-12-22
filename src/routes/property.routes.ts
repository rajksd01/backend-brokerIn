import express from 'express';
import { createProperty, getProperties } from '../controllers/property.controller';

const router = express.Router();

router.post('/', createProperty);
router.get('/', getProperties);

export default router; 