let users = {};
let currentUser = null;
let messages = [];

function showSignup() {
    hideAll();
    document.getElementById("signup").classList.remove("hidden");
}

function showLogin() {
    hideAll();
    document.getElementById("login").classList.remove("hidden");
}

function backToHome() {
    hideAll();
    document.getElementById("landing").classList.remove("hidden");
}

function hideAll() {
    document.querySelectorAll(".container > div").forEach(div => {
        div.classList.add("hidden");
    });
}

function signup() {
    const name = document.getElementById("signupName").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    const gender = document.getElementById("signupGender").value;

    if (!email.endsWith("@gmail.com")) {
        alert("Only @gmail.com emails allowed!");
        return;
    }

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    users[email] = { name, password, gender, code };
    if (gender === "girl") {
        document.getElementById("generatedCode").innerText =
            "Your Match Code: " + code;
    }

    alert("Account Created!");
}

function login() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const matchCode = document.getElementById("matchCode").value;

    if (!users[email] || users[email].password !== password) {
        alert("Invalid credentials");
        return;
    }

    currentUser = users[email];

    if (currentUser.gender === "boy") {
        const enteredCode = matchCode.trim().toUpperCase();
        const girlCode = Object.values(users).find(u => u.gender === "girl")?.code;
        if (!girlCode) {
            alert("No girl account found. She must sign up first!");
            return;
        }
        if (enteredCode !== girlCode) {
            alert("Invalid Match Code!");
            return;
        }
    }

    loadDashboard();
}

function loadDashboard() {
    hideAll();
    document.getElementById("dashboard").classList.remove("hidden");
    document.getElementById("welcomeText").innerText =
        "Welcome " + currentUser.name;

    if (currentUser.gender === "girl") {
        document.getElementById("girlSection").classList.remove("hidden");
        document.getElementById("girlMatchCodeDisplay").innerText =
            "🔑 Your Match Code: " + currentUser.code + " (share this with your partner)";
    } else {
        document.getElementById("boySection").classList.remove("hidden");
    }

    renderDates();
    checkReminders();
}

function savePeriod() {
    currentUser.periodDate = document.getElementById("periodDate").value;
    currentUser.cycleLength = document.getElementById("cycleLength").value;
    alert("Period data saved!");
}

function updateGirlData() {
    currentUser.mood = document.getElementById("girlMood").value;
    currentUser.familyStress = document.getElementById("familyStress").value;
    currentUser.academicStress = document.getElementById("academicStress").value;
    currentUser.healthStress = document.getElementById("healthStress").value;
    currentUser.cravings = document.getElementById("cravings").value;
    alert("Status updated!");
}

function updateBoyMood() {
    currentUser.mood = document.getElementById("boyMood").value;
    alert("Mood updated!");
}

function sendMessage() {
    const text = document.getElementById("loveMessage").value;
    messages.push(text);
    displayMessages();
}

function displayMessages() {
    document.getElementById("messages").innerHTML =
        messages.map(m => "<p>💌 " + m + "</p>").join("");
}

function suggestMessage() {
    const girl = Object.values(users).find(u => u.gender === "girl");

    if (!girl) return;

    let suggestion = "Thinking of you ❤️";

    if (girl.mood === "Low") suggestion = "I'm here for you. You don't have to handle this alone 💗";
    if (girl.familyStress > 7 || girl.academicStress > 7)
        suggestion = "You’re stronger than this stress. I believe in you 💙";

    document.getElementById("suggestion").innerText = suggestion;
}

function logout() {
    currentUser = null;
    hideAll();
    document.getElementById("landing").classList.remove("hidden");
}
// --- Important Dates ---

let importantDates = [];

