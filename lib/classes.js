export class QuestionOption {
  constructor(optionOrder, code, text, value, image, fact) {
    this._optionOrder = optionOrder;
    this._code = code;
    this._text = text;
    this._value = value;
    this._image = image;
    this._fact = fact;
  }

  get optionOrder() {return this._optionOrder;}
 
  set code(code)    {this._code = code;}
  get code()        {return this._code;}
  
  set text(text)    {this._text = text;}
  get text()        {return this._text;}

  set value(value)  {this._value = value;}
  get value()       {return this._value;}

  set image(image)  {this._image = image;}
  get image()       {return this._image;}

  set fact(fact)    {this._fact = fact;}
  get fact()        {return this._fact;}
}

export class RuleTest {
  constructor(order, factId, operation, parameter) {
    this._order = order;
    this.factId = factId;
    this.operation = operation;
    this.parameter = parameter;
  }

  get order()         {return this._order;}

  set factId(factId)  {this.factId = factId;}
  get factId()        {return this.factId;}

  set operation(operation) {this.operation = operation;}
  get operation()     {return this.operation;}

  set parameter(parameter) {this.parameter = parameter;}
  get parameter()     {return this.parameter;}
}