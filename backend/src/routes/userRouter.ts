import { Router } from 'express';
import { UserController } from '../controllers/userController.ts';
import { authenticate, authorize } from '../middlewares/auth.ts';

const userRouter = Router();
const userController = new UserController();

// Khusus Admin
userRouter.use(authenticate, authorize('admin'));

userRouter.get('/', userController.getUsers);
userRouter.post('/', userController.createUser);
userRouter.patch('/:id/role', userController.updateRole);

export { userRouter };
