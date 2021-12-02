import React from "react";
import { Button } from "react-bootstrap";

type Props = {
  fieldName,
  labels, 
  onChangeFunction, 
  state, 
  setState, 
  name, 
  defaultValue = null
}

export function Dropdown(props: Props) {
  state[name] ??= {selectedValue: defaultValue};
  const search = state[name].search;
  const selectedValue = state[name].selectedValue;
  const visibility = state[name].visibility;
  const filteredLabels = new Map([...labels].filter(([id, label]) => label?.toLowerCase()?.includes(search ?? "")))

  const dropdownDisplay = [];
  filteredLabels.forEach((label, id) => {
    dropdownDisplay.push(
      <li key={id}>
        <Button 
        className="dropdown-item" 
        type="button" 
        onClick={() => {
          state[name].selectedValue = id;
          setState({...state});
          onChangeFunction(id);
        }}>
           {label}
        </Button>
      </li>
    );
  });

  return (
    <div className="dropdown" key={fieldName}>
      <Button
        className="btn"
        type="button"
        id={fieldName}
        value={selectedValue ?? ""}
        onClick={() => {
          state[name].visibility = !state[name].visibility;
          setState({...state});
      }}>
        {labels.get(selectedValue)}
      </Button>
      {visibility ?
      <ul>
        <li>
          <input 
            key="DropdownSearch" 
            id="dropdownSearch" 
            type="text" 
            onChange={(event) => {
              state[name].search = event.target.value;
              setState({...state});
            }}>
          </input>
        </li>
        {dropdownDisplay}
      </ul> : null
      }
    </div>
  )
}





