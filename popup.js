document.addEventListener("DOMContentLoaded", () => {
    const setReminderButton = document.getElementById("setReminderButton");
    const reminderNameInput = document.getElementById("reminderName");
    const reminderTimeInput = document.getElementById("reminderTime");
    const reminderList = document.getElementById("reminderList");

    // Load reminders and display them
    chrome.storage.local.get({ reminders: [] }, (result) => {
        displayReminders(result.reminders);
    });

    setReminderButton.addEventListener("click", () => {
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

            // Create and append the "X" button for each reminder
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "X";
            deleteButton.classList.add("delete-button");
            deleteButton.addEventListener("click", () => {
                deleteReminder(index);
            });

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
});
