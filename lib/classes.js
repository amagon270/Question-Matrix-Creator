export class QuestionOption {
  constructor(optionOrder, code, text, value, image) {
    this._optionOrder = optionOrder;
    this._code = code;
    this._text = text;
    this._value = value;
    this._image = image;
  }

  get optionOrder() {
    return this._optionOrder;
  }

  set code(code) {
    this._code = code;
  }

  get code() {
    return this._code;
  }

  set text(text) {
    this._text = text;
  }

  get text() {
    return this._text;
  }

  set value(value) {
    this._value = value;
  }

  get value() {
    return this._value;
  }

  set image(image) {
    this._image = image;
  }

  get image() {
    return this._image;
  }
}

export class RuleTest {
  constructor(order, fact, operator, parameter) {
    this._order = order;
    this._fact = fact;
    this._operator = operator;
    this._parameter = parameter;
  }

  get order() {
    return this._order;
  }

  set fact(fact) {
    this._fact = fact;
  }

  get fact() {
    return this._fact;
  }

  set operator(operator) {
    this._operator = operator;
  }

  get operator() {
    return this._operator;
  }

  set parameter(parameter) {
    this._parameter = parameter;
  }

  get parameter() {
    return this._parameter;
  }
}