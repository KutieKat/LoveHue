const express = require('express');
const router = express.Router();
const { ajax, createQueryObj, returnErrorResponse, returnSuccessResponse } = require('./utilities');
const validator = require('../../helpers/validator');
const Settings = require('../../models/Settings');

router.get('/', async (req, res, next) => {
    if (ajax(req)) {
        Settings
        .findOne()
        .then(data => {
            returnSuccessResponse(res, { message: 'Lấy danh sách tất cả các cài đặt thành công!', data });
        })
        .catch(error => {
            console.log(error);
            returnErrorResponse(res, { message: 'Lấy danh sách tất cả các cài đặt thất bại!', error });
        })
    }
    else {
        res.render('admin/pages/settings/index', {
            user: req.user,
            page_name: 'settings'
        });
    }
});

module.exports = Object.freeze(router);