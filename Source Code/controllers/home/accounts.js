const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../../models/User');
const PostCategory = require('../../models/PostCategory');
const { ensureAuthenticated, forwardAuthenticated } = require('../../config/auth');

router.get('/', ensureAuthenticated, async (req, res, next) => {
    const allPostCategories = await PostCategory.find();

    res.render('home/pages/accounts/profile', {
        post_categories: allPostCategories,
        user: req.user
    });
});

router.get('/dang-ky', forwardAuthenticated, (req, res, next) => {
    res.render('home/pages/accounts/register', {
        page_title: 'Đăng ký tài khoản - LoveHue',
        active_menu_item: 'register'
    });
});

router.post('/dang-ky', (req, res) => {
    const { username, email, password, password_confirmation } = req.body;
    let errors = [];

    if (!username || !email || !password || !password_confirmation) {
        errors.push({ msg: 'Vui lòng điền đầy đủ tất cả các trường được yêu cầu!' });
    }

    if (password != password_confirmation) {
        errors.push({ msg: 'Mật khẩu xác nhận không trùng khớp!' });
    }

    if (password.length < 6) {
        errors.push({ msg: 'Mật khẩu phải có tối thiểu 6 ký tự!' });
    }

    if (errors.length > 0) {
        res.render('home/pages/accounts/register', {
            errors,
            username,
            email,
            password,
            password_confirmation,
            user: req.user
        });
    } else {
        User.findOne({ email: email }).then(user => {
        if (user) {
            errors.push({ msg: 'Địa chỉ email đã tồn tại!' });
            res.render('home/pages/accounts/register', {
                errors,
                username,
                email,
                password,
                password_confirmation,
                user: req.user
            });
        } else {
            const newUser = new User({
                username,
                email,
                password
            });

            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    newUser.password = hash;
                    newUser
                    .save()
                    .then(user => {
                        req.flash(
                            'success_msg',
                            'Đăng ký tài khoản mới thành công!'
                        );
                        res.redirect('/tai-khoan/dang-nhap');
                    })
                    .catch(err => console.log(err));
                });
            });
        }
        });
    }
});

router.get('/dang-nhap', forwardAuthenticated, (req, res, next) => {
    res.render('home/pages/accounts/login', {
        page_title: 'Đăng nhập tài khoản - LoveHue',
        active_menu_item: 'login'
    });
});

router.post('/dang-nhap', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: req.session.returnTo || '/',
        failureRedirect: '/tai-khoan/dang-nhap',
        failureFlash: true
    })(req, res, next);
});

router.get('/dang-xuat', (req, res, next) => {
    req.logout();
    res.redirect('/');
});

router.get('/quen-mat-khau', (req, res, next) => {
    res.render('home/pages/accounts/forgot', {
        page_title: 'Quên mật khẩu - LoveHue'
    });
});

router.get('/thay-doi-mat-khau', ensureAuthenticated, async (req, res, next) => {
    const allPostCategories = await PostCategory.find();

    res.render('home/pages/accounts/profile-change-password', {
        post_categories: allPostCategories,
        user: req.user
    });
});

router.get('/dat-lai-mat-khau', (req, res, next) => {
    res.render('home/pages/accounts/reset', {
        page_title: 'Đặt lại mật khẩu - LoveHue'
    });
});

module.exports = router;