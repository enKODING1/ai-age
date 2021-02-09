
        var Body = {
            setColor:function(color){
              document.querySelector('body').style.color= color;
            },
            setBackgroundColor:function(color){
              document.querySelector('body').style.backgroundColor=color;
            }
          }
        
        var Links = {
            DarkColor:function(color){
            //   var links  = document.querySelectorAll('a');
            //   for(i=0; i < links.length ; i++){
            //     links[i].style.color = color;
            //     //sample color: blue
            //  }
            $('a').css("color",color);
            
            },
            DayColor:function(color){
            //   var links  = document.querySelectorAll('a');
            //   for(i=0; i < links.length ; i++){
            //     links[i].style.color = color;
            //     //sample color: powderblue
            //  }
            $('a').css('color',color); 
            }
            
          }
        
        
         function NightDayHandler(self){
          
             
            
             
        
              if(self.value === 'checked'){
                Body.setBackgroundColor('#DCE2F0');
                Body.setColor('#50586C');
                self.value = 'check';
                Links.DarkColor('blue');
              }else{
                Body.setBackgroundColor('#50586C');
                Body.setColor('#DCE2F0');
                self.value = 'checked';
                Links.DayColor('powderblue');
               
              }
            }