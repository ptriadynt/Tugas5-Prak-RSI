import { Router } from 'express';
import { MenuItemController } from '../controllers/menuItemController.ts';
import { authenticate, authorize } from '../middlewares/auth.ts';

const menuItemRouter = Router();
const menuItemController = new MenuItemController();

// GET publik
menuItemRouter.get('/', (req, res) => menuItemController.getMenuItems(req, res));
menuItemRouter.get('/:id', (req, res) => menuItemController.getMenuItemById(req, res));

// Operasi tulis untuk Owner dan Admin
menuItemRouter.post('/', authenticate, authorize('owner', 'admin'), (req, res) =>
  menuItemController.createMenuItem(req, res)
);
menuItemRouter.put('/:id', authenticate, authorize('owner', 'admin'), (req, res) =>
  menuItemController.updateMenuItem(req, res)
);
menuItemRouter.delete('/:id', authenticate, authorize('owner', 'admin'), (req, res) =>
  menuItemController.deleteMenuItem(req, res)
);

export { menuItemRouter };
