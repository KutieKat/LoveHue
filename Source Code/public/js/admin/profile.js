(() => {
    const BASE_API_URL = '/bang-dieu-khien/ho-so';

    function formatDateString(dateString) {
        return moment(dateString).format('DD/MM/YYYY, HH:mm:ss');
    }

    function fetchUserProfile() {
        $.ajax({
            url: BASE_API_URL
        }).done(function(response) {
            populateShowModalWithData(response.data);
        }).fail(function(response) {
            $(`#errorModal`).modal();
        });
    }

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

    $(`#editModal input`).focus(function() {
        $(this).removeClass('is-invalid');
    });

    $('#editModalAvatar').on('change', function() {
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
        $('#editModalFullName').val(full_name);
        $('#editModalGender').val(gender);
        $('#editModalDateOfBirth').val(formatDateString(date_of_birth));
        $('#editModalAddress').val(address);
        $('#editModalBio').val(bio);
        $('#editModalEmail').val(email);
        $('#editModalPhone').val(phone);
        $('#editModalCreatedAt').val(formatDateString(createdAt));
        $('#editModalUpdatedAt').val(formatDateString(updatedAt));
        $('#editModalRole').val(role);
        $('#editModalIsActive').val(is_active);
    }

    $('body').on('click', '.btn-list-edit', function() {
        const id = $(this).data('id');

        $.ajax({
            url: BASE_API_URL
        }).done(function(response) {
            populateEditModalWithData(response.data);
            $(`#editModal`).modal();
        }).fail(function(response) {
            $(`#errorModal`).modal();
        });
    });

    $('#editModalCloseButton').on('click', function() {
        $(`#editModal *[name]`).removeClass('is-invalid');
    });

    function closeModal(modalSelector) {
        $(modalSelector).modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();
    }

    (function initialize() {
        fetchUserProfile();
    })();
})();