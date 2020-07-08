(() => {
    const BASE_API_URL = '/bang-dieu-khien/nguoi-dung';
    const REFRESH_DELAYING_TIME = 500;
    const SEARCH_DEBOUNCING_TIME = 500;
    const ID_COLUMN_TEXT_COLOR = '#ef8157';

    const state = {
        keyword: '',
        role: -1,
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
        if (state['role'] !== -1)
            queryObj['role'] = state['role'];
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
                const { _id, username, email, createdAt, updatedAt, role, is_active, is_restricted } = document;
    
                html += `
                    <td>${ username }</td>
                    <td>${ email }</td>
                    <td>${ formatDateString(createdAt) }</td>
                    <td>${ formatDateString(updatedAt) }</td>
                    <td>${ ['Người dùng', 'Quản trị viên', 'Biên tập viên'][parseInt(role)] }</td>
                    <td>${ ['Chưa hiển thị', 'Đã hiển thị'][parseInt(is_active)] }</td>
                `;

                if (is_restricted && is_restricted === true) {
                    html += `
                        <td style="max-width: 200px;">
                            <button class="btn btn-sm btn-primary btn-list-show btn-block" data-id=${ _id }>Xem</button>
                        </td>
                    `;
                }
                else {
                    html += `
                        <td style="max-width: 200px;">
                            <button class="btn btn-sm btn-primary btn-list-show" data-id=${ _id }>Xem</button>
                            <button class="btn btn-sm btn-warning btn-list-edit" data-id=${ _id }>Sửa</button>
                            <button class="btn btn-sm btn-danger btn-list-delete" data-id=${ _id }>Xóa</button>
                        </td>
                    `;
                }

                html = `<tr>${ html }</tr>`;
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

    $(`#addModal input, #editModal input`).focus(function() {
        $(this).removeClass('is-invalid');
    });

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
        const { _id, avatar_file_name, username, full_name, gender, date_of_birth, address, bio, email, phone, role, is_active, createdAt, updatedAt } = data;
        
        $('#showModalIcon').attr('src', avatar_file_name ? `/${ avatar_file_name }` : '/images/image-not-found.jpg');
        $('#showModalId').val(_id);
        $('#showModalUsername').val(username);
        $('#showModalFullName').val(full_name || '(Chưa có thông tin)');
        $('#showModalGender').val(gender);
        $('#editModalDateOfBirth').val(formatDateString(date_of_birth) || '(Chưa có thông tin)');
        $('#showModalAddress').val(address || '(Chưa có thông tin)');
        $('#showModalBio').val(bio || '(Chưa có thông tin)');
        $('#showModalEmail').val(email);
        $('#showModalPhone').val(phone || '(Chưa có thông tin)');
        $('#showModalCreatedAt').val(formatDateString(createdAt));
        $('#showModalUpdatedAt').val(formatDateString(updatedAt));
        $('#showModalRole').val(role);
        $('#showModalIsActive').val(is_active);
    }

    function populateEditModalWithData(data) {
        const { _id, avatar_file_name, username, full_name, gender, date_of_birth, address, bio, email, phone, role, is_active, createdAt, updatedAt } = data;
        
        $('#editModal form').attr('action', `${ BASE_API_URL }/${ _id }`);
        $('#editModalIcon').attr('src', avatar_file_name ? `/${ avatar_file_name }` : '/images/image-not-found.jpg');
        $('#editModalId').val(_id);
        $('#editModalUsername').val(username);
        $('#editModalFullName').val(full_name || '(Chưa có thông tin)');
        $('#editModalGender').val(gender);
        $('#editModalDateOfBirth').val(formatDateString(date_of_birth) || '(Chưa có thông tin)');
        $('#editModalAddress').val(address || '(Chưa có thông tin)');
        $('#editModalBio').val(bio || '(Chưa có thông tin)');
        $('#editModalEmail').val(email);
        $('#editModalPhone').val(phone || '(Chưa có thông tin)');
        $('#editModalCreatedAt').val(formatDateString(createdAt));
        $('#editModalUpdatedAt').val(formatDateString(updatedAt));
        $('#editModalRole').val(role);
        $('#editModalIsActive').val(is_active);
    }

    function populateDeleteModalWithData(data) {
        const { _id, username } = data;

        $('#deleteModalId').text(_id);
        $('#deleteModalUsername').text(username);
    }

    function resetAddModalData() {
        $('#addModal input').removeClass('is-invalid');
        $('#addModalUsername').val('');
        $('#addModalEmail').val('');
        $('#addModalPassword').val('');
        $('#addModalPasswordConfirmation').val('');
        $('#addModalRole').val(0);
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

    $('#select-list-role').on('change', function(e) {
        state['role'] = parseInt(e.target.value);
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
            state['role'] = -1,
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