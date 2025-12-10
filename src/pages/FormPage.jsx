
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiFetch } from "../utils/apiFetch";
import { shouldShowQuestion } from "../utils/conditional";

export default function FormPage() {
  const { formId } = useParams();
  console.log("Form ID:", formId);

  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!formId) {
      setLoading(false);
      return;
    }

    apiFetch(`/forms/${formId}`)
      .then((data) => {
        setForm(data.form);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading form:", err);
        setLoading(false);
      });
  }, [formId]);

  const handleChange = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    try {
      await apiFetch(`/responses/${formId}/submit`, {
        method: "POST",
        body: JSON.stringify({ answers }),
      });

      alert("Form submitted successfully!");
      setAnswers({});
    } catch (err) {
      console.error("Submit failed:", err);
      if (err.data?.errors) setErrors(err.data.errors);
      else alert("Submission failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Loading form...
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Form not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 to-purple-100 p-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{form.name}</h2>

          <Link
            to={`/forms/${formId}/responses`}
            className="text-sm text-indigo-600 hover:underline"
          >
            View Responses →
          </Link>
        </div>

        {form.description && (
          <p className="text-gray-500 mb-4">{form.description}</p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {form.questions.map((q) => {
            const visible = shouldShowQuestion(q.conditionalRules, answers);
            if (!visible) return null;

            const value = answers[q.questionKey] ?? "";

            // TEXT INPUTS
            if (q.type === "shortText" || q.type === "longText") {
              return (
                <div key={q.questionKey}>
                  <label className="block mb-1 font-medium">
                    {q.label}
                    {q.required && <span className="text-red-500"> *</span>}
                  </label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) =>
                      handleChange(q.questionKey, e.target.value)
                    }
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                  />
                </div>
              );
            }

            // SINGLE SELECT
            if (q.type === "singleSelect") {
              return (
                <div key={q.questionKey}>
                  <label className="block mb-1 font-medium">
                    {q.label}
                    {q.required && <span className="text-red-500"> *</span>}
                  </label>
                  <select
                    value={value}
                    onChange={(e) =>
                      handleChange(q.questionKey, e.target.value)
                    }
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                  >
                    <option value="">Select...</option>
                    {q.options?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }

            // MULTI SELECT
            if (q.type === "multiSelect") {
              const current = Array.isArray(value) ? value : [];

              return (
                <div key={q.questionKey}>
                  <label className="block mb-1 font-medium">
                    {q.label}
                    {q.required && <span className="text-red-500"> *</span>}
                  </label>

                  <div className="space-y-1">
                    {q.options?.map((opt) => (
                      <label key={opt} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={current.includes(opt)}
                          onChange={(e) => {
                            let next = current;
                            if (e.target.checked) {
                              next = [...current, opt];
                            } else {
                              next = current.filter((v) => v !== opt);
                            }
                            handleChange(q.questionKey, next);
                          }}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              );
            }

            // ATTACHMENT (SIMPLIFIED)
            if (q.type === "attachment") {
              const textValue = Array.isArray(value)
                ? value.join(", ")
                : "";

              return (
                <div key={q.questionKey}>
                  <label className="block mb-1 font-medium">
                    {q.label}
                    {q.required && <span className="text-red-500"> *</span>}
                  </label>
                  <input
                    type="text"
                    placeholder="Comma separated file URLs"
                    value={textValue}
                    onChange={(e) =>
                      handleChange(
                        q.questionKey,
                        e.target.value
                          .split(",")
                          .map((v) => v.trim())
                          .filter(Boolean)
                      )
                    }
                    className="w-full border rounded px-3 py-2 focus:ring focus:ring-indigo-300"
                  />
                </div>
              );
            }

            return null;
          })}

          {/* Errors */}
          {errors.length > 0 && (
            <ul className="bg-red-100 text-red-700 p-3 rounded text-sm">
              {errors.map((err, i) => (
                <li key={i}>• {err}</li>
              ))}
            </ul>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full mt-4 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold"
          >
            Submit Form
          </button>
        </form>
      </div>
    </div>
  );
}
