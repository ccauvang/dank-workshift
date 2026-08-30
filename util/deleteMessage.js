/**
 * Delete a message after delay, safe-check if message still exist/deletable before delete.
 * @param {object} message - Discord message object to delete.
 * @param {number} [delay=2000] - Delay in ms before delete attempt.
 * @param {string} [errorContext=''] - Extra info append to error log (e.g. user/command detail).
 */
module.exports = function deleteMessageSafe(message, delay = 2000, errorContext = '') {
    setTimeout(() => {
        if (!message || !message.deletable) return;

        message.delete().catch(error => {
            if (error.code == 10008) {
                console.error(`Error delete: message already gone (id: ${message.id}).${errorContext ? ' ' + errorContext : ''}`);
            } else {
                console.error(error);
            };
        });
    }, delay);
};