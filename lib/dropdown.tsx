import React from "react";
import { Button } from "react-bootstrap";

type Props = {
  id: string,
  labels: Map<string, string>,
  onSelect?: (value: string) => void,
  value: string,
}
const Dropdown: React.FC<Props> = (props) => {
  const [search, setSearch] = React.useState<string>("");
  const [filteredLabels, setFilteredLables] = React.useState<Map<string, string>>(props.labels);
  const [visible, setVisible] = React.useState<boolean>(false);

  React.useEffect(() => {
    const array = Array.from(props.labels);
    const filtered = array.filter(label => label[1].toLocaleLowerCase().includes(search.toLocaleLowerCase()));
    setFilteredLables(new Map(filtered));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const dropdownDisplay = [];
  filteredLabels.forEach((label, value) => {
    dropdownDisplay.push(
      <li key={value}>
        <Button 
          className="dropdown-item" 
          type="button" 
          onClick={() => {
            setVisible(false);
            props.onSelect(value);
          }}
        >
           {label}
        </Button>
      </li>
    );
  });

  return (
    <div className="dropdown" key={props.id}>
      <Button
        className="btn"
        type="button"
        id={props.id}
        value={props.value ?? ""}
        onClick={() => {
          setVisible(!visible);
        }}
      >
        {props.labels.get(props.value) ?? "Select"}
      </Button>
      {visible && 
        <ul>
          <li>
            <input 
              key="DropdownSearch" 
              id="dropdownSearch" 
              type="text" 
              onChange={(event) => {
                setSearch(event.target.value);
              }}>
            </input>
          </li>
          {dropdownDisplay}
        </ul> 
      }
    </div>
  )
}


export default Dropdown;