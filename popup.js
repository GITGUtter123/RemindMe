document.addEventListener("DOMContentLoaded", () => {
    const setReminderButton = document.getElementById("setReminderButton");
    const reminderNameInput = document.getElementById("reminderName");
    const reminderTimeInput = document.getElementById("reminderTime");
    const reminderList = document.getElementById("reminderList");
    const themeDropdown = document.getElementById("themeDropdown");
    const repeatDayCheckboxes = document.querySelectorAll(".repeat-day");
    let editingIndex = null; // Track the index of the reminder being edited

    // Set initial theme
    const currentTheme = localStorage.getItem("theme") || "light";
    document.body.setAttribute("data-theme", currentTheme);
    themeDropdown.value = currentTheme;

    // Listen for theme change
    themeDropdown.addEventListener("change", (e) => {
        const selectedTheme = e.target.value;
        document.body.setAttribute("data-theme", selectedTheme);
        localStorage.setItem("theme", selectedTheme);
    });

    // Load reminders and display them
    chrome.storage.local.get({ reminders: [] }, (result) => {
        displayReminders(result.reminders);
    });

    setReminderButton.addEventListener("click", (e) => {
        triggerParticleEffect(e);

        const reminderName = reminderNameInput.value.trim();
        const reminderTime = reminderTimeInput.value;
        const repeatDays = [...repeatDayCheckboxes]
            .filter((checkbox) => checkbox.checked)
            .map((checkbox) => checkbox.value);

        if (!reminderName || !reminderTime) {
            alert("Please enter a name and time for your reminder.");
            return;
        }

        const [hours, minutes] = reminderTime.split(":");
        const reminderDate = new Date();
        reminderDate.setHours(hours);
        reminderDate.setMinutes(minutes);
        reminderDate.setSeconds(0);

        chrome.storage.local.get({ reminders: [] }, (result) => {
            let reminders = result.reminders;

            if (editingIndex !== null) {
                // Update existing reminder
                reminders[editingIndex] = {
                    name: reminderName,
                    time: reminderDate.getTime(),
                    repeatDays,
                    triggered: false,
                };
                editingIndex = null; // Reset editing state
            } else {
                // Add new reminder
                reminders.push({
                    name: reminderName,
                    time: reminderDate.getTime(),
                    repeatDays,
                    triggered: false,
                });
            }

            chrome.storage.local.set({ reminders }, () => {
                displayReminders(reminders);
                reminderNameInput.value = "";
                reminderTimeInput.value = "";
                repeatDayCheckboxes.forEach((checkbox) => (checkbox.checked = false));
            });
        });
    });

    // Display reminders
    function displayReminders(reminders) {
        reminderList.innerHTML = "";
        reminders.forEach((reminder, index) => {
            const repeatText = reminder.repeatDays.length
                ? ` (Repeats on: ${reminder.repeatDays.join(", ")})`
                : "";
            const li = document.createElement("li");
            li.innerHTML = `${reminder.name} - ${new Date(reminder.time).toLocaleTimeString()}${repeatText}${
                reminder.triggered ? " (Reminded)" : ""
            }`;

            // Create Edit button
            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.classList.add("edit-button");
            editButton.addEventListener("click", () => {
                editReminder(index, reminder);
            });

            // Create Delete button
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "X";
            deleteButton.classList.add("delete-button");
            deleteButton.addEventListener("click", () => {
                deleteReminder(index);
            });

            li.appendChild(editButton);
            li.appendChild(deleteButton);
            reminderList.appendChild(li);
        });
    }

    // Edit reminder
    function editReminder(index, reminder) {
        reminderNameInput.value = reminder.name;
        reminderTimeInput.value = new Date(reminder.time).toTimeString().slice(0, 5); // Convert time to HH:MM format
        repeatDayCheckboxes.forEach((checkbox) => {
            checkbox.checked = reminder.repeatDays.includes(checkbox.value);
        });
        editingIndex = index; // Track which reminder is being edited
    }

    // Delete reminder
    function deleteReminder(index) {
        chrome.storage.local.get({ reminders: [] }, (result) => {
            const reminders = result.reminders;
            reminders.splice(index, 1);

            chrome.storage.local.set({ reminders }, () => {
                displayReminders(reminders);
            });
        });
    }

    // Function to trigger particle effect on button click
    function triggerParticleEffect(e) {
        const button = e.target;
        const numberOfParticles = 280; // Increased number of particles for more effect

        for (let i = 0; i < numberOfParticles; i++) {
            const particle = document.createElement("div");
            particle.classList.add("particle");

            // Randomize the particle size, color, and movement
            const size = Math.random() * 5 + 5; // Random size between 5px and 10px
            const color = `hsl(${Math.random() * 360}, 100%, 60%)`; // Random color

            const angle = Math.random() * 2 * Math.PI;
            const distance = Math.random() * 100 + 50; // Random distance
            const x = distance * Math.cos(angle);
            const y = distance * Math.sin(angle);

            particle.style.setProperty("--x", `${x}px`);
            particle.style.setProperty("--y", `${y}px`);
            particle.style.backgroundColor = color;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;

            button.appendChild(particle);

            // Remove particle after animation ends
            setTimeout(() => {
                particle.remove();
            }, 1000);
        }
    }

    // Function to check and trigger reminders
    function checkReminders() {
        chrome.storage.local.get({ reminders: [] }, (result) => {
            let reminders = result.reminders;
            const now = new Date();
            const today = now.toLocaleString("en-US", { weekday: "long" });

            reminders.forEach((reminder, index) => {
                const reminderTime = new Date(reminder.time);
                const isRepeatDay = reminder.repeatDays.includes(today);

                if (
                    (isRepeatDay || reminderTime.toDateString() === now.toDateString()) &&
                    reminderTime.getHours() === now.getHours() &&
                    reminderTime.getMinutes() === now.getMinutes() &&
                    !reminder.triggered
                ) {
                    alert(`Reminder: ${reminder.name}`);

                    reminders[index].triggered = true;

                    if (isRepeatDay) {
                        reminders[index].triggered = false; // Reset for repeat reminders
                    }
                }
            });

            chrome.storage.local.set({ reminders });
        });
    }

    // Run reminder check every minute
    setInterval(checkReminders, 60000);
});
