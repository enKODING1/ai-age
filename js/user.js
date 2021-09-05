class USER {
    constructor(YY, MM, DD, T, V) {
        this.user_data = {
            dateTime: {
                year: YY,
                month: MM,
                day: DD,
                time: T
            },
            "visitor": V
        };

        this.user = document.querySelector('#user');
        this.datetime = document.querySelector("#datetime");
        this.count = 0;
        this.date()
        this.visitorCounter()
    }


    date() {
        for (var key in this.user_data.dateTime) {
            this.datetime.childNodes[this.count].innerHTML = this.user_data.dateTime[key];
            this.count += 2;
            console.log(key);
        }
    }

    visitorCounter() {
        for (var i = 0; i < this.user_data.visitor.toLocaleString().length; i++) {
            this.user.appendChild(document.createElement('span'))
            this.user.childNodes[i + 4].innerHTML = this.user_data.visitor.toLocaleString()[i];
        }
    }

}


const userData = new USER("2021","9","5",'2',15227);

