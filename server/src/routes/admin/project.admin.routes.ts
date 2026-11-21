import { Router } from 'express';
import * as controller from '../../controllers/admin/project.admin.controller';

const router = Router();

router.get('/', controller.listAll);
router.post('/', controller.create);
router.get('/:id', controller.getOne);
router.patch('/:id', controller.update);
router.delete('/:id', controller.remove);

export default router;
