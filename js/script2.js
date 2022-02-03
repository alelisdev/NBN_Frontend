/**
 * Frontend Script
 */

var geocoder,
map = null;

var app = new Vue({
    el: '#app-main',
    data : {
        settings : { apiUrl : 'https://api.10mates.com.au' },
        step : 1,
        phone : "",
        address : "",
        streetNo : "",
        streetName : "",
        streetType : "",
        suburb : "",
        state : "",
        postcode : "",
        locLevel : "",
        locSubAddrType : "",
        locNumber : "",

        errors : {
            address : {
                state : false,
                message : ''
            },

            phone: {
                existing_phone: '',
                full_name: '',
                address: '',
                acctno: '',
            },

            fields : {
                firstName : "",
                lastName : "",
                email : "",
                phone : ""
            }
        },

        showSQFormError: false,

        locations : [],
        qualifications : [],
        qualificationMessage: "",
        selectedLocId : "",
        selectedAddressFormatted : "",
        selectedLocGps : { lat : '', lng : '' },
        response_list : [],
        gmap_location : {},
        showContactForm : false,
        showNoLocationForm : false, 
        showSQMap : false,
        forms: {
            contact : {
                firstName : "",
                lastName : "",
                email : "",
                phone : ""
            }
        },

        phone: {
            keep: '1',
            existing_phone: '',
            full_name: '',
            address: '',
            acctno: '',
            agree_yes: 0,
            agree_no: 0
        },

        /**
         * Order
         */
        order : {
            
            internetSpeed : 'nbn100',
            loadBalancedConn : '',
            ipAddr : 'x1',
            modem : 'BYO',
            configureModem : "yes",
            wirelessConfig : {
                networkName : '',
                password : ''
            },
            familyFilter : 'no',
            phoneCalls : 'no-plan',
            phoneHardware : 'BYO',
            voipGateway : 'BYO',

            installOption : 1,
            installDay : '', // Monday, Tuesday ...
            installAMPM : '', // Morning / Afternoon
            installation : 'ASAP',

            professionalInstall : 'no',
            newDevFeeApplicable : false,
            devFeeOption : 'upfront',
            bonus : '',
            
            minMonthContract: 12,
            confirm : {
                conf1 : false,
                conf2 : false,
                conf3 : false
            }
        },
        amounts : {
            internetSpeed : 0,
            loadBal : 0,
            modem : 0,
            phone_plan : 0,
            phone : 0,
            profIns : 0,
            voipGateway : 0,
            newDevFee : 0,
            profInstall : 0,
            staticIp : 0
        },
        summary : {
            plan : '',
            modem : '',
            devfee : '',
            phoneplan : '',
            phone : '',
            profins : '',
            ip : '',
            voipgateway : '',
            bonus : '',
            monthlyCost : '',
            minCost : '',
            loadbal : '',
            payableNow : ''
        }
    },
    filters : {
        formatStatus : function(status){
            if(status == 'PASS')
                return '<span class="badge badge-success">PASS</span>';
            else if(status == 'FAIL')
                return '<span class="badge badge-danger">FAIL</span>';
            else
                return '<span class="badge badge-secondary">'+status+'</span>';      
        },
        trim : function(value){
            return $.trim(value);
        }
    },
    methods : {
       removeBonus: function(){
           this.order.bonus = '';
           this.summary.bonus = this.getSummaryItem('bonus');
           this.summary.devfee = this.getSummaryItem('devfee');
           this.summary.monthlyCost = this.getMonthlyCost();
           $('.bonus__item').removeClass('--is-active');
       },
       setInstallDay : function(option, type, value){
        this.order.installOption = option;
        
        if(option == 1){
            this.order.installDay = '';
            this.order.installAMPM = '';
            this.order.installation = 'ASAP';
        }else if(option == 2){
            this.order.installation = '';
            if(type == 'day')
                this.order.installDay = value;
            else if(type == 'ampm')
                this.order.installAMPM = value;
        }else if(option == 3){
            if(type == 'day'){
                this.order.installation = new Date(myCalendar.getDate()).toDateString();
            }else if(type == 'ampm')
                this.order.installAMPM = value;
        }
       },
       computeTotals : function(){
           this.summary.plan = this.getSummaryItem('plan');
           this.summary.loadbal = this.getSummaryItem('loadbal');
           this.summary.modem = this.getSummaryItem('modem');
           this.summary.devfee = this.getSummaryItem('devfee');
           this.summary.phoneplan = this.getSummaryItem('phoneplan');
           this.summary.phone = this.getSummaryItem('phone');
           this.summary.profins = this.getSummaryItem('profins');
           this.summary.ip = this.getSummaryItem('ip');
           this.summary.voipgateway = this.getSummaryItem('voipgateway');
           this.summary.bonus = this.getSummaryItem('bonus');
           this.summary.monthlyCost = this.getMonthlyCost();
       },
       updateField : function(name, value){

           if(name == 'loadBalancedConn'){
                this.order.internetSpeed = '';
                this.amounts.internetSpeed = 0;
                $('#internet-speed .choice__item').removeClass('--is-active');
           }
           if(name == 'internetSpeed'){
               this.order.loadBalancedConn = '';
               this.amounts.loadBal = 0;
               $('#load-balanced .choice__item').removeClass('--is-active');
           }
           
           this.order[name] = value;
           this.computeTotals();
       },
       getPayableNow : function(){
           var oneMonth = this.getMonthlyCost();
           var hardware = this.amounts.modem + this.amounts.phone + this.amounts.voipGateway;

           var devFee = 0;
           this.amounts.newDevFee = 0;
           if(this.order.newDevFeeApplicable){
            if(this.order.devFeeOption == 'upfront')
               this.amounts.newDevFee = 300;
            else   
               this.amounts.newDevFee = 300/12;
           }

           var other = this.amounts.newDevFee + this.amounts.profIns;
           return (oneMonth + hardware + other);
       },
       getMinCost12Month : function(){
           if(this.order.bonus != ''){
            this.order.minMonthContract = 24;
            return this.getMonthlyCost() * 24;
           }else{
            this.order.minMonthContract = 12;
            return this.getMonthlyCost() * 12;
           }
       },
       getMonthlyCost : function(){
           var plan = this.amounts.internetSpeed;
           var ip = this.amounts.staticIp;
           var phone_plan = this.amounts.phone_plan;
           var loadBal = this.amounts.loadBal;
           var devFee = 0;

           if(this.order.newDevFeeApplicable){
            if(this.order.devFeeOption == 'monthly'){
                if(this.order.bonus != '')
                    devFee = 25/2;
                else
                    devFee = 25;
            }
           }

           return plan + phone_plan + ip + loadBal + devFee;
       },
       getSummaryItem : function(id){
            switch(id){
                case 'loadbal':
                    value = this.order.loadBalancedConn;
                    this.amounts.loadBal = 0;
                    if(value != ''){
                     this.order.internetSpeed = '';

                     switch(value){
                        case '4x100mbps':
                        this.amounts.loadBal = 520;
                        return '4 x 100mbps $520';
                        break;
                        case '3x100mbps':
                        this.amounts.loadBal = 390;
                        return '3 x 100mbps $390';
                        break;
                        case '2x100mbps':
                        this.amounts.loadBal = 260;
                        return '2 x 100mbps $260';
                        break;

                        case '4x25mbps':
                        this.amounts.loadBal = 360;
                        return '4 x 25mbps $360';
                        break;
                        case '3x25mbps':
                        this.amounts.loadBal = 270;
                        return '3 x 25mbps $270';
                        break;
                        case '2x25mbps':
                        this.amounts.loadBal = 180;
                        return '2 x 25mbps $180';
                        break;

                        case '4x12mbps':
                        this.amounts.loadBal = 320;
                        return '4 x 12mbps $320';
                        break;
                        case '3x12mbps':
                        this.amounts.loadBal = 240;
                        return '3 x 12mbps $240';
                        break;
                        case '2x12mbps':
                        this.amounts.loadBal = 160;
                        return '2 x 12mbps $160';
                        break;
                     }
                    }

                    return '';
                break;
                case 'ip':
                    value = this.order.ipAddr;
                    switch(value){
                        case 'x1':
                            this.amounts.staticIp = 0;
                            return 'Static IP x1 FREE';
                        break;
                        case 'x2':
                            this.amounts.staticIp = 10;
                            return 'Static IP x2 $10';
                        break;
                        case 'x6':
                            this.amounts.staticIp = 20;
                            return 'Static IP x6 $20';
                        break;
                        case 'x14':
                            this.amounts.staticIp = 50;
                            return 'Static IP x14 $50';
                        break;
                        case 'x30':
                            this.amounts.staticIp = 100;
                            return 'Static IP x30 $100';
                        break;
                        case 'x62':
                            this.amounts.staticIp = 200;
                            return 'Static IP x62 $200';
                        break;
                        case 'x126':
                            this.amounts.staticIp = 500;
                            return 'Static IP x126 $500';
                        break;
                        case 'x254':
                            this.amounts.staticIp = 900;
                            return 'Static IP x254 $900';
                        break;
                    }
                break;
                case 'bonus':
                    value = this.order.bonus;
                    switch(value){
                        case 'netflix':
                        return '$50 Netflix Voucher';
                        break;
                        case 'bitcoin':
                        return '$50 of Bitcoin';
                        break;
                        case 'ubercrate':
                        return '12 Months Ubercrate Games Subscription';
                        break;
                        case 'vpn':
                        return '2 Years of VPN';
                        break;
                        case 'car-jump-starter':
                        return 'Car Jump Starter';
                        break;
                        default:
                        return 'Not chosen yet';
                        break;
                    }
                break;
                case 'voipgateway':
                    value = this.order.voipGateway;
                    switch(value){
                        case 'BYO':
                        this.amounts.voipGateway = 0;
                        break;
                        case 'LINKSYS PAP2T':
                        this.amounts.voipGateway = 25;
                        break;
                        case 'Cisco SPA 112':
                        this.amounts.voipGateway = 150;
                        break;
                    }
                    value += ' ($'+this.amounts.voipGateway+')';
                    return value;
                break;
                case 'profins':
                    value = this.order.professionalInstall;
                    this.amounts.profIns = 0;
                    if(value == 'yes'){
                        this.amounts.profIns = 150;
                        return 'Yes ($150)';
                    }else
                        return 'No';
                break;
                case 'phone':
                    value = this.order.phoneHardware;
                    switch(value){
                        case 'BYO':
                        this.amounts.phone = 0;
                        break;
                        case 'Panasonic KX-TG1611ALH':
                        this.amounts.phone = 25;
                        break;
                        case 'Panasonic KX-TG6822AI':
                        this.amounts.phone = 78;
                        break;
                    }
                    
                    value += ' ($'+this.amounts.phone+')';
                    
                    return value;
                break;
                case 'phoneplan':
                    value = this.order.phoneCalls;
                    switch(value){
                        case 'no-plan':
                            this.amounts.phone_plan = 0;
                            return 'No Phone Plan';
                        break;
                        case 'plan-1':
                            this.amounts.phone_plan = 10;
                            return 'Unlimited Local, National calls $10';
                        break;
                        case 'plan-2':
                            this.amounts.phone_plan = 20;
                            return 'Unlimited Mobile, Local National calls $20';
                        break;
                        case 'plan-3':
                            this.amounts.phone_plan = 0;
                            return '*30c per call to 13/1300 numbers';
                        break;
                    }
                break;
                case 'devfee':
                    value = this.order.newDevFeeApplicable;
                    if(value){
                        if(this.order.devFeeOption == 'upfront')
                            return 'Upfront ($300)';
                        else{
                            if(this.order.bonus != '')
                                return 'Monthly ($12.50)';
                            else
                                return 'Monthly ($25)';
                        }
                    }
                    
                    return 'Not Applicable';
                break;
                case 'plan': 
                    value = this.order.internetSpeed;
                    if(value == 'nbn100'){
                        this.amounts.internetSpeed = 130;
                        return 'nbn100 $130';
                    }else if(value == 'nbn50'){
                        this.amounts.internetSpeed = 120;
                        return 'nbn50 $120';
                    }else if(value == 'nbn25'){
                        this.amounts.internetSpeed = 90;
                        return 'nbn25 $90';
                    }
                    return value;
                break;
                case 'modem':
                    value = this.order.modem;
                    switch(value){
                        case 'BYO': 
                        this.amounts.modem = 0;
                        break;
                        case 'Tenda F9 NEW':
                        this.amounts.modem = 50;
                        break; 
                        case 'Tenda V300 NEW':
                        this.amounts.modem = 60;
                        break;
                        case 'Tenda AC10 NEW':
                        this.amounts.modem = 70;
                        break;
                        case 'Tenda AC18 NEW':
                        this.amounts.modem = 120;
                        break;
                        case 'TP-Link TD-W9970 NEW':
                        this.amounts.modem = 130;
                        break;
                        case 'TP-Link C50 NEW':
                        this.amounts.modem = 140;
                        break;
                        case 'Netgear D7000 USED':
                        this.amounts.modem = 180;
                        break;
                        case 'ASUS RT-AC87U USED':
                        this.amounts.modem = 200;
                        break;
                        case 'TP-Link VR600 NEW':
                        this.amounts.modem = 250;
                        break;
                        case 'TP-Link VR600v NEW':
                        this.amounts.modem = 280;
                        break;
                        case 'ASUS RT-AC88U USED':
                        this.amounts.modem = 300;
                        break;
                        case 'Netgear D7000 NEW':
                        this.amounts.modem = 330;
                        break;
                        case 'ASUS RT-AC87U NEW':
                        this.amounts.modem = 350;
                        break;
                        case 'TP-Link Archer C3150 NEW':
                        this.amounts.modem = 365;
                        break;
                        case 'ASUS RT-AC88U NEW':
                        this.amounts.modem = 450;
                        break;
                        case 'ASUS DSL-AC3100 NEW':
                        this.amounts.modem = 550;
                        break;
                        case 'Netgear Nighthawk AX8':
                        this.amounts.modem = 850;
                        break;
                    }
                    
                    value += ' ($'+this.amounts.modem+')';
                    return value;
                break;
            }
       },
       validateEmail : function(email) {
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
       },
       doSubmitContact : function(){
            var self = this;
            var contact = this.forms.contact;

            this.errors.fields.firstName = '';
            this.errors.fields.lastName = '';
            this.errors.fields.phone = '';
            this.errors.fields.email = '';

            if (contact.firstName == '' || contact.lastName == '' 
                || contact.email == '' || contact.phone == '' || 
                    !this.validateEmail(contact.email)) {

                if(contact.firstName == '')
                    self.errors.fields.firstName = 'This field is required';

                if(contact.lastName == '')
                    self.errors.fields.lastName = 'This field is required';

                if(contact.email == '')
                    self.errors.fields.email = 'This field is required';

                if(!this.validateEmail(contact.email) && contact.email != '')
                    self.errors.fields.email = 'Email is invalid.';

                if(contact.phone == '')
                    self.errors.fields.phone = 'Please specify a valid phone #';
    
                return false;
            }else 
                return this.doFormSubmit();
       },
       doFormSubmit : function(){
           var contact = this.forms.contact;
           var firstName = contact.firstName,
           lastName = contact.lastName,
           email = contact.email,
           phone = contact.phone,
           locId = app.selectedLocId,
           address = app.selectedAddressFormatted,
           lat = app.selectedLocGps.lat,
           lng = app.selectedLocGps.lng;

           if(firstName != '' && lastName != '' && email != '' && phone != ''){
               var apiUrl = 'https://api.10mates.com.au';
               $.post(apiUrl + '/api/contact/submit', {
                   "fname" : firstName,
                   "lname" : lastName,
                   "email" : email,
                   "phone" : phone,
                   "locId" : locId,
                   "address": address,
                   "lat" : lat,
                   "lng" : lng,
                   "action": "PENDING"
               }, function(response){
                   if(response.status > 0){

                       app.step = 1;
                       app.showNoLocationForm = false;
                       app.address = '';
                       app.forms.contact.firstName = '';
                       app.forms.contact.lastName = '';
                       app.forms.contact.phone = '';
                       app.forms.contact.email = '';
                    
                       app.streetName = '';
                       app.streetType = '';
                       $('input[type="text"]').val('');

                       $.alert({
                           icon: 'fa fa-check-circle',
                           theme: 'modern',
                           closeIcon: false,
                           animation: 'zoom',
                           type: 'blue', 
                           title : 'Success',
                           draggable : false,
                           content : response.message
                       });
                   }else
                       $.alert({
                           icon: 'fa fa-exclamation-circle',
                           theme: 'modern',
                           closeIcon: true,
                           animation: 'zoom',
                           type: 'red', 
                           content : 'Error occured please try again.'
                       });
               }, 'json');

               return true;
           }
           return false;
       },
       showContactFormModal(){
            var __vmm = this;
            this.jcp = $.confirm({
                title: 'Get Notified',
                icon : 'fa fa-bell',
                content: this.$refs.modal_contact,
                theme : 'supervan',
                draggable : false,
                buttons: {
                    submit: {
                        text: 'Submit',
                        btnClass: 'btn-green',
                        action: function () {
                           return __vmm.doSubmitContact();
                        }
                    },
                    cancel : {
                        text: 'Cancel',
                        action : function(){}
                    }
                }
            });
       },
       showNoLocFormModal(){
        var __vmm = this;
        this.jcp = $.confirm({
            title: 'Address Not Found',
            icon : 'fa fa-warning',
            content: this.$refs.modal_nolocation,
            theme : 'supervan',
            draggable : false,
            buttons: {
                submit: {
                    text: 'Submit',
                    btnClass: 'btn-green',
                    action: function () {
                       return __vmm.doSubmitLocationForm();
                    }
                },
                cancel: function () {
                    // do nothing.
                }
            }
        });
       },
       doSubmitLocationForm : function(){ 
            var self = this;
            var contact = this.forms.contact;

            this.errors.fields.firstName = '';
            this.errors.fields.lastName = '';
            this.errors.fields.phone = '';
            this.errors.fields.email = '';

            if (contact.firstName == '' || contact.lastName == '' 
                || contact.email == '' || contact.phone == '' 
                    || !this.validateEmail(contact.email)) {

                if(contact.firstName == '')
                    self.errors.fields.firstName = 'This field is required';

                if(contact.lastName == '')
                    self.errors.fields.lastName = 'This field is required';

                if(contact.email == '')
                    self.errors.fields.email = 'Please specify a valid email';

                if(!this.validateEmail(contact.email) && contact.email != '')
                    self.errors.fields.email = 'Email is invalid.';

                if(contact.phone == '')
                    self.errors.fields.phone = 'Please specify a valid phone #';
            } else{
                var contact = this.forms.contact;
                var firstName = contact.firstName,
                lastName = contact.lastName,
                email = contact.email,
                phone = contact.phone,
                locId = app.selectedLocId,
                address = app.selectedAddressFormatted,
                lat = app.selectedLocGps.lat,
                lng = app.selectedLocGps.lng;

                //var btn = Ladda.create( document.querySelector( '#btn-submit-contact' ) );
            
                if(firstName != '' && lastName != '' && email != '' && phone != ''){
                    var form = document.getElementById('form-noloc');
                    var formData = new FormData(form);
                    formData.append('fname', firstName);
                    formData.append('lname', lastName);
                    formData.append('email', email);
                    formData.append('phone', phone);
                    formData.append('locId', locId);
                    formData.append('address', address);
                    formData.append('lat', lat);
                    formData.append('lng', lng);
                    formData.append('action', 'ADDRESS_ISSUE');
                   
                    var apiUrl = 'https://api.10mates.com.au';
                    $.ajax({
                        type : 'POST',
                        url : apiUrl + '/api/contact/submit',
                        data : formData,
                        dataType : 'json',
                        contentType: false,
                        cache: false,
                        processData:false,
                        beforeSend : function(){
                        },
                        success : function(response){
                            if(response.status > 0)
                                $.alert({
                                    icon: 'fa fa-check-circle',
                                    theme: 'modern',
                                    animation: 'zoom',
                                    type: 'green', 
                                    title : 'Success',
                                    content : response.message,
                                });
                            else
                                $.alert({
                                    icon: 'fa fa-exclamation-circle',
                                    theme: 'modern',
                                    closeIcon: true,
                                    animation: 'zoom',
                                    type: 'red', 
                                    content : 'Error occured please try again.'
                                });
                        }
                    });
                    
                    return true;
                }
            }

            return false;
       },
       goBack : function(){
            if(this.step > 1)
                this.step = this.step - 1;
       },
       isArray : function(value){
            if($.isArray(value))
                return true;
            return false;
       },
       doQualify : function(selected){
            var self = this;
            self.locations.forEach(function(row){
                if(row.locationId == selected){
                    self.selectedAddressFormatted = row.displayAddress;
                    orderComponent.order.address = row.displayAddress;
                }
            });
            
            app.showContactForm = false;
            self.qualificationMessage = '';
            
            if(selected != ''){
                $('.spinner,.spinner-text').css('opacity', 1);
                $('.spinner-text').removeClass('error success').text('Retrieving availability date for this address..');
                self.step = 3;

                $.post(self.settings.apiUrl + '/api/sq/qualify/product', { locId : selected }, function(res){
                     if(typeof res.error == 'undefined'){
                            var res = res.QualifyProductResponse, 
                            qualifyList = res.accessQualificationList,
                            siteAddr = res.siteAddress,
                            siteDetails = res.siteDetails,
                            isDevFeeApplicable = false, 
                            nbnSpeedAvailable = false,
                            nbnSpeedDescription = '',
                            lat = siteDetails.gpsLocation.latitude,
                            lng = siteDetails.gpsLocation.longitude;

                            app.locLevel = '';
                            app.locSubAddrType = siteAddr.subAddressType;
                            app.locNumber = siteAddr.subAddressNumber;

                            self.selectedLocGps = {
                                lat : lat,
                                lng : lng
                            };

                            qualifyList.forEach(function(data){
                                var testOutcomes = data.testOutcomes;  
                                var newDevChargeApplies = data.nbnNewDevelopmentsChargeApplies; 

                                /**
                                 * Check if PASS or FAIL
                                 */
                                if(data.qualificationResult == 'PASS'){
                                    var accessMethod = data.accessMethod;
                                    var accessType = data.accessType;
                                    var serviceSpeeds = data.availableServiceSpeeds.serviceSpeed;

                                    switch(accessType){
                                        case 'NFAS':
                                            $('#choose-modem .filters > div[data-category="fttc"]').click();
                                        break;
                                        case 'NWAS':
                                            $('#choose-modem .filters > div[data-category="fw"]').click();
                                        break;
                                        case 'NCAS':
                                            // FTTN == FTTB, FTTC
                                            $('#choose-modem .filters > div[data-category="fttn"]').click();
                                            console.log('FTTN,FTTB,FTTC?', data);
                                        break;
                                        case 'NHAS':
                                            $('#choose-modem .filters > div[data-category="hfc"]').click();
                                        break;
                                        case 'NSAS':
                                        break;
                                        default:
                                            if(accessMethod.indexOf('ADSL') >= 0){
                                                $('#choose-modem .filters > div[data-category="adsl"]').click();
                                            }
                                            
                                        break;
                                    }
                                }

                                if($.isArray(testOutcomes)){
                                    testOutcomes.forEach(function(r){
                                        if(r.testDescription.match('Is this a New Development')){
                                            //console.log('Is this a New Development', r.testResponse);
                                            
                                            if(newDevChargeApplies == 'No'){
                                                isDevFeeApplicable = false;
                                                $("#free").hide();
                                            }else{
                                                isDevFeeApplicable = true;
                                                $("#free").show();
                                            }
                                        }

                                        if(r.testDescription.match('Are NBN speeds available at specified location?')){
                                            //console.log('Are NBN speeds available at specified location?', r.testResponse);
                                            if(r.testResult == 'PASS'){
                                                nbnSpeedAvailable = true;
                                                nbnSpeedDescription = r.testResponse;
                                            }
                                        }
                                    });
                                }else{
                                    if(testOutcomes.testDescription.match('Is this a New Development')){
                                        //console.log('Is this a New Development', testOutcomes.testResponse);
                                        
                                        if(newDevChargeApplies == 'No')
                                            isDevFeeApplicable = false;
                                        else
                                            isDevFeeApplicable = true;
                                    }

                                    if(testOutcomes.testDescription.match('Are NBN speeds available at specified location?')){
                                        //console.log('Are NBN speeds available at specified location?', testOutcomes.testResponse);
                                        if(testOutcomes.testResult == 'PASS'){
                                            nbnSpeedAvailable = true;
                                            nbnSpeedDescription = r.testResponse;
                                        }
                                    }
                                }
                            });
                            
                        
                            $.post(self.settings.apiUrl + '/api/sq/get/result', { 
                                sc : siteDetails.nbnServiceabilityClass }, function(r){

                                var statusResponse = '',
                                response_a = '',
                                response_b = '',
                                response_c = '',
                                response_d = '';
                                
                                self.response_list = [];
                               
                                $.each(r.data, function(index, value){
                                    if(value.class == 'A')
                                        response_a = value.description;
                                    if(value.class == 'B'){
                                        response_b = value.description;
                                    }
                                });

                                // B - Speed Estimate. You should only see a speed estimate for 10,11,12,13 on FrontierLink.
                                if($.inArray(siteDetails.nbnServiceabilityClass, [10, 11, 12, 13])){
                                    $.each(r.data, function(index, value){
                                        if(value.class == 'B' && Number(value.classIndex) == 0)
                                            response_b = value.description;
                                    });

                                    if(nbnSpeedDescription != '')
                                        response_b = nbnSpeedDescription;
                                }
                                
                                // C - Whether or not a New Development Fee is payable
                                app.order.newDevFeeApplicable = false;
                                
                                if(isDevFeeApplicable){
                                    app.order.newDevFeeApplicable = true;
                                    response_c = 'The nbnTM New Development Fee is applicable. ';
                                }else
                                    response_c = 'The nbnTM New Development Fee is not applicable. ';

                                // Set dev fee on order summary
                                /*if(app.order.newDevFeeApplicable){
                                    app.computeTotals();
                                }else{
                                    
                                }*/
                                app.computeTotals();


                                response_d = 'The Service Class is '+siteDetails.nbnServiceabilityClass+', you can read about them on our <a href="https://10mates.com.au/nbn-service-classes/" class="sclink">Service Classes</a> page.';

                                //siteDetails.nbnServiceabilityClass = 0;

                                self.response_list.push('<i class="fa fa-info-circle"></i> ' + response_a);
                                self.response_list.push('<i class="fa fa-info-circle"></i> ' +response_b);
                                self.response_list.push('<i class="fa fa-info-circle"></i> ' +response_c);
                                self.response_list.push('<i class="fa fa-info-circle"></i> ' +response_d);

                                self.response_list.push('<i class="fa fa-info-circle"></i> Your nbn Point Of Interchange (POI) is '+ siteDetails.nbnPoiId +'. Your location ID is ' + siteDetails.nbnLocationID + '. The Connectivity Service Area (CSA) is ' + siteDetails.nbnCustomerServiceAreaId + '.');

                                // not-serviceable
                                if($.inArray(Number(siteDetails.nbnServiceabilityClass), 
                                    [0, 4, 7,10, 20, 30]) >= 0){

                                    $('.spinner-text').removeClass('error success')
                                    .text('Retrieving availability date for this address.');
                                        
                                    $.post(self.settings.apiUrl + '/scrape/nbn/data', 
                                        { 'address' : self.selectedAddressFormatted }, function(res){
                                        if(res.result > 0){

                                            if(res.data != '*')
                                                self.response_list.push('<i class="fa fa-info-circle"></i> Planned to be available from <strong>'+res.data+'</strong>');
                                            else
                                                self.response_list.push('<i class="fa fa-info-circle"></i> nbnTM still has work to do before your premises is ready to connect. This work may take approximately 6 to 12 months. They have not given a specific date.');
                                            
                                            app.showContactFormModal();
                                            app.showSQMap = true;

                                            $('.spinner').css('opacity', 0);
                                            $('.spinner-text').removeClass('error').addClass('success')
                                            .html('<i class="fa fa-check-circle"></i> Results received..');
                                        }

                                        setTimeout(function(){
                                            $('html, body').animate({
                                                scrollTop: $("#sq-result").offset().top
                                            }, 2000);
                                        }, 1000);

                                    }, 'json');

                                }else{
                                    app.showSQMap = false;

                                    $('.spinner').css('opacity', 0);
                                    $('.spinner-text').removeClass('error').addClass('success')
                                    .html('<i class="fa fa-check-circle"></i> Results received..');

                                    setTimeout(function(){
                                        $('html, body').animate({
                                            scrollTop: $("#sq-result").offset().top
                                        }, 2000);
                                    }, 500);
                                }
                               
                                
                            }, 'json');

                    }else
                        console.log(res);
                },'json');
            }
       },
       checkAvailability : function(searchBox){
            var self = this;
            var place = searchBox.getPlaces(); 
            
            /**
             * Resets
             */
            self.errors.address.state = false;

            if(place != undefined){
                app.showContactForm = false;
                app.showNoLocationForm = false;

                var param = {
                    'streetNo': self.streetNo,
                    'streetName': self.streetName,
                    'streetType' : self.streetType,
                    'state': self.state,
                    'postcode': self.postcode,
                    'suburb': self.suburb
                };

                $('.spinner,.spinner-text').css('opacity', 1);
                $('.spinner-text').removeClass('error success')
                    .text('Matching your address on the nbn database...');

                $.post(this.settings.apiUrl + '/api/sq/check/location', param, 
                    function(response){
                    $('.spinner').css('opacity', 0);

                    response = response.FindServiceProviderLocationIdResponse;
                    var spList = response.serviceProviderLocationList.serviceProviderLocationList;
                    var locList = spList.locationList;

                    if(locList != null){
                        var serviceProvider = spList.serviceProvider,
                        addressInfo = locList.addressInformation;
                        
                        if($.isArray(addressInfo)){
                            // Multiple location
                            self.locations = addressInfo;
                            self.step = 2;

                            setTimeout(function(){
                                $('html, body').animate({
                                    scrollTop: $("#locations").offset().top
                                }, 1000); 
                                
                                $('input.radio,input.checkbox').iCheck({
                                    checkboxClass: 'icheckbox_square-blue',
                                    radioClass: 'iradio_square-blue',
                                    increaseArea: '20%' // optional
                                }).on('ifChecked', function(event){
                                    var elm = $(event.target);
                                    app.locSubAddrType = elm.data('subaddresstype');
                                    app.locNumber = elm.data('subaddressnumber');

                                    app.doQualify(event.target.value);
                                    $('html, body').animate({
                                        scrollTop: $(".enter-your-address").offset().top
                                    }, 1000);
                                });
                            }, 300);
                        }else{
                            // Single location only
                            self.locations = [];
                            self.locations.push({
                                locationId : addressInfo.locationId,
                                displayAddress : addressInfo.displayAddress
                            });
                            self.selectedLocId = addressInfo.locationId;
                            self.doQualify(addressInfo.locationId);
                        }
                    }else{
                        self.showNoLocFormModal();
                        $('.spinner-text').removeClass('success').addClass('error').html('<i class="fa fa-warning"></i> The address you specified doesnt exist on the nbn database. You can still put an order through, but there will be a delay because we need to get your address added.');
                    }
                }, 'json');
            }
       },
       checkAvailabilityManual: function(args){
        /*
        args example:
        {
            'streetNo': self.streetNo,
            'streetName': self.streetName,
            'streetType' : self.streetType,
            'state': self.state,
            'postcode': self.postcode,
            'suburb': self.suburb
        };
        */
        var self = this;

        app.showContactForm = false;
        app.showNoLocationForm = false;

        $('.spinner,.spinner-text').css('opacity', 1);
        $('.spinner-text').removeClass('error success')
            .text('Matching your address on the nbn database...');

        $.post(this.settings.apiUrl + '/api/sq/check/location', args, 
            function(response){
            $('.spinner').css('opacity', 0);

            response = response.FindServiceProviderLocationIdResponse;
            var spList = response.serviceProviderLocationList.serviceProviderLocationList;
            var locList = spList.locationList;

            if(locList != null){
                var serviceProvider = spList.serviceProvider,
                addressInfo = locList.addressInformation;
                
                if($.isArray(addressInfo)){
                    // Multiple location
                    self.locations = addressInfo;
                    self.step = 2;

                    setTimeout(function(){
                        $('input.radio,input.checkbox').iCheck({
                            checkboxClass: 'icheckbox_square-blue',
                            radioClass: 'iradio_square-blue',
                            increaseArea: '20%' // optional
                        }).on('ifChecked', function(event){
                            console.log(event);

                            var elm = $(event.target);
                            console.log(elm.data('subAddressType'));

                            app.locSubAddrType = elm.data('subaddresstype');
                            app.locNumber = elm.data('subaddressnumber');

                            app.doQualify(event.target.value);
                            $('html, body').animate({
                                scrollTop: $(".enter-your-address").offset().top
                            }, 1000);
                        });
                    }, 300);
                }else{
                    // Single location only
                    self.locations = [];
                    self.locations.push({
                        locationId : addressInfo.locationId,
                        displayAddress : addressInfo.displayAddress
                    });
                    self.selectedLocId = addressInfo.locationId;
                    self.doQualify(addressInfo.locationId);
                }
            }else{
                self.showNoLocFormModal();
                $('.spinner-text').removeClass('success').addClass('error').html('<i class="fa fa-warning"></i> The address you specified doesnt exist on the nbn database. You can still put an order through, but there will be a delay because we need to get your address added.');
            }
        }, 'json');
       },
       checkAvailabilityByPhone : function(){
            var self = this;
            app.showContactForm = false;
            app.showNoLocationForm = false;

            $('.spinner,.spinner-text').css('opacity', 1);
            $('.spinner-text').removeClass('error success')
                .text('Matching your phone on the nbn database...');

            if(self.phone != ''){
                $.post(this.settings.apiUrl + '/api/sq/qualify/phone', {
                    'csn': $.trim(self.phone)
                }, function(res){
                    if(typeof res.error == 'undefined'){
                        var res = res.QualifyProductResponse, 
                        qualifyList = res.accessQualificationList,
                        siteAddr = res.siteAddress,
                        siteDetails = res.siteDetails,
                        isDevFeeApplicable = false, 
                        nbnSpeedAvailable = false;
                        nbnSpeedDescription = '';
                        
                        app.locLevel = '',
                        app.locSubAddrType = siteAddr.subAddressType;
                        app.locNumber = siteAddr.subAddressNumber;

                        self.selectedAddressFormatted = siteAddr.streetNumber+' '+siteAddr.streetName+' '+siteAddr.suburb+' '+siteAddr.state+' '+siteAddr.state+' '+siteAddr.postcode;

                        if($.isArray(qualifyList)){
                            qualifyList.forEach(function(data){
                                var testOutcomes = data.testOutcomes;  
                                var newDevChargeApplies = data.nbnNewDevelopmentsChargeApplies; 

                                /**
                                 * Check if PASS or FAIL
                                 */
                                if(data.qualificationResult == 'PASS'){
                                    var accessMethod = data.accessMethod;
                                    var accessType = data.accessType;
                                    var serviceSpeeds = data.availableServiceSpeeds.serviceSpeed;

                                    switch(accessType){
                                        case 'NFAS':
                                            $('#choose-modem .filters > div[data-category="fttc"]').click();
                                        break;
                                        case 'NWAS':
                                            $('#choose-modem .filters > div[data-category="fw"]').click();
                                        break;
                                        case 'NCAS':
                                            // FTTN == FTTB, FTTC
                                            $('#choose-modem .filters > div[data-category="fttn"]').click();
                                            console.log('FTTN,FTTB,FTTC?', data);
                                        break;
                                        case 'NHAS':
                                            $('#choose-modem .filters > div[data-category="hfc"]').click();
                                        break;
                                        case 'NSAS':
                                        break;
                                        default:
                                            if(accessMethod.indexOf('ADSL') >= 0){
                                                $('#choose-modem .filters > div[data-category="adsl"]').click();
                                            }
                                            
                                        break;
                                    }
                                }

                                if($.isArray(testOutcomes)){
                                    testOutcomes.forEach(function(r){
                                        if(r.testDescription.match('Is this a New Development')){
                                            //console.log('Is this a New Development', r.testResponse);
                                            
                                            if(newDevChargeApplies == 'No'){
                                                isDevFeeApplicable = false;
                                                $("#free").hide();
                                            }else{
                                                isDevFeeApplicable = true;
                                                $("#free").show();
                                            }
                                        }

                                        if(r.testDescription.match('Are NBN speeds available at specified location?')){
                                            //console.log('Are NBN speeds available at specified location?', r.testResponse);
                                            if(r.testResult == 'PASS'){
                                                nbnSpeedAvailable = true;
                                                nbnSpeedDescription = r.testResponse;
                                            }
                                        }
                                    });
                                }else{
                                    console.log(testOutcomes);
                                    if(testOutcomes.testDescription.match('Is this a New Development')){
                                        //console.log('Is this a New Development', testOutcomes.testResponse);
                                        
                                        if(newDevChargeApplies == 'No')
                                            isDevFeeApplicable = false;
                                        else
                                            isDevFeeApplicable = true;
                                    }

                                    if(testOutcomes.testDescription.match('Are NBN speeds available at specified location?')){
                                        //console.log('Are NBN speeds available at specified location?', testOutcomes.testResponse);
                                        if(testOutcomes.testResult == 'PASS'){
                                            nbnSpeedAvailable = true;
                                            nbnSpeedDescription = r.testResponse;
                                        }

                                        
                                    }
                                }
                            });
                        }else{
                            data = qualifyList;
                            console.log(qualifyList);
                            var testOutcomes = data.testOutcomes;  
                            var newDevChargeApplies = data.nbnNewDevelopmentsChargeApplies; 

                            /**
                             * Check if PASS or FAIL
                             */
                            if(data.qualificationResult == 'PASS'){
                                var accessMethod = data.accessMethod;
                                var accessType = data.accessType;
                                var serviceSpeeds = data.availableServiceSpeeds.serviceSpeed;

                                switch(accessType){
                                    case 'NFAS':
                                        $('#choose-modem .filters > div[data-category="fttc"]').click();
                                    break;
                                    case 'NWAS':
                                        $('#choose-modem .filters > div[data-category="fw"]').click();
                                    break;
                                    case 'NCAS':
                                        // FTTN == FTTB, FTTC
                                        $('#choose-modem .filters > div[data-category="fttn"]').click();
                                        console.log('FTTN,FTTB,FTTC?', data);
                                    break;
                                    case 'NHAS':
                                        $('#choose-modem .filters > div[data-category="hfc"]').click();
                                    break;
                                    case 'NSAS':
                                    break;
                                    default:
                                        if(accessMethod.indexOf('ADSL') >= 0){
                                            $('#choose-modem .filters > div[data-category="adsl"]').click();
                                        }
                                        
                                    break;
                                }
                            }

                            if($.isArray(testOutcomes)){
                                testOutcomes.forEach(function(r){
                                    if(r.testDescription.match('Is this a New Development')){
                                        //console.log('Is this a New Development', r.testResponse);
                                        
                                        if(newDevChargeApplies == 'No'){
                                            isDevFeeApplicable = false;
                                            $("#free").hide();
                                        }else{
                                            isDevFeeApplicable = true;
                                            $("#free").show();
                                        }
                                    }

                                    if(r.testDescription.match('Are NBN speeds available at specified location?')){
                                        //console.log('Are NBN speeds available at specified location?', r.testResponse);
                                        if(r.testResult == 'PASS'){
                                            nbnSpeedAvailable = true;
                                            nbnSpeedDescription = r.testResponse;
                                        }
                                    }
                                });
                            }else{
                                console.log(testOutcomes);
                                if(testOutcomes.testDescription.match('Is this a New Development')){
                                    //console.log('Is this a New Development', testOutcomes.testResponse);
                                    
                                    if(newDevChargeApplies == 'No')
                                        isDevFeeApplicable = false;
                                    else
                                        isDevFeeApplicable = true;
                                }

                                if(testOutcomes.testDescription.match('Are NBN speeds available at specified location?')){
                                    //console.log('Are NBN speeds available at specified location?', testOutcomes.testResponse);
                                    if(testOutcomes.testResult == 'PASS'){
                                        nbnSpeedAvailable = true;
                                        nbnSpeedDescription = r.testResponse;
                                    }
                                }
                            }
                        }
                        
                    
                        $.post(self.settings.apiUrl + '/api/sq/get/result', { 
                            sc : siteDetails.nbnServiceabilityClass }, function(r){

                            var statusResponse = '',
                            response_a = '',
                            response_b = '',
                            response_c = '',
                            response_d = '';
                            
                            self.response_list = [];
                        
                            $.each(r.data, function(index, value){
                                if(value.class == 'A')
                                    response_a = value.description;

                                if(value.class == 'B'){
                                    response_b = value.description;
                                }
                            });

                            // B - Speed Estimate. You should only see a speed estimate for 10,11,12,13 on FrontierLink.
                            if($.inArray(Number(siteDetails.nbnServiceabilityClass), [10, 11, 12, 13])){
                                $.each(r.data, function(index, value){
                                    //if(value.class == 'B' && Number(value.classIndex) == 0){
                                      //  response_b = value.description;
                                    //}
                                        
                                });
                                response_b = nbnSpeedDescription;
                            }
                            
                            // C - Whether or not a New Development Fee is payable
                            app.order.newDevFeeApplicable = false;
                            
                            if(isDevFeeApplicable){
                                app.order.newDevFeeApplicable = true;
                                response_c = 'The nbnTM New Development Fee is applicable. ';
                            }else
                                response_c = 'The nbnTM New Development Fee is not applicable. ';

                            response_d = 'The Service Class is '+siteDetails.nbnServiceabilityClass+', you can read about them on our Service Classes page.';

                            self.response_list.push('<i class="fa fa-info-circle"></i> ' + response_a);
                            
                            // Not-Serviceable
                            if($.inArray(Number(siteDetails.nbnServiceabilityClass), 
                                [0, 4, 7,10, 20, 30]) >= 0){

                                $('.spinner-text').removeClass('error success')
                                .text('Retrieving availability date for this address.');
                                    
                                $.post(self.settings.apiUrl + '/scrape/nbn/data', 
                                    { 'address' : self.selectedAddressFormatted }, function(res){
                                    if(res.result > 0){
                                        self.response_list.push('<i class="fa fa-info-circle"></i> Planned to be available from <strong>'+res.data+'</strong>');

                                        self.response_list.push('<i class="fa fa-info-circle"></i> ' +response_b);
                                        self.response_list.push('<i class="fa fa-info-circle"></i> ' +response_c);
                                        self.response_list.push('<i class="fa fa-info-circle"></i> ' +response_d);

                                        app.showContactFormModal();
                                        app.showSQMap = true;

                                        $('.spinner').css('opacity', 0);
                                        $('.spinner-text').removeClass('error').addClass('success')
                                        .html('<i class="fa fa-check-circle"></i> Results received..');
                                    }

                                    setTimeout(function(){
                                        $('html, body').animate({
                                            scrollTop: $("#sq-result").offset().top
                                        }, 1500);
                                    }, 1000);

                                }, 'json');

                            }else{
                                app.showSQMap = false;

                                self.response_list.push('<i class="fa fa-info-circle"></i> ' +response_b);
                                self.response_list.push('<i class="fa fa-info-circle"></i> ' +response_c);
                                self.response_list.push('<i class="fa fa-info-circle"></i> ' +response_d);

                                $('.spinner').css('opacity', 0);
                                $('.spinner-text').removeClass('error').addClass('success')
                                .html('<i class="fa fa-check-circle"></i> Results received..');

                                setTimeout(function(){
                                    $('html, body').animate({
                                        scrollTop: $("#sq-result").offset().top
                                    }, 2000);
                                }, 500);
                            }
                        
                            
                        }, 'json');

                    }else
                    console.log(res);
                }, 'json');
            }
       },
       SQFormChanged: function(){
           let self = this;

           var args = {
            'streetNo': self.streetNo,
            'streetName': self.streetName,
            'streetType' : self.streetType,
            'state': self.state,
            'postcode': self.postcode,
            'suburb': self.suburb
           };

           this.showSQFormError = true;

           if(args.streetName != '' && args.streetType != '' && args.state != '' && args.postcode != '' && args.suburb)
                this.checkAvailabilityManual(args);
       }
    }
});



