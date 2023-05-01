import React, { useState } from "react";
import ImageUpload from "./ImageUpload";

const inputs = [
  { name: "site_id", label: "Site ID", type: "select", options: ["1", "2"] },
  {
    name: "laterality",
    label: "Laterality",
    type: "select",
    options: ["L", "R"],
  },
  {
    name: "view",
    label: "View",
    type: "select",
    options: ["CC", "MLO", "ML", "LM", "AT", "LMO"],
  },
  { name: "age", label: "Age" },
  { name: "biopsy", label: "Biopsy" },
  { name: "invasive", label: "Invasive" },
  { name: "BIRADS", label: "BIRADS" },
  { name: "implant", label: "Implant" },
  {
    name: "density",
    label: "Density",
    type: "select",
    options: ["A", "B", "C", "D"],
  },
  { name: "machine_id", label: "Machine ID" },
  {
    name: "difficult_negative_case",
    label: "Difficult Negative Case",
    type: "select",
    options: ["True", "False"],
  },
];

function InputForm(): JSX.Element {
  const [formData, setFormData] = useState<Record<string, any>>({
    site_id: "1",
  });
  const [cancer, setCancer] = useState<string>("");

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleChange = (e: any): void => {
    console.log(e.target.name, e.target.value);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpload = (): void => {
    if (file != null) {
      const base64 = localStorage.getItem("uploadedImage");
      console.log({ ...formData, file: base64 });
      void fetch("http://127.0.0.1:5000/classify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, file: base64 }),
      }).then(async (res) => {
        const result = await res.json();
        console.log(result);
        const prediction = result.prediction;
        setCancer(prediction);
      });
    }
  };

  return (
    <div className="container mx-auto">
      <form className="grid grid-cols-6 gap-4 mx-auto">
        {inputs.map(({ name, label, type, options }) => (
          <div className="mt-8" key={name}>
            <label
              className="block text-gray-700 font-light h-10"
              htmlFor={name}
            >
              {label}
            </label>
            {type === "select" ? (
              <select
                className="py-2 focus:shadow-outline bg-white hover:border-gray-500 h-[80%] shadow appearance-none border rounded w-full px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id={name}
                name={name}
                value={formData[name]}
                onChange={handleChange}
              >
                {options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="h-[80%] shadow appearance-none border rounded w-full px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id={name}
                type="text"
                placeholder="0.0"
                name={name}
                value={formData[name]}
                onChange={handleChange}
              />
            )}
          </div>
        ))}
      </form>
      <div className="mt-8 text-left">
        <ImageUpload
          onUpload={() => {}}
          file={file}
          setFile={setFile}
          previewUrl={previewUrl}
          setPreviewUrl={setPreviewUrl}
        />
        <div className="text-center">
          {cancer.length > 0 && (
            <div className="text-center mx-auto">
              <h1 className="mt-8 text-2xl font-bold">Results</h1>
              <h2 className="mt-4 text-xl font-bold">Cancer: {cancer}</h2>
            </div>
          )}
          <button
            type="button"
            className={`inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              file === null
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : ""
            }`}
            onClick={handleUpload}
            disabled={file === null}
          >
            Predict Cancer
          </button>
        </div>
      </div>
    </div>
  );
}

export default InputForm;
