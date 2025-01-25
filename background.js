// On extension install, initialize reminders
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ reminders: [] }); // Initialize empty reminders
});

// Function to check for due reminders and show notifications
function checkReminders() {
    chrome.storage.local.get({ reminders: [] }, (result) => {
        const now = Date.now();
        const reminders = result.reminders || [];

        // Find reminders that are due but not yet acknowledged
        const dueReminders = reminders.filter((reminder) => reminder.time <= now);

        // Show notifications for newly triggered reminders
        const newReminders = dueReminders.filter((reminder) => !reminder.triggered);
        newReminders.forEach((reminder) => {
            chrome.notifications.create({
                type: "basic",
                iconUrl: "Logo.png", // Updated icon URL
                title: "Reminder",
                message: `You've asked us to remind you: ${reminder.name}`,
            });
            reminder.triggered = true; // Mark as triggered
        });

        // Save updated reminders back to storage
        chrome.storage.local.set({ reminders });
    });
}

// Periodically check for reminders every second
setInterval(checkReminders, 1000);

// Listen for clicks on the extension icon
chrome.action.onClicked.addListener(() => {
    chrome.storage.local.get({ reminders: [] }, (result) => {
        const reminders = result.reminders || [];
        const now = Date.now();

        // Separate expired and active reminders
        const expiredReminders = reminders.filter((reminder) => reminder.time <= now);
        const activeReminders = reminders.filter((reminder) => reminder.time > now);

        if (expiredReminders.length > 0) {
            // Show alert for each expired reminder
            expiredReminders.forEach((reminder) => {
                alert(`Reminder: ${reminder.name}`);
            });

            // Remove expired reminders
            chrome.storage.local.set({ reminders: activeReminders });
        }
    });
});
