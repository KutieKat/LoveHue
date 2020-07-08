const express = require('express');
const router = express.Router();
const { ajax, createQueryObj, returnErrorResponse, returnSuccessResponse } = require('./utilities');
const User = require('../../models/User');

router.get('/', (req, res, next) => {
    if (ajax(req)) {
        returnSuccessResponse(res, { message: 'Lấy hồ sơ của người dùng thành công!', data: req['user'] });
    }
    else {
        renderIndexPage(req, res);
    }
});

router.put('/', (req, res, next) => {
    if (ajax(req)) {

    }
    else {
        redirectToIndexPage(res);
    }
});

function renderIndexPage(req, res) {
    res.render('admin/pages/profile', {
        user: req.user,
        page_name: 'profile'
    });
}

function redirectToIndexPage(res) {
    res.redirect('/bang-dieu-khien/ho-so');
}

module.exports = Object.freeze(router);