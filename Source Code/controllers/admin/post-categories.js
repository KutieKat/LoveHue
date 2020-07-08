const express = require('express');
const router = express.Router();
const { ajax, createQueryObj, returnErrorResponse, returnSuccessResponse } = require('./utilities');
const validator = require('../../helpers/validator');
const PostCategory = require('../../models/PostCategory');

router.get('/', (req, res, next) => {
    if (ajax(req)) {
        if (!req.query.no_limit) {
            const searchableFields = ['name', 'seo_slug'];
            const sort_field = req.query.sort_field || 'createdAt';
            const sort_value = parseInt(req.query.sort_value) || -1;
            const page = parseInt(req.query.page) || 1;
            const page_size = parseInt(req.query.page_size) || 10;
    
            PostCategory.paginate(createQueryObj(req, searchableFields), {
                sort: [[ sort_field, sort_value ]],
                page: page,
                limit: page_size
            }).then(data => {
                returnSuccessResponse(res, { message: 'Lấy danh sách tất cả các chuyên mục bài viết thành công!', data });
            })
            .catch(error => {
                console.log(error);
                returnErrorResponse(res, { message: 'Lấy danh sách tất cả các chuyên mục bài viết thất bại!', error });
            });
        } else {
            PostCategory
            .find({ is_active: 1 })
            .then(data => {
                returnSuccessResponse(res, { message: 'Lấy danh sách tất cả các chuyên mục bài viết thành công!', data });
            })
            .catch(error => {
                console.log(error);
                returnErrorResponse(res, { message: 'Lấy danh sách tất cả các chuyên mục bài viết thất bại!', error });
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

        PostCategory.findById(id).then(data => {
            returnSuccessResponse(res, { message: 'Lấy thông tin của chuyên mục bài viết thành công!', data });
        }).catch(error => {
            console.log(error);
            returnErrorResponse(res, { message: 'Lấy thông tin của chuyên mục bài viết thất bại!', error });
        });
    }
    else {
        redirectToIndexPage(res);
    }
});

const validateUserData = async (req, res, checkForDuplication = true) => {
    const { name, seo_slug } = req.body;
    const errors = [];
    let documentWithSameSeoSlug = null;

    if (checkForDuplication) {
        documentWithSameSeoSlug = await PostCategory.findOne({ seo_slug: { $eq: seo_slug } });
    }

    if (validator.empty(name))
        errors.push({ field_name: 'name', message: 'Tên của chuyên mục bài viết là bắt buộc và không được bỏ trống!' });
    if (validator.empty(seo_slug))
        errors.push({ field_name: 'seo_slug', message: 'SEO slug của chuyên mục bài viết là bắt buộc và không được bỏ trống!' });
    if (validator.containsBlankSpace(seo_slug))
        errors.push({ field_name: 'seo_slug', message: 'Bạn chỉ được sử dụng dấu gạch ngang để phân tách các từ trong SEO slug thay vì sử dụng khoảng trắng!' });
    if (validator.containsSpecialCharacters(seo_slug))
        errors.push({ field_name: 'seo_slug', message: 'Ngoài dấu gạch ngang, bạn không được sử dụng bất kì ký tự đặc biệt nào khác trong SEO slug!' });
    if (checkForDuplication && documentWithSameSeoSlug !== null)
        errors.push({ field_name: 'seo_slug', message: 'SEO slug đã bị trùng, vui lòng thử SEO slug khác!' });

    return errors;
}

router.post('/', async (req, res, next) => {
    if (ajax(req)) {
        const errors = await validateUserData(req, res);

        if (errors.length > 0) {
            console.log(errors);
            returnErrorResponse(res, { message: 'Thêm chuyên mục bài viết mới thất bại!', error: errors });
        } else {
            addNewDocument(req, res);
        }
    }
    else {
        redirectToIndexPage(res);
    }
});

router.put('/:id', async (req, res, next) => {
    if (ajax(req)) {
        const id = req.params.id;
        const currentDocument = await PostCategory.findOne({ _id: id });
        const errors = await validateUserData(req, res, req.body.seo_slug !== currentDocument.seo_slug);

        if (errors.length > 0) {
            console.log(errors);
            returnErrorResponse(res, { message: 'Cập nhật thông tin của chuyên mục bài viết thất bại!', error: errors });
        } 
        else {
            const newDocument = {
                name: req.body.name,
                seo_slug: req.body.seo_slug,
                description: req.body.description,
                show_on_menu: req.body.show_on_menu,
                is_active: req.body.is_active
            };

            PostCategory.findByIdAndUpdate(id, newDocument).then(data => {
                returnSuccessResponse(res, { message: 'Cập nhật thông tin của chuyên mục bài viết thành công!', data });
            })
            .catch(error => {
                console.log(error);
                returnErrorResponse(res, { message: 'Cập nhật thông tin của chuyên mục bài viết thất bại!', error });
            });
        }
    }
    else {
        redirectToIndexPage(res);
    }
});

function renderIndexPage(req, res) {
    res.render('admin/pages/post-categories/index', { 
        user: req.user,
        page_name: 'post-categories'
    });
}

function redirectToIndexPage(res) {
    res.redirect('/bang-dieu-khien/chuyen-muc');
}

function addNewDocument(req, res) {
    const newDocument = new PostCategory({
        name: req.body.name,
        seo_slug: req.body.seo_slug,
        description: req.body.description,
        show_on_menu: req.body.show_on_menu,
        is_active: req.body.is_active
    });

    newDocument
    .save()
    .then(data => {
        returnSuccessResponse(res, { message: 'Thêm chuyên mục bài viết mới thành công!', data });
    })
    .catch(error => {
        console.log(error);
        returnErrorResponse(res, { message: 'Thêm chuyên mục bài viết mới thất bại!', error });
    });
}

router.delete('/:id', (req, res, next) => {
    if (ajax(req)) {
        const id = req.params.id;

        PostCategory.findByIdAndDelete(id).then(data => {
            returnSuccessResponse(res, { message: 'Xóa chuyên mục bài viết thành công!', data });
        })
        .catch(error => {
            console.log(error);
            returnErrorResponse(res, { message: 'Xóa chuyên mục bài viết thất bại!', error });
        });
    }
    else {
        redirectToIndexPage(res);
    }
});

module.exports = Object.freeze(router);