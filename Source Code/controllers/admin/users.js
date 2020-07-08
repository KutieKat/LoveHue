const express = require('express');
const router = express.Router();
const { ajax, createQueryObj, returnErrorResponse, returnSuccessResponse } = require('./utilities');
const validator = require('../../helpers/validator');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');

router.get('/', (req, res, next) => {
    if (ajax(req)) {
        if (!req.query.no_limit) {
            const searchableFields = ['username', 'email'];
            const sort_field = req.query.sort_field || 'createdAt';
            const sort_value = parseInt(req.query.sort_value) || -1;
            const page = parseInt(req.query.page) || 1;
            const page_size = parseInt(req.query.page_size) || 10;
    
            User.paginate(createQueryObj(req, searchableFields), {
                sort: [[ sort_field, sort_value ]],
                page: page,
                limit: page_size
            }).then(data => {
                const newData = data;
                newData['docs'] = newData['docs'].map(doc => {
                    if (JSON.stringify(doc['_id']) === JSON.stringify(req['user']['_id'])) {
                        doc['_doc']['is_restricted'] = true;
                    }

                    return doc;
                });

                returnSuccessResponse(res, { message: 'Lấy danh sách tất cả các người dùng thành công!', data });
            })
            .catch(error => {
                console.log(error);
                returnErrorResponse(res, { message: 'Lấy danh sách tất cả các người dùng thất bại!', error });
            });
        } else {
            User
            .find({ is_active: 1 })
            .then(data => {
                returnSuccessResponse(res, { message: 'Lấy danh sách tất cả các người dùng thành công!', data });
            })
            .catch(error => {
                console.log(error);
                returnErrorResponse(res, { message: 'Lấy danh sách tất cả các người dùng thất bại!', error });
            });
        }
    }
    else {
        renderIndexPage(req, res);
    }
});

router.get('/:id', (req, res, next) => {
    if (ajax(req)) {
        const id = req.params.id;

        User.findById(id).then(data => {
            returnSuccessResponse(res, { message: 'Lấy thông tin của người dùng thành công!', data });
        }).catch(error => {
            console.log(error);
            returnErrorResponse(res, { message: 'Lấy thông tin của người dùng thất bại!', error });
        });
    }
    else {
        redirectToIndexPage(res);
    }
});

router.post('/', async (req, res, next) => {
    if (ajax(req)) {
        const { username, email, password, password_confirmation } = req.body;
        const documentWithSameUsername = await User.findOne({ username });
        const documentWithSameEmail = await User.findOne({ email });
        let errors = [];

        if (validator.empty(username))
            errors.push({ field_name: 'username', message: 'Tên đăng nhập của người dùng là bắt buộc và không được bỏ trống!' });
        if (documentWithSameUsername)
            errors.push({ field_name: 'username', message: 'Tên đăng nhập này đã tồn tại!' });
        if (validator.empty(email))
            errors.push({ field_name: 'email', message: 'Địa chỉ email của người dùng là bắt buộc và không được bỏ trống!' });
        if (documentWithSameEmail)
            errors.push({ field_name: 'email', message: 'Địa chỉ email này đã tồn tại!' });
        if (validator.empty(password))
            errors.push({ field_name: 'password', message: 'Mật khẩu của người dùng là bắt buộc và không được bỏ trống!' });
        if (validator.empty(password_confirmation))
            errors.push({ field_name: 'password_confirmation', message: 'Mật khẩu xác nhận là bắt buộc và không được bỏ trống!' });
        if (validator.equals(password, password_confirmation))
            errors.push({ field_name: 'password_confirmation', message: 'Mật khẩu xác nhận không trùng khớp!' });
        if (password.length < 6)
            errors.push({ field_name: 'password', message: 'Mật khẩu phải tối thiểu phải có 6 ký tự!' });
        if (errors.length > 0) {
            returnErrorResponse(res, { message: 'Thêm người dùng mới thất bại!', error: errors });
        } else {
            const newUser = new User({
                username,
                email,
                password,
                role: req.body.role
            });

            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    
                    newUser.password = hash;
                    newUser
                    .save()
                    .then(user => {
                        returnSuccessResponse(res, { message: 'Thêm người dùng mới thành công!', user });
                    })
                    .catch(err => console.log(err));
                });
            });
        }
    }
    else {
        redirectToIndexPage(res);
    }
});

router.put('/:id', async (req, res, next) => {
    if (ajax(req)) {
        const id = req.params.id;
        const newDocument = {
            role: req.body.role,
            is_active: req.body.is_active
        };

        User.findByIdAndUpdate(id, newDocument).then(data => {
            returnSuccessResponse(res, { message: 'Cập nhật thông tin của người dùng thành công!', data });
        })
        .catch(error => {
            console.log(error);
            returnErrorResponse(res, { message: 'Cập nhật thông tin của người dùng thất bại!', error });
        });
    }
    else {
        redirectToIndexPage(res);
    }
});

function renderIndexPage(req, res) {
    res.render('admin/pages/users/index', { 
        user: req.user,
        page_name: 'users'
    });
}

function redirectToIndexPage(res) {
    res.redirect('/bang-dieu-khien/nguoi-dung');
}

router.delete('/:id', (req, res, next) => {
    if (ajax(req)) {
        const id = req.params.id;

        User.findByIdAndDelete(id).then(data => {
            returnSuccessResponse(res, { message: 'Xóa người dùng thành công!', data });
        })
        .catch(error => {
            console.log(error);
            returnErrorResponse(res, { message: 'Xóa người dùng thất bại!', error });
        });
    }
    else {
        redirectToIndexPage(res);
    }
});

module.exports = Object.freeze(router);