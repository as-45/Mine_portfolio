import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import projectAdminRoutes from './project.admin.routes';
import messageAdminRoutes from './message.admin.routes';

const router = Router();

router.use(requireAuth);

router.use('/projects', projectAdminRoutes);
router.use('/messages', messageAdminRoutes);

export default router;
