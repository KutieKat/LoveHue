(() => {
    const BASE_API_URL = '/bang-dieu-khien/chuyen-muc';
    const REFRESH_DELAYING_TIME = 500;
    const SEARCH_DEBOUNCING_TIME = 500;
    const ID_COLUMN_TEXT_COLOR = '#ef8157';

    const state = {
        keyword: '',
        show_on_menu: -1,
        is_active: -1,
        sort_field: 'createdAt',
        sort_value: -1,
        page: 1,
        page_size: 10
    };

    function queryUrlBuilder() {
        let queryObj = {};

        queryObj['sort_field'] = state['sort_field'];
        queryObj['sort_value'] = state['sort_value'];

        if (state['keyword'] !== '')
            queryObj['keyword'] = state['keyword'];
        if (state['show_on_menu'] !== -1)
            queryObj['show_on_menu'] = state['show_on_menu'];
        if (state['is_active'] !== -1)
            queryObj['is_active'] = state['is_active'];
        if (state['page'] > 1)
            queryObj['page'] = state['page'];
        if (state['page_size'] > 10)
            queryObj['page_size'] = state['page_size'];

        return `${ BASE_API_URL }?${ parseQueryObj(queryObj) }`;
    }

    function parseQueryObj(queryObj) {
        let queryString = '';
        const keys = Object.keys(queryObj);

        for (const key of keys) {
            queryString += `${ key.trim() }=${ queryObj[key] }&`;
        }

        return queryString;
    }

    function fetchPostCategories() {
        $.ajax({
            url: queryUrlBuilder()
        }).done(function(response) {
            const { docs, total, page, limit } = response.data;

            $('.post-categories-data-table').html(renderCollection(docs));
            $('#pagination-container').bootpag({ total: Math.ceil(total / limit), page });

            showMessage(response);
        }).fail(function(response) {
            $(`#errorModal`).modal();
        });
    }

    function showMessage(response) {
        const { total } = response.data;
        let message = '';

        if (state['keyword'] !== '') {
            if (total > 0) {
                message = `Tìm thấy ${ total } kết quả trùng khớp với từ khóa <strong>${ state['keyword'] }</strong>`
            }
            else {
                message = `Không tìm thấy kết quả nào trùng khớp với từ khóa <strong>${ state['keyword'] }</strong>`
            }
        }
        else {
            message = `Có tất cả ${ total } kết quả trong danh sách`;
        }

        $('#list-message').html(message);
    }

    function formatDateString(dateString) {
        return moment(dateString).format('DD/MM/YYYY, HH:mm:ss');
    }

    function renderCollection(collectionToRender) {
        let html = '';

        if (collectionToRender.length > 0) {
            collectionToRender.forEach(document => {
                const { _id, name, seo_slug, createdAt, updatedAt, show_on_menu, is_active } = document;
    
                html += `
                    <tr>
                        <td style="font-weight: bold; color: ${ ID_COLUMN_TEXT_COLOR };">${ _id }</td>
                        <td>${ name }</td>
                        <td>${ seo_slug }</td>
                        <td>${ formatDateString(createdAt) }</td>
                        <td>${ formatDateString(updatedAt) }</td>
                        <td>${ ['Không hiển thị', 'Có hiển thị'][parseInt(show_on_menu)] }</td>
                        <td>${ ['Chưa hiển thị', 'Đã hiển thị'][parseInt(is_active)] }</td>
                        <td style="max-width: 200px;">
                            <button class="btn btn-sm btn-primary btn-list-show" data-id=${ _id }>Xem</button>
                            <button class="btn btn-sm btn-warning btn-list-edit" data-id=${ _id }>Sửa</button>
                            <button class="btn btn-sm btn-danger btn-list-delete" data-id=${ _id }>Xóa</button>
                        </td>
                    </tr>
                `;
            });
        }
        else {
            html = `
                <tr class="text-center">
                    <td colspan="7">Chưa có dữ liệu!</td>
                </tr>
            `;
        }

        return html;
    }

    $('body').on('click', '.btn-list-add', function() {
        resetAddModalData();
        $('#addModal').modal();
    });

    $('body').on('click', '.btn-list-refresh', function() {
        refresh();
    });
    
    $('body').on('click', '.btn-list-show', function() {
        const id = $(this).data('id');

        $.ajax({
            url: `${ BASE_API_URL }/${ id }`
        }).done(function(response) {
            populateShowModalWithData(response.data);
            $(`#showModal`).modal();
        }).fail(function(response) {
            $(`#errorModal`).modal();
        });
    });

    $('body').on('click', '.pagination li', function(e) {
        const pageNumber = $(this).data('lp');
        state['page'] = pageNumber;

        fetchPostCategories();
    });

    $('#addModal form').on('submit', function(e) {
        e.preventDefault();
        $(this).ajaxSubmit({
            success: function(response) {
                fetchPostCategories();
                closeModal(`#addModal`);
            },
            error: function(response) {
                response.responseJSON && response.responseJSON.error.forEach(error => {
                    $(`#addModal *[name=${ error.field_name }]`).addClass('is-invalid');
                    $(`#addModal *[name=${ error.field_name }]`).next().text(error.message);
                });
            },
        })
    });

    $('#editModal form').on('submit', function(e) {
        e.preventDefault();
        $(this).ajaxSubmit({
            type: 'put',
            success: function(response) {
                fetchPostCategories();
                closeModal(`#editModal`);
            },
            error: function(response) {
                response.responseJSON && response.responseJSON.error.forEach(error => {
                    $(`#editModal *[name=${ error.field_name }]`).addClass('is-invalid');
                    $(`#editModal *[name=${ error.field_name }]`).next().text(error.message);
                });
            },
        })
    });

    $(`#addModal input, #addModal textarea, #editModal input, #editModal textarea`).focus(function() {
        $(this).removeClass('is-invalid');
    });

    $('#addModalName').on('keyup', function() {
        const value = $(this).val();
        $('#addModalSeoSlug').val(getSlugFromString(value));
    });

    $('#editModalName').on('keyup', function() {
        const value = $(this).val();
        $('#editModalSeoSlug').val(getSlugFromString(value));
    });

    function getSlugFromString(str) {
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
        str = str.replace(/đ/g, 'd');
        str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
        str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
        str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
        str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
        str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
        str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
        str = str.replace(/Đ/g, 'D');
        str = str.replace(/\s+/g, '-');
        str = str.replace(/[`~!@#$%^&*()_|+\=?;:'",.<>\{\}\[\]\\\/]/gi, '');
        str = str.toLowerCase();
        return str;
    }

    $('#addModalIcon').on('change', function() {
        if (typeof (FileReader) != 'undefined') {
            const image = $(`.image-uploader__image`);
            const reader = new FileReader();

            reader.onload = function (e) {
                image.attr('src', e.target.result);
                $('.image-uploader__delete-button').show();
                $('.image-uploader__deletion-flag').val(0);
            }
            reader.readAsDataURL($(this)[0].files[0]);
        } else {
            console.error('This browser does not support FileReader!');
        }
    });

    $('#editModalIcon').on('change', function() {
        if (typeof (FileReader) != 'undefined') {
            const image = $(`.image-uploader__image`);
            const reader = new FileReader();

            reader.onload = function (e) {
                image.attr('src', e.target.result);
                $('.image-uploader__delete-button').show();
                $('.image-uploader__deletion-flag').val(0);
            }
            reader.readAsDataURL($(this)[0].files[0]);
        } else {
            console.error('This browser does not support FileReader!');
        }
    });

    $('.image-uploader__delete-button').on('click', function() {
        $('.image-uploader__image').attr('src', '/images/image-not-found.jpg');
        $('#addModalIcon').val(null);
        $('#editModalIcon').val(null);
        $('.image-uploader__deletion-flag').val(1);
        $('.image-uploader__delete-button').hide();
    });

    function populateShowModalWithData(data) {
        const { _id, name, seo_slug, description = 'Chưa có nội dung', icon_file_name, createdAt, updatedAt, is_active, show_on_menu } = data;
        
        $('#showModalIcon').attr('src', icon_file_name ? `/${ icon_file_name }` : '/images/image-not-found.jpg');
        $('#showModalId').val(_id);
        $('#showModalName').val(name);
        $('#showModalSeoSlug').val(seo_slug);
        $('#showModalDescription').val(description);
        $('#showModalCreatedAt').val(formatDateString(createdAt));
        $('#showModalUpdatedAt').val(formatDateString(updatedAt));
        $('#showModalIsActive').val(is_active);
        $('#showModalShowOnMenu').val(show_on_menu);
    }

    function populateEditModalWithData(data) {
        const { _id, name, seo_slug, description, icon_file_name, createdAt, updatedAt, show_on_menu, is_active } = data;

        $('#editModal input, #editModal textarea').removeClass('is-invalid');
        $('#editModal form').attr('action', `${ BASE_API_URL }/${ _id }`);
        $('.image-uploader__image').attr('src', icon_file_name ? `/${ icon_file_name }` : '/images/image-not-found.jpg');
        icon_file_name ? $('.image-uploader__delete-button').show() : $('.image-uploader__delete-button').hide();
        $('.image-uploader__deletion-flag').val(0);
        $('#editModalId').val(_id);
        $('#editModalName').val(name);
        $('#editModalSeoSlug').val(seo_slug);
        $('#editModalDescription').val(description);
        $('#editModalCreatedAt').val(formatDateString(createdAt));
        $('#editModalUpdatedAt').val(formatDateString(updatedAt));
        $('#editModalIsActive').val(is_active);
        $('#showModalShowOnMenu').val(show_on_menu);
    }

    function populateDeleteModalWithData(data) {
        const { _id, name } = data;

        $('#deleteModalId').text(_id);
        $('#deleteModalName').text(name);
    }

    function resetAddModalData() {
        $('#addModal input, #addModal textarea').removeClass('is-invalid');
        $('.image-uploader__image').attr('src', '/images/image-not-found.jpg');
        $('#addModalIcon').val(null);
        $('.image-uploader__delete-button').hide();
        $('#addModalName').val('');
        $('#addModalSeoSlug').val('');
        $('#addModalIsActive').val(0);
        $('#addModalDescription').val('');
        $('#addModalShowOnMenu').val(0);
    }

    $('body').on('click', '.btn-list-edit', function() {
        const id = $(this).data('id');

        $.ajax({
            url: `${ BASE_API_URL }/${ id }`
        }).done(function(response) {
            populateEditModalWithData(response.data);
            $(`#editModal`).modal();
        }).fail(function(response) {
            $(`#errorModal`).modal();
        });
    });

    $('body').on('click', '.btn-list-delete', function() {
        const id = $(this).data('id');

        $.ajax({
            url: `${ BASE_API_URL }/${ id }`
        }).done(function(response) {
            populateDeleteModalWithData(response.data);
            $(`#deleteModal`).modal();
        }).fail(function(response) {
            $(`#errorModal`).modal();
        });
    });

    $('body').on('click', '.btn-modal-delete', function() {
        const id = $('#deleteModalId').text();

        $.ajax({
            url: `${ BASE_API_URL }/${ id }`,
            method: 'delete'
        }).done(function(response) {
            fetchPostCategories();
            closeModal(`#deleteModal`);
        }).fail(function(response) {
            closeModal(`#deleteModal`);
            $(`#errorModal`).modal();
        });
    });

    $('#editModalCloseButton').on('click', function() {
        $(`#editModal *[name]`).removeClass('is-invalid');
    });

    $('#addModalCloseButton').on('click', function() {
        $(`#addModal *[name]`).removeClass('is-invalid');
    });

    function debounce(fn, delay) {
        var timer = null;
        return function () {
          var context = this, args = arguments;
          clearTimeout(timer);
          timer = setTimeout(function () {
            fn.apply(context, args);
          }, delay);
        };
      }

    $('#txtKeyword').on('keyup', debounce(function(e) {
        state['keyword'] = e.target.value;
        fetchPostCategories();
    }, SEARCH_DEBOUNCING_TIME));

    $('#select-list-show-on-menu').on('change', function(e) {
        state['show_on_menu'] = parseInt(e.target.value);
        fetchPostCategories();
    });

    $('#select-list-is-active').on('change', function(e) {
        state['is_active'] = parseInt(e.target.value);
        fetchPostCategories();
    });

    $('#select-list-page-size').on('change', function(e) {
        state['page_size'] = parseInt(e.target.value);
        fetchPostCategories();
    });

    $('.btn-list-sort-column').on('click', function() {
        const sortField = $(this).data('sort_field');

        if (state['sort_field'] !== sortField) {
            state['sort_field'] = sortField;
            state['sort_value'] = -1;
        }
        else {
            state['sort_value'] = state['sort_value'] * -1;
        }

        changeColumnSortIcon();
    });

    function changeColumnSortIcon() {
        const activeColumn = $(document).find(`th[data-sort_field="${ state['sort_field'] }"] i`);
        const inactiveColumns = $(document).find(`th[data-sort_field!="${ state['sort_field'] }"] i`);

        activeColumn.removeClass('nc-sound-wave');
        activeColumn.parent().removeClass('text-danger');
        inactiveColumns.removeClass('nc-minimal-up').removeClass('nc-minimal-down').addClass('nc-sound-wave');
        inactiveColumns.parent().removeClass('text-danger');

        if (state['sort_value'] === 1) {
            activeColumn.removeClass('nc-minimal-up').addClass('nc-minimal-down');
            activeColumn.parent().addClass('text-danger');
        }
        else {
            activeColumn.removeClass('nc-minimal-down').addClass('nc-minimal-up');
            activeColumn.parent().addClass('text-danger');
        }

        fetchPostCategories();
    };

    function closeModal(modalSelector) {
        $(modalSelector).modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();
    }

    function refresh() {
        $('.post-categories-data-table').html(`
            <tr class="text-center">
                <td colspan="7">
                    <div><img src="/images/loading.gif" style="width: 50px; margin-top: 12pxp; margin-bottom: 6px;" /></div>
                    Đang tải lại danh sách, vui lòng chờ đợi trong giây lát...
                </td>
            </tr>
        `);

        setTimeout(() => {
            state['keyword'] = '';
            state['is_active'] = -1;
            state['sort_field'] = 'createdAt';
            state['sort_value'] = -1;
            state['page'] = 1;
            state['page_size'] = 10;

            changeColumnSortIcon();
        }, REFRESH_DELAYING_TIME);
    }

    (function initialize() {
        changeColumnSortIcon();
    })();
})();