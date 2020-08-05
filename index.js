$(document).ready(function () {
    $("#use-auth").on("change", function () {
        $("#username").prop("disabled", !$(this).prop("checked"));
        $("#password").prop("disabled", !$(this).prop("checked"));
    });

    $("#method").on("change", function () {
        ($(this).val() === "GET")
            ? $("#body-p").addClass("d-none")
            : $("#body-p").removeClass("d-none");
    });

    $("form").on("submit", function (event) {
        event.preventDefault();

        const method = $("#method").val();
        const endpoint = $("#endpoint").val().trim();
        const useAuth = $("#use-auth").prop("checked");
        const requestBody = $("#request-body").val().trim();
        const hasBody = (requestBody.length > 0);

        let ajaxParams = {
            type: method,
            url: encodeURI(endpoint),
            beforeSend: function (xhr) {
                if (useAuth) {
                    const username = $("#username").val().trim();
                    const password = $("#password").val().trim();

                    xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
                }
            }
        };

        if (method === "POST" && hasBody)
            ajaxParams.data = JSON.parse(requestBody);

        $.ajax(ajaxParams)
            .then(response => {
                console.log(response);
                $("#output").val(JSON.stringify(response, null, "\t"));
            })
            .catch(error => {
                console.error(error);
                $("#output").val(JSON.stringify(error, null, "\t"));
            });
    });
});
