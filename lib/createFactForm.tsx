import { Button, Form } from "react-bootstrap";
import { Matrix } from "../types/matrix";
import Dropdown from "./dropdown";
import { objectArrayToMap } from "./utility";
import React from 'react';

export type Props = {
  fact: Matrix.Fact,
  setFact: (fact: Matrix.Fact) => void,
  submit: (event) => void,
  submitButtonLabel?: string,
  allFactTypes: Matrix.FactType[],
  allFacts: Matrix.Fact[],
  allThemes: Matrix.Theme[],
}

export default function CreateFactForm(props: Props) {
  const negateFactFields = [];
  for (let i = 0; i < props.fact?.negatedFacts?.length; i++) {
    const index = i;
    negateFactFields.push(
      <Dropdown
        key={"negateFact" + i}
        id={i+"Fact"}
        labels={objectArrayToMap(props.allFacts, 'id', 'display', 'name')}
        onSelect={(id) => { setNegateFact(id, index)}}
        value={props.fact.negatedFacts[i].toString()}
      />
    );
  }

  function setNegateFact(id, index) {
    props.fact.negatedFacts[index] = id
    props.setFact({...props.fact});
  }

  function AddNegateFact() {
    props.fact.negatedFacts.push(0);
    props.setFact({...props.fact});
  }

  function RemoveNegateFact() {
    props.fact.negatedFacts.pop();
    props.setFact({...props.fact});
  }

  return (
    <Form onSubmit={props.submit} key="createFact">
      <Form.Group controlId="name">
        <Form.Label>Name</Form.Label>
        <Form.Control
          type="text"
          defaultValue={props.fact?.name}
          onChange={(event) => { props.setFact({...props.fact, name: event.target.value}) }}
          required
        />
      </Form.Group>
      Fact Types
      <Dropdown
        id="factType"
        labels={objectArrayToMap(props.allFactTypes, 'type', 'type')}
        onSelect={(id) => {
          props.fact.type = id; 
          props.setFact({...props.fact});
        }}
        value={props.fact?.type}
      />

      Theme
      <Dropdown
        id="theme"
        labels={objectArrayToMap(props.allThemes, 'id', 'name')}
        onSelect={(id) => {
          props.fact.theme = parseInt(id); 
          props.setFact({...props.fact});
        }}
        value={props.fact?.theme?.toString()}
      />

      Negated Facts<br />
      {negateFactFields}
      <Button type="button" onClick={AddNegateFact}>Add Negate Fact</Button>
      <Button type="button" onClick={RemoveNegateFact}>Remove Fact</Button>
      <br/><br/>

      <Button type="submit">{props.submitButtonLabel}</Button>
    </Form>
  )
}