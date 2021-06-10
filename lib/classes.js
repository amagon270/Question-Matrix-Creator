export class QuestionOption {
  constructor(order, code, text, image) {
    this._order = order;
    this._code = code;
    this._text = text;
    this._image = image;
  }

  get order() {
    return this._order;
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