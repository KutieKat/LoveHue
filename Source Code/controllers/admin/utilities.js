const ajax = (req) => {
    return req.xhr;
}

const createQueryObj = (req, searchableFields = []) => {
    const queryObj = { $or: [] };
    const keyword = req['query']['keyword'] || '';
    const is_active = req['query']['is_active'] || -1;
    const show_on_menu = req['query']['show_on_menu'] || -1;
    const is_hot = req['query']['is_hot'] || -1;
    const role = req['query']['role'] || -1;

    searchableFields.forEach(field => {
        const searchableField = {};
        searchableField[field] = { $regex: keyword, $options: 'i' };
        queryObj['$or'].push(searchableField);
    });

    if (is_active !== -1) {
        queryObj['is_active'] = is_active;
    }

    if (show_on_menu !== -1) {
        queryObj['show_on_menu'] = show_on_menu;
    }

    if (is_hot !== -1) {
        queryObj['is_hot'] = is_hot;
    }

    if (role !== -1) {
        queryObj['role'] = role;
    }

    return queryObj;
};

const returnSuccessResponse = (res, { message = '', data = null }) => {
    const response = { status: 'SUCCESS' };

    if (message !== '') {
        response['message'] = message;
    }
    if (data !== null) {
        response['data'] = data;
    }

    res.status(200).json(response);
};

const returnErrorResponse = (res, { message = '', error = null }) => {
    const response = { status: 'ERROR' };

    if (message !== '') {
        response['message'] = message;
    }
    if (error !== null) {
        response['error'] = error;
    }

    res.status(500).json(response);
};

module.exports = Object.freeze({
    ajax,
    createQueryObj,
    returnSuccessResponse,
    returnErrorResponse
});