/**
 * Home
 */
var app_home = new Vue({
    el : '#home',
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
                                        console.log('has Error');
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

function initJS(){
    geocoder = new google.maps.Geocoder();
    var defaultBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(-33.8902, 151.1759),
        new google.maps.LatLng(-33.8474, 151.2631)
    );
    
    var input = document.getElementById('address-field');
    var input2 = document.getElementById('address-info');
    var options = {
        bounds: defaultBounds,
        types: ['establishment']
    };
    
    //autocomplete = new google.maps.places.Autocomplete(input, options);
    searchBox = new google.maps.places.SearchBox(input);
    searchBox2 = new google.maps.places.SearchBox(input2);

    //autocomplete.addListener('place_changed', fillAddress);
    searchBox.addListener('places_changed', fillAddress);
    searchBox2.addListener('places_changed', fillAddress2);
    
    setInterval(function(){ 
        $(".pac-item").each(function(){  
            var t = $(this);
            var addressText = t.text();
            if(addressText.match('Australia') == null)
                t.remove();
        });  
    }, 300);
}

function fillAddress(){
    var places = searchBox.getPlaces();

    if (places.length == 0) 
        return;
    
    if(places != undefined){
        var data = places[0];
        var placeId = data.place_id;
        var comp = data.address_components;

        app.selectedAddressFormatted = places[0].formatted_address;
        orderComponent.order.address = places[0].formatted_address;
        app.gmap_location = places[0].formatted_address;

        var latLngLoc = places[0].geometry.location;
        
        app.selectedLocGps.lat = latLngLoc.lat();
        app.selectedLocGps.lng = latLngLoc.lng();

        app.step = 1;

        $.each(comp, function(index, component){
            var types = component.types;
            $.each(types, function(index, type){

              if(type == 'locality') {
                suburb = (component.short_name).toUpperCase();
                app.suburb = suburb;
              }

              if(type == 'administrative_area_level_1') {
                state = (component.short_name).toUpperCase();
                app.state = state;
              }

              if(type == 'street_number'){
                strNo = component.short_name;
                app.streetNo = strNo;
              }

              if(type == 'postal_code'){
                zip = component.short_name;
                app.postcode = zip;
              }

              if(type == 'route'){
                strName = (component.long_name).toUpperCase()
                var getType = strName.split(' ');
                getType = $.trim(getType[getType.length-1]);
                
                if(getType != '')
                    strName = strName.replace(getType, '');

                app.streetName = strName;
                app.streetType = getType;
              }
            });
        });
    
        if(app.state != '' && app.streetName != '')
            app.checkAvailability(searchBox);
    }
}

function fillAddress2(){
    var places = searchBox2.getPlaces();

    if (places.length == 0) 
        return;
    
    if(places != undefined){
        var data = places[0];
        var placeId = data.place_id;
        var comp = data.address_components;

        app.selectedAddressFormatted = places[0].formatted_address;
        orderComponent.order.address = places[0].formatted_address;
        app.gmap_location = places[0].formatted_address;

        var latLngLoc = places[0].geometry.location;
        
        app.selectedLocGps.lat = latLngLoc.lat();
        app.selectedLocGps.lng = latLngLoc.lng();

        app.step = 1;

        $.each(comp, function(index, component){
            var types = component.types;
            $.each(types, function(index, type){

              if(type == 'locality') {
                suburb = (component.short_name).toUpperCase();
                app.suburb = suburb;
              }

              if(type == 'administrative_area_level_1') {
                state = (component.short_name).toUpperCase();
                app.state = state;
              }

              if(type == 'street_number'){
                strNo = component.short_name;
                app.streetNo = strNo;
              }

              if(type == 'postal_code'){
                zip = component.short_name;
                app.postcode = zip;
              }

              if(type == 'route'){
                strName = (component.long_name).toUpperCase()
                var getType = strName.split(' ');
                getType = $.trim(getType[getType.length-1]);
                
                if(getType != '')
                    strName = strName.replace(getType, '');

                app.streetName = strName;
                app.streetType = getType;
              }
            });
        });
    
        if(app.state != '' && app.streetName != '')
            app.checkAvailability(searchBox2);
    }
}

$(document).ready(function(){
    app.computeTotals();

    $('#button-order').on('click', function(){
        $('html, body').animate({
            scrollTop: $("#address-section").offset().top
        }, 1000); 
        setTimeout(function(){
            $('.get-started').slideDown('normal');
        }, 800);
    });

    $('#button-order-menu').on('click', function(){
        $('html, body').animate({
            scrollTop: $("#address-section").offset().top
        }, 1000); 
        setTimeout(function(){
            $('.get-started').slideDown('normal');
        }, 800);
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
        app.phone.keep = event.target.value;
    });



    $("#agree_keep_num").iCheck({
        checkboxClass: 'icheckbox_square-blue',
        radioClass: 'iradio_square-blue',
        increaseArea: '20%' // optional
    }).on('ifChecked', function(event){
        var elm = $(event.target);
        app.phone.agree_yes = 1;
    }).on('ifUnchecked', function(event){
        app.phone.agree_yes = 0;
    });

    $("#agree_no_number").iCheck({
        checkboxClass: 'icheckbox_square-blue',
        radioClass: 'iradio_square-blue',
        increaseArea: '20%' // optional
    }).on('ifChecked', function(event){
        var elm = $(event.target);
        app.phone.agree_no = 1;
    }).on('ifUnchecked', function(event){
        app.phone.agree_no = 0;
    });

    $('.radio-field').eq(0).iCheck('check');

    $(".load-balanced-options").toggle();

    $('.btsopt').on('click', function(){
        var t = $(this);
        var el = $(".load-balanced-options");
        el.toggle();
        if(!el.is(":visible")) t.removeClass('--is-active');
    });

    $('.inaactd1').on('click', function(){
        $('.inaactd2, .inaactd2-1, .inaactd3, .inaactd3-1').removeClass('--is-active');
    });

    $('.inaactd2, .inaactd2-1').on('click', function(){
        $('.inaactd1, .inaactd3, .inaactd3-1').removeClass('--is-active');
    });

    $('.inaactd3, .inaactd3-1').on('click', function(){
        $('.inaactd1, .inaactd2, .inaactd2-1').removeClass('--is-active');
    });

    $('.dywphone').on('click', function(e){
        var t = $(this);
      
        if(t.data('show-options') == true)
            $('#phone, #voip').show();
        else    
            $('#phone, #voip').hide();
    });

    $('.btnaorf').on('click', function(e){
        var t = $(this);
        if(t.data('option') == 'phone'){
            $("#input-address-field").hide();
            $("#input-phone-field").show();
        }else{
            $("#input-address-field").show();
            $("#input-phone-field").hide();
        }
    });

    $('#phone-field').on('keyup', function(){
       if(typeof(window.pfsearch) != 'undefined')
           clearTimeout(window.pfsearch);
       
        window.pfsearch = setTimeout(function(){
            window.pfsearch = clearTimeout(window.pfsearch);
            if(app.phone != '')
                app.checkAvailabilityByPhone();
        }, 1500);
    });

    if($('.nosavepwd').length > 0){
        if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1){
             $('.nosavepwd').attr('type', 'password');
        }
    }
    
});