import { Button, Card, Form } from "react-bootstrap";
import Dropdown from "./dropdown";
import { objectArrayToMap } from "./utility";
import utilStyles from '../styles/utils.module.css';
import * as React from "react";
import { Matrix } from "../types/matrix";

export type Props = {
  allFacts: Matrix.Fact[],
  allQuestionTypes: Matrix.QuestionType[],
  question: Matrix.Question,
  setQuestion: (question: Matrix.Question) => void,
  submit: (event) => void,
  submitButtonLabel?: string,
  allThemes: Matrix.Theme[],
}

export default function CreateQuestionForm(props: Props) {
  const _sliderQuestionTypes: Matrix.SliderQuestionTypes = ["Slider", "TextSlider"];
  const _optionQuestionTypes: Matrix.OptionQuestionTypes = ["MultipleChoice", "Polygon", "MultiPolygon", "MultipleSelect"];
  const sliderQuestionTypes: string[] = _sliderQuestionTypes;
  const optionQuestionTypes: string[] = _optionQuestionTypes;
  const numberOfOptions = 6;

  //used to store the currently typed label before it is saved
  let currentLabel;

  const optionFields = [];
  //if this question type needs options
  if (optionQuestionTypes.includes(props.question?.type)) {
    for (let i = 0; i < numberOfOptions; i++) {
      optionFields.push(QuestionOptionField(i, props.question?.options[i]));
      if (props.question?.options.find(option => option.optionOrder == i) == null) {
        props.question?.options.push({
          optionOrder: i,
          text: "",
          id: 0,
          questionId: 0,
          code: "",
          image: "",
          value: "",
          factId: 0,
        });
      }
    }
  }

  const themeFields = [];
  if (props.question?.type == "Theme") {
    themeFields.push(
      <>
        Theme:
        <Dropdown
          id={"theme"}
          labels={objectArrayToMap(props.allThemes, 'id', 'name')}
          value={props.question?.theme.toString()}
        />
      </>
    );
  }

  let sliderFields;
  //if this questions type needs slider fields
  if (sliderQuestionTypes.includes(props.question?.type)) {
    const labelFields = [];
    if (props.question?.labels.length > 0) {
      for (let i = 0; i < props.question?.labels.length; i++) {
        labelFields.push(
          <Card key={"label"+i}>
              {props.question?.labels[i]}
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
            defaultValue={props.question?.min} 
          />
        </Form.Group>

        <Form.Group controlId="max">
          <Form.Label>Max</Form.Label>
          <Form.Control 
            type="int" 
            defaultValue={props.question?.max} 
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
    <Form onSubmit={props.submit} key="questionFields">
      <Form.Group controlId="code">
        <Form.Label>code</Form.Label>
        <Form.Control type="text" defaultValue={props.question?.code} required/>
      </Form.Group>

      Type
      <Dropdown
        id={"QuestionType"}
        labels={objectArrayToMap(props.allQuestionTypes, 'type', 'type')}
        onSelect={handleQuestionTypeChange}
        value={props.question?.type}
      />

      <Form.Group controlId="text">
        <Form.Label>Text</Form.Label>
        <Form.Control type="text" defaultValue={props.question?.text} required/>
      </Form.Group>

      Fact: {props.question?.factSubject} <br/>
      <Dropdown
        id={"QuestionFact"}
        labels={objectArrayToMap(props.allFacts, 'id', 'display', "name")}
        onSelect={clickFact}
        value={props.question?.factSubject}
      />
      {/* {props.question?.shownFacts}<br/> */}

      <Form.Group controlId="timer">
        <Form.Label>Timer</Form.Label>
        <Form.Control type="text" defaultValue={60} required/>
      </Form.Group>

      {sliderFields}
      {optionFields}
      {themeFields}

      <Button type="submit">{props.submitButtonLabel ?? "Create"}</Button>
    </Form>
  )

  function clickFact(factId) {
    props.question.factSubject = factId;
    props.setQuestion({...props.question});
  }

  function QuestionOptionField(order, existingData = null) {
    return (
      <div key={"option"+order}>
        <h4>Option {order+1}</h4>

        <Form.Group controlId={order+"-description"}>
          <Form.Label>Description</Form.Label>
          <Form.Control 
            //@ts-ignore
            num={order}
            type="text" 
            defaultValue={existingData?.code} 
            onChange={handleQuestionOptionChange} 
          />
        </Form.Group>

        <Form.Group controlId={order+"-text"}>
          <Form.Label>Text</Form.Label>
          <Form.Control 
            //@ts-ignore
            num={order}
            type="text" 
            defaultValue={existingData?.text} 
            onChange={handleQuestionOptionChange} 
          />
        </Form.Group>

        <Form.Group controlId={order+"-value"}>
          <Form.Label>value</Form.Label>
          <Form.Control 
            //@ts-ignore
            num={order}
            type="text" 
            defaultValue={existingData?.value} 
            onChange={handleQuestionOptionChange} 
          />
        </Form.Group>

        <Form.Group controlId={order+"-Image"}>
          <Form.Label>Image</Form.Label>
          <Form.Control 
            //@ts-ignore
            num={order}
            type="text" 
            defaultValue={existingData?.Image} 
            onChange={handleQuestionOptionChange} 
          />
        </Form.Group>

        <Dropdown
          id={"Fact"}
          labels={objectArrayToMap(props.allFacts, 'id', 'display', "name")}
          onSelect={(id)=>{handleQuestionOptionChange({
            target: {
              value: id, 
              id: order+"fact", 
              attributes: {
                num: {value: order}
              }
            }
          })}}
          value={props.question?.factSubject}
        />

      </div>
    )
  }

  function handleQuestionTypeChange(type) {
    props.question.type = type;
    props.setQuestion({...props.question});
  }

  function handleQuestionOptionChange(event) {
    //Trying out custom attribute in input tag
    const optionNumber = event.target.attributes.num.value;

    //find existing option
    let option: Matrix.QuestionOption = props.question?.options.find(item => {
      return item.optionOrder?.toString() == optionNumber;
    });

    //if option doesn't exist create it
    if (option == undefined) {
      option = {
        id: 0,
        questionId: 0,
        optionOrder: optionNumber, 
        code: "",
        value: "",
        text: "", 
        image: "",
        factId: 0
      };
      props.question?.options.push(option);
      props.setQuestion({...props.question});
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
      props.question?.labels.push(currentLabel);
    }
    props.setQuestion({...props.question});
  }

  function removeQuestionLabel() {
    props.question?.labels.pop();
    props.setQuestion({...props.question});
  }
}