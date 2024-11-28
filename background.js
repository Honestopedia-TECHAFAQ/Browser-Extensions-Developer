chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'placeBets') {
        placeBets(request.mode).then(() => {
            sendResponse({ status: 'Bets placed successfully' });
        }).catch(error => {
            console.error('Error placing bets:', error);
            sendResponse({ status: `Error: ${error.message}` });
        });
        return true; 
    }
});

async function placeBets(mode) {
    try {
        await setProxy();
        const loginSuccess = await login();
        if (!loginSuccess) throw new Error('Login failed.');

        switch (mode) {
            case 'instant':
                await placeInstantBet();
                break;
            case 'semi-cyclical':
                setInterval(placeSemiCyclicalBet, 30000); 
                break;
            case 'cyclical':
                setInterval(placeCyclicalBet, 60000); 
                break;
            default:
                throw new Error('Invalid betting mode.');
        }
    } catch (error) {
        throw new Error('Error in placing bets: ' + error.message);
    }
}

async function setProxy() {
    const proxyConfig = {
        mode: "fixed_servers",
        rules: {
            singleProxy: {
                scheme: "http",
                host: "201.182.96.142",
                port: 35458
            },
            bypassList: ["<local>"]
        }
    };
    await chrome.proxy.settings.set({ value: proxyConfig, scope: 'regular' });
    console.log("Proxy set.");
}

async function login() {
    const loginUrl = 'https://www.kto.com/login';
    const credentials = {
        username: 'marcosdavidbet@gmail.com',
        password: 'KXKE8KAfC$PMDd'
    };

    const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
    });

    if (!response.ok) {
        throw new Error('Login failed with status ' + response.status);
    }

    console.log("Logged in successfully.");
    return true;
}

async function placeInstantBet() {
    console.log("Placing instant bet...");
}

async function placeSemiCyclicalBet() {
    console.log("Placing semi-cyclical bet...");
}

async function placeCyclicalBet() {
    console.log("Placing cyclical bet...");
}
