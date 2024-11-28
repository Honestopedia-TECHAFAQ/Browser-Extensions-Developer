document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('start').addEventListener('click', () => {
        const bettingMode = document.querySelector('input[name="bettingMode"]:checked').value;
        chrome.runtime.sendMessage({ action: 'placeBets', mode: bettingMode }, (response) => {
            console.log(response.status);
        });
    });
});
