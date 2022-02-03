/**
 * Frontend Script
 */
Stripe.setPublishableKey('pk_live_wlvjM3x2b9xeSIW0pclUhsBM'); //pk_live_wlvjM3x2b9xeSIW0pclUhsBM
// Stripe.setPublishableKey('pk_test_C76k2ySFWCcMjZ329VQ1GtaU');
var phone = new Vue({
    el : '#phone_page',
    data : {

        apiUrl : 'https://api.10mates.com.au',
        phoneSystem: "",
        phoneSystemList: [],
        extraList: [],
        extraSelected: [],
        phoneSelected: [],
        phoneList: [],
        phoneSystemSetup: "",
        sohoType: "",
        showPayment: false,
        isPbxHosted: false,
        selfInstall: false,
        selfSetup: false,
        selectedPhoneSystem: "",
        smallBusinessType: "",
        selectedPhone1: 0,
        selectedPhone2: 0,
        selectedPhone3: 0,
        selectedPhone4: 0,
        cabledComputers: 0,
        cabledPhones: 0,
        mediumBusinessType: "",
        enterpriseBusinessType: "",
        devicesCount: 0,
        isCallRecord: false,
        useCurrentPhone: false,
        is16Channel: false,
        is32Channel: false,
        sohoPhoneStandard: 0,
        sohoPhonePremium: 0,
        total : 0,
        fullName: "",
        abn: "",
        businessName: "",
        email: "",
        phone: "",
        address: "",
        ccNum: "",          
        expDate: "",
        cvc: "",
        totalPhones: 0,
        errors : {
            name : false,
            abn : false,
            businessName : false,
            email : false,
            phone : false,
            address : false,
            ccNum : false,
            expDate : false,
            cvc : false,
        },

    },
    mounted() {
        this.getPhoneData()
        this.getPhoneSystemData()
        this.getExtraData()
    },
    computed: {
        phoneCablingTotal() {
          return   (parseFloat(this.cabledComputers) + parseFloat(this.cabledPhones)) * 150
        },
        overallTotal() {
            let crm = 0
            let phoneTotal = 0
            this.phoneList.forEach((e) => {
                if(e.qty > 0) {
                    phoneTotal = (parseFloat(e.price) * parseFloat(e.qty)) + parseFloat(phoneTotal)
                }
            })
            this.extraSelected.forEach((e) => {
              if(e == 5) {
                crm = this.extraList.filter((x) => x.id == e)[0].price
              }
            })
            return parseFloat(this.totalMonthlyCost) + parseFloat(this.totalOSI) + parseFloat(crm) + parseFloat(this.phoneCablingTotal) + parseFloat(phoneTotal)
        },
        totalMonthlyCost() {
            return parseFloat(this.selectedPhoneSystemTotal) + parseFloat(this.extraPrices)
        },
        totalMonthlyCost24() {
            return (parseFloat(this.selectedPhoneSystemTotal) + parseFloat(this.extraPrices)) * 24
        },
        selectedPhoneSystemTotal() {
          let shs = 0
          let shp = 0
          let sb = 0
          let mb = 0
          let ent = 0
            if(this.selectedPhoneSystem == 'premium_soho') {
                shp = this.sohoPhonePremiumTotal
            }
            if(this.selectedPhoneSystem == 'standard_soho') {
                shs = this.sohoPhoneStandardTotal
            }
            if(this.selectedPhoneSystem == 'small_business') {
                sb = 249
            }
            if(this.selectedPhoneSystem == 'medium_business') {
                mb = 449
            }
            if(this.selectedPhoneSystem == 'enterprise') {
                ent = 999
            }
            return parseFloat(shp) + parseFloat(shs) + parseFloat(sb) + parseFloat(mb) + parseFloat(ent)
        },
        extraPrices() {
          let extraPrices = []
          let total = 0
          this.extraSelected.forEach((e) => {
            if(e != 5) {
              extraPrices.push({
                  id: e,
                  price: this.extraList.filter((x) => x.id == e)[0].price
              })
            }
          })
          extraPrices.forEach((x) => {
            total = parseFloat(total) + parseFloat(x.price)
          })
          return total
        },
        totalOSI() {
            if(this.totalPhones > 0 && this.totalPhones < 4) {
                return 125
            }
            if(this.totalPhones >= 4 && this.totalPhones < 10) {
                return 250
            }
            if(this.totalPhones >= 10 && this.totalPhones < 16) {
                return 400
            }
            if(this.totalPhones >= 16 && this.totalPhones < 31) {
                return 600
            }
            if(this.totalPhones > 30) {
                return parseFloat(this.totalPhones) * 17
            }
            if (this.totalPhones == 0) {
                return 0
            }
        },
        //     totalPhones() {
        //       total = 0
        //       if(this.phoneList.length > 0) {
        //         this.phoneList.forEach((e) => {
        //             total = parseFloat(total) + parseFloat(e.qty)
        //         })
        //       }
              
        //       return total
        //   },
          sohoPhonePremiumTotal() {
              if(this.selectedPhoneSystem == "premium_soho") {
                  return parseFloat(this.sohoPhonePremium) * 49.95
              } else {
                  return 0
              }
          },
            sohoPhoneStandardTotal() {
                if(this.selectedPhoneSystem == "standard_soho") {
                    if(this.isPbxHosted) {
                        return (parseFloat(this.sohoPhoneStandard) * 34.95) + (5 * parseFloat(this.sohoPhoneStandard))
                    } else {
                        return parseFloat(this.sohoPhoneStandard) * 34.95
                    }

                } else {
                    return 0
                }
            }
    },
    watch: {
        selectedPhone1: "resetUseCurrentPhone",
        selectedPhoneSystem(e) {
            if(e == "premium_soho") {
                this.sohoPhoneStandard = 0
                this.sohoPhonePremium = 1
                this.isPbxHosted = false
            }
            if(e == "standard_soho") {
                this.sohoPhonePremium = 0
                this.sohoPhoneStandard = 1
            }
        }
    },
    methods: {
        setTotalPhone(e) {
            this.selfInstall = false
            this.selfSetup = false
            this.totalPhones = e
        },
        setSelfInstall() {
          this.selfInstall = true
          this.selfSetup = false
          this.totalPhones = 0
          this.$forceUpdate()
        },
        addPhone(e) {
            this.totalPhones = 0
            this.useCurrentPhone = false
            this.selfInstall = false
            this.selfSetup = false
            this.phoneList.forEach((x) => {
                if(x.id == e) {
                    x.qty++
                }
                this.totalPhones = parseFloat(this.totalPhones) + x.qty
            });
            this.$forceUpdate()
        },
        removePhone(e) {
            this.totalPhones = 0
            this.useCurrentPhone = false
            this.selfSetup = false
            this.phoneList.forEach((x) => {
                if(x.id == e && x.qty > 0) {
                    x.qty--
                }
                this.totalPhones = parseFloat(this.totalPhones) + x.qty
            });
            this.$forceUpdate()
        },
        selectExtra(e) {
            var index = this.extraSelected.indexOf(e);
            if (index >= 0) {
                this.extraSelected.splice( index, 1 );
            } else {
                this.extraSelected.push(e)
            }
            
        },
        getPhoneSystemData() {
            $.ajax({
                type : 'GET',
                url :'https://api.10mates.com.au/api/phone_systems',
                crossDomain: true,
                dataType: 'jsonp',
                contentType: false,
                cache: false,
                processData:false,
                beforeSend : function(){
                },
                success: (data, textStatus, xhr) => {
                    if(xhr.status == 200) {
                        this.phoneSystemList = data.data
                        console.log(this.phoneSystemList)
                    }
                    else {

                    }
                },
                error: (XMLHttpRequest, textStatus, errorThrown) => {

                }
            });
        },
        getExtraData() {
            $.ajax({
                type : 'GET',
                url :'https://api.10mates.com.au/api/extras',
                crossDomain: true,
                dataType: 'jsonp',
                contentType: false,
                cache: false,
                processData:false,
                beforeSend : function(){
                },
                success: (data, textStatus, xhr) => {
                    if(xhr.status == 200) {
                        this.extraList = data.data
                        console.log(this.extraList)
                    }
                    else {

                    }
                },
                error: (XMLHttpRequest, textStatus, errorThrown) => {

                }
            });
        },
        getPhoneData() {
            $.ajax({
                type : 'GET',
                url :'https://api.10mates.com.au/api/phones',
                crossDomain: true,
                dataType: 'jsonp',
                contentType: false,
                cache: false,
                processData:false,
                beforeSend : function(){
                },
                success: (data, textStatus, xhr) => {
                    if(xhr.status == 200) {
                        this.phoneList = data.data
                        this.phoneList.forEach((e) => {
                            e.qty = 0
                        })
                        console.log(this.phoneList)
                    }
                    else {

                    }
                },
                error: (XMLHttpRequest, textStatus, errorThrown) => {

                }
            });
        },
        validateEmail(email) {
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        },
        doSubmitOrder() {
            this.errors = {
                name : false,
                email : false,
                phone : false,
                address : false,
                ccNum : false,
                expDate : false,
                cvc : false,
            }
            let phoneSysID = null
            if(this.selectedPhoneSystem == "standard_soho") {
                phoneSysID = 1
            }
            if(this.selectedPhoneSystem == "premium_soho") {
                phoneSysID = 2
            }
            if(this.selectedPhoneSystem == "small_business") {
                phoneSysID = 3
            }
            if(this.selectedPhoneSystem == "medium_business") {
                phoneSysID = 4
            }
            if(this.selectedPhoneSystem == "enterprise") {
                phoneSysID = 5
            }
            let extras = []
            let phones = []
            let crmInteg = 0
            if(this.extraSelected.length > 0) {
                crmInteg = 150
            }
            let sp = 0
            sp = parseFloat(this.sohoPhonePremium) + parseFloat(this.sohoPhoneStandard)
            this.phoneList.forEach((e) => {
                if(e.qty > 0) {
                    phones.push(e.id)
                }
            })
            // for(let i = 0; i < this.totalPhones; i++) {
            //     phones.push(1)
            // }
            // if(this.isCallRecord) {
            //     extras.push(1)
            // }
            // if(this.is16Channel) {
            //     extras.push(2)
            // }
            // if(this.is32Channel) {
            //     extras.push(3)
            // }
            var exp = this.expDate.split('/'),
            valid_card = Stripe.card.validateCardNumber(this.ccNum),
            valid_exp = Stripe.card.validateExpiry(exp[0], exp[1]),
            valid_cvc = Stripe.card.validateCVC(this.cvc);
            if (this.fullName == '' 
                || this.email == '' || this.phone == '' || 
                this.address == '' || 
                    !this.validateEmail(this.email)) {

                if(this.fullName == '')
                    this.errors.name = 'This field is required';

                if(this.email == '')
                    this.errors.email = 'This field is required';

                if(this.address == '')
                    this.errors.address = 'This field is required';

                if(!this.validateEmail(this.email) && this.email != '')
                    this.errors.email = 'Email is invalid.';

                if(this.phone == '')
                    this.errors.phone = 'Please specify a valid phone #';
            } else {
                if(valid_card && valid_exp && valid_cvc){
                    // Loading...
                    var btn = $("#submit-order");
                    btn.attr('disabled', 'disable').val('We are now processing your order..Please wait...').parent().addClass('disabled');
                    btn.parent().find('svg').hide();
                    btn.parent().find('.fa').remove();
                    btn.parent().append('<i class="fa fa-hourglass"></i>');
    
                    Stripe.card.createToken({
                        number: this.ccNum,
                        cvc: this.cvc,
                        exp_month: exp[0],
                        exp_year: exp[1]
                    }, (status, response) => {
                        if (response.error) {
                            // self.errors.captcha = response.error.message;
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
    
                            // if(app.order.installOption == 2)
                            //     app.order.installation = app.order.installDay+' '+app.order.installAMPM;
                            // else if(app.order.installOption == 3)
                            //     app.order.installation = app.order.installAMPM+' '+myCalendar.getFormatedDate('%l %M %j %Y');
    
                            $.ajax({
                                type: "POST",
                                dataType: 'json',
                                url: this.apiUrl + '/api/phone/v2/order/create',
                                beforeSend: function(){},
                                data: {
                                    token : token,
                                    name : this.fullName,
                                    business_name : this.businessName,
                                    abn : this.abn,
                                    email : this.email,
                                    phone : this.phone,
                                    address : this.address,
                                    phone_system: phoneSysID,
                                    soho_phones: sp,
                                    pbx_hosted: this.isPbxHosted,
                                    phonesys_setup: this.phoneSystemSetup,
                                    use_current_phones: this.useCurrentPhone,
                                    crm_integration: 0,
                                    osi_fee: this.totalOSI,
                                    phone_cabling: this.cabledPhones,
                                    pc_cabling: this.cabledComputers,
                                    total_monthly: this.totalMonthlyCost,
                                    total_payable_amount: this.overallTotal,
                                    extras: this.extraSelected,
                                    phones: phones
                                    // cc : this.ccNum,
                                    // exp : this.expDate,
                                    // cvc : this.cvc,
                                    // 'g-recaptcha-response' : $("#g-recaptcha-response").val(),
    
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
                                        this.fullName = ''
                                        this.email = ''
                                        this.phone = ''
                                        this.address = ''
                                        this.ccNum = ''
                                        this.expDate = ''
                                        this.cvc = ''
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
                                error : (err) => {
                                    var btn = $("#submit-order");
                                    btn.removeAttr('disabled').val('Submit Order').parent().removeClass('disabled');
                                    btn.parent().find('svg').show();
                                    btn.parent().find('.fa').remove();
    
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
            }
            

        },
        resetUseCurrentPhone(e) {
            if(e != 0) {
                this.useCurrentPhone = false
            }

        },
        setSelectedPhoneSystem(e) {
            this.selectedPhoneSystem = e
            if(this.phoneSystem != 'soho') {
                setTimeout(() => {
                    this.animateToSection('#system-setup');
                }, 10);
            }

        },
        usePhone() {
            this.totalPhones = 0
            this.phoneList.forEach((e) => {
                e.qty = 0
            })
            this.useCurrentPhone = true
            this.selfInstall = false
            this.selfSetup = true
                setTimeout(() => {
                    this.animateToSection('#osi');
                }, 10);

        },
        setPhoneSystemSetup(e) {
            this.phoneSystemSetup = e
                setTimeout(() => {
                    this.animateToSection('#choose-extra');
                }, 10);

        },
        setPhoneSystem(e) {
            this.phoneSystem = e
            console.log(e)
            if(e == 'soho') {
                setTimeout(() => {
                    this.animateToSection('#soho');
                }, 10);
            }
            if(e == 'small') {
                setTimeout(() => {
                    this.animateToSection('#small-business');
                }, 10);
            }
            if(e == 'medium') {
                setTimeout(() => {
                    this.animateToSection('#medium-business');
                }, 10);
            }
            if(e == 'enterprise') {
                setTimeout(() => {
                    this.animateToSection('#enterprise');
                }, 10);
            }

        },
        animateToSection(elm, transition = 100){
            $('html, body').animate({
                scrollTop: $(elm).offset().top
            }, transition);
        },
        showRequestCallbackModal (){
            alert()
            console.log(MicroModal)
            MicroModal.show('modal-1');
        },
        tpPLAN() {
            setTimeout(() => {
                this.animateToSection('#phone_page');
            }, 10);
        },
        doRequestCallback : function(){
            var __vmm = this;

            var jc = $.confirm({
                title: 'Speak to our team',
                theme: 'supervan',
                content: this.$refs.modal_callback,
                draggable : false,
                bgOpacity : 1,
                columnClass: 'col-md-8 col-md-offset-2 col-xs-12 bg-green',
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
                                    }else
                                        __vmm.errors[e] = false;
                                }
                            }

                            if(hasError == false){
                                btn.setText('Submitting form..');

                                $.post(__vmm.apiUrl + '/api/leads/add', data, function(res){
                                    jc.close();

                                    $.alert({ type : 'green', title : 'Success', content : 'Form submitted successfully', theme : 'modern' })

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
                                $.alert({ type : 'red', title : 'Error', content : 'Please fill in the required details', theme : 'modern' })
                            
                                
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

$(document).ready(function(){
    $('#keepnum1').iCheck({
        checkboxClass: 'icheckbox_square-blue',
        radioClass: 'iradio_square-blue',
        increaseArea: '20%' // optional
    });
    $('input[type="checkbox"],input[type="radio"]').iCheck({
        checkboxClass: 'icheckbox_square-blue',
        radioClass: 'iradio_square-blue',
        increaseArea: '20%' // optional
    });

    $('.radio-field').iCheck({
        checkboxClass: 'icheckbox_square-blue',
        radioClass: 'iradio_square-blue',
        increaseArea: '20%' // optional
    }).on('ifChecked', function(event){
        var elm = $(event.target);
        app.phone.keep = elm.val();
    });

    $("#keepnum").iCheck({
        checkboxClass: 'icheckbox_square-blue',
        radioClass: 'iradio_square-blue',
        increaseArea: '30%' // optional
    })



    $(".agree_no_number").iCheck({
        checkboxClass: 'icheckbox_square-blue',
        radioClass: 'iradio_square-blue',
        increaseArea: '20%' // optional
    }).on('ifChecked', function(event){
        app.phone.agree_no = 1;
    }).on('ifUnchecked', function(event){
        app.phone.agree_no = 0;
    });
});
