$(document).ready(function () {
    $("#use-auth").on("change", function () {
        $("#username").prop("disabled", !$(this).prop("checked"));
        $("#password").prop("disabled", !$(this).prop("checked"));
    });

    $("#method").on("change", function () {
        // For future development
    });

    $("form").on("submit", function (event) {
        event.preventDefault();

        const method = $("#method").val();
        const endpoint = $("#endpoint").val().trim();
        const useAuth = $("#use-auth").prop("checked");

        $.ajax({
            type: method,
            url: encodeURI(endpoint),
            // crossDomain: true,
            beforeSend: function (xhr) {
                if (useAuth) {
                    const username = $("#username").val().trim();
                    const password = $("#password").val().trim();

                    xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
                }
            }
        })
            .then(response => {
                console.log(response);
                alert("Request successful!");
            })
            .catch(error => {
                console.error(error);
                alert("Failure!");
            });
    });
});
