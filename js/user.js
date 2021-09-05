const user_data = { 
    dateTime : {
        "year" : "2021",
        "month" : "9",
        "day": "5",
        "time" : "2" 
    },
    "visitor" : 15227
};

var user = document.querySelector('#user');


var datetime = document.querySelector("#datetime");

datetime.childNodes[0].innerHTML = user_data.dateTime.year;
datetime.childNodes[2].innerHTML = user_data.dateTime.month;
datetime.childNodes[4].innerHTML = user_data.dateTime.day;
datetime.childNodes[6].innerHTML = user_data.dateTime.time;

for(var i = 0 ; i < user_data.visitor.toLocaleString().length ; i++)
{
    user.appendChild(document.createElement('span'))
    user.childNodes[i+4].innerHTML = user_data.visitor.toLocaleString()[i];
}






