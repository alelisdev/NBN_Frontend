Stripe.setPublishableKey('pk_live_wlvjM3x2b9xeSIW0pclUhsBM'); //pk_live_wlvjM3x2b9xeSIW0pclUhsBM
// Stripe.setPublishableKey('pk_test_C76k2ySFWCcMjZ329VQ1GtaU');
var orderComponent = new Vue({
    el : '#order',
    data : {
        errors : {
            fullName : '',
            email : '',
            phone : '',
            address : '',
            ccNum : '',
            expDate : '',
            cvc : '',
            captcha : ''
        },
        order : {
            fullName : '',
            email : '',
            phone : '',
            address : '',
            ccNum : '',
            expDate : '',
            cvc : ''
        },
        validateForm : false,
        terms: app.order.confirm,

        showOrderForm: false,
    }, 
    methods : {
        validateEmail : function(email) {
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        },
        doSubmitOrder : function(){ 
            var self = this;
            this.errors = {
                fullName : '',
                email : '',
                phone : '',
                address : '',
                ccNum : '',
                expDate : '',
                cvc : ''
            };
            
            $("#confirm-error").text('');
            var formSubmit = true;

            $('.error-message').text('');

            app.errors.phone = {
                existing_phone: '',
                full_name: '',
                address: '',
                acctno: '',
            };

            if(app.order.phoneCalls != 'no-plan'){
                if(app.phone.keep == '1'){
                    if(app.phone.agree_yes == 0){
                        formSubmit = false;
                        $('html, body').animate({
                            scrollTop: $("#agree_keep_num").offset().top
                        }, 2000);
                        $("#agree_keep_num").parent().find('.error-message').text('You need to agree by clicking on the checkbox above.');
                    }else{
                        if(app.phone.existing_phone == '' || app.phone.full_name == '' || app.phone.address == '' || app.phone.acctno == ''){
                            formSubmit = false;

                            if($.trim(app.phone.existing_phone) == '')
                                app.errors.phone.existing_phone = 'This field is required';

                            if($.trim(app.phone.full_name) == '')
                                app.errors.phone.full_name = 'This field is required';

                            if($.trim(app.phone.address) == '')
                                app.errors.phone.address = 'This field is required';
                                
                            if($.trim(app.phone.acctno) == '')
                                app.errors.phone.acctno = 'This field is required';

                            $('html, body').animate({
                                scrollTop: $(".keep-number-form").offset().top
                            }, 2000);
                        }
                    }
                }else{
                    if(app.phone.agree_no == 0){
                        formSubmit = false;
                        $('html, body').animate({
                            scrollTop: $("#agree_no_number").offset().top
                        }, 2000);
                        $("#agree_no_number").parent().find('.error-message').text('You need to agree by clicking on the checkbox above.');
                    }
                }
            }
            
            //
            if(this.order.fullName != '' && this.order.email != '' 
                && this.order.phone != '' && this.order.address != '' && this.order.ccNum != '' && this.order.expDate != '' && this.order.cvc != '' 
                    && this.validateEmail(this.order.email) && $("#g-recaptcha-response").val() != '' && (this.terms.conf1 != false && this.terms.conf2 != false && this.terms.conf3 != false) && formSubmit){
                        
                var exp = this.order.expDate.split('/'),
                valid_card = Stripe.card.validateCardNumber(this.order.ccNum),
                valid_exp = Stripe.card.validateExpiry(exp[0], exp[1]),
                valid_cvc = Stripe.card.validateCVC(this.order.cvc);

                if(valid_card && valid_exp && valid_cvc){
                     // Loading...
                     var btn = $("#submit-order");
                     btn.attr('disabled', 'disable').val('We are now processing your order..Please wait...').parent().addClass('disabled');
                     btn.parent().find('svg').hide();
                     btn.parent().find('.fa').remove();
                     btn.parent().append('<i class="fa fa-hourglass"></i>');
                       
                    Stripe.card.createToken({
                        number: this.order.ccNum,
                        cvc: this.order.cvc,
                        exp_month: exp[0],
                        exp_year: exp[1]
                      }, function(status, response) {
                        if (response.error) { 
                          self.errors.captcha = response.error.message;
                          var btn = $("#submit-order");
                            btn.removeAttr('disabled').val('Submit Order').parent().removeClass('disabled');
                            btn.parent().find('svg').show();
                            btn.parent().find('.fa').remove();

                           $.alert({ 
                                theme : 'modern', 
                                icon : 'fa fa-warning', 
                                type : 'red', 
                                title : 'Order failed', 
                                content : response.error.message, draggable: false 
                            });

                        } else {
                          var token = response.id;

                          if(app.order.installOption == 2)
                            app.order.installation = app.order.installDay+' '+app.order.installAMPM;
                          else if(app.order.installOption == 3)
                            app.order.installation = app.order.installAMPM+' '+myCalendar.getFormatedDate('%l %M %j %Y');
                       
                          $.ajax({
                            type: "POST", 
                            dataType: 'json',
                            url: app.settings.apiUrl + '/api/order/create',
                            beforeSend: function(){},
                            data: {
                                token : token,
                                name : self.order.fullName,
                                email : self.order.email,
                                phone : self.order.phone,
                                address : self.order.address,
                                cc : self.order.ccNum,
                                exp : self.order.expDate,
                                cvc : self.order.cvc,
                                'g-recaptcha-response' : $("#g-recaptcha-response").val(),
                                plan : app.order.internetSpeed,
                                loadbal : app.order.loadBalancedConn,
                                ip : app.order.ipAddr,
                                modem : app.order.modem,
                                confModem : app.order.configureModem,
                                wireless_config_network : app.order.wirelessConfig.networkName,
                                wireless_config_pwd : app.order.wirelessConfig.password,
                                filter : app.order.familyFilter,
                                phonePlan : app.order.phoneCalls,
                                phoneHardware : app.order.phoneHardware,
                                voipGateway : app.order.voipGateway,
                                install : app.order.installation,
                                profInstall : app.order.professionalInstall,
                                devFeeApp : app.order.newDevFeeApplicable,
                                devFeeOption : app.order.devFeeOption,
                                bonus : app.order.bonus,
                                
                                phone_existing: app.phone.existing_phone,
                                phone_keep: app.phone.keep,
                                phone_fname: app.phone.full_name,
                                phone_address: app.phone.address,
                                phone_acctno: app.phone.acctno,
                                refcode: $("#refcode").val()
                            },
                            success : function(res){
                                var btn = $("#submit-order");
                                btn.removeAttr('disabled').val('Submit Order').parent().removeClass('disabled');
                                btn.parent().find('svg').show();
                                btn.parent().find('.fa').remove();

                                if(res.error){
                                    res.status = 0;
                                    if(res.error.indexOf('insufficient') >= 0)
                                        res.error = 'Your card has insufficient funds';

                                    if(res.error.indexOf('card was declined') >= 0)
                                        res.error = 'Your card was declined. Please use a different card';
                                }

                                if(res.status > 0){
                                    self.order = {
                                        fullName : '',
                                        email : '',
                                        phone : '',
                                        address : '',
                                        ccNum : '',
                                        expDate : '',
                                        cvc : ''
                                    };
                                
                                    if(res.status > 0){

                                        if (typeof(Storage) !== "undefined") {
                                            if(localStorage.getItem('ttrans'))
                                                localStorage.removeItem('ttrans');
                                            localStorage.setItem('ttrans', JSON.stringify(res));
                                        } else 
                                            console.error('Error no localStorage Support');
                                      
                                       window.location.href = '/thank-you';
                                    }else
                                        $.alert({ 
                                            theme : 'modern', 
                                            icon : 'fa fa-warning', 
                                            type : 'red', 
                                            title : 'Order failed', 
                                            content : 'An error has occured please try again', draggable: false 
                                        });
                                    
                                }else{
                                    if(res.error)
                                        $.alert({ 
                                            theme : 'modern', icon : 'fa fa-exclamation-circle', type : 'red', title : 'Transaction Failed', 
                                            content : res.error,
                                            draggable: false
                                        });  
                                    else
                                        $.alert({ 
                                            theme : 'modern', icon : 'fa fa-exclamation-circle', type : 'red', title : 'Order failed', 
                                            content : res.message,
                                            draggable: false
                                        });  
                                } 
                            },
                            error : function(err){
                                $.alert({
                                    theme: 'modern',
                                    type: 'red', 
                                    title: 'Error', 
                                    content: 'Error occured when processing your transaction, please try again.' 
                                });
                            }
                          });
                        
                        }
                      });


                }else{
                    var btn = $("#submit-order");
                    btn.removeAttr('disabled').val('Submit Order').parent().removeClass('disabled');
                    btn.parent().find('svg').show();
                    btn.parent().find('.fa').remove();

                    if(!valid_card)
                        this.errors.ccNum = 'Invalid credit card #';
                    if(!valid_exp)
                        this.errors.expDate = 'Invalid expiration date';
                    if(!valid_cvc)
                        this.errors.cvc = 'CVC is invalid';                        
                }
            }else{
                if(this.order.fullName == '')
                    this.errors.fullName = 'This field is required';
                if(this.order.email == '')
                    this.errors.email = 'This field is required';
                if(this.order.phone == '')
                    this.errors.phone = 'This field is required';
                if(this.order.address == '')
                    this.errors.address = 'This field is required';
                if(this.order.ccNum == '')
                    this.errors.ccNum = 'This field is required';
                if(this.order.expDate == '')
                    this.errors.expDate = 'This field is required';
                if(this.order.cvc == '')
                    this.errors.cvc = 'This field is required';

                if($("#g-recaptcha-response").val() == '')
                    this.errors.captcha = 'Please click the captcha';

                if(!this.validateEmail(this.order.email))
                    this.errors.email = 'Invalid email specified.';

                var errFlag = true;
                for(err in this.errors){
                    if(this.errors[err] != '')
                        errFlag = false;
                }

                if((this.terms.conf1 == false 
                        || this.terms.conf2 == false || this.terms.conf3 == false) && errFlag){
                    $("#confirm-error").text('To submit an order, your answer must be YES to the three questions.');
                    $('html, body').animate({
                        scrollTop: $("#confirmation").offset().top
                    }, 2000);
                }
            }
            
            return false;
        },

        doSubmitTestOrder : function(){ 
            var self = this;
            this.errors = {
                fullName : '',
                email : '',
                phone : '',
                address : ''
            };
            
            $("#confirm-error").text('');
            var formSubmit = true;

            $('.error-message').text('');

            app.errors.phone = {
                existing_phone: '',
                full_name: '',
                address: '',
                acctno: '',
            };

            if(app.order.phoneCalls != 'no-plan'){
                if(app.phone.keep == '1'){
                    if(app.phone.agree_yes == 0){
                        formSubmit = false;
                        $('html, body').animate({
                            scrollTop: $("#agree_keep_num").offset().top
                        }, 2000);
                        $("#agree_keep_num").parent().find('.error-message').text('You need to agree by clicking on the checkbox above.');
                    }else{
                        if(app.phone.existing_phone == '' || app.phone.full_name == '' || app.phone.address == '' || app.phone.acctno == ''){
                            formSubmit = false;

                            if($.trim(app.phone.existing_phone) == '')
                                app.errors.phone.existing_phone = 'This field is required';

                            if($.trim(app.phone.full_name) == '')
                                app.errors.phone.full_name = 'This field is required';

                            if($.trim(app.phone.address) == '')
                                app.errors.phone.address = 'This field is required';
                                
                            if($.trim(app.phone.acctno) == '')
                                app.errors.phone.acctno = 'This field is required';

                            $('html, body').animate({
                                scrollTop: $(".keep-number-form").offset().top
                            }, 2000);
                        }
                    }
                }else{
                    if(app.phone.agree_no == 0){
                        formSubmit = false;
                        $('html, body').animate({
                            scrollTop: $("#agree_no_number").offset().top
                        }, 2000);
                        $("#agree_no_number").parent().find('.error-message').text('You need to agree by clicking on the checkbox above.');
                    }
                }
            }
            
            // && $("#g-recaptcha-response").val() != ''
            if(this.order.fullName != '' && this.order.email != '' 
                && this.order.phone != '' && this.order.address != '' && this.validateEmail(this.order.email)
                && (this.terms.conf1 != false && this.terms.conf2 != false && this.terms.conf3 != false) && formSubmit){

                // Loading...
                var btn = $("#submit-test-order");
                btn.attr('disabled', 'disable').val('We are now processing your order..Please wait...').parent().addClass('disabled');
                btn.parent().find('svg').hide();
                btn.parent().find('.fa').remove();
                btn.parent().append('<i class="fa fa-hourglass"></i>');
                
                if(app.order.installOption == 2)
                app.order.installation = app.order.installDay+' '+app.order.installAMPM;
                else if(app.order.installOption == 3)
                app.order.installation = app.order.installAMPM+' '+myCalendar.getFormatedDate('%l %M %j %Y');
            
                $.ajax({
                type: "POST", 
                dataType: 'json',
                url: app.settings.apiUrl + '/api/order/test',
                beforeSend: function(){},
                data: {
                    name : self.order.fullName,
                    email : self.order.email,
                    phone : self.order.phone,
                    address : self.order.address,
                    // 'g-recaptcha-response' : $("#g-recaptcha-response").val(),
                    plan : app.order.internetSpeed,
                    loadbal : app.order.loadBalancedConn,
                    ip : app.order.ipAddr,
                    modem : app.order.modem,
                    confModem : app.order.configureModem,
                    wireless_config_network : app.order.wirelessConfig.networkName,
                    wireless_config_pwd : app.order.wirelessConfig.password,
                    filter : app.order.familyFilter,
                    phonePlan : app.order.phoneCalls,
                    phoneHardware : app.order.phoneHardware,
                    voipGateway : app.order.voipGateway,
                    install : app.order.installation,
                    profInstall : app.order.professionalInstall,
                    devFeeApp : app.order.newDevFeeApplicable,
                    devFeeOption : app.order.devFeeOption,
                    bonus : app.order.bonus,
                    phone_existing: app.phone.existing_phone,
                    phone_keep: app.phone.keep,
                    phone_fname: app.phone.full_name,
                    phone_address: app.phone.address,
                    phone_acctno: app.phone.acctno,
                    refcode: $("#refcode").val()
                },
                success : function(res){
                    var btn = $("#submit-test-order");
                    btn.removeAttr('disabled').val('Submit Test Order').parent().removeClass('disabled');
                    btn.parent().find('svg').show();
                    btn.parent().find('.fa').remove();

                    if(res.status > 0){
                        self.order = {
                            fullName : '',
                            email : '',
                            phone : '',
                            address : ''
                        };
                    
                        if(res.status > 0){

                            if (typeof(Storage) !== "undefined") {
                                if(localStorage.getItem('ttrans'))
                                    localStorage.removeItem('ttrans');
                                localStorage.setItem('ttrans', JSON.stringify(res));
                            } else 
                                console.error('Error no localStorage Support');
                            
                            window.location.href = '/thank-you';
                        }else
                            $.alert({ 
                                theme : 'modern', 
                                icon : 'fa fa-warning', 
                                type : 'red', 
                                title : 'Order failed', 
                                content : 'An error has occured please try again', draggable: false 
                            });
                        
                    }else{
                        if(res.error)
                            $.alert({ 
                                theme : 'modern', icon : 'fa fa-exclamation-circle', type : 'red', title : 'Transaction Failed', 
                                content : res.error,
                                draggable: false
                            });  
                        else
                            $.alert({ 
                                theme : 'modern', icon : 'fa fa-exclamation-circle', type : 'red', title : 'Order failed', 
                                content : res.message,
                                draggable: false
                            });  
                    } 
                },
                error : function(err){
                    $.alert({
                        theme: 'modern',
                        type: 'red', 
                        title: 'Error', 
                        content: 'Error occured when processing your transaction, please try again.' 
                    });
                }
                });
            }else{
                if(this.order.fullName == '')
                    this.errors.fullName = 'This field is required';
                if(this.order.email == '')
                    this.errors.email = 'This field is required';
                if(this.order.phone == '')
                    this.errors.phone = 'This field is required';
                if(this.order.address == '')
                    this.errors.address = 'This field is required';

                // if($("#g-recaptcha-response").val() == '')
                //     this.errors.captcha = 'Please click the captcha';

                if(!this.validateEmail(this.order.email))
                    this.errors.email = 'Invalid email specified.';

                var errFlag = true;
                for(err in this.errors){
                    if(this.errors[err] != '')
                        errFlag = false;
                }

                if((this.terms.conf1 == false 
                        || this.terms.conf2 == false || this.terms.conf3 == false) && errFlag){
                    $("#confirm-error").text('To submit an order, your answer must be YES to the three questions.');
                    $('html, body').animate({
                        scrollTop: $("#confirmation").offset().top
                    }, 2000);
                }
            }
            
            return false;
        }
    }
});
