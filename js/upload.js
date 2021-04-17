function readURL(input) {
    if (input.files && input.files[0]) {
  
      var reader = new FileReader();
  
      reader.onload = function(e) {
        $('.image-upload-wrap').hide();
        $('.image-title-wrap').hide();
        $('#loading').show();
        $('.file-upload-image').attr('src', e.target.result);
        $('.file-upload-content').show();
  
        $('.image-title').html(input.files[0].name);
      };
  
      reader.readAsDataURL(input.files[0]);
      init().then(()=>{
        console.log("hello");
        predict();
        $('#loading').hide();
        $('.image-title-wrap').show();
      });
      
    } else {
      removeUpload();
    }
  }
  
