import React from "react";
import { QuestionOption, RuleTest } from './classes.jsx'
import { makeDropdownable } from './utility'
import utilStyles from '../styles/utils.module.css'
import { Form, Button } from "react-bootstrap";
import { Card } from "reactstrap";

export function QuestionCreateLayout(props) {
  const facts = props.facts;
  const questionTypes = props.questionTypes;
  const questionData = props.questionData ?? {};
  const setQuestionData = props.setQuestionData;
  const formSubmit = props.formSubmit;
  const existingQuestion = props.existingQuestion;
  const optionQuestionTypes = props.optionQuestionTypes;
  const sliderQuestionTypes = props.sliderQuestionTypes;
  const numberOfOptions = props.numberOfOptions;
  const themes = props.themes;

  questionData.chosenFact ??= existingQuestion?.factSubject ?? 0;
  const existingFact = facts.find(fact => fact.id == questionData.chosenFact)?.name

  const firstRun = questionData.firstRun ?? true;
  questionData.firstRun = false;

  //used to store the currently typed label before it is saved
  var currentLabel;

  var optionFields = [];
  //if this question type needs options
  if (optionQuestionTypes.includes(questionData.type)) {
    for (var i = 0; i < numberOfOptions; i++) {
      optionFields.push(QuestionOptionField(i, questionData.options[i]));
      if (questionData.options.find(option => option.optionOrder == i) == null) {
        questionData.options.push(new QuestionOption(i, "", "", ""))
      }
    }
  }

  var themeFields = [];
  if (questionData.type == "Theme") {
    themeFields.push(
      <>
        Theme:
        {Dropdown("theme", makeDropdownable(themes, 'id', 'name'), ()=>{}, questionData, setQuestionData, "actionTheme", questionData?.theme)}
      </>
    );
  }

  var sliderFields;
  //if this questions type needs slider fields
  if (sliderQuestionTypes.includes(questionData.type)) {
    var labelFields = [];
    if (questionData.labels.length > 0) {
      for (var i = 0; i < questionData.labels.length; i++) {
        labelFields.push(
          <Card key={"label"+i}>
              {questionData.labels[i]}
          </Card>
        )
      }
    }
    
    sliderFields = (
      <>
        <Form.Group controlId="min">
          <Form.Label>Min</Form.Label>
          <Form.Control 
            type="int" 
            defaultValue={questionData.question?.min} 
          />
        </Form.Group>

        <Form.Group controlId="max">
          <Form.Label>Max</Form.Label>
          <Form.Control 
            type="int" 
            defaultValue={questionData.question?.max} 
          />
        </Form.Group>
        
        <label>Labels </label>
        <Form.Control
          as="textarea"
          style={{ height: '100px' }}
          onChange={handleQuestionLabelChange}
        />
        <Button type="button" onClick={submitQuestionLabel}>Add Label</Button>
        <Button type="button" onClick={removeQuestionLabel}>remove Label</Button><br/>

        <div className={utilStyles.allowNewline}>{labelFields}</div><br/>
    </>
    )
  }

  return(
    <Form onSubmit={formSubmit} key="questionFields">
      <Form.Group controlId="code">
        <Form.Label>code</Form.Label>
        <Form.Control type="text" defaultValue={existingQuestion?.code} required/>
      </Form.Group>

      Type
      {Dropdown("QuestionType", makeDropdownable(questionTypes, 'type', 'type'), handleQuestionTypeChange, questionData, setQuestionData, "questionType", existingQuestion?.type)}

      <Form.Group controlId="text">
        <Form.Label>Text</Form.Label>
        <Form.Control type="text" defaultValue={existingQuestion?.text} required/>
      </Form.Group>

      Fact: {existingFact} <br/>
      {Dropdown("QuestionFact", makeDropdownable(facts, 'id', 'display', 'name'), clickFact, questionData, setQuestionData, "questionFact", existingQuestion?.fact)}
      {questionData.shownFacts}<br/>

      <Form.Group controlId="timer">
        <Form.Label>Timer</Form.Label>
        <Form.Control type="text" defaultValue={60} required/>
      </Form.Group>

      {sliderFields}
      {optionFields}
      {themeFields}

      <Button type="submit">{questionData.submitLabel ?? "Create"}</Button>
    </Form>
  )

  function clickFact(factId) {
    questionData.chosenFact = factId;
    setQuestionData({...questionData});
  }

  function QuestionOptionField(order, existingData = null) {
    return (
      <div key={"option"+order}>
        <h4>Option {order+1}</h4>

        <Form.Group controlId={order+"-description"}>
          <Form.Label>Description</Form.Label>
          <Form.Control 
            num = {order}
            type="text" 
            defaultValue={existingData?.code} 
            onChange={handleQuestionOptionChange} 
          />
        </Form.Group>

        <Form.Group controlId={order+"-text"}>
          <Form.Label>Text</Form.Label>
          <Form.Control 
            num = {order}
            type="text" 
            defaultValue={existingData?.text} 
            onChange={handleQuestionOptionChange} 
          />
        </Form.Group>

        <Form.Group controlId={order+"-value"}>
          <Form.Label>value</Form.Label>
          <Form.Control 
            num = {order}
            type="text" 
            defaultValue={existingData?.value} 
            onChange={handleQuestionOptionChange} 
          />
        </Form.Group>

        <Form.Group controlId={order+"-Image"}>
          <Form.Label>Image</Form.Label>
          <Form.Control 
            num = {order}
            type="text" 
            defaultValue={existingData?.Image} 
            onChange={handleQuestionOptionChange} 
          />
        </Form.Group>

        {Dropdown(
          "Fact",
           makeDropdownable(facts, 'id', 'display', 'name'),
          (id)=>{handleQuestionOptionChange({target: {value: id, id: order+"fact", attributes: {num: {value: order}}}})},
          questionData, setQuestionData,
          order+"questionOptionFact",
          existingData?.factId
        )}

      </div>
    )
  }

  function handleQuestionTypeChange(type) {
    questionData.type = type;
    setQuestionData({...questionData});
  }

  function handleQuestionOptionChange(event) {
    //Trying out custom attribute in input tag
    var optionNumber = event.target.attributes.num.value;

    //find existing option
    var option = questionData.options.find(item => {
      return item.optionOrder?.toString() == optionNumber;
    });

    //if option doesn't exist create it
    if (option == undefined) {
      option = new QuestionOption(optionNumber, "", "", "");
      questionData.options.push(option);
      setQuestionData({...questionData});
    }

    if (event.target.id.includes("description")) {
      option.code = event.target.value;
    }
    if (event.target.id.includes("text")) {
      option.text = event.target.value;
    }
    if (event.target.id.includes("value")) {
      option.value = event.target.value;
    }
    if (event.target.id.includes("image")) {
      option.image = event.target.value;
    }
    if (event.target.id.includes("fact")) {
      option.factId = event.target.value;
    }
  }

  //every character typed in label field
  function handleQuestionLabelChange(event) {
    currentLabel = event.target.value;
  }

  //when the add label button is pushed
  function submitQuestionLabel() {
    if (currentLabel != null) {
      questionData.labels.push(currentLabel);
    }
    setQuestionData({...questionData});
  }

  function removeQuestionLabel() {
    questionData.labels.pop();
    setQuestionData({...questionData});
  }
}