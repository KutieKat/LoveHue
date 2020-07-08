module.exports = Object.freeze({
    ensureAuthenticated: (req, res, next) => {
        if (req.isAuthenticated())
            return next();
        
        req.flash('error_msg', 'Bạn phải đăng nhập trước');
        req.session.returnTo = req.originalUrl;
        res.redirect('/tai-khoan/dang-nhap');
    },
    forwardAuthenticated: (req, res, next) => {
        if (!req.isAuthenticated())
            return next();

        res.redirect('/');
    }
});