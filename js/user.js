class USER {
    constructor(YY, MM, DD, Hour, V) {
        this.user_data = {
            dateTime: {
                year: YY,
                month: MM,
                day: DD,
                time: Hour
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
        }
    }

    visitorCounter() {
        for (var i = 0; i < this.user_data.visitor.toLocaleString().length; i++) {
            var user_num = document.createElement('div')
            this.user.appendChild(user_num);
            user_num.classList.add("user");
            this.user.childNodes[i + 4].innerHTML = this.user_data.visitor.toLocaleString()[i];
        }
    }

}


const userData = new USER("2021","11","23",'12',21794);

