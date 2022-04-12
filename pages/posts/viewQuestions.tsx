import React, { useState } from "react";
import Layout from '../../components/layout'
import { PrismaClient } from '@prisma/client'
import { Search } from '../../lib/search'
import { Card, ListGroup, Button } from "react-bootstrap";
import CreateQuestionForm from "../../lib/createQuestionForm";
import { Matrix } from "../../types/matrix";

export async function getServerSideProps() {
  if (!global.questions || !global.questionLabels || !global.questionOptions || global.questionTypes || global.facts || global.themes) {
    const prisma = new PrismaClient();
    global.questions = await prisma.question.findMany();
    global.questionLabels = await prisma.questionLables.findMany()
    global.questionOptions = await prisma.questionOptions.findMany()
    global.questionTypes = await prisma.questionType.findMany()
    global.facts = await prisma.fact.findMany()
    global.themes = await prisma.theme.findMany()
    await prisma.$disconnect()
  }

  const questions = global.questions;
  const questionLabels = global.questionLabels;
  const questionOptions = global.questionOptions;
  const questionTypes = global.questionTypes;
  const facts = global.facts;
  const themes = global.themes;

  return {
    props: {
      questions,
      questionLabels,
      questionOptions,
      questionTypes,
      facts,
      themes
    }
  }
}

type Props = {
  questions: Matrix.Question[],
  questionLabels: Matrix.QuestionLabels[],
  questionOptions: Matrix.QuestionOption[],
  questionTypes: Matrix.QuestionType[],
  facts: Matrix.Fact[],
  themes: Matrix.Theme[]
}


export default function ViewQuestion({ questions, questionLabels, questionOptions, questionTypes, facts, themes }: Props) {
  const [shownQuestions, setShownQuestions] = useState(questions);
  const [editQuestionData, setEditQuestionData] = useState(null);
  const _sliderQuestionTypes: Matrix.SliderQuestionTypes = ["Slider", "TextSlider"];
  const _optionQuestionTypes: Matrix.OptionQuestionTypes = ["MultipleChoice", "Polygon", "MultiPolygon", "MultipleSelect"];
  const sliderQuestionTypes: string[] = _sliderQuestionTypes;
  const optionQuestionTypes: string[] = _optionQuestionTypes;
  const questionHtml = [];

  if (editQuestionData != null) {
    questionHtml.push(
      <CreateQuestionForm
        allFacts={facts}
        allQuestionTypes={questionTypes} 
        question={editQuestionData}
        setQuestion={setEditQuestionData}
        submit={updateQuestion}
        allThemes={themes}
        submitButtonLabel={"Create Question"}
      />
    )
  } else {
    questionHtml.push(...questionViewLayout());
  }
  return (
    <Layout>
      <h2>View Questions</h2>
      {questionHtml}
    </Layout>
  )

  async function updateQuestion(event) {
    event.preventDefault() // don't redirect the page
    const res = await fetch('/api/question', {
      body:  JSON.stringify({
        id: editQuestionData.id,
        code: event.target.code.value,
        type: event.target.QuestionType.value,
        text: event.target.text.value,
        factSubject: editQuestionData.factSubject,
        options: editQuestionData.options,
        min: event.target.min?.value,
        max: event.target.max?.value,
        labels: editQuestionData.labels,
        theme: event.target.theme?.value,
        timer: event.target.timer.value
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'PUT'
    })

    await res.json();

    setEditQuestionData(null);
  }

  function pushEditQuestionButton(event) {
    const newQuestion = questions.find(question => question.id == event.target.id.substring(4))
    setEditQuestionData({
      ...newQuestion,
      options: questionOptions.filter(option => option.questionId == newQuestion.id).sort((a, b) => a.optionOrder-b.optionOrder),
      labels: questionLabels.filter(label => label.questionId == newQuestion.id).map(label => label.label),
    });
  }

  async function pushDeleteQuestionButton(event) {
    event.preventDefault()
    const res = await fetch('/api/question', {
      body:  JSON.stringify({
        id: event.target.id.substring(6),
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'DELETE'
    })

    await res.json();

    setEditQuestionData(null);
  }

  function questionViewLayout() {
    const layout = [];
    layout.push(
      <div key="Search">
        <>Search: </>
        {Search(questions, "code", setShownQuestions)}
      </div>
    );

    for (let i = 0; i < shownQuestions.length; i++) {
      const optionOptions = [];
      if (optionQuestionTypes.includes(shownQuestions[i].type)) {
        const currentQuestionOptions = 
          questionOptions.filter(option => option.questionId == shownQuestions[i].id)
          .sort((a, b) => a.optionOrder - b.optionOrder);

        for (let j = 0; j < currentQuestionOptions.length; j++) {
          optionOptions.push(
            <div key={"QuestionOptions"+j}>
              {currentQuestionOptions[j].code}: {currentQuestionOptions[j].text}: {currentQuestionOptions[j].value}: {currentQuestionOptions[j].image}<br/>
            </div>
          )
        }
      }

      const sliderOptions = [];
      if (sliderQuestionTypes.includes(shownQuestions[i].type)) {
        const currentQuestionLabels = questionLabels.filter(label => label.questionId == shownQuestions[i].id);
        sliderOptions.push(<div key="min"><b>Min: </b>{shownQuestions[i].min}</div>);
        sliderOptions.push(<div key="max"><b>Max: </b>{shownQuestions[i].max}</div>);
        for (let j = 0; j < currentQuestionLabels.length; j++) {
          sliderOptions.push(
            <div key={"sliderOptions"+j}>
              {currentQuestionLabels[j].label} <br/>
            </div>
          )
        }
      }
      layout.push(
        <Card key={"Question"+i}>
          <Card.Header>{shownQuestions[i].code}</Card.Header>
          <ListGroup>
            <ListGroup.Item>Type: {shownQuestions[i].type}</ListGroup.Item>
            <ListGroup.Item>Text: {shownQuestions[i].text}</ListGroup.Item>
            <ListGroup.Item>Fact: {facts.find(fact => fact.id.toString() === shownQuestions[i].factSubject)?.name ?? ""}</ListGroup.Item>
            {/* {sliderOptions}
            {optionOptions} */}
          </ListGroup>
          <Card.Body>
            <Button id={"edit"+shownQuestions[i].id} type="button" onClick={pushEditQuestionButton} className='mx-2'>Edit</Button>
            <Button id={"delete"+shownQuestions[i].id} type="button" onClick={pushDeleteQuestionButton}>Delete</Button>
          </Card.Body>
        </Card>
      )
    }
    return layout;
  }
}