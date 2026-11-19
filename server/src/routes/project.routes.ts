import { Router } from 'express';
import { listProjects, getProjectBySlug } from '../controllers/project.controller';

const router = Router();

router.get('/', listProjects);
router.get('/:slug', getProjectBySlug);

export default router;