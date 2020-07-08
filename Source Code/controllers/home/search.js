const express = require('express');
const router = express.Router();
const { ajax, createQueryObj, returnErrorResponse, returnSuccessResponse } = require('../admin/utilities');
const { getRelativeTimeString } = require('./utilities');

const PostCategory = require('../../models/PostCategory');
const Post = require('../../models/Post');

router.get('/', async (req, res, next) => {
    if (ajax(req)) {
        const regexExpression = { $regex: req.query['tu-khoa'], $options: 'i' }

        Post.paginate({ 
            $or: 
            [
                { title: regexExpression },
                { seo_slug: regexExpression },
                { summary: regexExpression },
                { content: regexExpression },
            ], is_active: 1 }, {
            sort: [[ 'createdAt', -1 ]],
            page: req.query.page,
            populate: 'post_category'
        }).then(data => {
            returnSuccessResponse(res, { message: 'Lấy danh sách các bài viết trùng khớp với từ khóa thành công!', data });
        })
        .catch(error => {
            console.log(error);
            returnErrorResponse(res, { message: 'Lấy danh sách các bài viết trùng khớp với từ khóa thất bại!', error });
        });
    }
    else {
        const allPostCategories = await PostCategory.find({ show_on_menu: 1, is_active: 1 });
        const currentPosts = await Post.find({ is_active: 1 }).populate('post_category').sort({ createdAt: -1 }).limit(3);
        const featuredPosts = await Post.find({ is_active: 1, is_hot: 1 }).populate('post_category').sort({ updatedAt: -1 }).limit(2);
        const mostReadPosts = await Post.find({ is_active: 1 }).populate('post_category').sort({ views: -1 }).limit(2);

        res.render('home/pages/search', {
            post_categories: allPostCategories,
            page_title: `Tìm kiếm bài viết - LoveHue`,
            keyword: req.query['tu-khoa'],
            results_count: 0,
            current_posts: currentPosts,
            featured_posts: featuredPosts,
            most_read_posts: mostReadPosts,
            getRelativeTimeString
        });
    }
});

module.exports = router;