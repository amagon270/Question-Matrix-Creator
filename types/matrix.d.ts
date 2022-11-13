import * as Prisma from "@prisma/client";

declare namespace Matrix {
  type Question = Prisma.question & {
    options?: QuestionOption[],
    labels?: string[]
  };

  type QuestionType = Prisma.questionType;

  type QuestionOption = Prisma.questionOptions

  type Fact = Prisma.fact;

  type FactType = Prisma.factType;

  type Theme = Prisma.theme;

  type Rule = Prisma.rule;
  
  type RuleTest = Prisma.ruleTests

  type RuleOperation = Prisma.ruleOperation;

  type RuleTrigger = Prisma.ruleTrigger;

  type QuestionLabels = Prisma.questionLables;

  type CreateFactFormProps = {
    fact: Fact,
  };

  const blankFact: Fact = {
    id: null, 
    name: "", 
    type: "", 
    negatedFacts: [], 
    theme: null, 
    display: ""
  };

  const blankRule: Rule = {
    id: 0,
    code: "",
    triggerType: "",
    priority: 0,
    factId: 0,
    factAction: "",
    questionId: 0,
  }

  const blankQuestion: Question = {
    id: 0,
    code: "",
    text: "",
    factSubject: "",
    type: "",
    min: 0,
    max: 0,
    theme: 0,
    options: [],
    labels: [],
  }

  const blankRuleTest: RuleTest = {
    id: 0,
    ruleId: 0,
    factId: 0,
    operation: "",
    parameter: "",
  }

  type SliderQuestionTypes = ["Slider", "TextSlider"];
  type OptionQuestionTypes = ["MultipleChoice", "Polygon", "MultiPolygon", "MultipleSelect"];
}