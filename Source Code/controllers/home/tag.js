const express = require('express');
const router = express.Router();
const PostCategory = require('../../models/PostCategory');

router.get('/:seo_slug', async (req, res, next) => {
    const allPostCategories = await PostCategory.find({ show_on_menu: 1, is_active: 1 });
    const postCategoryToFind = await PostCategory.findOne({ seo_slug: req.params.seo_slug });
    
    if (postCategoryToFind) {
        res.render('home/pages/tag', {
            recentPosts: recentPosts,
            page_title: `${ postCategoryToFind['name'] } -  ${ postCategoryToFind['description'] } - LoveHue`,
            user: req.user,
            post_categories: allPostCategories
        });
    }
    else {
        res.render('home/pages/404', {
            user: req.user,
            post_categories: allPostCategories
        });
    }
});

module.exports = router;