function getDaysUntil(dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(dateStr);
    let target = new Date(today.getFullYear(), d.getMonth(), d.getDate());
    if (target < today) target.setFullYear(today.getFullYear() + 1);
    return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

function typeEmoji(type) {
    return type === "birthday" ? "🎂" : type === "anniversary" ? "💍" : "⭐";
}

function saveDate() {
    const label = document.getElementById("dateLabel").value.trim();
    const type = document.getElementById("dateType").value;
    const date = document.getElementById("dateValue").value;
    const idx = parseInt(document.getElementById("editingDateIndex").value);

    if (!label || !date) {
        alert("Please fill in both a label and a date!");
        return;
    }

    const entry = { label, type, date };
    if (idx === -1) {
        importantDates.push(entry);
    } else {
        importantDates[idx] = entry;
    }

    cancelEdit();
    renderDates();
    checkReminders();
}

function cancelEdit() {
    document.getElementById("editingDateIndex").value = "-1";
    document.getElementById("dateLabel").value = "";
    document.getElementById("dateType").value = "birthday";
    document.getElementById("dateValue").value = "";
    document.getElementById("cancelEditBtn").style.display = "none";
    document.getElementById("addDateBtn").innerText = "➕ Add Date";
}

function editDate(idx) {
    const d = importantDates[idx];
    document.getElementById("editingDateIndex").value = idx;
    document.getElementById("dateLabel").value = d.label;
    document.getElementById("dateType").value = d.type;
    document.getElementById("dateValue").value = d.date;
    document.getElementById("cancelEditBtn").style.display = "inline-block";
    document.getElementById("addDateBtn").innerText = "💾 Save Changes";
    document.getElementById("dateLabel").focus();
}

function deleteDate(idx) {
    if (!confirm("Remove this date?")) return;
    importantDates.splice(idx, 1);
    renderDates();
    checkReminders();
}

function renderDates() {
    const list = document.getElementById("datesList");
    if (importantDates.length === 0) {
        list.innerHTML = "<p style='color:#aaa; font-size:13px;'>No special dates added yet.</p>";
        return;
    }

    const sorted = importantDates
        .map((d, i) => ({ ...d, idx: i, daysUntil: getDaysUntil(d.date) }))
        .sort((a, b) => a.daysUntil - b.daysUntil);

    list.innerHTML = sorted.map(d => {
        const when = d.daysUntil === 0 ? "🎉 Today!" : "in " + d.daysUntil + "d";
        const soon = d.daysUntil <= 5 ? " date-soon" : "";
        const dateFormatted = new Date(d.date + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long" });
        return "<div class='date-card" + soon + "'>" +
            "<span class='date-emoji'>" + typeEmoji(d.type) + "</span>" +
            "<div class='date-info'><strong>" + d.label + "</strong><small>" + dateFormatted + "</small></div>" +
            "<span class='date-countdown'>" + when + "</span>" +
            "<div class='date-actions'>" +
            "<button onclick='editDate(" + d.idx + ")' class='btn-icon'>✏️</button>" +
            "<button onclick='deleteDate(" + d.idx + ")' class='btn-icon btn-red'>🗑️</button>" +
            "</div></div>";
    }).join("");
}

function checkReminders() {
    if (!currentUser || currentUser.gender !== "boy") return;
    const banner = document.getElementById("reminderBanner");
    const upcoming = importantDates
        .map(d => ({ ...d, daysUntil: getDaysUntil(d.date) }))
        .filter(d => d.daysUntil <= 5)
        .sort((a, b) => a.daysUntil - b.daysUntil);

    if (upcoming.length === 0) {
        banner.style.display = "none";
        return;
    }

    let items = "";
    upcoming.forEach(d => {
        const when = d.daysUntil === 0 ? "TODAY! 🎉" : "in " + d.daysUntil + " day" + (d.daysUntil > 1 ? "s" : "");
        items += "<li>" + typeEmoji(d.type) + " <strong>" + d.label + "</strong> — " + when + "</li>";
    });

    banner.innerHTML = "<div class='reminder-box'>⏰ <strong>Upcoming Special Days — Don't forget!</strong><ul>" + items + "</ul></div>";
    banner.style.display = "block";
}
