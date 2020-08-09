$(document).ready(function () {
    updateHistory();
    resetForm();

    $("form").on("submit", function (event) {
        event.preventDefault();
        formOnSubmit();
    });
    $("#reset").click(function (event) {
        event.preventDefault();
        resetForm();
    });
    $(".history-link").click(function (event) {
        event.preventDefault();
        historyLinkOnClick(event.target);
    });
    $("#clear-history").click(function (event) {
        event.preventDefault();
        clearHistory();
    });

    function getSessionFromHistory(id) {
        const savedSessions = getSavedSessions();
        const session = savedSessions.find(s => s.id === id);

        return (session !== undefined) ? session : null;
    }

    function getSavedSessions() {
        const savedSessions = localStorage.getItem("savedSessions");

        return savedSessions
            ? JSON.parse(savedSessions)
            : [];
    }

    function updateHistory() {
        $("#clear-history").addClass("d-none");

        const savedSessions = getSavedSessions();

        if (savedSessions.length > 0) {
            $("#clear-history").removeClass("d-none");
        }

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

    function formOnSubmit() {
        // Gather form data
        const formData = getFormData();

        // Extract fields needed for this method
        const { method, endpoint, body, username, password } = formData;

        // Configure the API request
        let ajaxParams = {
            type: method,
            url: encodeURI(endpoint),
            beforeSend: function (xhr) {
                if ((username.length > 0) && (password.length > 0)) {
                    xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
                }
            }
        };

        if (body.lenth > 0) {
            ajaxParams.data = JSON.parse(body);
        }

        // Save user's session
        saveSession(formData);

        // Update the history list
        updateHistory();

        // Make the API call
        $.ajax(ajaxParams)
            .then(response => {
                console.log(response);
                $("#output").val(JSON.stringify(response, null, "\t"));
            })
            .catch(error => {
                console.error(error);
                $("#output").val(JSON.stringify(error, null, "\t"));
            });
    }

    function getFormData() {
        return {
            name: $("#session-name").val().trim(),
            method: $("#method").val(),
            endpoint: $("#endpoint").val().trim(),
            body: $("#request-body").val().trim(),
            username: $("#username").val().trim(),
            password: $("#password").val().trim()
        };
    }

    function setFormData(formData) {
        const {
            name = generateSessionName(),
            method = "GET",
            endpoint = "",
            body = "",
            username = "",
            password = ""
        } = formData;

        $(document).attr("title", `${name} | Rest Hitter`);
        $("#session-name").val(name);
        $("#method").val(method);
        $("#endpoint").val(endpoint);
        $("#request-body").val(body);
        $("#username").val(username);
        $("#password").val(password);
        $("#output").val("");

        $("#session-name").focus();
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
            if (!confirm(`A saved session called "${formData.name}" already exists. Replace it?`)) {
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

    function historyLinkOnClick(clickedLink) {
        // Get the unique ID of the clicked link
        const id = $(clickedLink).prop("data-id");

        // Find session with this ID
        const session = getSessionFromHistory(id);

        // If no session was found, exit the function
        if (!session) return;

        // Populate the form with values from the saved session
        setFormData(session);
    }

    function generateNewID() {
        // If no saved sessions yet, returns ID of 1
        if (getSavedSessions().length === 0) return 1;

        // Otherwise returns a new ID that is 1 greater than the highest existing ID
        return getSavedSessions().map(session => session.id)
            .sort((id1, id2) => id2 - id1)[0] + 1;
    }

    function generateSessionName() {
        return `Untitled Session ${getSavedSessions().filter(session => /^untitled session \d*$/i.test(session.name)).length + 1}`;
    }

    function resetForm() {
        setFormData({ name: generateSessionName() });
    }

    function clearHistory() {
        if (confirm("Clear all saved sessions?")) {
            localStorage.removeItem("savedSessions");
            updateHistory();
        }
    }
});
