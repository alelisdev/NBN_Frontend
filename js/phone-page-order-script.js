Stripe.setPublishableKey('pk_live_wlvjM3x2b9xeSIW0pclUhsBM'); 

var app = new Vue ({
    el: "#plan-section", // plan-section
    data: {
        settings: {
            apiUrl : 'https://api.10mates.com.au',
        },

        businessCost : 50,
        businessTotal: "",
       
        callers: "",
        addnum: 0,
 
        callerCount: 0,
        numberType: 'No',
       
        pipInput: '',
        OverallTotal: 0,
       
        showOptionHome: true,
        showOptionBusiness: true,
        showOptionStandalone: true,

        choosenPlan: "Not selected any plan",

        order : {
            confirm : {
                conf1 : false,
                conf2 : false,
                conf3 : false
            }
        },

        summary : {
            getPhone : '',
            getStndAlone: '',
            getBusiness: '',
            getAddPeople: '',
            get13Number: ''
        },

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

        phone: {
            keep: 0,
            existing_phone: '',
            full_name: '',
            address: '',
            acctno: '',
            agree_yes: 0,
            agree_no: 0
        },

        activeSection: 0,

        homePlanOption: '',
        standAlonePlanOption: '',
    },
    methods: {
        setPhoneFormDefaults : function(){
            this.phone = {
                keep: '',
                existing_phone: '',
                full_name: '',
                address: '',
                acctno: '',
                agree_yes: 0,
                agree_no: 0
            };

            $('input[name="keepnum"]').iCheck('uncheck');
        },

        getOrderRequest: function(){
            if(this.activeSection > 0){
                switch(this.activeSection){
                    case 1:
                        return {
                            'plan': this.activeSection,
                            'planOption': this.homePlanOption,
                            'phone': this.phone
                        };
                    break;
                    case 2:
                        return {
                            'plan': this.activeSection,
                            'planOption': 1,
                            'callers': this.callerCount,
                            'numType': this.numberType,
                            'phone': this.phone
                        }
                    break;
                    case 3:
                        return {
                            'plan': this.activeSection,
                            'planOption': this.standAlonePlanOption,
                            'phone': this.phone
                        };
                    break;
                }
            }

            return false;
        },

        setPhoneVOIPOptions: function(option, price) {
            if(this.activeSection != 1)
                this.setPhoneFormDefaults();

            this.activeSection = 1;
            this.homePlanOption = option;
            this.OverallTotal = price;
            this.choosenPlan = "Home Phone / VOIP";

            // Unset other options
            this.standAlonePlanOption = '';
            this.pipInput = 0;
        },

        setCallers: function(cost, callersCount){
            if(this.activeSection != 2)
                this.setPhoneFormDefaults();

            this.activeSection = 2;
            this.pipInput = callersCount;

            this.choosenPlan = "Business Phone / VOIP";
            this.businessTotal  = this.businessCost + cost;
            this.OverallTotal = this.businessTotal;
            this.callers = cost;

            this.callerCount = callersCount;

            this.doComputeBusinessCost();

            // Unset other options
            this.homePlanOption = '';
            this.standAlonePlanOption = '';
        },
        
        StandAlone: function(option, cost){
            if(this.activeSection != 3)
                this.setPhoneFormDefaults();

            this.activeSection = 3;
            this.standAlonePlanOption = option;
            this.OverallTotal = cost;
            this.choosenPlan = "Standalone Phone / VOIP";

            // Unset other options
            this.homePlanOption = '';
            this.pipInput = 0;
        },

        selectNumberType: function(add13Number, type){
            var t = $(event.target);
            // Highlight
            $(".choices-list-numbertype .choice__item").removeClass('--is-active');
            if(t.hasClass('choice__item'))
                t.addClass('--is-active');
            else
                t.parents('.choice__item').first().addClass('--is-active');

            var total = 0;

            if(this.pipInput == '')
                this.pipInput = 3;

            if(this.pipInput > 3){
                total = (Number(this.pipInput-3)*10);
            }else
                total = 0;

            this.OverallTotal = this.businessTotal + add13Number + total;

            this.addnum = add13Number;
            this.numberType = type;

            this.doComputeBusinessCost();
            return this.addnum;
        },

        doComputeBusinessCost: function(){
            var total = 0;
            if(this.pipInput > 3)
                total = (Number(this.pipInput-3)*10);
            else
                total = 0;
            
            this.OverallTotal = Number(this.businessCost) + Number(this.addnum) + total;

            return false;
        }
    }
});

