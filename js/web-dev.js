var app_home = new Vue({
    el : '#header',
    data : {
        apiUrl : 'https://api.10mates.com.au',
        name : "",
        email : "",
        phone : "",
        state : "",
        propType : "",
        time : "",
        address : "",
        interest : "",
        question : "",

        errors : {
            name : false,
            email : false,
            phone : false,
            state : false,
            propType : false,
            time : false,
            address : false,
            interest : false,
            question : false,
        }
    },
    methods : {
        doRequestCallback : function(){
            var __vmm = this;

            var jc = $.confirm({
                title: 'Speak to our team',
                theme: 'supervan',
                content: this.$refs.modal_callback,
                draggable : false,
                bgOpacity : 1,
                columnClass: 'col-md-8 col-xs-12 bg-green',
                containerFluid : true,
                onContentReady : function(data, status, xhr){
                    $('.jconfirm-open').addClass('bg-green').attr('id', 'modal-speak-team');
                    $('.check-label').iCheck({
                        checkboxClass: 'icheckbox_polaris',
                        radioClass: 'iradio_polaris',
                        increaseArea : '20%'
                    });
                },
                buttons: {
                    doSubmit: {
                        text: 'Submit',
                        btnClass: 'btn-submit',
                        action: function (btn) {
                            var hasError = false;

                            var data = {
                                'name' : __vmm.name,
                                'email' : __vmm.email,
                                'phone': __vmm.phone,
                                'time': __vmm.time,
                                'address': __vmm.address,
                                'question': __vmm.question
                            };

                            for(var e in data){
                                if($.inArray(e, ['name', 'email', 'phone', 'time', 'address'])){
                                    if($.trim(data[e]) == ''){
                                        __vmm.errors[e] = true;
                                        hasError = true;
                                        console.log('has Error');
                                    }else
                                        __vmm.errors[e] = false;
                                }
                            }

                            if(hasError == false){
                                btn.setText('Submitting form..');

                                $.post(__vmm.apiUrl + '/api/leads/add', data, function(res){
                                    jc.close();

                                    $.alert({ type : 'green', title : 'Success', content : 'Form submitted successfully', theme : 'modern', columnClass: '' })

                                    __vmm.name = '';
                                    __vmm.email = '';
                                    __vmm.phone = '';
                                    __vmm.state = '';
                                    __vmm.propType = '';
                                    __vmm.time = '';
                                    __vmm.address = '';
                                    __vmm.question = '';

                                }, 'json');
                            }else
                                $.alert({ type : 'red', title : 'Error', content : 'Please fill in the required details', theme : 'modern', columnClass: '' })
                            
                                
                            return false;
                        }
                    },
                    later: {
                        text : 'Close',
                        action : function(){

                        }
                    }
                }
            });
        }
    }
});

$(function(){
    $('#button-order').on('click', function(){
        $('html, body').animate({
            scrollTop: $("#hire").offset().top
        }, 1000); 
    });

    $("#contact-form").submit(function(e){
        e.preventDefault();
        var name = $('#c-name').val(), 
        email = $('#c-email').val(),
        message = $('#c-message').val(),
        captcha = $("#g-recaptcha-response").val(),
        btn = $("#btn-submit");

        if($.trim(name) != '' && $.trim(email) != '' 
            && $.trim(message) != '' && captcha != ''){
            btn.attr('disabled', 'disabled');

            $("#c-name, #c-email, #c-message").val('');
            $.post('https://api.10mates.com.au/api/contact/form', {
                'name' : name, 
                'email': email,
                'msg': message,
                'g-recaptcha-response': captcha
            }, function(res){
                btn.removeAttr('disabled');

                if(res.result > 0)
                    $("div#ajax-message p").removeClass('error').addClass('success');
                else
                    $("div#ajax-message p").removeClass('success').addClass('error');

                $("#msg").text(res.message);  
                $("#ajax-message").show();
            }, 'json')
        }else{
            // Show error..
            $("div#ajax-message p").removeClass('success').addClass('error');
            $("#msg")
                .text('Please fill in the required details');
            $("#ajax-message").show();
        }
    });
});