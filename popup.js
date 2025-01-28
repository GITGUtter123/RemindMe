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
        // Trigger particle effect
        triggerParticleEffect(e);

        // Determine if it's adding or updating a reminder
        if (setReminderButton.textContent === "Set Reminder") {
            addReminder();
        } else {
            updateReminder();
        }
    });

    // Function to add a new reminder
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
                resetForm();
            });
        });
    }

    // Function to update an existing reminder
    function updateReminder() {
        const reminderName = reminderNameInput.value.trim();
        const reminderTime = reminderTimeInput.value;

        if (!reminderName || !reminderTime) {
            alert("Please enter a name and time for your reminder.");
            return;
        }

        const [hours, minutes] = reminderTime.split(":");
        const updatedDate = new Date();
        updatedDate.setHours(hours);
        updatedDate.setMinutes(minutes);
        updatedDate.setSeconds(0);

        const updatedReminder = {
            name: reminderName,
            time: updatedDate.getTime(),
            triggered: false,
        };

        chrome.storage.local.get({ reminders: [] }, (result) => {
            const reminders = result.reminders;
            reminders[selectedReminderIndex] = updatedReminder;

            chrome.storage.local.set({ reminders }, () => {
                displayReminders(reminders);
                alert(`Reminder updated to ${reminderName} at ${reminderTime}`);
                resetForm();
            });
        });
    }

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
    let selectedReminderIndex = -1;

    function editReminder(index, reminder) {
        selectedReminderIndex = index;

        // Populate the input fields with the current reminder values
        reminderNameInput.value = reminder.name;
        reminderTimeInput.value = new Date(reminder.time).toLocaleTimeString().slice(0, 5);

        // Change the Set button to Update
        setReminderButton.textContent = "Update Reminder";
    }

    // Reset form and button after editing/updating
    function resetForm() {
        reminderNameInput.value = '';
        reminderTimeInput.value = '';
        setReminderButton.textContent = "Set Reminder";
        selectedReminderIndex = -1;
    }

    // Function to trigger particle effect on button click
    function triggerParticleEffect(e) {
        const button = e.target;
        const numberOfParticles = 280; // Increased number of particles for more effect

        for (let i = 0; i < numberOfParticles; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');

            // Randomize the particle size, color, and movement
            const size = Math.random() * 5 + 5; // Random size between 5px and 10px
            const color = `hsl(${Math.random() * 360}, 100%, 60%)`; // Random color

            const angle = Math.random() * 2 * Math.PI;
            const distance = Math.random() * 100 + 50; // Random distance
            const x = distance * Math.cos(angle);
            const y = distance * Math.sin(angle);

            particle.style.setProperty('--x', `${x}px`);
            particle.style.setProperty('--y', `${y}px`);
            particle.style.backgroundColor = color;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;

            button.appendChild(particle);

            // Remove particle after animation ends
            setTimeout(() => {
                particle.remove();
            }, 1000); // Duration of the animation
        }
    }
});
