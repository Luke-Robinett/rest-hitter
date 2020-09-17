$(document).ready(function () {
    updateHistory();
    resetForm();

    $("#run").on("click", function (event) {
        event.preventDefault();
        submitOnClick(false);
    });

    $("#run-and-save").on("click", function (event) {
        event.preventDefault();
        submitOnClick(true);
    });

    $("#reset").on("click", function (event) {
        event.preventDefault();
        resetForm();
    });

    $("#history").on("click", ".history-link", function (event) {
        event.preventDefault();
        historyLinkOnClick(event.target);
    });
    $("#history").on("click", ".fa-remove", function (event) {
        event.preventDefault();
        removeIconOnClick(event.target);
    });
    $("#clear-history").on("click", function (event) {
        event.preventDefault();
        clearHistory();
    });

    $("#session-name").on("change", event => UpdateTitle($(event.target).val()));

    function UpdateTitle(newTitle) {
        $(document).attr("title", `${newTitle} | Rest Hitter`);
    }

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

        $("#history").empty();

        savedSessions.forEach(session => {
            $("#history").prepend(
                $("<div class='row' role='listitem'>").append(
                    $("<div class='col-6'>").append(
                        $(`<a href="#" class="history-link" data-id=${session.id}>${session.name}</a>`)
                    ),
                    $("<div class='col-6'>").append(
                        $(`<a href="#" class="fa fa-remove text-danger" data-id=${session.id}><span class="sr-only">Remove ${session.name}</span></a>`)
                    )
                )
            );
        });
    }

    function submitOnClick(saveFlag) {
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

        // Make the API call
        $.ajax(ajaxParams)
            .then(response => {
                console.log(response);
                $("#output").val(JSON.stringify(response, null, "\t"));

                if (saveFlag) {
                    saveSession(formData);
                    updateHistory();
                }
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
            body: $("#request-body").val(),
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

        $("#session-name").val(name);
        $("#method").val(method);
        $("#endpoint").val(endpoint);
        $("#request-body").val(body);
        $("#username").val(username);
        $("#password").val(password);
        $("#output").val("");

        UpdateTitle(name);

        $("#session-name").focus();
    }

    function saveSession(formData) {
        let savedSession = {};

        // Get list of saved sessions so we can add to it
        const savedSessions = getSavedSessions();

        // Search to see if there's already a session with the chosen name
        const existingSessionIndex = savedSessions.findIndex(s => s.name.toLowerCase() === formData.name.toLowerCase());

        // If a session with that name already exists, save new entries to it
        if (existingSessionIndex >= 0) {
            savedSession = {
                id: savedSessions[existingSessionIndex].id,
                ...formData
            };
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
        const id = parseInt($(clickedLink).attr("data-id"));

        // Find session with this ID
        const session = getSessionFromHistory(id);

        // If no session was found, exit the function
        if (!session) {
            return;
        }

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

    function removeIconOnClick(clickedIcon) {
        const id = parseInt($(clickedIcon).attr("data-id"));
        const filteredSessions = getSavedSessions().filter(session => session.id !== id);
        localStorage.setItem("savedSessions", JSON.stringify(filteredSessions));
        updateHistory();
    }
});
