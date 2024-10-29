(function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) { return; }
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/messenger.Extensions.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'Messenger'));

window.extAsyncInit = function () {
    MessengerExtensions.getContext('1065655205124699',
        function success(thread_context) {
            $("#psid").val(thread_context.psid);
            handleClickButtonBooking();
        },
        function error(err) {
            console.log('Lỗi đặt lịch khám bệnh chatbot', err);
            $("#psid").val(senderId);
            handleClickButtonBooking();
        }
    );
};

function validateInputFields() {
    const EMAIL_REG = /[a-zA-Z][a-zA-Z0-9_\.]{1,32}@[a-z0-9]{2,}(\.[a-z0-9]{2,4}){1,2}/g;

    let email = $("#email");
    let phoneNumber = $("#phoneNumber");
    let address = $("#address");
    let birthYear = $("#birthYear");
    let gender = $("#gender");
    let reason = $("#reason");

    if (!email.val().match(EMAIL_REG)) {
        email.addClass("is-invalid");
        return true;
    } else {
        email.removeClass("is-invalid");
    }

    if (phoneNumber.val() === "") {
        phoneNumber.addClass("is-invalid");
        return true;
    } else {
        phoneNumber.removeClass("is-invalid");
    }
    if (address.val().trim() === "") {
        address.addClass("is-invalid");
        return true;
    } else {
        address.removeClass("is-invalid");
    }
    const currentYear = new Date().getFullYear();
    if (birthYear.val() === "" || isNaN(birthYear.val()) || birthYear.val() < 1900 || birthYear.val() > currentYear) {
        birthYear.addClass("is-invalid");
        return true;
    } else {
        birthYear.removeClass("is-invalid");
    }

    if (gender.val() === "") {
        gender.addClass("is-invalid");
        return true;
    } else {
        gender.removeClass("is-invalid");
    }

    if (reason.val().trim() === "") {
        reason.addClass("is-invalid");
        return true;
    } else {
        reason.removeClass("is-invalid");
    }

    return false;
}


function handleClickButtonBooking() {
    $("#btnBooking").on("click", function (e) {
        let check = validateInputFields();

        let data = {
            psid: $("#psid").val(),
            customerName: $("#customerName").val(),
            email: $("#email").val(),
            phoneNumber: $("#phoneNumber").val(),
            address: $("#address").val(),
            birthYear: $("#birthYear").val(),
            gender: $("#gender").val(),
            reason: $("#reason").val()
        };

        if (!check) {
            $.ajax({
                url: `${window.location.origin}/booking-ajax`,
                method: "POST",
                data: data,
                success: function (response) {
                    console.log(response);

                    $('#customerInfor').css("display", "none");
                    $('#handleError').css("display", "block");

                    MessengerExtensions.requestCloseBrowser(
                        function success() {
                            console.log("Webview closed successfully.");
                        },
                        function error(err) {
                            console.log(err);
                        }
                    );
                },
                error: function (error) {
                    console.log(error);
                    $('#customerInfor').css("display", "none");
                    $('#handleError').css("display", "block");
                }
            });
        }
    });
}


function callAjax(data) {
    $.ajax({
        url: `${window.location.origin}/booking-ajax`,
        method: "POST",
        data: data,
        success: function (data) {
            console.log(data);
        },
        error: function (error) {
            console.log(error);
        }
    })
}