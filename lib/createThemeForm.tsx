import { Button, Form } from "react-bootstrap";
import * as React from "react";

export default function CreateThemeForm(props) {
  const formSubmit = props.formSubmit;
  const existingTheme = props.existingTheme;
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