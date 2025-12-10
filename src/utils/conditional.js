
export function shouldShowQuestion(rules, answers) {
  if (!rules) return true;
  const { logic, conditions } = rules;
  if (!Array.isArray(conditions) || conditions.length === 0) return true;

  const results = conditions.map((c) => {
    const answer = answers[c.questionKey];
    if (answer === undefined || answer === null) return false;

    if (c.operator === "equals") return answer === c.value;
    if (c.operator === "notEquals") return answer !== c.value;
    if (c.operator === "contains") {
      if (Array.isArray(answer)) return answer.includes(c.value);
      if (typeof answer === "string") return answer.includes(c.value);
      return false;
    }
    return false;
  });

  if (logic === "AND") return results.every(Boolean);
  if (logic === "OR") return results.some(Boolean);
  return true;
}
