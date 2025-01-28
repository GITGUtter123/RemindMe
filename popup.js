document.addEventListener("DOMContentLoaded", () => {
    const setReminderButton = document.getElementById("setReminderButton");
    const reminderNameInput = document.getElementById("reminderName");
    const reminderTimeInput = document.getElementById("reminderTime");
    const reminderList = document.getElementById("reminderList");

    // Load reminders and display them
    chrome.storage.local.get({ reminders: [] }, (result) => {
        displayReminders(result.reminders);
    });

    setReminderButton.addEventListener("click", (e) => {
        // Particle effect
        triggerParticleEffect(e);

        const reminderName = reminderNameInput.value.trim();
        const reminderTime = reminderTimeInput.value;

        if (!reminderName || !reminderTime) {
            alert("Please enter a name and time for your reminder.");
            return;
        }

        const [hours, minutes] = reminderTime.split(":");
        const reminderDate = new Date();
        reminderDate.setHours(hours);
        reminderDate.setMinutes(minutes);
        reminderDate.setSeconds(0);

        const newReminder = {
            name: reminderName,
            time: reminderDate.getTime(),
            triggered: false,
        };

        chrome.storage.local.get({ reminders: [] }, (result) => {
            const reminders = result.reminders;
            reminders.push(newReminder);

            chrome.storage.local.set({ reminders }, () => {
                displayReminders(reminders);
                alert(`Reminder set for ${reminderName} at ${reminderTime}`);
            });
        });
    });

    // Display reminders
    function displayReminders(reminders) {
        reminderList.innerHTML = "";
        reminders.forEach((reminder, index) => {
            const li = document.createElement("li");
            li.innerHTML = `${reminder.name} - ${new Date(reminder.time).toLocaleTimeString()}${
                reminder.triggered ? " (Reminded)" : ""
            }`;

            // Create and append the "Edit" button for each reminder
            const editButton = document.createElement("button");
            editButton.textContent = "✎"; // Edit icon
            editButton.classList.add("edit-button");
            editButton.addEventListener("click", () => {
                editReminder(index, reminder);
            });

            // Create and append the "X" button for each reminder
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

    // Delete reminder
    function deleteReminder(index) {
        chrome.storage.local.get({ reminders: [] }, (result) => {
            const reminders = result.reminders;
            reminders.splice(index, 1);  // Remove the reminder at the given index

            chrome.storage.local.set({ reminders }, () => {
                displayReminders(reminders);  // Refresh the list after deletion
            });
        });
    }

    // Edit reminder
    function editReminder(index, reminder) {
        // Populate the input fields with the current reminder values
        reminderNameInput.value = reminder.name;
        reminderTimeInput.value = new Date(reminder.time).toLocaleTimeString().slice(0, 5);

        // Change the Set button to Update
        setReminderButton.textContent = "Update Reminder";

        // Handle the update functionality
        setReminderButton.removeEventListener("click", addReminder);
        setReminderButton.addEventListener("click", () => {
            const updatedName = reminderNameInput.value.trim();
            const updatedTime = reminderTimeInput.value;

            if (!updatedName || !updatedTime) {
                alert("Please enter a name and time for your reminder.");
                return;
            }

            const [hours, minutes] = updatedTime.split(":");
            const updatedDate = new Date();
            updatedDate.setHours(hours);
            updatedDate.setMinutes(minutes);
            updatedDate.setSeconds(0);

            const updatedReminder = {
                name: updatedName,
                time: updatedDate.getTime(),
                triggered: false,
            };

            chrome.storage.local.get({ reminders: [] }, (result) => {
                const reminders = result.reminders;
                reminders[index] = updatedReminder;

                chrome.storage.local.set({ reminders }, () => {
                    displayReminders(reminders);
                    alert(`Reminder updated to ${updatedName} at ${updatedTime}`);
                    setReminderButton.textContent = "Set Reminder";
                    setReminderButton.removeEventListener("click", arguments.callee);
                    setReminderButton.addEventListener("click", addReminder);
                });
            });
        });
    }

    // Add new reminder
    function addReminder() {
        const reminderName = reminderNameInput.value.trim();
        const reminderTime = reminderTimeInput.value;

        if (!reminderName || !reminderTime) {
            alert("Please enter a name and time for your reminder.");
            return;
        }

        const [hours, minutes] = reminderTime.split(":");
        const reminderDate = new Date();
        reminderDate.setHours(hours);
        reminderDate.setMinutes(minutes);
        reminderDate.setSeconds(0);

        const newReminder =
