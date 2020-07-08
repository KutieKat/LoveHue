const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { ajax, returnErrorResponse, returnSuccessResponse } = require('../admin/utilities.js');
const { getRelativeTimeString } = require('./utilities');

const PostCategory = require('../../models/PostCategory');
const Post = require('../../models/Post');

router.get('/:seo_slug', async (req, res, next) => {
    const allPostCategories = await PostCategory.find({ show_on_menu: 1, is_active: 1 });
    const postToFind = await Post.findOne({ seo_slug: req.params.seo_slug, is_active: 1 }).populate('post_category author');
    const postsToFind = await Post.find({ _id: { $ne: postToFind['_id'] }, title: { $in: postToFind['tags'] } }).populate('post_category author');
    const currentPosts = await Post.find({ is_active: 1, post_category: postToFind['post_category']['_id'] }).populate('post_category').sort({ createdAt: -1 }).limit(3);
    const featuredPosts = await Post.find({ is_active: 1, is_hot: 1, post_category: postToFind['post_category']['_id'] }).populate('post_category').sort({ updatedAt: -1 }).limit(2);
    const mostReadPosts = await Post.find({ is_active: 1, post_category: postToFind['post_category']['_id'] }).populate('post_category').sort({ views: -1 }).limit(2);
    const addOneNewView = await Post.findOneAndUpdate({ seo_slug: req.params.seo_slug }, { $inc: { views: 1 } }, { new: true });

    if (postToFind) {
        if (ajax(req)) {
            Post.paginate({ 
                _id: { $ne: postToFind['_id'] },
                post_category: postToFind['post_category']['_id'],
                is_active: 1
            },
            {
                sort: [[ 'createdAt', -1 ]],
                page: req.query.page,
                populate: 'post_category'
            }).then(data => {
                returnSuccessResponse(res, { message: 'Lấy danh sách các bài viết cùng chuyên mục thành công!', data });
            })
            .catch(error => {
                console.log(error);
                returnErrorResponse(res, { message: 'Lấy danh sách các bài viết cùng chuyên mục thất bại!', error });
            });
        }
        else {
            res.render('home/pages/post', {
                active_category: postToFind['post_category']['seo_slug'],
                post_categories: allPostCategories,
                page_title: postToFind.title,
                post: postToFind,
                is_post: true,
                urlToShare: `http://localhost:3000/bai-viet/${ postToFind['seo_slug'] }`,
                getRelativeTimeString,
                current_posts: currentPosts,
                featured_posts: featuredPosts,
                most_read_posts: mostReadPosts,
                title_related_posts: postsToFind
            });
        }
    }
    else {
        res.render('home/pages/404', {
            user: req.user,
            post_categories: allPostCategories
        });
    }
});

module.exports = router;