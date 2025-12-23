const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { createNews, getNews, deleteNews, updateNews } = require('../controllers/newsController');
const { uploadNews } = require('../middleware/upload');

router.get('/', protect, getNews);
router.post('/', protect, authorize('admin', 'manager'), uploadNews.array('files', 5), createNews);
router.put('/:id', protect, authorize('admin', 'manager'), uploadNews.array('files', 5), updateNews); // NEW
router.delete('/:id', protect, authorize('admin', 'manager'), deleteNews);

module.exports = router;