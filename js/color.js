//night_day code

var Body = {
    setColor:function(color){
      $('body').css('color',color)
    },
    setBackgroundColor:function(color){
     $('body').css('backgroundColor',color);
    },
    setUpload:function(color){
        $('.file-upload').css('backgroundColor',color);
    },
    setPopbtn:function(color){
        $('.pop-btn').css('backgroundColor',color);
    }
}

var Links = {
        NightColors:function(color){
        $('#list').css('color',color);
    },
        DayColor:function(color){
        $('#list').css('color',color);
        }
}     
var Mode = {
        setMoon:function(color){
            $('#Moon').css("backgroundColor",color);
        },
        setSun:function(color){
            $('#half').css("backgroundColor",color);
        }   
}
var License_wrap = {
    setLicenseBackgroundColor:((color)=>{
        $('.license').css("backgroundColor",color);
    }),
    setLicenseColor:((color)=>{
        $('.license').css('color',color);
    }),
    setEmailBackgroundColor:((color)=>{
        $('.email').css('backgroundColor',color);
    }),
    setEmailColor:((color)=>{
        $('.email').css('color',color);
    })
}



    function NightDayHandler(self){
           
            if(self.value === "checked"){
                //밝아질때
                Body.setBackgroundColor('#F7F8FB');
                Body.setColor('#7b9acc');
                Body.setUpload('white');
                Body.setPopbtn('white');
                License_wrap.setLicenseBackgroundColor('rgb(224, 230, 251)');
                License_wrap.setLicenseColor('rgb(86, 115, 235)');
                License_wrap.setEmailBackgroundColor('rgb(224, 230, 251)');
                License_wrap.setEmailColor('rgb(86, 115, 235)');
                Links.NightColors('#7b9acc');
                self.value = 'check';
            }
            else{
                //어두워질때
                Body.setBackgroundColor('#14161A'); 
                Body.setColor('#DCE2F0');
                Body.setUpload('#484A50');
                Body.setPopbtn('#484A50');
                Links.NightColors('#DCE2F0');
                License_wrap.setLicenseBackgroundColor('rgba(86, 115, 235, 0.082)');
                License_wrap.setLicenseColor('rgb(86, 115, 235)');
                License_wrap.setEmailBackgroundColor('rgba(86, 115, 235, 0.082)');
                License_wrap.setEmailColor('rgb(86, 115, 235)');
                $('.email').css('backgroundColor','rgb(224, 230, 251)');
                Mode.setMoon("#F9EBDE");
                self.value = 'checked';
            }   
            
}