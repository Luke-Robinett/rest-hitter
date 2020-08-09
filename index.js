$(document).ready(function () {
    updateHistory(getSavedSessions());
    $("#method").focus();

    $("#use-auth").on("change", useAuthOnChange);
    $("#method").on("change", methodOnChange);
    $("form").on("submit", function (event) {
        event.preventDefault();
        formOnSubmit();
    });
    $("#reset").click(function (event) {
        event.preventDefault();
        resetForm();
    });
    $("#save").on("change", saveOnChange);
    $(".history-link").click(function (event) {
        event.preventDefault();
        historyLinkOnClick(this);
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

    function useAuthOnChange() {
        $("#use-auth").prop("checked")
            ? $("#credentials").removeClass("d-none")
            : $("#credentials").addClass("d-none");

        $(".auth").prop("required", $("#use-auth").prop("checked"));
    }

    function methodOnChange() {
        ($("#method").val() === "GET")
            ? $("#body-p").addClass("d-none")
            : $("#body-p").removeClass("d-none");
    }

    function formOnSubmit() {
        // Gather form data
        const formData = getFormData();

        // Extract fields needed for this method
        const { method, endpoint, body, useAuth, username, password, save } = formData;

        // Configure the API request
        let ajaxParams = {
            type: method,
            url: encodeURI(endpoint),
            beforeSend: function (xhr) {
                if (useAuth) {
                    xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
                }
            }
        };

        if (method === "POST" && body.lenth > 0)
            ajaxParams.data = JSON.parse(body);

        if (save) {
            // Save user's session
            saveSession(formData);

            // Update the history list
            updateHistory(getSavedSessions());
        }

        // Make the API call
        $.ajax(ajaxParams)
            .then(response => {
                console.log(response);
                $("#output").val(JSON.stringify(response, null, "\t"));
            })
            .catch(error => {
                console.error(error);
                $("#output").val(JSON.stringify(error, null, "\t"));
            })
            .always($("#output").focus());
    }

    function getFormData() {
        return {
            method: $("#method").val(),
            endpoint: $("#endpoint").val().trim(),
            body: $("#request-body").val().trim(),
            useAuth: $("#use-auth").prop("checked"),
            username: $("#username").val(),
            password: $("#password").val(),
            save: $("#save").prop("checked"),
            name: $("#session-name").val().trim()
        };
    }

    function saveSession(formData) {
        let savedSession = {};

        // Get list of saved sessions so we can add to it
        const savedSessions = getSavedSessions();

        // Search to see if there's already a session with the chosen name
        const existingSessionIndex = savedSessions.findIndex(s => s.name.toLowerCase() === formData.name.toLowerCase());

        // If a session with that name already exists, prompt the user to either replace it or cancel
        if (existingSessionIndex >= 0) {
            savedSession = {
                id: savedSessions[existingSessionIndex].id,
                ...formData
            };
            if (!confirm(`A saved session called "${formData.name}" already exists. Choose OK to replace it or Cancel to cancel the save operation.`)) {
                return;
            }
            savedSessions[existingSessionIndex] = savedSession;
        } else {
            savedSession = {
                id: generateNewID(),
                ...formData
            };

            // Add the new session to the list
            savedSessions.push(savedSession);
        }

        // Save the list to local storage with newly added session
        localStorage.setItem("savedSessions", JSON.stringify(savedSessions));
    }

    function saveOnChange() {
        $("#save").prop("checked")
            ? $("#session-p").removeClass("d-none")
            : $("#session-p").addClass("d-none");

        $("#session-name").prop("required", $("#save").prop("checked"));
    }

    function historyLinkOnClick(clickedLink) {
        // Get the unique ID of the clicked link
        const id = $(clickedLink).prop("data-id");

        // Find session with this ID
        const session = getSessionFromHistory(id);

        // If no session was found, exit the function
        if (!session) return;

        // Populate the form with values from the saved session
        $("#method").val(session.method);
        $("#request-body").val(session.body);
        $("#endpoint").val(session.endpoint);
        $("#use-auth").prop("checked", session.useAuth);
        $("#username").val(session.username);
        $("#password").val(session.password);
        $("#save").prop("checked", false);
        $("#session-name").val("");
        $("#output").val("");

        // Update UI based on form entries
        updateUI();

        $("#method").focus();
    }

    function generateNewID() {
        // If no saved sessions yet, returns ID of 1
        if (getSavedSessions().length === 0) return 1;

        // Otherwise returns a new ID that is 1 greater than the highest existing ID
        return getSavedSessions.map(session => session.id)
            .sort((id1, id2) => id2 - id1)[0];
    }

    function resetForm() {
        $("#method").val("GET");
        $("#endpoint").val("");
        $("#request-body").val("");
        $("#use-auth").prop("checked", false);
        $("#username").val("");
        $("#password").val("");
        $("#save").prop("checked", false);
        $("#session-name").val("");
        $("#output").val("");

        updateUI();

        $("#method").focus();
    }

    function updateUI() {
        methodOnChange();
        useAuthOnChange();
        saveOnChange();
    }
});