var OrderComponent = new Vue({
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
    }, 
    methods : {
        form: function(){
            return app;
        },

        validateEmail : function(email) {
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        },
      
        doSubmitOrder : function(){ 
            var self = this, 
            formSubmit = true;

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
            $('.error-message').text('');

            app.errors.phone = {
                existing_phone: '',
                full_name: '',
                address: '',
                acctno: '',
            };

            /** Make sure section is selected */
            if(app.activeSection > 0){
                var section = '';
                if(app.activeSection == 1)
                    section = '.home-voip';
                else if(app.activeSection == 2)
                    section = '.business-voip';
                else if(app.activeSection == 3)
                    section = '.standalone-voip';

                if(app.phone.keep == '1'){
                    if(app.phone.agree_yes == 0){
                        formSubmit = false;
                        $('html, body').animate({
                            scrollTop: $(section + " .agree_keep_num").offset().top
                        }, 500);
                        $(section + " .agree_keep_num").parent().find('.error-message').text('You need to agree by clicking on the checkbox above.');
                    }else{
                        if(app.phone.existing_phone == '' || app.phone.full_name == '' 
                            || app.phone.address == '' || app.phone.acctno == ''){
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
                                scrollTop: $(section + " .keep-number-form").offset().top
                            }, 500);
                        }
                    }
                }else if(app.phone.keep == '0'){
                    if(app.phone.agree_no == 0){
                        formSubmit = false;

                        $('html, body').animate({
                            scrollTop: $(section + " .agree_no_number").offset().top
                        }, 500);

                        $(section + " .agree_no_num").parent().find('.error-message').text('You need to agree by clicking on the checkbox above.');
                    }
                }else{
                    formSubmit = false;
                    $('html, body').animate({
                        scrollTop: $(section).offset().top
                    }, 500);
                }

               
                if(this.order.fullName != '' && this.order.email != ''  && this.order.phone != '' && this.order.address != '' && this.order.ccNum != '' && this.order.expDate != '' && this.order.cvc != '' && this.validateEmail(this.order.email) && $("#g-recaptcha-response").val() != '' && (this.terms.conf1 != false && this.terms.conf2 != false && this.terms.conf3 != false) && formSubmit){
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
                                    btn.removeAttr('disabled').val('Order Now').parent().removeClass('disabled');
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

                            request = {
                                token : token,
                                name : self.order.fullName,
                                email : self.order.email,
                                'order_phone' : self.order.phone,
                                address : self.order.address,
                                'g-recaptcha-response' : $("#g-recaptcha-response").val(),
                                refcode: $("#refcode").val()
                            };
                            
                            request = $.extend(request, self.form().getOrderRequest());
                         
                            $.ajax({
                                type: "POST", 
                                dataType: 'json',
                                url: app.settings.apiUrl + '/api/phone/order/create',
                                beforeSend: function(){
                                    console.log('sending request..., please wait');
                                },
                                data: request,
                                success : function(res){
                                    console.log('response', res);
                                    var btn = $("#submit-order");
                                    btn.removeAttr('disabled').val('Order Now').parent().removeClass('disabled');
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
                                    
                                        if(res.status > 0)
                                            window.location.href = '/thank-you';
                                        else
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
                        btn.removeAttr('disabled').val('Order Now').parent().removeClass('disabled');
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
                        }, 500);
                    }
                }
            }else
                $.confirm({ theme:'modern', type: 'red', title: 'Cannot submit form', content: 'No plan selected, please choose at least one plan.'});
            
            return false;
        }
    }
});

