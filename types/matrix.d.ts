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

  type SliderQuestionTypes = ["Slider", "TextSlider"];
  type OptionQuestionTypes = ["MultipleChoice", "Polygon", "MultiPolygon", "MultipleSelect"];
}