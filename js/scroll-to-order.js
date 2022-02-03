$(function(){
    $('#button-order-top').on('click', function(){
        if(window.location.href.indexOf('/nbn/') >= 0){
            if($("#button-order").length > 0)
                $("#button-order").click();
            else
                window.location.href = '/nbn/#view';
        }else
            window.location.href = '/nbn/#view';      
    });
});