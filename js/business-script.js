/**
 * Frontend Script
 */

var geocoder,
map = null;
Stripe.setPublishableKey('pk_live_wlvjM3x2b9xeSIW0pclUhsBM'); //pk_live_wlvjM3x2b9xeSIW0pclUhsBM
// Stripe.setPublishableKey('pk_test_C76k2ySFWCcMjZ329VQ1GtaU');

$(document).on('scroll', function() {
    if ($(this).scrollTop() >= $('#bandwidth-profile').position().top) {
      app.isInitiallyLoaded = true
    }
  })

var app = new Vue({
    el: '#app-main',
    components: {
        'vueSlider': window[ 'vue-slider-component' ],
        Multiselect: window.VueMultiselect.default,
    },
    mounted() {
        this.getModemData()
        this.getPlanPrices()
        this.getAccessPoints()
        this.getFirewalls()
        this.show = true
        this.bandwidthProfile = 'trafficClass4'
    },
    data : {
      showPaymentForm: false,
        accessPoints: [],
        firewalls: [],
        isInitiallyLoaded: false,
        prices: [],
      selectedModem: {
          id: null,
          name: '',
      },
        selectedFirewall: {
            id: null,
            name: '',
        },
        selectedAccessPoint: [],
        selectedBandwidth: {},
      selectedModemType: '',
      modems: [],
      selectedHardwareQTY: '',
      customSelectedHardwareQTY: '',
      customSelectedWifiCoverage: '',
      selectedWifiCoverage: '',
      isFirstLoad: true,
      fullName: "",
      abn: "",
      businessName: "",
      email: "",
      phoneNumber: "",
      address: "",
      ccNum: "",
      expDate: "",
      cvc: "",
      errorsSubmit : {
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
        settings : { apiUrl : 'https://api.10mates.com.au' }, //https://api.10mates.com.au
        step : 1,
        bandwidthProfiles: [],
        availableBandwidth: [],
        qualifyProductResponse: {},
        phone : "",
        contractLength : 12,
        bandwidthProfile : "",
        requiredBandwidth : 0,
        supportPackage : "Basic",
        failOver : "noFailOver",
        rangeInput: 1,
        plans : [],
        showPhoneVoip: false,
        showWifiAP: false,
        showHardware: false,
        showWifiCoverage: false,
        isVoipSelected: false,
        showInstallationDay: false,
        showModem: false,
        showOrderSummary: false,
        showConfirmation: false,
        showChooseBonus: false,
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
        showAddress: false,
        showAdvOrder: false,
        hideText: true,
        home: true,
        business: false,
        stnd: false,

        pipInput: '',
        wifiCoverage: '',
        modemFilter: '',
        wifiCoverageSelection: '',
        wifiDevices: '',
        wifiDevicesSelection: '',
        numberType: 'No',
        businessPlanTotal: 0,
        addnum: 0,

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
        showFlag : false,
        forms: {
            contact : {
                firstName : "",
                lastName : "",
                email : "",
                phone : ""
            }
        },

        phone: {
            number: '',
            keep: '',
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
                conf3 : false,
                conf4: false,
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
    computed: {
        detailedAccessPointOrder() {
            if(this.selectedAccessPoint.length > 0) {
                return this.selectedAccessPoint.reduce(function (r, a) {
                    r[a.id] = r[a.id] || [];
                    r[a.id].push(a);
                    return r;
                }, Object.create(null));
            }
            return null
        },
        brandNames() {
            return Object.keys(_.groupBy(this.modems, 'brand'))
        },
        getWifiCoverage(){
            let wifiCoverage = 0
            let wifiCoverage1 = 0
            let totalAPRange = 0
            let wcDiff = 0
            let wcDiff1 = 0
            let range = 0
            let totalRange = 0
            if(this.customSelectedWifiCoverage) {
                wifiCoverage = this.customSelectedWifiCoverage
                wifiCoverage1 = 0
            } else {
                if(this.selectedWifiCoverage == '< 200sqm') {
                    wifiCoverage = 200
                    wifiCoverage1 = 0
                }
                if(this.selectedWifiCoverage == '201 - 500sqm') {
                    wifiCoverage = 201
                    wifiCoverage1 = 500
                }
                if(this.selectedWifiCoverage == '501 - 750sqm') {
                    wifiCoverage = 501
                    wifiCoverage1 = 750
                }
            }

            if(this.selectedAccessPoint.length > 0) {
                this.selectedAccessPoint.forEach((e) => {
                    totalAPRange = parseFloat(e.ap_range) + totalAPRange
                })
            }
            if(this.selectedModem.id) {
                range = this.modems.find(e => e.id == this.selectedModem.id).range
            }
            wcDiff = wifiCoverage - (totalAPRange + range)
            wcDiff1 = wifiCoverage1 - (totalAPRange + range)
            totalRange = totalAPRange + range
            return {
                wcDiff,
                wcDiff1,
                totalRange,
                totalAPRange
            }
        },
        filteredAccessPoints() {
            if(this.selectedModem.id) {
                let brand = this.modems.find(e => e.id == this.selectedModem.id).brand
                return this.accessPoints.filter(e => e.brand == brand)
            }
            return []
        },
        filteredModems() {
            if(this.selectedModemType) {
                return this.modems.filter(e => e.brand == this.selectedModemType)
            }
            return this.modems
        },
        pricesBackup() {
            return [
                {
                    contractLength: 24,
                    bandwidthProfile: "fastFibre",
                    price: 799
                },
                {
                    contractLength: 36,
                    bandwidthProfile: "fastFibre",
                    price: 699
                },
                {
                    contractLength: 48,
                    bandwidthProfile: "fastFibre",
                    price: 499
                },
                {
                    bandwidthProfile: "trafficClass2",
                    price: 199,
                    speed: 5,
                    type: "metro"
                },
                {
                    bandwidthProfile: "trafficClass2",
                    price: 199,
                    speed: 5,
                    type: "regional"
                },
                {
                    bandwidthProfile: "trafficClass2",
                    price: 219,
                    speed: 10,
                    type: "metro"
                },
                {
                    bandwidthProfile: "trafficClass2",
                    price: 409,
                    speed: 10,
                    type: "regional"
                },
                {
                    bandwidthProfile: "trafficClass2",
                    price: 329,
                    speed: 20,
                    type: "metro"
                },
                {
                    bandwidthProfile: "trafficClass2",
                    price: 609,
                    speed: 20,
                    type: "regional"
                },
                {
                    bandwidthProfile: "trafficClass2",
                    price: 389,
                    speed: 30,
                    type: "metro"
                },
                {
                    bandwidthProfile: "trafficClass2",
                    price: 719,
                    speed: 30,
                    type: "regional"
                },
                {
                    bandwidthProfile: "trafficClass2",
                    price: 429,
                    speed: 40,
                    type: "metro"
                },
                {
                    bandwidthProfile: "trafficClass2",
                    price: 869,
                    speed: 40,
                    type: "regional"
                },
                {
                    bandwidthProfile: "trafficClass2",
                    price: 839,
                    speed: 50,
                    type: "metro"
                },
                {
                    bandwidthProfile: "trafficClass2",
                    price: 889,
                    speed: 50,
                    type: "regional"
                },
                {
                    bandwidthProfile: "trafficClass2",
                    price: 959,
                    speed: 60,
                    type: "metro"
                },
                {
                    bandwidthProfile: "trafficClass2",
                    price: 1019,
                    speed: 60,
                    type: "regional"
                },
                {
                    bandwidthProfile: "trafficClass2",
                    price: 1029,
                    speed: 70,
                    type: "metro"
                },
                {
                    bandwidthProfile: "trafficClass2",
                    price: 1099,
                    speed: 70,
                    type: "regional"
                },
                {
                    bandwidthProfile: "trafficClass2",
                    price: 1089,
                    speed: 80,
                    type: "metro"
                },
                {
                    bandwidthProfile: "trafficClass2",
                    price: 1169,
                    speed: 80,
                    type: "regional"
                },
                {
                    bandwidthProfile: "trafficClass2",
                    price: 1139,
                    speed: 90,
                    type: "metro"
                },
                {
                    bandwidthProfile: "trafficClass2",
                    price: 1229,
                    speed: 90,
                    type: "regional"
                },
                {
                    bandwidthProfile: "trafficClass2",
                    price: 1159,
                    speed: 100,
                    type: "metro"
                },
                {
                    bandwidthProfile: "trafficClass2",
                    price: 1259,
                    speed: 100,
                    type: "regional"
                },
                {
                    bandwidthProfile: "trafficClass4",
                    price: 79,
                    speed: 50,
                },
                {
                    bandwidthProfile: "trafficClass4",
                    price: 109,
                    speed: 100,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 389,
                    speed: 10,
                    contractLength: 12,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 401,
                    speed: 20,
                    contractLength: 12,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 401,
                    speed: 30,
                    contractLength: 12,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 401,
                    speed: 40,
                    contractLength: 12,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 401,
                    speed: 50,
                    contractLength: 12,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 409,
                    speed: 60,
                    contractLength: 12,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 409,
                    speed: 70,
                    contractLength: 12,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 409,
                    speed: 80,
                    contractLength: 12,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 409,
                    speed: 90,
                    contractLength: 12,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 414,
                    speed: 100,
                    contractLength: 12,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 488,
                    speed: 200,
                    contractLength: 12,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 669,
                    speed: 300,
                    contractLength: 12,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 749,
                    speed: 400,
                    contractLength: 12,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 779,
                    speed: 500,
                    contractLength: 12,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 799,
                    speed: 600,
                    contractLength: 12,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 819,
                    speed: 700,
                    contractLength: 12,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 839,
                    speed: 800,
                    contractLength: 12,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 859,
                    speed: 900,
                    contractLength: 12,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 879,
                    speed: 1000,
                    contractLength: 12,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 489,
                    speed: 10,
                    contractLength: 12,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 544,
                    speed: 20,
                    contractLength: 12,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 573,
                    speed: 30,
                    contractLength: 12,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 595,
                    speed: 40,
                    contractLength: 12,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 612,
                    speed: 50,
                    contractLength: 12,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 679,
                    speed: 60,
                    contractLength: 12,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 689,
                    speed: 70,
                    contractLength: 12,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 699,
                    speed: 80,
                    contractLength: 12,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 709,
                    speed: 90,
                    contractLength: 12,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 719,
                    speed: 100,
                    contractLength: 12,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 799,
                    speed: 200,
                    contractLength: 12,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 909,
                    speed: 300,
                    contractLength: 12,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 979,
                    speed: 400,
                    contractLength: 12,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 1049,
                    speed: 500,
                    contractLength: 12,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 1079,
                    speed: 600,
                    contractLength: 12,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 1119,
                    speed: 700,
                    contractLength: 12,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 1159,
                    speed: 800,
                    contractLength: 12,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 1199,
                    speed: 900,
                    contractLength: 12,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 1229,
                    speed: 1000,
                    contractLength: 12,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 349,
                    speed: 10,
                    contractLength: 24,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 355,
                    speed: 20,
                    contractLength: 24,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 360,
                    speed: 30,
                    contractLength: 24,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 365,
                    speed: 40,
                    contractLength: 24,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 365,
                    speed: 50,
                    contractLength: 24,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 369,
                    speed: 60,
                    contractLength: 24,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 369,
                    speed: 70,
                    contractLength: 24,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 369,
                    speed: 80,
                    contractLength: 24,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 369,
                    speed: 90,
                    contractLength: 24,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 369,
                    speed: 100,
                    contractLength: 24,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 434,
                    speed: 200,
                    contractLength: 24,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 609,
                    speed: 300,
                    contractLength: 24,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 679,
                    speed: 400,
                    contractLength: 24,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 709,
                    speed: 500,
                    contractLength: 24,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 719,
                    speed: 600,
                    contractLength: 24,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 739,
                    speed: 700,
                    contractLength: 24,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 759,
                    speed: 800,
                    contractLength: 24,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 779,
                    speed: 900,
                    contractLength: 24,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 789,
                    speed: 1000,
                    contractLength: 24,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 439,
                    speed: 10,
                    contractLength: 24,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 486,
                    speed: 20,
                    contractLength: 24,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 518,
                    speed: 30,
                    contractLength: 24,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 530,
                    speed: 40,
                    contractLength: 24,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 548,
                    speed: 50,
                    contractLength: 24,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 609,
                    speed: 60,
                    contractLength: 24,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 619,
                    speed: 70,
                    contractLength: 24,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 629,
                    speed: 80,
                    contractLength: 24,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 639,
                    speed: 90,
                    contractLength: 24,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 649,
                    speed: 100,
                    contractLength: 24,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 719,
                    speed: 200,
                    contractLength: 24,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 819,
                    speed: 300,
                    contractLength: 24,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 879,
                    speed: 400,
                    contractLength: 24,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 939,
                    speed: 500,
                    contractLength: 24,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 979,
                    speed: 600,
                    contractLength: 24,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 1009,
                    speed: 700,
                    contractLength: 24,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 1049,
                    speed: 800,
                    contractLength: 24,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 1079,
                    speed: 900,
                    contractLength: 24,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 1119,
                    speed: 1000,
                    contractLength: 24,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 329,
                    speed: 10,
                    contractLength: 36,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 336,
                    speed: 20,
                    contractLength: 36,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 342,
                    speed: 30,
                    contractLength: 36,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 347,
                    speed: 40,
                    contractLength: 36,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 347,
                    speed: 50,
                    contractLength: 36,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 351,
                    speed: 60,
                    contractLength: 36,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 351,
                    speed: 70,
                    contractLength: 36,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 351,
                    speed: 80,
                    contractLength: 36,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 351,
                    speed: 90,
                    contractLength: 36,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 351,
                    speed: 100,
                    contractLength: 36,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 417,
                    speed: 200,
                    contractLength: 36,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 579,
                    speed: 300,
                    contractLength: 36,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 639,
                    speed: 400,
                    contractLength: 36,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 669,
                    speed: 500,
                    contractLength: 36,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 679,
                    speed: 600,
                    contractLength: 36,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 699,
                    speed: 700,
                    contractLength: 36,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 719,
                    speed: 800,
                    contractLength: 36,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 739,
                    speed: 900,
                    contractLength: 36,
                },
                {
                    bandwidthProfile: "lowCostEnterpriseEthernet",
                    price: 749,
                    speed: 1000,
                    contractLength: 36,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 419,
                    speed: 10,
                    contractLength: 36,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 456,
                    speed: 20,
                    contractLength: 36,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 490,
                    speed: 30,
                    contractLength: 36,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 503,
                    speed: 40,
                    contractLength: 36,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 521,
                    speed: 50,
                    contractLength: 36,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 579,
                    speed: 60,
                    contractLength: 36,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 589,
                    speed: 70,
                    contractLength: 36,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 589,
                    speed: 80,
                    contractLength: 36,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 599,
                    speed: 90,
                    contractLength: 36,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 609,
                    speed: 100,
                    contractLength: 36,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 679,
                    speed: 200,
                    contractLength: 36,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 769,
                    speed: 300,
                    contractLength: 36,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 829,
                    speed: 400,
                    contractLength: 36,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 889,
                    speed: 500,
                    contractLength: 36,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 929,
                    speed: 600,
                    contractLength: 36,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 959,
                    speed: 700,
                    contractLength: 36,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 989,
                    speed: 800,
                    contractLength: 36,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 1019,
                    speed: 900,
                    contractLength: 36,
                },
                {
                    bandwidthProfile: "highCostEnterpriseEthernet",
                    price: 1059,
                    speed: 1000,
                    contractLength: 36,
                },
            ]
        },
        isNonNBNAvailable() {
          if(this.bandwidthProfiles.length > 0) {
            if(this.bandwidthProfiles.find(e => e.accessMethod == "Metro Ethernet").qualificationResult == "PASS") {
                return true
            }
            return false
          }
          return true
        },
        isNCASAvailable() {
          if(this.bandwidthProfiles.length > 0) {
            if(this.bandwidthProfiles.find(e => e.accessType == "NCAS").qualificationResult == "PASS") {
                return true
            }
            return false
          }
          return true
        },
        isNHASAvailable() {
          if(this.bandwidthProfiles.length > 0) {
            if(this.bandwidthProfiles.find(e => e.accessType == "NHAS").qualificationResult == "PASS") {
              return true
            }
            return false
          }
          return false
        },
        isNFASAvailable() {
          if(this.bandwidthProfiles.length > 0) {
            if(this.bandwidthProfiles.find(e => e.accessType == "NFAS").qualificationResult == "PASS") {
              return true
            }
            return false
          }
          return true
        },
        totalPlanPrice() {
            let pz = ''
            if(this.bandwidthProfiles.length > 0) {
                pz = this.bandwidthProfiles.find( e => e.qualificationResult == "PASS").priceZone.toLowerCase()
            }
          let planPrice = 0
          console.log(this.bandwidthProfile != "" && this.requiredBandwidth != "" && this.contractLength != "" && this.bandwidthProfiles > 0)
          if(this.bandwidthProfile != "" && this.requiredBandwidth != "" && this.contractLength != "") {
            if(pz != '') {
                if(this.bandwidthProfile == "trafficClass2") {
                    planPrice = this.prices.find(x => x.bandwidthProfile == this.bandwidthProfile && x.speed == this.requiredBandwidth && x.type == pz).price
                  }
                  if(this.bandwidthProfile == "trafficClass4") {
                    planPrice = this.prices.find(x => x.bandwidthProfile == this.bandwidthProfile && x.speed == this.requiredBandwidth).price
                  }
                  if(this.bandwidthProfile == "highCostEnterpriseEthernet" || this.bandwidthProfile == "lowCostEnterpriseEthernet") {
                    planPrice = this.prices.find(x => x.bandwidthProfile == this.bandwidthProfile && x.speed == this.requiredBandwidth && x.contractLength == this.contractLength).price
                  }
                  if(this.bandwidthProfile == "fastFibre") {
                    planPrice = this.prices.find(x => x.bandwidthProfile == this.bandwidthProfile && x.contractLength == this.contractLength).price
                  }
            } else {
                if(this.prices.length > 0) {
                   if(this.bandwidthProfile == "trafficClass2") {
                    planPrice = this.prices.find(x => x.bandwidthProfile == this.bandwidthProfile && x.speed == this.requiredBandwidth).price
                  }
                  if(this.bandwidthProfile == "trafficClass4") {
                    planPrice = this.prices.find(x => x.bandwidthProfile == this.bandwidthProfile && x.speed == this.requiredBandwidth).price
                  }
                  if(this.bandwidthProfile == "highCostEnterpriseEthernet" || this.bandwidthProfile == "lowCostEnterpriseEthernet") {
                    planPrice = this.prices.find(x => x.bandwidthProfile == this.bandwidthProfile && x.speed == this.requiredBandwidth && x.contractLength == this.contractLength).price
                  }
                  if(this.bandwidthProfile == "fastFibre") {
                    planPrice = this.prices.find(x => x.bandwidthProfile == this.bandwidthProfile && x.contractLength == this.contractLength).price
                  }
                }

            }
            return planPrice
          } else {
            return 0
          }
        },
        supportPackagePrice() {
            if(this.supportPackage == "Basic") {
                return 0
            }
            if(this.supportPackage == "Bronze") {
                return 45
            }
            if(this.supportPackage == "Silver") {
                return 60
            }
            if(this.supportPackage == "Gold") {
                return 70
            }
            if(this.supportPackage == "Platinum") {
                return 80
            }
        },
        totalMonthCost() {
          return parseFloat(this.totalPlanPrice) + parseFloat(this.supportPackagePrice)
        },
        installationCharge() {

            return 0
        },
        totalFailOver() {
          let fail = 0
            if(this.failOver == "failover4g") {
                fail = 200
            }
            return fail
        },
        getTotalPayable() {
            let modem = 0
            let firewall = 0
            let ap = 0
            if(this.selectedModem.name) {
                modem =  parseFloat(this.modems.find(e => e.id == this.selectedModem.id).price)
            }
            if(this.selectedFirewall.name) {
                firewall =  parseFloat(this.firewalls.find(e => e.id == this.selectedFirewall.id).price)
            }
            if(this.selectedAccessPoint.length > 0) {
                this.selectedAccessPoint.forEach((e) => {
                    ap = parseFloat(e.price) + ap
                })
            }
            return parseFloat(parseFloat(this.totalMonthCost) + this.totalFailOver + modem + ap + firewall ).toFixed(2)
        },
        getMinimumCost12Month() {
            let foMultiplier = parseFloat(this.contractLength) / 12
            let fo =  parseFloat(this.totalFailOver) * foMultiplier
            let modem = 0
            let firewall = 0
            let ap = 0
            if(this.selectedModem.name) {
                modem =  parseFloat(this.modems.find(e => e.id == this.selectedModem.id).price)
            }
            if(this.selectedFirewall.name) {
                firewall =  parseFloat(this.firewalls.find(e => e.id == this.selectedFirewall.id).price)
            }
            if(this.selectedAccessPoint.length > 0) {
                this.selectedAccessPoint.forEach((e) => {
                    ap = parseFloat(e.price) + ap
                })
            }
            if(parseFloat(this.totalMonthCost) > 0) {
                return parseFloat((parseFloat(this.totalMonthCost)  *  parseFloat(this.contractLength)) + fo + modem + ap + firewall).toFixed(2)
            } else {
                return "0.00"
            }
        },
    },
    watch: {
        requiredBandwidth(e) {
            this.selectedBandwidth = this.availableBandwidth.find((x) => x.value == e)
        },
        selectedBandwidth(e, x) {
            if(e) {
                this.requiredBandwidth = e.value
            }
        },
        contractLength(e) {
            this.isInitiallyLoaded = true
            setTimeout(function () {
                $('html, body').animate({
                    scrollTop: $('#required-bandwidth').offset().top
                }, 1000);
            }, 100);
        },
        failOver(e) {
            this.isInitiallyLoaded = true
            setTimeout(function () {
                $('html, body').animate({
                    scrollTop: $('#hardware').offset().top
                }, 1000);
            }, 100);
        },
        selectedHardwareQTY(e) {
            this.isInitiallyLoaded = true
            this.customSelectedHardwareQTY = ''
            setTimeout(function () {
                $('html, body').animate({
                    scrollTop: $('#wifi-coverage').offset().top
                }, 1000);
            }, 100);
        },
        selectedWifiCoverage(e) {
            this.isInitiallyLoaded = true
            this.customSelectedWifiCoverage = ''
        },
        supportPackage(e) {
            this.isInitiallyLoaded = true
            setTimeout(function () {
                $('html, body').animate({
                    scrollTop: $('#fail-over').offset().top
                }, 1000);
            }, 100);
        },
        bandwidthProfile(e) {
            // if(e == "fastFibre") {
            //     if(this.bandwidthProfiles.filter(e => e.accessMethod == "Metro Ethernet")[0].availableServiceSpeeds == null ) {
            //         param = {
            //             'qualifyID': this.qualifyProductResponse.qualificationID,
            //             'accessMethod':this.bandwidthProfiles.filter(e => e.accessMethod == "Metro Ethernet")[0].accessMethod,
            //             'serviceSpeed' : "1000Mbps/1000Mbps",
            //         };
            //     } else {

            //         param = {
            //             'qualifyID': this.qualifyProductResponse.qualificationID,
            //             'accessMethod': this.bandwidthProfiles.filter(e => e.accessMethod == "Metro Ethernet")[0].accessMethod,
            //             'serviceSpeed' : this.bandwidthProfiles.filter(e => e.accessMethod == "Metro Ethernet")[0].availableServiceSpeeds.serviceSpeed.filter(e => e.status == "PASS")[this.bandwidthProfiles.filter(e => e.accessMethod == "Metro Ethernet")[0].availableServiceSpeeds.serviceSpeed.filter(e => e.status == "PASS").length - 1 ].serviceSpeed,
            //         };
            //     }
            // }
            if(e == "trafficClass2") {
                this.availableBandwidth = [
                    {
                        value: 0,
                        name: '0'
                    },
                    {
                        value: 5,
                        name: '5/5'
                    },
                    {
                        value: 10,
                        name: '10/10'
                    },
                    {
                        value: 20,
                        name: '20/20'
                    },
                    {
                        value: 30,
                        name: '30/30'
                    },
                    {
                        value: 40,
                        name: '40/40'
                    },
                    {
                        value: 50,
                        name: '50/50'
                    },
                    {
                        value: 60,
                        name: '60/60'
                    },
                    {
                        value: 70,
                        name: '70/70'
                    },{
                        value: 80,
                        name: '80/80'
                    },
                    {
                        value: 90,
                        name: '90/90'
                    },
                    {
                        value: 100,
                        name: '100/100'
                    },

                ]
                this.requiredBandwidth = 5
            }
            if(e == "trafficClass4") {
                this.availableBandwidth = [
                    {
                        value: 50,
                        name: '50/20'
                    },
                    {
                        value: 100,
                        name: '100/40'
                    },

                ]
                this.requiredBandwidth = 100
            }
            if(e == "lowCostEnterpriseEthernet" || e == "highCostEnterpriseEthernet") {
                 this.availableBandwidth = [
                    {
                        value: 5,
                        name: '5/5'
                    },
                    {
                        value: 10,
                        name: '10/10'
                    },
                    {
                        value: 20,
                        name: '20/20'
                    },
                    {
                        value: 30,
                        name: '30/30'
                    },
                    {
                        value: 40,
                        name: '40/40'
                    },
                    {
                        value: 50,
                        name: '50/50'
                    },
                    {
                        value: 60,
                        name: '60/60'
                    },
                    {
                        value: 70,
                        name: '70/70'
                    },{
                        value: 80,
                        name: '80/80'
                    },
                    {
                        value: 90,
                        name: '90/90'
                    },
                    {
                        value: 100,
                        name: '100/100'
                    },
                    {
                        value: 200,
                        name: '200/200'
                    },
                    {
                        value: 300,
                        name: '300/300'
                    },
                    {
                        value: 400,
                        name: '400/400'
                    },
                    {
                        value: 500,
                        name: '500/500'
                    },
                    {
                        value: 600,
                        name: '600/600'
                    },
                    {
                        value: 700,
                        name: '700/700'
                    },
                    {
                        value: 800,
                        name: '800/800'
                    },
                    {
                        value: 900,
                        name: '900/900'
                    },
                    {
                        value: 1000,
                        name: '1000/1000'
                    },

                ]
                this.requiredBandwidth = 10
            }
            if(e == "fastFibre") {
                this.availableBandwidth = [
                    {
                        value: 0,
                        name: '0'
                    },
                    {
                        value: 1000,
                        name: '1000/1000'
                    },

                ]
                this.requiredBandwidth = 0
            }
            console.log(this.availableBandwidth)
            this.$forceUpdate()
            // $.post(this.settings.apiUrl + '/api/fastfibre/getPricing', param, null, 'json')
            //     .done((response) =>{

            //         try{
            //             this.plans = response.GetFastFibreProductPricingDetailResponse.priceList.priceInformation
            //             let arr1 = []
            //             this.plans.forEach((e, index) => {
            //                 e.id = index + 1
            //                 let arr = e.description.split(" ")
            //                 let instaCharge = 0
            //                 arr.forEach((x) => {
            //                     if(x[0] == "$" ) {
            //                         instaCharge =  x.split("$")
            //                     }
            //                 })
            //                 if(parseFloat(instaCharge[1]) > 0) {
            //                     arr1.push(e)
            //                 }
            //             })
            //             this.plans = arr1

            //             this.showFlag = true
            //             app.showFlag = true;
            //             $('.spinner').css('opacity', 0);
            //             $('.spinner-text').css('opacity', 0);
            //         }catch(e){
            //             console.error('error', e);
            //             $.alert({
            //                 theme: 'modern',
            //                 type: 'red',
            //                 title: 'Error',
            //                 content: 'The checker is currently down or area is not serviceable, please contact us in the chat and we will check it manually. Thanks'
            //             });
            //         }

            //     }).fail(() =>{
            //     $.alert({
            //         theme: 'modern',
            //         type: 'red',
            //         title: 'Error',
            //         content: 'The checker is currently down or area is not serviceable, please contact us in the chat and we will check it manually. Thanks'
            //     });
            // });
            if(!this.isFirstLoad) {
                this.isInitiallyLoaded = true
                setTimeout(function () {
                    $('html, body').animate({
                        scrollTop: $('#contract-length').offset().top
                    }, 1000);
                }, 100);
            }
            this.isFirstLoad = false
        },
        wifiCoverageSelection(e) {
            if(e != "") {
                this.wifiCoverage = ""
            }
        },
        wifiDevicesSelection(e) {
            if(e != "") {
                this.wifiDevices = ""
            }
        }
    },
    methods : {
    selectWiFiCoverage(e) {
        this.selectedWifiCoverage = e
        this.selectedAccessPoint = []
        setTimeout(function () {
            $('html, body').animate({
                scrollTop: $('#choose-modem').offset().top
            }, 1000);
        }, 100);
    },
    customWifiCoverageHandler() {
        this.selectedWifiCoverage = ''
        this.selectedAccessPoint = []
    },
    addAP(e) {
        if(this.selectedWifiCoverage != '' ||  this.customSelectedWifiCoverage != '') {
            if(this.getWifiCoverage.wcDiff >= 0 || this.getWifiCoverage.wcDiff1 >= 0) {
                return this.selectedAccessPoint.push(e)
            }
            return $.alert({
                theme : 'modern', icon : 'fa fa-exclamation-circle', type : 'red', title : 'Oh No!',
                content : `You have exceeded the amount of devices needed for your area.`,
                draggable: false
            });
        }
        return $.alert({
            theme : 'modern', icon : 'fa fa-exclamation-circle', type : 'red', title : 'Oh No!',
            content : `Please add an area coverage so we can estimate how many devices are needed for your setup.`,
            draggable: false
        });

    },
    getModemData() {
        $.ajax({
            type : 'GET',
            url :'https://api.10mates.com.au/api/business/modems',
            crossDomain: true,
            dataType: 'jsonp',
            contentType: false,
            cache: false,
            processData:false,
            beforeSend : function(){
            },
            success: (data, textStatus, xhr) => {
                if(xhr.status == 200) {
                    this.modems = data.data
                    this.modems.forEach((e) => {
                        e.modem_types = ''
                        e.dataClick = e.name
                        e.modem_type.forEach((x, index) => {
                            e.range = 0
                            if(e.modem_range !== null && e.modem_range != "") {
                                e.range = parseFloat(e.modem_range.replace(' m2',''))
                            }
                            if(index < e.modem_type.length - 1 ) {
                                if(x.modem_type != '3G/4G') {
                                    e.modem_types += x.modem_type.toLowerCase() + ','
                                } else {
                                    e.modem_types += x.modem_type + ','
                                }
                            }
                            if(index == e.modem_type.length - 1 ) {
                                if(x.modem_type != '3G/4G') {
                                    e.modem_types += x.modem_type.toLowerCase()
                                } else {
                                    e.modem_types += x.modem_type
                                }
                            }
                        })
                    })
                    console.log(this.modems)
                }
                else {

                }
            },
            error: (XMLHttpRequest, textStatus, errorThrown) => {

            }
        });
    },
    getAccessPoints() {
            $.ajax({
                type : 'GET',
                url :'https://api.10mates.com.au/api/business/access-points',
                crossDomain: true,
                dataType: 'jsonp',
                contentType: false,
                cache: false,
                processData:false,
                beforeSend : function(){
                },
                success: (data, textStatus, xhr) => {
                    if(xhr.status == 200) {
                        this.accessPoints = data.data
                    }
                },
                error: (XMLHttpRequest, textStatus, errorThrown) => {

                }
            });
        },
    getFirewalls() {
            $.ajax({
                type : 'GET',
                url :'https://api.10mates.com.au/api/business/firewalls',
                crossDomain: true,
                dataType: 'jsonp',
                contentType: false,
                cache: false,
                processData:false,
                beforeSend : function(){
                },
                success: (data, textStatus, xhr) => {
                    if(xhr.status == 200) {
                        this.firewalls = data.data
                    }
                },
                error: (XMLHttpRequest, textStatus, errorThrown) => {

                }
            });
        },
    getPlanPrices() {
            $.ajax({
                type : 'GET',
                url :'https://api.10mates.com.au/api/business/plan-prices',
                crossDomain: true,
                dataType: 'jsonp',
                contentType: false,
                cache: false,
                processData:false,
                beforeSend : function(){
                },
                success: (data, textStatus, xhr) => {
                    if(xhr.status == 200) {
                        this.prices = data.data
                        if(this.prices.length > 0) {
                            this.prices.forEach((e) => {
                                e.speed = e.speed.toLowerCase()
                                let extractedSpeed = e.speed.split("mbps")
                                e.speed = extractedSpeed[0]
                            })
                        }
                    }
                },
                error: (XMLHttpRequest, textStatus, errorThrown) => {

                }
            });
        },
    handleDragOrChange(e) {
        setTimeout(() => {
            this.animateToSection('#support-package');
        }, 100);
    },
      validateEmail(email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
      },
      doSubmitOrder() {
        this.errorsSubmit = {
            name : false,
            email : false,
            phone : false,
            address : false,
            ccNum : false,
            expDate : false,
            cvc : false,
        }
        var exp = this.expDate.split('/'),
        valid_card = Stripe.card.validateCardNumber(this.ccNum),
        valid_exp = Stripe.card.validateExpiry(exp[0], exp[1]),
        valid_cvc = Stripe.card.validateCVC(this.cvc);
          if(this.selectedHardwareQTY == '' &&  this.customSelectedHardwareQTY == '') {
              return $.alert({
                  theme : 'modern', icon : 'fa fa-exclamation-circle', type : 'red', title : 'Oh No!',
                  content : `Hardware quantity is required to process this order.`,
                  draggable: false
              });
          }
          if(this.selectedModem.id == null) {
              return $.alert({
                  theme : 'modern', icon : 'fa fa-exclamation-circle', type : 'red', title : 'Oh No!',
                  content : `A modem is required to process this order.`,
                  draggable: false
              });
          }
          if(this.selectedFirewall.id == null) {
              return $.alert({
                  theme : 'modern', icon : 'fa fa-exclamation-circle', type : 'red', title : 'Oh No!',
                  content : `A firewall is required to process this order.`,
                  draggable: false
              });
          }
          if(this.getWifiCoverage.wcDiff > 0) {
              return $.alert({
                  theme : 'modern', icon : 'fa fa-exclamation-circle', type : 'red', title : 'Oh No!',
                  content : `You are still short of ${this.getWifiCoverage.wcDiff}sqm. to cover the minimum range`,
                  draggable: false
              });
          }
          if(this.getWifiCoverage.wcDiff1 > 0) {
              return $.alert({
                  theme : 'modern', icon : 'fa fa-exclamation-circle', type : 'red', title : 'Oh No!',
                  content : `You are still short of ${this.getWifiCoverage.wcDiff1}sqm. to cover the maximum range`,
                  draggable: false
              });
          }
          if(this.selectedWifiCoverage == '' &&  this.customSelectedWifiCoverage == '') {
              return $.alert({
                  theme : 'modern', icon : 'fa fa-exclamation-circle', type : 'red', title : 'Oh No!',
                  content : `Please add an area coverage so we can estimate how many devices are needed for your setup.`,
                  draggable: false
              });
          }

        if (this.fullName == ''
            || this.email == '' || this.phone == '' ||
            this.address == '' ||
                !this.validateEmail(this.email)) {

            if(this.fullName == '')
                this.errorsSubmit.name = 'This field is required';

            if(this.email == '')
                this.errors.email = 'This field is required';

            if(this.address == '')
                this.errorsSubmit.address = 'This field is required';

            if(!this.validateEmail(this.email) && this.email != '')
                this.errorsSubmit.email = 'Email is invalid.';
            if( this.email == '')
                this.errorsSubmit.email = 'This field is required';
            if(this.phoneNumber == '')
                this.errorsSubmit.phone = 'Please specify a valid phone #';
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
                        let ap_price = 0
                        let modem_price = 0
                        let firewall_price = 0
                        // if(this.accessPoints.find(e => e.id == this.selectedAccessPoint.id).price) {
                        //     ap_price = this.accessPoints.find(e => e.id == this.selectedAccessPoint.id).price
                        // }
                        let ap_details = []
                        Object.keys(this.detailedAccessPointOrder).forEach((e) => {
                            ap_details.push({
                                name: this.detailedAccessPointOrder[e][0].name,
                                qty: this.detailedAccessPointOrder[e].length,
                                price: this.detailedAccessPointOrder[e][0].price
                            })
                        })
                        if(this.modems.find(e => e.id == this.selectedModem.id).price) {
                            modem_price = this.modems.find(e => e.id == this.selectedModem.id).price
                        }
                        if(this.firewalls.find(e => e.id == this.selectedFirewall.id).price) {
                            firewall_price = this.firewalls.find(e => e.id == this.selectedFirewall.id).price
                        }
                        $.ajax({
                            type: "POST",
                            dataType: 'json',
                            contentType: 'application/json; charset=utf-8',
                            url: this.settings.apiUrl + '/api/business/v2/order/create',
                            beforeSend: function(){},
                            data: JSON.stringify({
                                token : token,
                                name : this.fullName,
                                business_name : this.businessName,
                                abn : this.abn,
                                ap_details,
                                email : this.email,
                                phone : this.phoneNumber,
                                access_points: this.selectedAccessPoint,
                                address : this.address,
                                modem: {
                                    id: this.selectedModem.id,
                                    name: this.selectedModem.name,
                                    price: modem_price,
                                },
                                firewall: {
                                    id: this.selectedFirewall.id,
                                    name: this.selectedFirewall.name,
                                    price: firewall_price,
                                },
                                hardware: this.selectedHardwareQTY ? this.selectedHardwareQTY : this.customSelectedHardwareQTY,
                                wifi_coverage: this.selectedWifiCoverage ? this.selectedWifiCoverage : this.customSelectedWifiCoverage,
                                contract_length: this.contractLength,
                                bandwidth_profile: this.bandwidthProfile,
                                bandwidth_profile_price: this.totalPlanPrice,
                                required_bandwidth: this.requiredBandwidth,
                                required_bandwidth_string: this.availableBandwidth.find((e) => e.value == this.requiredBandwidth).name,
                                support_package: this.supportPackage,
                                support_package_price: this.supportPackagePrice,
                                failover: this.failOver,
                                failover_price: this.totalFailOver,
                                total_payable_now: this.getTotalPayable,
                                total_monthly: this.totalMonthCost

                            }),
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


            }
            else{
                var btn = $("#submit-order");
                btn.removeAttr('disabled').val('Submit Order').parent().removeClass('disabled');
                btn.parent().find('svg').show();
                btn.parent().find('.fa').remove();

                if(!valid_card)
                    this.errorsSubmit.ccNum = 'Invalid credit card #';
                if(!valid_exp)
                    this.errorsSubmit.expDate = 'Invalid expiration date';
                if(!valid_cvc)
                    this.errorsSubmit.cvc = 'CVC is invalid';
            }
          }

        },
        animateToSection(elm, transition = 1000){
            $('html, body').animate({
                scrollTop: $(elm).offset().top
            }, transition);
        },
        scrollPay: function(){
            let self = this;
            orderComponent.showOrderForm = true;
            this.showPaymentForm = true
            setTimeout(function () {
                $('html, body').animate({
                    scrollTop: $('#order').offset().top
                }, 1000);
            }, 100);
            // this.animateToSection('#order');
        },
        choosePlanNBN(){
            this.animateToSection('#internet-speed-nbn');
        },
        choosePlanNBNFibr(){
            this.animateToSection('#internet-speed-fibr');
        },
        doComputeBusinessCost: function(){
            var total = 0;
            if(this.pipInput > 3)
                total = (Number(this.pipInput-3)*10);
            else
                total = 0;

            this.businessPlanTotal = 50 + Number(this.addnum) + total;

            this.computeTotals();

            return false;
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

            this.businessPlanTotal = this.businessTotal + add13Number + total;

            this.addnum = add13Number;
            this.numberType = type;

            this.doComputeBusinessCost();
            return this.addnum;
        },

        setCallers(cost, callersCount){
            if(this.activeSection != 2)
                this.setPhoneFormDefaults();

            this.activeSection = 2;
            this.pipInput = callersCount;

            this.choosenPlan = "Business Phone / VOIP";
            this.businessPlanTotal =  50 + cost;
            this.callers = cost;
            this.showModem = true;
            setTimeout(function () {
                $('html, body').animate({
                    scrollTop: $('#choose-modem').offset().top
                }, 1000);
            }, 100);
            this.callerCount = callersCount;
            this.order.phoneCalls = 'business-phone';

            this.doComputeBusinessCost();
        },

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

        onClickhome : function () {
            this.home = true,
            this.business = false,
            this.stnd = false
        },
        onClickbus : function () {
            this.home = false,
            this.business = true,
            this.stnd = false
        },
        onClickstnd : function () {
            this.home = false,
            this.business = false,
            this.stnd = true
        },
        Adv: function () {
            i = 1;
            if(1==1){
                this.showAdvOrder = true;
                this.hideText = false;
            }
        },
        Adv2: function () {
            this.showAdvOrder = false;
            this.hideText = true;
        },
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

            this.showChooseBonus = true;
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
       selectModemFilter(e) {
            this.modemFilter = e
       // this.animateToSection('#choose-modem')
            this.showModem = true;
            setTimeout(function () {
                $('html, body').animate({
                    scrollTop: $('#choose-modem').offset().top
                }, 1000);
            }, 100);
       },
       selectWifiCoverage(e) {
        this.wifiCoverageSelection = e
        setTimeout(function () {
            $('html, body').animate({
                scrollTop: $('#modem-brand').offset().top
            }, 1000);
        }, 100);
        this.showModem = true;
       },
       wifiCoverageKeyup() {
        this.wifiCoverageSelection = ''
        setTimeout(function () {
            $('html, body').animate({
                scrollTop: $('#modem-brand').offset().top
            }, 1000);
        }, 100);
        this.showModem = true;
       },
       wifiDevicesKeyup() {
        this.wifiDevicesSelection = ''
        setTimeout(function () {
            $('html, body').animate({
                scrollTop: $('#wifiCoverage').offset().top
            }, 1000);
        }, 100);
       },
       selectWifiDevices(e) {
        this.wifiDevicesSelection = e
        setTimeout(function () {
            $('html, body').animate({
                scrollTop: $('#wifiCoverage').offset().top
            }, 1000);
        }, 100);
       },
       updateField : function(name,  value, id){
           this.isInitiallyLoaded = true
           if(name == 'loadBalancedConn'){
                this.order.internetSpeed = '';
                this.amounts.internetSpeed = 0;
                $('#internet-speed .choice__item').removeClass('--is-active');
           }
           if(name == 'internetSpeed'){
                this.order.loadBalancedConn = '';
                this.amounts.loadBal = 0;
                this.showHardware = true
                this.showWifiCoverage = true
               $('#load-balanced .choice__item').removeClass('--is-active');
               // this.animateToSection('#choose-modem')
               setTimeout(function () {
                   $('html, body').animate({
                       scrollTop: $('#hardware').offset().top
                   }, 1000);
               }, 100);
               this.showModem = true;
           }
           if(name == 'modem'){
                // this.showPhoneVoip = true;
                // this.animateToSection('.modem-configuration')
                this.selectedModem = {
                    id: id,
                    name: value,
                }
            //    this.showWifiAP = true
            //    setTimeout(function () {
            //        $('html, body').animate({
            //            scrollTop: $('#wifiAP').offset().top
            //        }, 1000);
            //    }, 100);
               setTimeout(function () {
                   $('html, body').animate({
                       scrollTop: $('#choose-access-point').offset().top
                   }, 1000);
               }, 100);
            }
           if(name == 'firewall'){
                // this.showPhoneVoip = true;
                // this.animateToSection('.modem-configuration')
                this.selectedFirewall = {
                    id: id,
                    name: value,
                }
            //    this.showWifiAP = true
            //    setTimeout(function () {
            //        $('html, body').animate({
            //            scrollTop: $('#wifiAP').offset().top
            //        }, 1000);
            //    }, 100);
               setTimeout(function () {
                   $('html, body').animate({
                       scrollTop: $('#confirmation').offset().top
                   }, 1000);
               }, 100);
            }
           // if(name == 'accessPoint'){
           //     // this.showPhoneVoip = true;
           //     // this.animateToSection('.modem-configuration')
           //     this.selectedAccessPoint  = {
           //         id: id,
           //         name: value,
           //     }
           //     this.showConfirmation = true;
           //     setTimeout(function () {
           //         $('html, body').animate({
           //             scrollTop: $('#confirmation').offset().top
           //         }, 1000);
           //     }, 100);
           // }
            if(name == 'phoneHardware') {
                this.animateToSection('#voip');
            }
            if(name == 'voipGateway'){
                this.showInstallationDay = true;
                this.animateToSection('#calendar');
            }

            if(name == 'bonus'){
                $('.noBonusBtn').removeClass('--is-active');
                this.showConfirmation = true;
                this.animateToSection('.bonus-list');
            }

            if(name == 'conf1' || name == 'conf2' || name == 'conf3' || name == 'conf4'){
                this.order.confirm[name] =value;

                if(this.order.confirm['conf1'] && this.order.confirm['conf2'] && this.order.confirm['conf3'] && this.order.confirm['conf4']){
                    this.showOrderSummary = true;
                    setTimeout(function () {
                        $('html, body').animate({
                            scrollTop: $('#order-summary').offset().top
                        }, 1000);
                    }, 100);
                    // this.animateToSection('#order-summary');
                }
            }

            if(name == 'ipAddr'){
                this.showConfirmation = true;
                setTimeout(function () {
                    $('html, body').animate({
                        scrollTop: $('#confirmation').offset().top
                    }, 1000);
                }, 100);
            }

            if(name == 'familyFilter'){
                this.order.familyFilter = value;
                this.animateToSection('#professional-install');
            }
            if(name == 'professionalInstall'){
                this.showConfirmation = true;
                this.animateToSection('#confirmation');
            }

            if(name == 'phoneCalls'){
                if(value != 'no-plan')
                    this.animateToSection('#phone-call-form');
                else{
                    self.showInstallationDay = true;
                    this.animateToSection('#calendar');
                }

            }
            this.order[name] = value;
            this.computeTotals();
       },
       getPayableNow : function(){
           var oneMonth = this.getMonthlyCost();
           var hardware = this.amounts.modem + this.amounts.phone + this.amounts.voipGateway;
           var other = this.amounts.profIns;
           var devFee = 0;

           if(this.order.newDevFeeApplicable){
            if(this.order.devFeeOption != 'monthly')
                devFee = 300;
           }

           return (oneMonth + hardware + other + devFee);
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
           this.amounts.newDevFee = 0;

           if(this.order.newDevFeeApplicable){
            if(this.order.devFeeOption == 'monthly'){
                if(this.order.bonus != '')
                    devFee = 12.50;
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
                        case 'business-phone':
                            this.amounts.phone_plan = this.businessPlanTotal;
                            return 'Business Phone / VOIP';
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
                        this.amounts.internetSpeed = 180;
                        return 'nbn100 $130';
                    }else if(value == 'nbn50'){
                        this.amounts.internetSpeed = 170;
                        return 'nbn50 $120';
                    }else if(value == 'nbn25'){
                        this.amounts.internetSpeed = 140;
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
               var apiUrl = 'http://127.0.0.1:8765';
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

                $.post(self.settings.apiUrl + '/api/sq/qualify/product', { locId : selected }, null,'json')
                    .done(function(res){

                        try{
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

                                if(Number(siteDetails.nbnServiceabilityClass) >=0 && Number(siteDetails.nbnServiceabilityClass) <= 3){
                                    // fttp
                                    $('#choose-modem .filters > div[data-category="fttp"]').click();
                                }else if(Number(siteDetails.nbnServiceabilityClass) >=4 && Number(siteDetails.nbnServiceabilityClass) <= 6){
                                    // fw
                                    $('#choose-modem .filters > div[data-category="fw"]').click();
                                }else if(Number(siteDetails.nbnServiceabilityClass) >=7 && Number(siteDetails.nbnServiceabilityClass) <= 9){
                                    // satellite
                                    //$('#choose-modem .filters > div[data-category="fttn"]').click();
                                }else if(Number(siteDetails.nbnServiceabilityClass) >=10 && Number(siteDetails.nbnServiceabilityClass) <= 13){
                                    // fttn
                                    $('#choose-modem .filters > div[data-category="fttn"]').click();
                                }else if(Number(siteDetails.nbnServiceabilityClass) >=20 && Number(siteDetails.nbnServiceabilityClass) <= 24){
                                    // hfc
                                    $('#choose-modem .filters > div[data-category="hfc"]').click();
                                }else if(Number(siteDetails.nbnServiceabilityClass) >=30 && Number(siteDetails.nbnServiceabilityClass) <= 33){
                                    // fttc
                                    $('#choose-modem .filters > div[data-category="fttc"]').click();
                                }


                                $.post(self.settings.apiUrl + '/api/sq/get/result', {
                                    sc : siteDetails.nbnServiceabilityClass }, function(r){
                                    this.showFlag = true;
                                    app.showFlag = true;
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
                                                console.log('res2', res);
                                            if(res.result > 0){

                                                if(res.data != '*' && res.data != '')
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
                                        app.showSQMap = true;
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

                            }
                        }catch(err){
                            $.alert({
                                theme: 'modern',
                                type: 'red',
                                title: 'Error',
                                content: 'We are currently having some issues with this feature, please try again shortly'
                            });
                        }

                   }).fail(function(){
                        $.alert({
                            theme: 'modern',
                            type: 'red',
                            title: 'Error',
                            content: 'We are currently having some issues fetching the data, please try again shortly'
                        });
                   });
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
                    'streetNo': $.trim(self.streetNo),
                    'streetName': $.trim(self.streetName),
                    'streetType' : self.streetType,
                    'state': self.state,
                    'postcode': self.postcode,
                    'suburb': self.suburb
                };

                $('.spinner,.spinner-text').css('opacity', 1);
                $('.spinner-text').removeClass('error success')
                    .text('Matching your address on the nbn database...');

                // $.post(this.settings.apiUrl + '/api/sq/check/location', param, null, 'json')
                $.post(this.settings.apiUrl + '/api/sq/qualify/product/fastfibre', param, null, 'json')
                    .done((response) =>{
                        this.showFlag = true
                        app.showFlag = true;
                        $('.spinner').css('opacity', 0);
                        $('.spinner-text').css('opacity', 0);
                        try{
                            this.bandwidthProfiles = response.QualifyProductResponse.accessQualificationList;
                            this.address = this.selectedAddressFormatted
                            console.log(this.bandwidthProfiles)
                            setTimeout(function () {
                                $('html, body').animate({
                                    scrollTop: $('#bandwidth-profile').offset().top
                                }, 1000);
                            }, 100);
                        }catch(e){
                            console.error('error', e);
                            $.alert({
                                theme: 'modern',
                                type: 'red',
                                title: 'Error',
                                content: 'The checker is currently down or area is not serviceable, please contact us in the chat and we will check it manually. Thanks'
                            });
                        }

                    }).fail(() =>{
                        $.alert({
                            theme: 'modern',
                            type: 'red',
                            title: 'Error',
                            content: 'The checker is currently down or area is not serviceable, please contact us in the chat and we will check it manually. Thanks'
                        });
                    });
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

        $.post(this.settings.apiUrl + '/api/sq/check/location', args, null, 'json')
            .done(function(response){
                $('.spinner').css('opacity', 0);

                try{
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
                }catch(e){
                    $.alert({
                        theme: 'modern',
                        type: 'red',
                        title: 'Error',
                        content: 'We are currently having some issues with this feature, please try again shortly'
                    });
                }

            }).fail(function(){
                $.alert({
                    theme: 'modern',
                    type: 'red',
                    title: 'Error',
                    content: 'We are currently having some issues fetching the data, please try again shortly'
                });
            });
       },
       checkAvailabilityByPhone : function(){
            var self = this;
            app.showContactForm = false;
            app.showNoLocationForm = false;

            $('.spinner,.spinner-text').css('opacity', 1);
            $('.spinner-text').removeClass('error success')
                .text('Matching your phone on the nbn database...');
            self.step = 3;

            if(self.phone != ''){
                $.post(this.settings.apiUrl + '/api/sq/qualify/phone', {
                    'csn': $.trim(self.phone.number)
                }, null, 'json')
                    .done(function(res){
                        try{
                            if(typeof res.error == 'undefined'){
                                var res = res.QualifyProductResponse,
                                qualifyList = res.accessQualificationList,
                                siteAddr = res.siteAddress,
                                siteDetails = res.siteDetails,
                                isDevFeeApplicable = false,
                                nbnSpeedAvailable = false,
                                nbnSpeedDescription = '';

                                app.locLevel = '';
                                app.locSubAddrType = siteAddr.subAddressType;
                                app.locNumber = siteAddr.subAddressNumber;


                                qualifyList.forEach(function(data){
                                    var testOutcomes = data.testOutcomes;
                                    var newDevChargeApplies = data.nbnNewDevelopmentsChargeApplies;

                                    if($.isArray(testOutcomes)){
                                        testOutcomes.forEach(function(r){
                                            if(r.testDescription.match('Is this a New Development')){

                                                if(newDevChargeApplies == 'No'){
                                                    isDevFeeApplicable = false;
                                                    $("#free").hide();
                                                }else{
                                                    isDevFeeApplicable = true;
                                                    $("#free").show();
                                                }
                                            }

                                            if(r.testDescription.match('Are NBN speeds available at specified location?')){
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

                                if(Number(siteDetails.nbnServiceabilityClass) >=0 && Number(siteDetails.nbnServiceabilityClass) <= 3){
                                    // fttp
                                    $('#choose-modem .filters > div[data-category="fttp"]').click();
                                }else if(Number(siteDetails.nbnServiceabilityClass) >=4 && Number(siteDetails.nbnServiceabilityClass) <= 6){
                                    // fw
                                    $('#choose-modem .filters > div[data-category="fw"]').click();
                                }else if(Number(siteDetails.nbnServiceabilityClass) >=7 && Number(siteDetails.nbnServiceabilityClass) <= 9){
                                    // satellite
                                    //$('#choose-modem .filters > div[data-category="fttn"]').click();
                                }else if(Number(siteDetails.nbnServiceabilityClass) >=10 && Number(siteDetails.nbnServiceabilityClass) <= 13){
                                    // fttn
                                    $('#choose-modem .filters > div[data-category="fttn"]').click();
                                }else if(Number(siteDetails.nbnServiceabilityClass) >=20 && Number(siteDetails.nbnServiceabilityClass) <= 24){
                                    // hfc
                                    $('#choose-modem .filters > div[data-category="hfc"]').click();
                                }else if(Number(siteDetails.nbnServiceabilityClass) >=30 && Number(siteDetails.nbnServiceabilityClass) <= 33){
                                    // fttc
                                    $('#choose-modem .filters > div[data-category="fttc"]').click();
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
                                                console.log('res', res);
                                            if(res.result > 0){

                                                if(res.data != '*' && res.data != '')
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
                                console.log('error sq by phone', res);
                        }catch(err){
                            $.alert({
                                theme: 'modern',
                                type: 'red',
                                title: 'Error',
                                content: 'We are currently having some issues with this feature, please try again shortly'
                            });
                        }

                    }).fail(function(){
                        $.alert({
                            theme: 'modern',
                            type: 'red',
                            title: 'Error',
                            content: 'We are currently having some issues fetching the data, please try again shortly'
                        });
                    });
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
        if(typeof(fbq) == 'function')
            fbq('track', 'Enter Your Address Input Box', { search_string: app.selectedAddressFormatted });

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

        if(typeof(fbq) == 'function')
            fbq('track', 'Search', { search_string: app.selectedAddressFormatted });

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

    //$('.radio-field').eq(0).iCheck('check');

    $(".load-balanced-options").toggle();

    $('.btsopt').on('click', function(){
        var t = $(this);
        var el = $(".load-balanced-options");
        el.toggle();
        if(!el.is(":visible")) t.removeClass('--is-active');
    });


    $('.ViewAdv').on('click', function(){
        var t = $(this);
        t.removeClass('--is-active');
    });



    $('.vOrder').on('click', function(){
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
        // alert('test');
        console.log(t.data('show-options'));
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

    var refCode =window.location.search.replace('?ref=','');
    if(refCode != ''){
        refCode = refCode.split('&');
        refCode = refCode[0];
        var expires = new Date();
        expires.setMonth( expires.getMonth() + 12 );
        cookievalue = escape( refCode ) + ";"
        document.cookie = "10mates_affiliate=" + cookievalue;
        document.cookie = "expires=" + expires.toUTCString() + ";"

        $("#refcode").val(refCode);
    }

    cookiearray = document.cookie.split(';');

    // Now take key value pair out of this array
    for(var i=0; i<cookiearray.length; i++) {
        key = cookiearray[i].split('=')[0];
        value = cookiearray[i].split('=')[1];
        if(key == '10mates_affiliate'){
            $("#refcode").val( value );
        }
    }


});
