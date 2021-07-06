import React, {useEffect} from "react";
import Button from 'react-bootstrap/Button'

export function Search(data, searchField, dataReturn, firstRun = false) {
  if (firstRun) {
    dataReturn(data);
  }
  return (
      <input key="SearchField" id="searchInput" type="text" onChange={findData} ></input>
  )

  function findData(event) {
    var filteredData = data.filter(e => e[searchField].toLowerCase().includes(event.target.value.toLowerCase()));
    dataReturn(filteredData)
  }
}

export function SearchButtonMatrix(data, searchField, dataReturn, clickEvent, firstRun = false) {
  const NUM_OF_SHOWN_ITEMS = 20;
  const NUM_OF_ITEMS_PER_LINE = 5

  return (
    Search(data, searchField, buttonMatrix, firstRun)
  )

  function buttonMatrix(filteredData, outputArray) {
    var newLine = 0;
    var totalItems = 0;
    outputArray = [];
    filteredData.forEach(item => {
      if (totalItems < NUM_OF_SHOWN_ITEMS) {
        outputArray.push(
          <Button 
            key={"item-"+item.id} 
            id={"item-"+item.id} 
            onClick={clickEvent}>
            {item.name} 
          </Button>
        )
        newLine++;
        if (newLine >= NUM_OF_ITEMS_PER_LINE) {
          outputArray.push(<br key={"break"+item.id}/>);
          newLine = 0;
        }
      }
    })
    dataReturn(outputArray);
  }
}