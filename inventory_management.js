(function() {
  'use strict';
  // update item stock when order is completed
  kintone.events.on('app.record.detail.process.proceed', async function(eventobject) {
    try {
      console.log(eventobject);
      const status_action = eventobject.action.value;
      console.log('Status action is', status_action);
      // if action is to complete the order, update the item app data
      const action_complete = ['Complete order', '納品完了'];
      if (status_action in action_complete) {
        const item_app_id = 7;
        const item_record_id = eventobject.record.item_rn.value;
        const order_type = eventobject.record.order_type.value;
        const order_quantity = parseInt(eventobject.record.qty.value);
        console.log('Item record ID is', item_record_id);
        console.log('Order type is', order_type);
        console.log('Order quantity is', order_quantity);
        // make API request to get the number of stock for item
        var api_request_body = {
          'app': item_app_id,
          'id': item_record_id
        };
        const item_record = await kintone.api(kintone.api.url('/k/v1/record.json', true), 'GET', api_request_body);
        console.log(item_record);
        const item_stock = parseInt(item_record.record.stock.value);
        console.log(item_stock);
        // if order type is purchase, subtract from stock
        // if not, then order type is assumed to be Sale, and adds to stock
        var new_stock;
        if (order_type == 'Purchase') {
          new_stock = item_stock - order_quantity;
        } else {
          new_stock = item_stock + order_quantity;
        }
        // if the new stock is minus, raise error and cancel order completion
        if (new_stock < 0) {
          const err_message = 'Order number of '+order_quantity+' is too large for stock: '+item_stock;
          alert(err_message);
          console.error(err_message);
          return false;
          // return swal({
          //   title: 'The order is too big!',
          //   text: 'The purchase exceeds the number of items stock: ',
          //   icon: 'error',
          // }).then(function() {
          //   console.log(result);
          //   throw 'Order too large';
          // });
        }
        // make API request to upate the item data
        api_request_body = {
          'app': item_app_id,
          'id': item_record_id,
          'record': {
            'stock': {
              'value': new_stock
            }
          }
        };
        const item_stock_update_resp = await kintone.api(kintone.api.url('/k/v1/record.json', true), 'PUT', api_request_body);
        console.log(item_stock_update_resp);
      }
    } catch (err) {
      console.error(err);
      return false;
    }
    return eventobject;
  });
})();
