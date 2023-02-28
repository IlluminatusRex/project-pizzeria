import { select, classNames, templates } from '../settings.js';
import utils from '../utils.js';
import amountWidget from './AmountWidget.js';


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
    thisProduct.amountWidget.element.addEventListener('updated', function() {
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
        const addProduct = thisProduct.imageWrapper.querySelector( '.' + paramId + '-' + optionId);
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
    //app.cart.add(thisProduct.prepareCartProduct());

    //app.cart.add(thisProduct.prepareCartProductParams());
    const event = new CustomEvent('add-to-cart', {
      bubbles: true, 
      detail: {
        product: thisProduct,
      }
    });
    thisProduct.element.dispatchEvent(event);
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
      };
    
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

export default Product;