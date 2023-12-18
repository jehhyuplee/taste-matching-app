// script.js
let currentUser = null;
let users = [];

function addTastes() {
    const userIdInput = document.getElementById("userId");
    const tastesInput = document.getElementById("tastes");
    const userTastesDiv = document.getElementById("userTastes");

    const userId = userIdInput.value.trim();
    const userTastes = tastesInput.value
        .split(",")
        .map((taste) => taste.trim());

    // Check if the user with the given ID already exists
    const existingUser = users.find((user) => user.id === userId);

    if (existingUser) {
        // Update existing user's tastes history
        existingUser.history.push(userTastes);
    } else {
        // Add a new user
        users.push({ id: userId, history: [userTastes] });
    }

    // Display the user's ID and tastes history dynamically
    userTastesDiv.innerHTML = "";
    const userHeader = document.createElement("h3");
    userHeader.textContent = `User ID: ${userId}`;
    userTastesDiv.appendChild(userHeader);

    const tastesHistoryList = document.createElement("ul");
    users
        .find((user) => user.id === userId)
        .history.forEach((historyTastes) => {
            const historyListItem = document.createElement("li");
            historyListItem.textContent = historyTastes.join(", ");
            tastesHistoryList.appendChild(historyListItem);
        });
    userTastesDiv.appendChild(tastesHistoryList);

    // Persist the user ID for future entries
    userIdInput.value = userId;

    // Clear tastes input field
    tastesInput.value = "";
}

function finishTastes() {
    // Set the current user for displaying matches
    const userId = document.getElementById("userId").value.trim();
    currentUser = users.find((user) => user.id === userId);
    if (!currentUser) {
        alert("User not found.");
    }
}

function findMatches() {
    if (!currentUser) {
        alert("Please finish adding your tastes first.");
        return;
    }

    const minSimilarity = document.getElementById("minSimilarity").value;

    const matches = [];

    for (let i = 0; i < users.length; i++) {
        if (users[i].id !== currentUser.id) {
            const commonTastes = getCommonTastes(
                currentUser.history,
                users[i].history
            );

            if (commonTastes.length >= minSimilarity) {
                matches.push({
                    user1: currentUser.id,
                    user2: users[i].id,
                    commonTastes,
                });
            }
        }
    }

    displayMatches(matches);
}

function getCommonTastes(history1, history2) {
    const tastes1 = history1.flatMap((history) => history);
    const tastes2 = history2.flatMap((history) => history);

    const commonTastes = tastes1.filter((taste1) =>
        tastes2.some((taste2) => compareTastes(taste1, taste2))
    );

    return commonTastes;
}

function compareTastes(taste1, taste2) {
    const typoThreshold = 2; // Adjust this threshold based on your needs
    const distance = levenshteinDistance(
        taste1.toLowerCase(),
        taste2.toLowerCase()
    );
    return distance <= typoThreshold;
}

function levenshteinDistance(a, b) {
    const distanceMatrix = Array.from(Array(a.length + 1), () =>
        Array(b.length + 1).fill(0)
    );

    for (let i = 0; i <= a.length; i++) {
        distanceMatrix[i][0] = i;
    }

    for (let j = 0; j <= b.length; j++) {
        distanceMatrix[0][j] = j;
    }

    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            distanceMatrix[i][j] = Math.min(
                distanceMatrix[i - 1][j] + 1,
                distanceMatrix[i][j - 1] + 1,
                distanceMatrix[i - 1][j - 1] + cost
            );
        }
    }

    return distanceMatrix[a.length][b.length];
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function displayMatches(matches) {
    const matchList = document.getElementById("matchList");
    matchList.innerHTML = "";

    if (matches.length === 0) {
        const listItem = document.createElement("li");
        listItem.textContent = "No matches found.";
        matchList.appendChild(listItem);
        return;
    }

    matches.forEach((match) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${match.user1} and ${match.user2} have ${
            match.commonTastes.length
        } common tastes: ${match.commonTastes.join(", ")}`;
        matchList.appendChild(listItem);
    });
}

function displayAllUsers() {
    const allUsersDiv = document.getElementById("allUsers");
    allUsersDiv.innerHTML = "";

    users.forEach((user) => {
        const userContainer = document.createElement("div");
        userContainer.classList.add("user-container");

        const userHeader = document.createElement("h3");
        userHeader.textContent = `User ID: ${user.id}`;
        userContainer.appendChild(userHeader);

        const tastesHistoryList = document.createElement("ul");
        user.history.forEach((historyTastes) => {
            const historyListItem = document.createElement("li");
            historyListItem.textContent = historyTastes.join(", ");
            tastesHistoryList.appendChild(historyListItem);
        });
        userContainer.appendChild(tastesHistoryList);

        allUsersDiv.appendChild(userContainer);
    });
}

function updateMinSimilarityValue() {
    const minSimilarityValue = document.getElementById("minSimilarityValue");
    const minSimilaritySlider = document.getElementById("minSimilarity");
    minSimilarityValue.textContent = minSimilaritySlider.value;
}
