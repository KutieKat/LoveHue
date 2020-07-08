const express = require('express');
const router = express.Router();
const { ajax, returnErrorResponse, returnSuccessResponse } = require('../admin/utilities.js');
const { getRelativeTimeString } = require('./utilities');

const PostCategory = require('../../models/PostCategory');
const Post = require('../../models/Post');
const Settings = require('../../models/Settings');

router.get('/ajaxloadmore/:id', (req, res, next) => {
    if (ajax(req)) {
        Post.paginate({ post_category: req.params.id, is_active: 1 }, {
            sort: [[ 'createdAt', -1 ]],
            page: req.query.page,
            populate: 'post_category'
        }).then(data => {
            returnSuccessResponse(res, { message: 'Lấy danh sách các bài viết thành công!', data });
        })
        .catch(error => {
            console.log(error);
            returnErrorResponse(res, { message: 'Lấy danh sách các bài viết thất bại!', error });
        });
    }
});

router.get('/:seo_slug', async (req, res, next) => {
    const allPostCategories = await PostCategory.find({ show_on_menu: 1, is_active: 1 });
    const allSettings = await Settings.findOne();
    const postCategoryToFind = await PostCategory.findOne({ seo_slug: req.params.seo_slug });
    const currentPosts = await Post.find({ is_active: 1, post_category: postCategoryToFind['_id'] }).populate('post_category').sort({ createdAt: -1 }).limit(3);
    const featuredPosts = await Post.find({ is_active: 1, is_hot: 1, post_category: postCategoryToFind['_id'] }).populate('post_category').sort({ updatedAt: -1 }).limit(2);
    const mostReadPosts = await Post.find({ is_active: 1, post_category: postCategoryToFind['_id'] }).populate('post_category').sort({ views: -1 }).limit(2);
    const concernedPosts = await Post.find({ is_active: 1 }).sort({ createdAt: -1 }).limit(5);
    // const allPosts = await Post.find({  })
    
    if (postCategoryToFind) {
        // if (ajax(req)) {
            
        // }
        // else {
            res.render('home/pages/post-category', {
                page_title: `${ postCategoryToFind['name'] } -  ${ postCategoryToFind['description'] } - LoveHue`,
                user: req.user,
                active_category: req.params.seo_slug,
                active_category_id: postCategoryToFind['_id'],
                post_categories: allPostCategories,
                settings: allSettings,
                getRelativeTimeString,
                current_posts: currentPosts,
                featured_posts: featuredPosts,
                most_read_posts: mostReadPosts,
                concerned_posts: concernedPosts
            });
        // }
    }
    else {
        res.render('home/pages/404', {
            user: req.user,
            post_categories: allPostCategories
        });
    }
});

module.exports = router;