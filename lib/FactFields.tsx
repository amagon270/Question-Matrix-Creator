import React from "react";
import { makeDropdownable } from './utility'
import { Form, Button } from "react-bootstrap";

export function FactCreateLayout(props) {
  const factState = props.factState;
  const setFactState = props.setFactState;
  const formSubmit = props.formSubmit;
  const factTypes = props.factTypes;
  var existingFact = props.existingFact;
  const submitButtonLabel = props.submitButtonLabel ?? "Create";
  const facts = factState.facts;
  const themes = props.themes;

  factState.negateFacts ??= [];

  var negateFactFields = [];
  for (var i = 0; i < factState.negateFacts.length; i++) {
    const index = i;
    negateFactFields.push(
      Dropdown(
        i+"Fact",
        makeDropdownable(facts, 'id', 'display', 'name'),
        (id)=>{setNegateFact(id, index)},
        factState, setFactState,
        i+"negateFacts",
        existingFact?.negateFacts[i]
      )
    );
  }

  function setNegateFact(id, index) {
    factState.negateFacts[index] = id
  }

  function AddNegateFact() {
    factState.negateFacts.push("");
    setFactState({...factState});
  }

  function RemoveNegateFact() {
    factState.negateFacts.pop();
    setFactState({...factState});
  }

  return (
    <Form onSubmit={formSubmit} key="createFact">
      <Form.Group controlId="name">
        <Form.Label>Name</Form.Label>
        <Form.Control
          type="text"
          defaultValue={existingFact?.name}
          required
        />
      </Form.Group>
      Fact Types
      {Dropdown("factType", makeDropdownable(factTypes, 'type', 'type'), ()=>{}, factState, setFactState, "factFormFactType", existingFact?.type)}

      Theme
      {Dropdown("theme", makeDropdownable(themes, 'id', 'name'), ()=>{}, factState, setFactState, "factFormTheme", existingFact?.theme)}

      {negateFactFields}
      <Button type="button" onClick={AddNegateFact}>Add Negate Fact</Button>
      <Button type="button" onClick={RemoveNegateFact}>Remove Fact</Button>
      <br/>

      <Button type="submit">{submitButtonLabel}</Button>
    </Form>
  )
}