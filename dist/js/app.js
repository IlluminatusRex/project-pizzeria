import { settings, select, classNames } from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';
import Home from './components/home.js';

const app = {
  initPages: function(){
    const thisApp = this;
    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);
    thisApp.homeLinks = document.querySelectorAll(select.nav.homelinks);
    
    //console.log('pages',thisApp.pages);
    const idFromHash = window.location.hash.replace('#/', '');
    let pageMatchingHash = thisApp.pages[2].id;

    for(let page of thisApp.pages){
      if(page.id == idFromHash){
        pageMatchingHash = page.id;
        break;
      }
    }

    thisApp.activatePage(pageMatchingHash);

    for(let link of thisApp.navLinks){
      link.addEventListener('click', function(event){
        const clickedElement = this;
        event.preventDefault();
        
        // get page id from href attribute
        const id  = clickedElement.getAttribute('href').replace('#', '');
        
        // run thisApp.activatePage with that id
        thisApp.activatePage(id);

        // change URL hash
        window.location.hash = '#/' + id;
      });
    }
  },

  activatePage: function(pageId){
    const thisApp = this;
    // add class "active" to matching pages, remove from non-matching

    for(let page of thisApp.pages){
      page.classList.toggle(classNames.pages.active, page.id==pageId);
    }

    // add class "active" to matching links, remove from non-matching
    for(let link of thisApp.navLinks){
      link.classList.toggle(classNames.nav.active, link.getAttribute('href') == '#' + pageId);
      
    }
  },


  initMenu: function(){
    const thisApp = this;

    for(let productData in thisApp.data.products){
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initBooking: function(){
    const thisApp = this;

    thisApp.bookingCntr = document.querySelector(select.containerOf.booking);
    thisApp.booking = new Booking(thisApp.bookingCntr);

  },

  
  initHome: function(){
    const thisApp = this;
    thisApp.homeCntr = document.querySelector(select.containerOf.home);
    thisApp.home = new Home(thisApp.homeCntr);

    thisApp.homeLinks = document.getElementById('booking-home');
    thisApp.homeLinks.addEventListener('click', function(event){
      event.preventDefault();
      thisApp.activatePage('booking');
    });

    thisApp.homeLinks = document.getElementById('order-home');
    thisApp.homeLinks.addEventListener('click', function(event){
      event.preventDefault();
      thisApp.activatePage('order');
    });

  },

  init: function(){
    const thisApp = this;

    thisApp.initPages();
    thisApp.initData();
    thisApp.initCart();
    thisApp.initBooking();
    thisApp.initHome(); 
  },

  initData: function(){
    const thisApp = this;

    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.product;

    fetch(url)
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function(parsedResponse){
        //console.log('parsedResponse', parsedResponse);
        thisApp.data.products = parsedResponse;
        thisApp.initMenu();
      });
  },

  initCart: function(){
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);
    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);
    });

  },

};

app.init();

