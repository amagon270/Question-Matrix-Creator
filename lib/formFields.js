import React from "react";

export function Dropdown(fieldName, Labels, onChangeFunction) {
  const dropdownDisplay = [];
  Labels.forEach((label, id) => {
    dropdownDisplay.push(
      <option value={id} label={label} key={id}>{label}</option>
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