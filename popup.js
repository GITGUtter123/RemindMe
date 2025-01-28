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

    // Function to trigger particle effect on button click
    function triggerParticleEffect(e) {
        const button = e.target;
        const numberOfParticles = 20; // Number of particles

        for (let i = 0; i < numberOfParticles; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');

            // Randomize the particle direction and position
            const angle = Math.random() * 2 * Math.PI;
            const distance = Math.random() * 100 + 50; // Random distance from the click point
            const x = distance * Math.cos(angle);
            const y = distance * Math.sin(angle);

            particle.style.setProperty('--x', `${x}px`);
            particle.style.setProperty('--y', `${y}px`);

            button.appendChild(particle);

            // Remove particle after animation ends
            setTimeout(() => {
                particle.remove();
            }, 1000); // Duration of the animation
        }
    }
});
