
import { useEffect, useState } from "react";
import { apiFetch } from "../utils/apiFetch";
import { useNavigate } from "react-router-dom";

export default function CreateForm() {
  const [formName, setFormName] = useState("");
  const [bases, setBases] = useState([]);
  const [tables, setTables] = useState([]);
  const [fields, setFields] = useState([]);
  const [selectedBaseId, setSelectedBaseId] = useState("");
  const [selectedTableId, setSelectedTableId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    apiFetch("/airtable/bases", {headers: {Authorization: `Bearer ${localStorage.getItem('airtableAccessToken')}`}})
      .then((d) => setBases(d.bases))
      .catch(console.error);
  }, []);

  const handleBaseChange = async (e) => {
    const id = e.target.value;
    setSelectedBaseId(id);
    setTables([]);
    setSelectedTableId("");
    setFields([]);

    if (!id) return;
    const d = await apiFetch(`/airtable/bases/${id}/tables`, {
      method: "GET",
      headers: {Authorization: `Bearer ${localStorage.getItem('airtableAccessToken')}`}
    });
    setTables(d.tables);
  };

  const handleTableChange = (e) => {
    setSelectedTableId(e.target.value);
    setFields([]);
  };

  const handleLoadFields = async () => {
    if (!selectedBaseId || !selectedTableId) return;
    const d = await apiFetch(
      `/airtable/bases/${selectedBaseId}/tables/${selectedTableId}/fields`,
      { method: "GET", headers: {Authorization: `Bearer ${localStorage.getItem('airtableAccessToken')}`} }
    );
    setFields(
      d.fields.map((f) => ({
        ...f,
        include: true,
        label: f.name,
        required: false,
      }))
    );
  };

  const handleSaveForm = async () => {
    const included = fields.filter((f) => f.include);
    if (!included.length) {
      alert("Select at least one field.");
      return;
    }

    const questions = included.map((f) => ({
      questionKey: f.name.toLowerCase().replace(/\s+/g, "_"),
      airtableFieldId: f.id,
      airtableFieldName: f.name,
      label: f.label || f.name,
      type: f.type,
      required: f.required,
      options: f.options || undefined,
      conditionalRules: null,
    }));

    const payload = {
      name: formName || "Untitled Form",
      airtableBaseId: selectedBaseId,
      airtableTableId: selectedTableId,
      questions,
    };

    try {
      const res = await apiFetch("/forms/create-form", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem('airtableAccessToken')}`
        },
        body: JSON.stringify(payload),
      });
      navigate(`/form/${res.form._id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to save form");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-6">Create New Form</h2>

        <div className="mb-4">
          <input
            placeholder="Form Name"
            className="w-full border p-3 rounded"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <select
            className="w-full border p-3 rounded"
            value={selectedBaseId}
            onChange={handleBaseChange}
          >
            <option value="">Select Base</option>
            {bases.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <select
            className="w-full border p-3 rounded"
            value={selectedTableId}
            onChange={handleTableChange}
          >
            <option value="">Select Table</option>
            {tables.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleLoadFields}
          disabled={!selectedBaseId || !selectedTableId}
          className="bg-indigo-600 disabled:bg-gray-400 text-white px-4 py-2 rounded mb-6"
        >
          Load Fields
        </button>

        {fields.length > 0 && (
          <>
            <h3 className="text-lg font-semibold mb-2">Configure Fields</h3>
            <div className="space-y-2">
              {fields.map((f, i) => (
                <div
                  key={f.id}
                  className="flex items-center gap-4 border p-3 rounded"
                >
                  <input
                    type="checkbox"
                    checked={f.include}
                    onChange={(e) =>
                      setFields((prev) => {
                        const copy = [...prev];
                        copy[i] = { ...copy[i], include: e.target.checked };
                        return copy;
                      })
                    }
                  />
                  <input
                    className="border rounded p-2 flex-1"
                    value={f.label}
                    onChange={(e) =>
                      setFields((prev) => {
                        const copy = [...prev];
                        copy[i] = { ...copy[i], label: e.target.value };
                        return copy;
                      })
                    }
                  />
                  <span className="text-sm text-gray-600">{f.type}</span>
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={f.required}
                      onChange={(e) =>
                        setFields((prev) => {
                          const copy = [...prev];
                          copy[i] = { ...copy[i], required: e.target.checked };
                          return copy;
                        })
                      }
                    />
                    Required
                  </label>
                </div>
              ))}
            </div>

            <button
              onClick={handleSaveForm}
              className="mt-6 bg-green-600 text-white px-6 py-3 rounded-lg"
            >
              Save Form
            </button>
          </>
        )}
      </div>
    </div>
  );
}
