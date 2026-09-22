import { useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const [form, setForm] = useState({
    brand_name: "",
    class_type: "",
    alcohol_content: "",
    net_contents: "",
    producer_name_address: "",
    country_of_origin: "",
    government_warning: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const verifyLabel = async () => {
    if (!file) {
      alert("Please upload a label image.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Step 1: Extract label data
      const uploadData = new FormData();
      uploadData.append("file", file);

      const uploadResponse = await fetch(
        "http://127.0.0.1:8000/upload-label",
        {
          method: "POST",
          body: uploadData,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error("Label extraction failed.");
      }

      const uploadResult = await uploadResponse.json();

      // Step 2: Compare against application data
      const verifyResponse = await fetch(
        "http://127.0.0.1:8000/verify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            application_data: form,
            extracted_fields: uploadResult.extracted_fields,
          }),
        }
      );

      if (!verifyResponse.ok) {
        throw new Error("Verification failed.");
      }

      const verification = await verifyResponse.json();
      setResult(verification);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <h1>Alcohol Label Verifier</h1>

      <p className="subtitle">
        AI-assisted alcohol beverage label compliance review
      </p>

      <section className="card">
        <h2>1. Upload Label</h2>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setFile(e.target.files[0])}
        />
      </section>

      <section className="card">
        <h2>2. Application Data</h2>

        {[
          ["brand_name", "Brand Name"],
          ["class_type", "Class / Type"],
          ["alcohol_content", "Alcohol Content"],
          ["net_contents", "Net Contents"],
          ["producer_name_address", "Producer Name / Address"],
          ["country_of_origin", "Country of Origin"],
        ].map(([name, label]) => (
          <label key={name}>
            {label}
            <input
              name={name}
              value={form[name]}
              onChange={handleChange}
            />
          </label>
        ))}

        <label>
          Government Warning
          <textarea
            name="government_warning"
            value={form.government_warning}
            onChange={handleChange}
            rows="5"
          />
        </label>
      </section>

      <button
        className="verify-button"
        onClick={verifyLabel}
        disabled={loading}
      >
        {loading ? "Analyzing Label..." : "Verify Label"}
      </button>

      {result && (
        <section className="card results">
          <h2>
            Verification Result: {result.overall_status}
          </h2>

          {Object.entries(result.results).map(
            ([field, data]) => (
              <div
                key={field}
                className={`result ${data.status.toLowerCase()}`}
              >
                <strong>
                  {field.replaceAll("_", " ").toUpperCase()}
                </strong>

                <span>{data.status}</span>

                <p>{data.reason}</p>

                <small>
                  Expected: {data.expected || "Not provided"}
                  <br />
                  Label: {data.actual || "Not detected"}
                </small>
              </div>
            )
          )}
        </section>
      )}
    </main>
  );
}

export default App;