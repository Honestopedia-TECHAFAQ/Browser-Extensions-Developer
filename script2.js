class MomentalRequest {
    static async makeRequest(url, method, data, callback) {
        let response = await fetch(url, {
            credentials: "include",
            headers: {
                'User-Agent': window.navigator.userAgent,
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': "application/json;charset=utf-8",
                'X-Requested-With': "XMLHttpRequest",
            },
            referrer: document.location.href,
            body: JSON.stringify(data),
            method: method,
            mode: "cors"
        });

        let result = {};
        if (response.status === 200) {
            try {
                result = await response.json();
            } catch (e) {
                console.log(e);
            }
        }
        callback(result);
    }

    static async post(url, data, callback) {
        this.makeRequest(url, "POST", data, callback);
    }
}

class CouponHelper {
    static getCouponData() {
        let coupons = window.app.store.coupon.bets.map(bet => ({
            'GameId': bet.GameId,
            'Type': bet.Type,
            'Coef': bet.Coef,
            'Param': bet.Param,
            'PV': bet.PV,
            'PlayerId': bet.PlayerId,
            'Kind': bet.Kind,
            'InstrumentId': bet.InstrumentId,
            'Seconds': bet.Seconds,
            'Price': bet.Price,
            'Expired': bet.Expired
        }));

        return {
            'coupon': {
                'Live': true,
                'Events': coupons,
                'Summ': window.app.store.coupon.sum,
                'Lng': window.app.store.global.language,
                'UserId': window.app.store.global.user_id,
                'hash': GetCookie("uhash"),
                'CheckCf': window.app.store.coupon.checkChangeCoef,
                'partner': window.app.store.global.user_ref_id,
                'TimeZone': window.app.store.global.time_zone
            }
        };
    }
}

class MomentalBetting {
    constructor() {
        this.currentBetGuid = null;
        this.warming = false;
        this.config = {
            additionalWaitTime: 1000,
            interval: 900,
            onWaitTime1000: 500
        };
    }

    getCouponData() {
        return CouponHelper.getCouponData();
    }

    putBetRequest(data, callback) {
        MomentalRequest.post("/datalinelive/putbetscommon", data, callback);
    }

    turnOffBetting() {
        this.warming = false;
    }

    warmUpBetting() {
        this.warming = true;
        this.startGuidsLoop();
    }

    startGuidsLoop() {
        if (!this.warming) return;

        const couponData = this.getCouponData();
        this.putBetRequest(couponData, (response) => {
            if (response.ErrorCode === 0 && response.Value.betGUID) {
                this.currentBetGuid = response.Value.betGUID;
                setTimeout(() => this.startGuidsLoop(), this.config.interval);
            } else {
                console.log("Error:", response.Error);
            }
        });
    }

    bet() {
        this.turnOffBetting();
        let couponData = this.getCouponData();
        couponData = this.injectGuid(couponData, this.currentBetGuid);
        this.putBetRequest(couponData, (response) => {
            if (response.ErrorCode > 0) {
                alert(response.Error);
                return;
            }
            alert("Success");
        });
    }

    injectGuid(couponData, guid) {
        couponData.coupon.betGUID = guid;
        return couponData;
    }
}

const mb = new MomentalBetting();
