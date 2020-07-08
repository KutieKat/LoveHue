const express = require('express');
const router = express.Router();
const { ajax, createQueryObj, returnErrorResponse, returnSuccessResponse } = require('./utilities');
const validator = require('../../helpers/validator');
const mongoose = require('mongoose');
const PostCategory = require('../../models/PostCategory');
const Post = require('../../models/Post');

router.get('/', async (req, res, next) => {
    if (ajax(req)) {
        const searchableFields = ['title', 'seo_slug'];
        const sort_field = req.query.sort_field || 'createdAt';
        const sort_value = parseInt(req.query.sort_value) || -1;
        const page = parseInt(req.query.page) || 1;
        const page_size = parseInt(req.query.page_size) || 10;

        Post
        .paginate(createQueryObj(req, searchableFields), {
            sort: [[ sort_field, sort_value ]],
            page: page,
            limit: page_size,
            populate: 'post_category'
        })
        .then(data => {
            returnSuccessResponse(res, { message: 'Lấy danh sách tất cả các bài viết thành công!', data });
        })
        .catch(error => {
            console.log(error);
            returnErrorResponse(res, { message: 'Lấy danh sách tất cả các bài viết thất bại!', error });
        });
    }
    else {
        renderIndexPage(req, res);
    }
});

router.get('/:id', (req, res, next) => {
    if (ajax(req)) {
        const id = req.params.id;

        Post.findById(id).then(data => {
            returnSuccessResponse(res, { message: 'Lấy thông tin của bài viết thành công!', data });
        }).catch(error => {
            console.log(error);
            returnErrorResponse(res, { message: 'Lấy thông tin của bài viết thất bại!', error });
        });
    }
    else {
        redirectToIndexPage(res);
    }
});

const validateUserData = async (req, res, checkForDuplication = true) => {
    const { title, seo_slug, content } = req.body;
    const errors = [];
    let documentWithSameSeoSlug = null;

    if (checkForDuplication) {
        documentWithSameSeoSlug = await Post.findOne({ seo_slug: { $eq: seo_slug } });
    }

    if (validator.empty(title))
        errors.push({ field_name: 'title', message: 'Tiêu đề của bài viết là bắt buộc và không được bỏ trống!' });
    if (validator.empty(seo_slug))
        errors.push({ field_name: 'seo_slug', message: 'SEO slug của bài viết là bắt buộc và không được bỏ trống!' });
    if (validator.containsBlankSpace(seo_slug))
        errors.push({ field_name: 'seo_slug', message: 'Bạn chỉ được sử dụng dấu gạch ngang để phân tách các từ trong SEO slug thay vì sử dụng khoảng trắng!' });
    if (validator.containsSpecialCharacters(seo_slug))
        errors.push({ field_name: 'seo_slug', message: 'Ngoài dấu gạch ngang, bạn không được sử dụng bất kì ký tự đặc biệt nào khác trong SEO slug!' });
    if (checkForDuplication && documentWithSameSeoSlug !== null)
        errors.push({ field_name: 'seo_slug', message: 'SEO slug đã bị trùng, vui lòng thử SEO slug khác!' });

    return errors;
}

router.post('/', upload.single('thumbnail_image_file'), async (req, res, next) => {
    if (ajax(req)) {
        const errors = await validateUserData(req, res);

        if (errors.length > 0) {
            console.log(errors);
            returnErrorResponse(res, { message: 'Thêm bài viết mới thất bại!', error: errors });
        } else {
            addNewDocument(req, res);
        }
    }
    else {
        redirectToIndexPage(res);
    }
});

router.put('/:id', upload.single('thumbnail_image_file'), async (req, res, next) => {
    if (ajax(req)) {
        const id = req.params.id;
        const currentDocument = await Post.findOne({ _id: id });
        const errors = await validateUserData(req, res, req.body.seo_slug !== currentDocument.seo_slug);

        if (errors.length > 0) {
            console.log(errors);
            returnErrorResponse(res, { message: 'Cập nhật thông tin của bài viết thất bại!', error: errors });
        } 
        else {
            const currentDocument = await Post.findById(id);
            let thumbnail_image_file_name = currentDocument.thumbnail_image_file_name;

            if (req.file) {
                thumbnail_image_file_name = req.file.filename;
            }

            if (parseInt(req.body.is_deleted) === 1) {
                thumbnail_image_file_name= '';
            }

            const newDocument = {
                title: req.body.title,
                seo_slug: req.body.seo_slug,
                summary: req.body.summary,
                content: req.body.content,
                post_category: mongoose.Types.ObjectId(req.body.post_category),
                author: req.body.author,
                tags: req.body.tags.split(',').map(tag => tag.trim()),
                source: req.body.source,
                thumbnail_image_file_name: thumbnail_image_file_name,
                is_hot: req.body.is_hot,
                is_active: req.body.is_active
            };

            Post.findByIdAndUpdate(id, newDocument).then(data => {
                returnSuccessResponse(res, { message: 'Cập nhật thông tin của bài viết thành công!', data });
            })
            .catch(error => {
                console.log(error);
                returnErrorResponse(res, { message: 'Cập nhật thông tin của bài viết thất bại!', error });
            });
        }
    }
    else {
        redirectToIndexPage(res);
    }
});

function renderIndexPage(req, res) {
    res.render('admin/pages/posts/index', { 
        user: req.user,
        page_name: 'posts'
    });
}

function redirectToIndexPage(res) {
    res.redirect('/bang-dieu-khien/bai-viet');
}

function addNewDocument(req, res) {
    const newDocument = new Post({
        title: req.body.title,
        seo_slug: req.body.seo_slug,
        summary: req.body.summary,
        content: req.body.content,
        post_category: mongoose.Types.ObjectId(req.body.post_category),
        author: req.body.author,
        tags: req.body.tags.split(',').map(tag => tag.trim()),
        source: req.body.source,
        thumbnail_image_file_name: (req.file && req.file.filename) || '',
        is_hot: req.body.is_hot,
        is_active: req.body.is_active
    });

    newDocument
    .save()
    .then(data => {
        returnSuccessResponse(res, { message: 'Thêm bài viết mới thành công!', data });
    })
    .catch(error => {
        console.log(error);
        returnErrorResponse(res, { message: 'Thêm bài viết mới thất bại!', error });
    });
}

router.delete('/:id', (req, res, next) => {
    if (ajax(req)) {
        const id = req.params.id;

        Post.findByIdAndDelete(id).then(data => {
            returnSuccessResponse(res, { message: 'Xóa bài viết thành công!', data });
        })
        .catch(error => {
            console.log(error);
            returnErrorResponse(res, { message: 'Xóa bài viết thất bại!', error });
        });
    }
    else {
        redirectToIndexPage(res);
    }
});

module.exports = Object.freeze(router);