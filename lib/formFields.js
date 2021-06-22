import React from "react";
import { makeDropdownable } from './utility'

export function Dropdown(fieldName, Labels, onChangeFunction) {
  const dropdownDisplay = [];
  Labels.forEach((label, id) => {
    dropdownDisplay.push(
      <option value={id} key={id}>{label}</option>
    );
  });
  return (
    <select 
      id={fieldName} 
      name={fieldName} 
      onChange={onChangeFunction}
    >
      {dropdownDisplay}
    </select>
  )
}

export function FactFields(formSubmit, factTypes) {
  console.log("Test");
  return (
    <form onSubmit={formSubmit}>
      <label htmlFor="name">Name </label>
      <input id="name" type="text" autoComplete="name" required /><br/>
      {Dropdown("Fact Types", makeDropdownable(factTypes, 'type', 'type'))}<br/>
      <br/>
      <button type="submit">Create</button>
    </form>
  )
}