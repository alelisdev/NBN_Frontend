Stripe.setPublishableKey('pk_live_wlvjM3x2b9xeSIW0pclUhsBM');

$(function(){
    $("#updateForm").on('submit', function(e){ 
        e.preventDefault();
        var name = $("#name").val();
        var email = $("#email").val();
        var cc = $("#ccnumber").val();
        var expMonth = $("#expirymonth").val();
        var expYear = $("#expiryyear").val();
        var cvc = $("#cvcnumber").val();

        if(name != '' && email != '' && cc != '' && expMonth > 0 && expYear > 0 && cvc != ''){
            var valid_card = Stripe.card.validateCardNumber(cc);
            var valid_exp = Stripe.card.validateExpiry(expMonth, expYear);
            var valid_cvc = Stripe.card.validateCVC(cvc);

            $("#stripeSubscribe").attr('disabled','disabled')
                .text('Updating card... Please wait..');

            Stripe.card.createToken({
                'number': cc,
                'cvc': cvc,
                'exp_month': expMonth,
                'exp_year': expYear
            }, function(status, response) {
                      
                if(!response.error){
                    $.post('https://api.10mates.com.au/api/card/update', {
                        'token': response.id,
                        "email": email,
                        'name': name
                    }, function(res){

                        $("#stripeSubscribe").removeAttr('disabled')
                        .text('Submit');
                        
                        if(!res.error){
                            $("#update-response").html('<p align="center" class="text-center" style="padding-top: 20px;">'+ res.message +'</p>');
                            if(res.status > 0)
                                $("#updateForm input").val('');
                        }else
                            $("#update-response").html('<p align="center" class="text-center" style="padding-top: 20px;">'+ res.error +'</p>');
                        
                    });
                }else{
                    $("#update-response").html('<p align="center" class="text-center" style="padding-top: 20px;">'+ response.error.message +'</p>');
                    $("#stripeSubscribe").removeAttr('disabled')
                        .text('Submit');
                }
            });
        }else
            alert('Please fill in the required details');
        
    });
});
