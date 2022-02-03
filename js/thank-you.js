if(localStorage.getItem('ttrans')){
 
  try{  
    var ttrans = JSON.parse(localStorage.getItem('ttrans'));
    var total = 0;
    console.log('ttrans->new', ttrans);

    var items = [];

    for(t of ttrans.items){
        console.log(t)
        if(t.Type == 'modem'){
            items.push({
                'sku': String(t.ItemCode).replace(' ','-'),
                'name': t.SKU,
                'price': t.UnitAmount,
                'category': 'Modems',
                'quantity': t.Quantity
            });

            total += (Number(t.UnitAmount) * Number(t.Quantity));
        }
    }

    window.page.trans_value = Number(ttrans.total_amount).toFixed(2);

    window.dataLayer = window.dataLayer || [];
    dataLayer.push({
        'transactionId': ttrans.id, 
        'transactionAffiliation': '10MATES', 
        'transactionTotal': total, 
        'transactionProducts': items 
    });


  }catch(ex){
      console.error('error => ', ex);
  }
}else {
    console.error('transaction doesnt exist');
    // window.page.trans_value = 0;

    // window.dataLayer = window.dataLayer || [];
    // dataLayer.push({
    //     'transactionId': 1, 
    //     'transactionAffiliation': '10MATES', 
    //     'transactionTotal': 100, 
    //     'transactionProducts': [{
    //         'sku': 'test123',
    //         'name': 'Test 123',
    //         'category': 'Modems',
    //         'price': 11.99,
    //         'quantity': 1
    //     },{
    //         'sku': 'AA1243544',
    //         'name': 'Test 123',
    //         'category': 'Modems',
    //         'price': 9.99,
    //         'quantity': 2
    //   }]
    // });
}
    
