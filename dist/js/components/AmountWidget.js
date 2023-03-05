import {select, settings} from '../settings.js';
import BaseWidget from './baseWidget.js';

class amountWidget extends BaseWidget{
  constructor(element){
    super(element, settings.amountWidget.defaultValue);

    const thisWidget = this;

    thisWidget.getElements(element);
    thisWidget.setValue(settings.amountWidget.defaultValue);
    thisWidget.initActions();
  }
  
  getElements(element){
    const thisWidget = this;
   
    thisWidget.dom.wrapper = element;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }

  //parseValue(value){
  //  return parseInt(value);
  //}

  isValid(value){
    return !isNaN(value) &&
    settings.amountWidget.defaultMin <= value &&
        settings.amountWidget.defaultMax >= value;
  }

  setValue(value){
    const thisWidget = this;

    thisWidget.value = value;
  }


  renderValue() {
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value;
  }


  initActions(){
    const thisWidget = this;
    thisWidget.dom.input.addEventListener('change', function(){
      //thisWidget.setValue(thisWidget.dom.input.value);
      thisWidget.correctValue = thisWidget.dom.input.value;
    });

    thisWidget.dom.linkDecrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.correctValue - 1);
    });

    thisWidget.dom.linkIncrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.correctValue + 1);
    });
  }

}

export default amountWidget;