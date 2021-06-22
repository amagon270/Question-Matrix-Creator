import React from "react";

export function Search(data, searchField, dataReturn) {
  return (
    <>
      <>Search: </>
      <input id="searchInput" type="text" onChange={findData}></input>
      <br/>
    </>
  )

  function findData(event) {
    var filteredData = data.filter(e => e[searchField].toLowerCase().includes(event.target.value.toLowerCase()));
    dataReturn(filteredData)
  }
}