import React from "react";
import { Form, Button } from "react-bootstrap";

export function ThemeCreateLayout(props) {
  const themeState = props.themeState;
  const setThemeState = props.setThemeState;
  const formSubmit = props.formSubmit;
  var existingTheme = props.existingTheme;
  const submitButtonLabel = props.submitButtonLabel ?? "Create";

  return (
    <Form onSubmit={formSubmit} key="createTheme">
      <Form.Group controlId="name">
        <Form.Label>Name</Form.Label>
        <Form.Control
          type="text"
          defaultValue={existingTheme?.name}
          required
        />
      </Form.Group>
      <Button type="submit">{submitButtonLabel}</Button>
    </Form>
  )
}