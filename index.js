$(document).ready(function () {
    updateHistory(getSavedSessions());

    $("#use-auth").on("change", function () {
        $("#credentials").toggleClass("d-none");
        $(".auth").prop("required", $(this).prop("checked"));
    });

    $("#method").on("change", function () {
        ($(this).val() === "GET")
            ? $("#body-p").addClass("d-none")
            : $("#body-p").removeClass("d-none");
    });

    $("form").on("submit", function (event) {
        event.preventDefault();

        // Gather our data from the form fields
        const method = $("#method").val();
        const endpoint = $("#endpoint").val().trim();
        const requestBody = (method === "POST") ? $("#request-body").val().trim() : "";
        const hasBody = (requestBody.length > 0);
        const useAuth = $("#use-auth").prop("checked");
        const username = useAuth ? $("#username").val() : "";
        const password = useAuth ? $("#password").val() : "";
        const save = $("#save").prop("checked");
        const sessionName = save ? $("#session-name").val().trim() : "";

        let ajaxParams = {
            type: method,
            url: encodeURI(endpoint),
            beforeSend: function (xhr) {
                if (useAuth) {
                    xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
                }
            }
        };

        if (method === "POST" && hasBody)
            ajaxParams.data = JSON.parse(requestBody);

        if (save) {
            // Get list of saved sessions so we can add to it
            const savedSessions = getSavedSessions();

            // Create a new object to store session data
            let savedSession = {
                id: savedSessions.length + 1,
                name: sessionName,
                method: method,
                endpoint: endpoint,
                requestBody: requestBody,
                useAuth: useAuth,
                username: username,
                password: password
            };

            // Add the new session to the list
            savedSessions.push(savedSession);

            // Save the list to local storage with newly added session
            localStorage.setItem("savedSessions", JSON.stringify(savedSessions));

            // Update the history list
            updateHistory(savedSessions);
        }

        $.ajax(ajaxParams)
            .then(response => {
                console.log(response);
                $("#output").val(JSON.stringify(response, null, "\t"));
            })
            .catch(error => {
                console.error(error);
                $("#output").val(JSON.stringify(error, null, "\t"));
            })
            .finally($("#output").focus());
    });

    $("#save").on("change", function () {
        $("#session-p").toggleClass("d-none");
        $("#session-name").prop("required", $(this).prop("checked"));
    });

    $(".history-link").click(function (event) {
        event.preventDefault();

        const id = $(this).prop("data-id");

        const session = getSessionFromHistory(id);

        if (!session) return;

        $("#method").val(session.method);
        $("#endpoint").val(session.endpoint);
    });

    function getSessionFromHistory(id) {
        const savedSessions = getSavedSessions();
        const session = savedSessions.find(s => s.id === id);

        return (session !== undefined) ? session : null;
    }

    function getSavedSessions() {
        const savedSessions = localStorage.getItem("savedSessions");

        if (savedSessions == null) return [];
        return JSON.parse(localStorage.getItem("savedSessions"));
    }

    function updateHistory(savedSessions) {
        if (!Array.isArray(savedSessions)) return;

        const historyList = $("#history");
        historyList.empty();

        savedSessions.forEach(session => {
            const historyListItem = $("<li>")
                .addClass("list-group-item");
            const historyLink = $("<a href='#'>")
                .addClass("history-link")
                .prop("data-id", session.id)
                .text(session.name);
            historyListItem.append(historyLink);
            historyList.prepend(historyListItem);
        });
    }
});
