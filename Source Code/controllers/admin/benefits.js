const express = require('express');
const router = express.Router();
const { ajax, createQueryObj, returnErrorResponse, returnSuccessResponse } = require('./utilities');
const validator = require('../../helpers/validator');
const Benefit = require('../../models/Benefit');

router.get('/', (req, res, next) => {
    if (ajax(req)) {
        const searchableFields = ['name', 'description'];
        const sort_field = req.query.sort_field || 'createdAt';
        const sort_value = parseInt(req.query.sort_value) || -1;
        const page = parseInt(req.query.page) || 1;
        const page_size = parseInt(req.query.page_size) || 10;

        Benefit.paginate(createQueryObj(req, searchableFields), {
            sort: [[ sort_field, sort_value ]],
            page: page,
            limit: page_size
        }).then(data => {
            returnSuccessResponse(res, { message: 'Lấy danh sách tất cả các lợi ích thành công!', data });
        })
        .catch(error => {
            console.log(error);
            returnErrorResponse(res, { message: 'Lấy danh sách tất cả các lợi ích thất bại!', error });
        });
    }
    else {
        renderIndexPage(req, res);
    }
});

router.get('/:id', (req, res, next) => {
    if (ajax(req)) {
        const id = req.params.id;

        Benefit.findById(id).then(data => {
            returnSuccessResponse(res, { message: 'Lấy thông tin của lợi ích thành công!', data });
        }).catch(error => {
            console.log(error);
            returnErrorResponse(res, { message: 'Lấy thông tin của lợi ích thất bại!', error });
        });
    }
    else {
        redirectToIndexPage(res);
    }
});

router.post('/', upload.single('icon_file'), (req, res, next) => {
    if (ajax(req)) {
        const errors = validateUserData(req, res);

        if (errors.length > 0) {
            console.log(errors);
            returnErrorResponse(res, { message: 'Thêm lợi ích mới thất bại!', error: errors });
        } else {
            addNewDocument(req, res);
        }
    }
    else {
        redirectToIndexPage(res);
    }
});

router.put('/:id', upload.single('icon_file'), async (req, res, next) => {
    if (ajax(req)) {
        const id = req.params.id;
        const errors = validateUserData(req, res);

        if (errors.length > 0) {
            console.log(errors);
            returnErrorResponse(res, { message: 'Cập nhật thông tin của lợi ích thất bại!', error: errors });
        } 
        else {
            const currentDocument = await Benefit.findById(id);
            let icon_file_name = currentDocument.icon_file_name;

            if (req.file) {
                icon_file_name = req.file.filename;
            }

            if (parseInt(req.body.is_deleted) === 1) {
                icon_file_name = '';
            }

            const newDocument = {
                name: req.body.name,
                description: req.body.description,
                icon_file_name: icon_file_name,
                is_active: req.body.is_active
            };

            Benefit.findByIdAndUpdate(id, newDocument).then(data => {
                returnSuccessResponse(res, { message: 'Cập nhật thông tin của lợi ích thành công!', data });
            })
            .catch(error => {
                console.log(error);
                returnErrorResponse(res, { message: 'Cập nhật thông tin của lợi ích thất bại!', error });
            });
        }
    }
    else {
        redirectToIndexPage(res);
    }
});

function renderIndexPage(req, res) {
    res.render('admin/pages/benefits/index', { 
        user: req.user,
        page_name: 'benefits'
    });
}

function redirectToIndexPage(res) {
    res.redirect('/bang-dieu-khien/loi-ich');
}

function validateUserData(req, res) {
    const { name, description } = req.body;
    const errors = [];

    if (validator.empty(name))
        errors.push({ field_name: 'name', message: 'Tên của lợi ích là bắt buộc và không được bỏ trống!' });
    if (validator.empty(description))
        errors.push({ field_name: 'description', message: 'Mô tả của lợi ích là bắt buộc và không được bỏ trống!' });

    return errors;
}

function addNewDocument(req, res) {
    const newDocument = new Benefit({
        name: req.body.name,
        description: req.body.description,
        icon_file_name: req.file.filename,
        is_active: req.body.is_active
    });

    newDocument
    .save()
    .then(data => {
        returnSuccessResponse(res, { message: 'Thêm lợi ích mới thành công!', data });
    })
    .catch(error => {
        console.log(error);
        returnErrorResponse(res, { message: 'Thêm lợi ích mới thất bại!', error });
    });
}

router.delete('/:id', (req, res, next) => {
    if (ajax(req)) {
        const id = req.params.id;

        Benefit.findByIdAndDelete(id).then(data => {
            returnSuccessResponse(res, { message: 'Xóa lợi ích thành công!', data });
        })
        .catch(error => {
            console.log(error);
            returnErrorResponse(res, { message: 'Xóa lợi ích thất bại!', error });
        });
    }
    else {
        redirectToIndexPage(res);
    }
});

module.exports = Object.freeze(router);