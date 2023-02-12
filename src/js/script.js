/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },

    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong',
      totalPrice2: '.cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },

  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },

    cart: {
      wrapperActive: 'active',
    },

  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };

  class Product {
    constructor(id, data){
      const thisProduct = this;
      
      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();

    }

    renderInMenu(){
      const thisProduct = this;

      /* generate HTML based on template */
      const generateHTML = templates.menuProduct(thisProduct.data);

      /* create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generateHTML);

      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);

      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);
    }

    getElements(){
      const thisProduct = this;
    
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidget = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    
    }

    initAmountWidget(){
      const thisProduct = this;
      
      
      thisProduct.amountWidget = new amountWidget(thisProduct.amountWidget);
      thisProduct.amountWidget.element.addEventListener('updated', function(event) {
        //event.preventDefault();
        thisProduct.processOrder();
      });
    }
    
    initAccordion(){
      const thisProduct = this;
  
      /* find the clickable trigger (the element that should react to clicking) */
      //const clickableTrigger = this.element.querySelector(select.menuProduct.clickable);
  
      /* START: add event listener to clickable trigger on event click */
      thisProduct.accordionTrigger.addEventListener('click', function(event) {
        /* prevent default action for event */
        event.preventDefault();

        /* find active product (product that has active class) */
        const activeProduct = document.querySelector('article.active');
  
        /* if there is active product and it's not thisProduct.element, remove class active from it */
        if(activeProduct != null && activeProduct != thisProduct.element){
          activeProduct.classList.remove('active');
        }
        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle('active');
      });
    }

    initOrderForm(){
      const thisProduct = this;

      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
      
      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }
      
      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }

    processOrder(){
      const thisProduct = this;
      //console.log('processOrder',thisProduct);

      const formData = utils.serializeFormToObject(thisProduct.form);
      //console.log('formData', formData);

        // set price to default price
      let price = thisProduct.data.price;
            
      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        //console.log(paramId, param);

        // for every option in this category
        for(let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          //console.log('OPTIONID and OPTION: ', optionId, option);
          if(formData[paramId] && formData[paramId].includes(optionId)){
            if(option.default != true){
              // add option price to price variable
              price = price + option.price;
              
            }
          }else{
            if(option.default == true){
              price = price - option.price;}
          }
          const addProduct = thisProduct.imageWrapper.querySelector( '.' + paramId + '-' + optionId)
          if (addProduct != null){
            if(formData[paramId] && formData[paramId].includes(optionId)){
              addProduct.classList.add(classNames.menuProduct.imageVisible);
            } else{
              addProduct.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }   
      }

      // update calculated price in the HTML
      price *= thisProduct.amountWidget.value;
      thisProduct.priceElem.innerHTML = price;
      
    }

    addToCart(){
      const thisProduct  = this;

      app.cart.add(thisProduct.prepareCartProduct());

      //app.cart.add(thisProduct.prepareCartProductParams());
    }

    prepareCartProduct(){
      const thisProduct  = this;
      const productSummary = {
        id: thisProduct.data.id,
        name: thisProduct.data.name,
        amount: thisProduct.amountWidget.value,
        priceSingle: thisProduct.data.price,
        price: thisProduct.data.price*thisProduct.amountWidget.value,
        params: thisProduct.prepareCartProductParams(),
      };

      return productSummary;
    }

    prepareCartProductParams() {
      const thisProduct = this;
    
      const formData = utils.serializeFormToObject(thisProduct.form);
      const params = {};
    
      // for very category (param)
      for(let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];
    
        // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
        params[paramId] = {
          label: param.label,
          options: {}
        }
    
        // for every option in this category
        for(let optionId in param.options) {
          const option = param.options[optionId];
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
    
          if(optionSelected) {
            params[paramId].options[paramId] = option.label; //DLACZEGO SKŁADNIKI PIZZY NIE SĄ PRAWIDŁOWO UŁOŻONE, A KAWA DZIAŁA POPRAWNIE? - [EDIT]: FIXED
            
          }
        }
      }
    
      return params;

    }

  }
  
  class amountWidget{
    constructor(element) {
      const thisWidget = this;

      thisWidget.getElements(element);
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();

    }

    getElements(element){
      const thisWidget = this;
    
      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value){
      const thisWidget = this;
      thisWidget.value = settings.amountWidget.defaultValue;
      const newValue = parseInt(value);
      /* TODO: Add validation */
      if(newValue !== thisWidget.input && !isNaN(newValue) && newValue<11 && newValue>0){
        thisWidget.value = newValue;  
        thisWidget.announce();
      } 
      thisWidget.input.value = thisWidget.value;
    }

    initActions(){
      const thisWidget = this;
      thisWidget.input.addEventListener('change', function(event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.input.value);
      });

      thisWidget.linkDecrease.addEventListener('click', function(event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });
    
      thisWidget.linkIncrease.addEventListener('click', function(event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });
    }

    announce(){
      const thisWidget = this;

      const event = new Event('updated', {bubbles: true});
      thisWidget.element.dispatchEvent(event);
    }

  }

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
      const deliveryFee = settings.cart.defaultDeliveryFee;

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

      console.log('totalNumber: ', totalNumber, 'subtotalPrice: ', subtotalPrice, 'totalPrice: ', totalPrice);
      thisCart.dom.totalNumber.innerHTML = totalNumber;
      thisCart.dom.deliveryFee.innerHTML = deliveryFee;
      thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
      thisCart.dom.totalPrice.innerHTML = totalPrice;
      thisCart.dom.totalPrice2.innerHTML = totalPrice;
      
    }
  }


  
  class cartProduct {
    constructor(menuProduct, element){
      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.price = menuProduct.price;
      
      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
    }
      
    getElements(element){
      const thisCartProduct = this;
  
      thisCartProduct.dom = {};
      
      
      thisCartProduct.dom.amountWidget = element.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = element.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = element.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = element.querySelector(select.cartProduct.remove);

      thisCartProduct.dom.wrapper = element;
    }

    initAmountWidget(){
      const thisCartProduct = this;
      
      thisCartProduct.amountWidget = new amountWidget(thisCartProduct.dom.amountWidget);
      thisCartProduct.dom.amountWidget.addEventListener('updated', function () {
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.amount * thisCartProduct.priceSingle;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      });
    }


  }

  const app = {
    initMenu: function(){
      const thisApp = this;

      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    init: function(){
      const thisApp = this;
      /*
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
      */

      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },

    initData: function(){
      const thisApp = this;

      thisApp.data = dataSource;
    },

    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },
  };

  app.init();



}
