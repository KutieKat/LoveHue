const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    if (req.user['role'] > 0) {
        res.render('admin/pages/post-categories', {
            user: req.user,
            page_name: 'post-categories'
        });
    }
    else {
        res.redirect('/');
    }
});

router.use('/chuyen-muc', require('./post-categories'));
router.use('/loi-ich', require('./benefits'));
router.use('/cai-dat-chung', require('./settings'));
router.use('/bai-viet', require('./posts'));
router.use('/nguoi-dung', require('./users'));
router.use('/ho-so', require('./profile'));

router.get('/dang-xuat', (req, res, next) => {
    req.logout();
    res.redirect('/');
});

module.exports = Object.freeze(router);