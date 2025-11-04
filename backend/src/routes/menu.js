/*// backend/src/routes/menu.js
const express = require('express');
const router = express.Router();
const {
    getMenu,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem
} = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getMenu); // Public

router.use(protect);
router.use(authorize('admin'));

router.route('/')
    .post(createMenuItem);

router.route('/:id')
    .put(updateMenuItem)
    .delete(deleteMenuItem);

module.exports = router;*/
/*// backend/src/routes/menu.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getAllMenus,
    getMenu,
    createMenu,
    updateMenu,
    deleteMenu
} = require('../controllers/menuController');
const upload = require('../middleware/upload');

// Routes
router
    .route('/')
    .get(getAllMenus)
    .post(
        protect,
        authorize('admin', 'manager'),
        upload.single('image'),
        createMenu
    );

router
    .route('/:id')
    .get(getMenu)
    .put(
        protect,
        authorize('admin', 'manager'),
        upload.single('image'),
        updateMenu
    )
    .delete(
        protect,
        authorize('admin', 'manager'),
        deleteMenu
    );

module.exports = router;*/
/*
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const controller = require('../controllers/menuController');

router.get('/', controller.getAll);
router.post('/', upload.single('image'), controller.add);
router.put('/:id', upload.single('image'), controller.update);
router.delete('/:id', controller.remove);

module.exports = router;*/
// backend/src/routes/menu.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getAll, add, update, remove } = require('../controllers/menuController');
const { uploadMenu } = require('../middleware/upload');

router.get('/', getAll);
router.post('/', protect, authorize('admin', 'manager'), uploadMenu.single('image'), add);
router.put('/:id', protect, authorize('admin', 'manager'), uploadMenu.single('image'), update);
router.delete('/:id', protect, authorize('admin', 'manager'), remove);

module.exports = router;