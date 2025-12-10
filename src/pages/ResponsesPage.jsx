import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiFetch } from "../utils/apiFetch";

export default function ResponsesPage() {
  const { formId } = useParams();

  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!formId) return;

    apiFetch(`/responses/${formId}/get-all-responses`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("airtableAccessToken")}`,
      },
    })
      .then((data) => {
        setResponses(data.responses || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load responses:", err);
        setError("Failed to load responses");
        setLoading(false);
      });
  }, [formId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Loading responses...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 to-purple-100 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Form Responses</h2>

          <Link
            to={`/form/${formId}`}
            className="text-sm text-indigo-600 hover:underline"
          >
            ← Back to Form
          </Link>
        </div>

        {/* Empty state */}
        {responses.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            No responses submitted yet.
          </div>
        )}

        {/* Table */}
        {responses.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 border">#</th>
                  <th className="p-3 border">Submission ID</th>
                  <th className="p-3 border">Created At</th>
                  <th className="p-3 border">Status</th>
                  <th className="p-3 border">Answers Preview</th>
                </tr>
              </thead>

              <tbody>
                {responses.map((r, index) => (
                  <tr key={r._id} className="hover:bg-gray-50">
                    <td className="p-3 border text-center">{index + 1}</td>

                    <td className="p-3 border font-mono text-xs">{r._id}</td>

                    <td className="p-3 border">
                      {new Date(r.createdAt).toLocaleString()}
                    </td>

                    <td className="p-3 border">
                      {r.deletedInAirtable ? (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded">
                          Deleted in Airtable
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                          Active
                        </span>
                      )}
                    </td>

                    <td className="p-3 border text-xs text-gray-700">
                      {Array.isArray(r.preview) && r.preview.length > 0
                        ? r.preview
                            .map(([k, v]) => `${k}: ${String(v)}`)
                            .join(" | ")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
