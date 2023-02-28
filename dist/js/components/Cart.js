import { settings, select, templates } from '../settings.js';
import cartProduct from './CartProduct.js';
import utils from '../utils.js';

class Cart {
  constructor(element){
    const thisCart = this;

    thisCart.products = [];
    thisCart.getElements(element);
    thisCart.initActions();
    //console.log('new Cart', thisCart);

  }

  getElements(element){
    const thisCart = this;
    thisCart.dom = {};
    thisCart.dom.wrapper = element;

    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelector(select.cart.totalPrice);
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    thisCart.dom.totalPrice2 = thisCart.dom.wrapper.querySelector(select.cart.totalPrice2);
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
  }

  initActions(){
    const thisCart = this;
    thisCart.dom.toggleTrigger.addEventListener('click', function(event) {
      event.preventDefault();
        
      thisCart.dom.wrapper.classList.toggle('active');
    });

    thisCart.dom.productList.addEventListener('updated', function () {
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function (event) {
      thisCart.remove(event.detail.cartProduct);
    });

    thisCart.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisCart.sendOrder();
    });
  }

  sendOrder(){
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.orders;
    console.log('thisCart.dom.totalNumber.value ', thisCart.dom.totalNumber.innerHTML);
    const payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.dom.totalPrice.innerHTML,
      subtotalPrice: thisCart.dom.totalPrice2.innerHTML- thisCart.dom.deliveryFee.innerHTML,
      totalNumber: thisCart.dom.totalNumber.innerHTML,
      deliveryFee: thisCart.dom.deliveryFee.innerHTML,
      products: []
    };
      
    for(let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }
    
    console.log('ORDER: ', payload);
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
      
    fetch(url, options);
  }
      
  add(menuProduct){
    const thisCart = this;

    const generateHTML = templates.cartProduct(menuProduct);
 
    const generateDOM = utils.createDOMFromHTML(generateHTML);
     
    thisCart.dom.productList.appendChild(generateDOM);

    thisCart.products.push(new cartProduct(menuProduct, generateDOM));
    //console.log('thisCart.products', thisCart.products);
    thisCart.update();
  }

  update(){
    const thisCart = this;
    let deliveryFee = settings.cart.defaultDeliveryFee;

    let totalNumber = 0;
    let subtotalPrice = 0;
    let totalPrice = 0;

    console.log('deliveryFee', deliveryFee);


    for (let product of thisCart.products) {
      totalNumber += product.amount;
      subtotalPrice += product.price;
    }
    if (thisCart.subtotalPrice != 0) {
      totalPrice = subtotalPrice + deliveryFee;
        
    } else {
      totalPrice = 0;
    }

    if(subtotalPrice == 0){
      totalPrice = 0;
      deliveryFee = 0;
    }


    console.log('totalNumber: ', totalNumber, 'subtotalPrice: ', subtotalPrice, 'totalPrice: ', totalPrice);
    thisCart.dom.totalNumber.innerHTML = totalNumber;
    thisCart.dom.deliveryFee.innerHTML = deliveryFee;
    thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
    thisCart.dom.totalPrice.innerHTML = totalPrice;
    thisCart.dom.totalPrice2.innerHTML = totalPrice;
  }

  remove(event) {
    const thisCart = this;
    event.dom.wrapper.remove();
    /* check where product is in array */
    const productToRemove = thisCart.products.indexOf(event);
    /* Remove product */
    thisCart.products.splice(productToRemove, 1);

    thisCart.update();
  }
}

export default Cart;