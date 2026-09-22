import { useState } from "react";
import "./App.css";

const fields = [
  ["brand_name", "Brand Name"],
  ["class_type", "Class / Type"],
  ["alcohol_content", "Alcohol Content"],
  ["net_contents", "Net Contents"],
  ["producer_name_address", "Producer Name / Address"],
  ["country_of_origin", "Country of Origin"],
];

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

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
      setError("Please upload a label image.");
      return;
    }

    setLoading(true);
    setResult(null);
    setError("");

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const uploadResponse = await fetch(
        "https://ai-alcohol-label-verifier.onrender.com/upload-label",
        {
          method: "POST",
          body: uploadData,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error("Unable to analyze the label.");
      }

      const uploadResult = await uploadResponse.json();

      const verifyResponse = await fetch(
        "https://ai-alcohol-label-verifier.onrender.com/verify",
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
        throw new Error("Unable to verify the label.");
      }

      setResult(await verifyResponse.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <header className="header">
        <div>
          <span className="eyebrow">TTB REVIEW PROTOTYPE</span>
          <h1>Alcohol Label Verifier</h1>
          <p>
            AI-assisted comparison of beverage label artwork
            against application data.
          </p>
        </div>
      </header>

      <section className="card">
        <div className="step">STEP 1</div>
        <h2>Upload Label Artwork</h2>
        <p className="help">
          Upload a JPG, PNG, or WebP image of the beverage label.
        </p>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setFile(e.target.files[0])}
        />

        {file && (
          <p className="selected">
            Selected: <strong>{file.name}</strong>
          </p>
        )}
      </section>

      <section className="card">
        <div className="step">STEP 2</div>
        <h2>Application Data</h2>
        <p className="help">
          Enter the values submitted in the application.
        </p>

        <div className="form-grid">
          {fields.map(([name, label]) => (
            <label key={name}>
              {label}
              <input
                name={name}
                value={form[name]}
                onChange={handleChange}
                placeholder={label}
              />
            </label>
          ))}
        </div>

        <label>
          Government Warning
          <textarea
            name="government_warning"
            value={form.government_warning}
            onChange={handleChange}
            rows="5"
            placeholder="Enter the required government warning exactly as submitted."
          />
        </label>
      </section>

      {error && <div className="error-message">{error}</div>}

      <button
        className="verify-button"
        onClick={verifyLabel}
        disabled={loading}
      >
        {loading ? "Analyzing label..." : "Verify Label"}
      </button>

      {result && (
        <section className="card results">
          <div className="step">STEP 3</div>

          <div className="result-header">
            <h2>Verification Results</h2>
            <span
              className={`overall ${result.overall_status.toLowerCase()}`}
            >
              {result.overall_status}
            </span>
          </div>

          {Object.entries(result.results).map(([field, data]) => (
            <div
              key={field}
              className={`result ${data.status.toLowerCase()}`}
            >
              <div className="result-title">
                <strong>
                  {field.replaceAll("_", " ").toUpperCase()}
                </strong>
                <span>{data.status}</span>
              </div>

              <p>{data.reason}</p>

              <div className="comparison">
                <div>
                  <b>Application</b>
                  <p>{data.expected || "Not provided"}</p>
                </div>

                <div>
                  <b>Detected on label</b>
                  <p>{data.actual || "Not detected"}</p>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      <footer>
        AI-assisted prototype • Human review recommended for final compliance decisions
      </footer>
    </main>
  );
}

export default App;