const express = require('express');
const router = express.Router();
const { getRelativeTimeString } = require('./utilities.js');
const { HOST_NAME, PORT } = require('../../config/secret');
const sm = require('sitemap');

const PostCategory = require('../../models/PostCategory');
const Benefit = require('../../models/Benefit');
const Settings = require('../../models/Settings');
const Post = require('../../models/Post');

router.get('/', async (req, res, next) => {
    const allPostCategories = await PostCategory.find({ show_on_menu: 1, is_active: 1 });
    const allBenefits = await Benefit.find({ is_active: 1 });
    const allSettings = await Settings.findOne();
    const currentPosts = await Post.find({ is_active: 1 }).populate('post_category').sort({ createdAt: -1 }).limit(3);
    const featuredPosts = await Post.find({ is_active: 1, is_hot: 1 }).populate('post_category').sort({ updatedAt: -1 }).limit(2);
    const mostReadPosts = await Post.find({ is_active: 1 }).populate('post_category').sort({ views: -1 }).limit(2);
    const categories = await PostCategory.find({ is_active: 1 });

    let sections = [];

    for(let i = 0; i < categories.length; i++) {
        const { _id, name, seo_slug } = categories[i];
        const posts = await Post.find({ post_category: _id, is_active: 1 }).sort({ createdAt: -1 });

        if (posts.length > 0) {
            sections.push({ name, seo_slug, posts });
        }
    }

    res.render('home/pages/index', {
        user: req.user,
        active_category: req.params.seo_slug,
        post_categories: allPostCategories,
        benefits: allBenefits,
        settings: allSettings,
        current_posts: currentPosts,
        featured_posts: featuredPosts,
        most_read_posts: mostReadPosts,
        is_home: true,
        getRelativeTimeString,
        sections
    });
});

router.get('/moi-nhat', async (req, res, next) => {
    const allPostCategories = await PostCategory.find({ show_on_menu: 1, is_active: 1 });
    const allSettings = await Settings.findOne();

    res.render('home/pages/index-current-posts', {
        recentPosts: recentPosts,
        page_title: `Các bài viết mới nhất - LoveHue`,
        user: req.user,
        active_category: req.params.seo_slug,
        post_categories: allPostCategories,
        settings: allSettings,
    });
});

router.get('/noi-bat', async (req, res, next) => {
    const allPostCategories = await PostCategory.find({ show_on_menu: 1, is_active: 1 });
    const allSettings = await Settings.findOne();

    res.render('home/pages/index-featured-posts', {
        recentPosts: recentPosts,
        page_title: `Các bài viết nổi bật - LoveHue`,
        user: req.user,
        active_category: req.params.seo_slug,
        post_categories: allPostCategories,
        settings: allSettings,
    });
});

router.get('/doc-nhieu', async (req, res, next) => {
    const allPostCategories = await PostCategory.find({ show_on_menu: 1, is_active: 1 });
    const allSettings = await Settings.findOne();
    
    res.render('home/pages/index-most-read-posts', {
        recentPosts: recentPosts,
        page_title: `Các bài viết được đọc nhiều - LoveHue`,
        user: req.user,
        active_category: req.params.seo_slug,
        post_categories: allPostCategories,
        settings: allSettings,
    });
});

// router.use('/tai-khoan', require('./accounts'));
router.use('/chuyen-muc', require('./post-categories'));
router.use('/tim-kiem', require('./search'));
router.use('/bai-viet', require('./posts'));
router.use('/the', require('./tag'));
router.get('/sitemap.xml', async (req, res, next) => {
    let allPostCategories = await PostCategory.find({ is_active: 1 });
    let allPosts = await Post.find({ is_active: 1 });
    let allPostCategoriesChildren = [];

    allPostCategories = allPostCategories.map(category => {
        const children = ['moi-nhat', 'noi-bat', 'doc-nhieu'];

        children.forEach(child => {
            allPostCategoriesChildren.push({
                url: `/${ category['seo_slug'] }/${ child }`
            });
        });

        return {
            url: `/${ category['seo_slug'] }`
        }
    });

    allPosts = allPosts.map(post => {
        return {
            url: `/${ post['seo_slug'] }`
        }
    });

    const sitemap = sm.createSitemap({
        hostname: `${ HOST_NAME }:${ PORT }`,
        urls: [
            { url: '/' },
            { url: '/moi-nhat' },
            { url: '/noi-bat' },
            { url: '/doc-nhieu' },
            { url: '/chuyen-muc' },
            ...allPostCategories,
            ...allPosts,
            ...allPostCategoriesChildren
        ]
    });

    sitemap.toXML( function (err, xml) {
        if (err) {
          return res.status(500).end();
        }
        res.header('Content-Type', 'application/xml');
        res.send(xml);
    });
});


module.exports = router;